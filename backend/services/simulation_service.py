import numpy as np
import pandas as pd
from typing import Dict, List, Any
from datetime import datetime, timedelta
import asyncio
from models import SimulationRequest, SimulationResponse


class SimulationService:
    def __init__(self):
        self.risk_free_rate = 0.02  # 2% risk-free rate

    async def simulate(self, request: SimulationRequest) -> SimulationResponse:
        """Simulate investment returns with cash flow breakdown"""

        # Generate synthetic price data based on historical patterns
        price_data = await self._generate_price_data(request)

        # Calculate portfolio performance
        portfolio_performance = await self._calculate_portfolio_performance(
            request, price_data
        )

        # Calculate cash flow vs capital gains breakdown
        cash_flow_breakdown = await self._calculate_cash_flow_breakdown(
            request, portfolio_performance
        )

        # Calculate rebalancing events
        rebalance_events = await self._calculate_rebalance_events(
            request, portfolio_performance
        )

        # Generate performance chart data
        performance_chart = await self._generate_performance_chart(
            portfolio_performance
        )

        return SimulationResponse(
            final_value=portfolio_performance["final_value"],
            total_return=portfolio_performance["total_return"],
            annualized_return=portfolio_performance["annualized_return"],
            volatility=portfolio_performance["volatility"],
            sharpe_ratio=portfolio_performance["sharpe_ratio"],
            max_drawdown=portfolio_performance["max_drawdown"],
            cash_flow_breakdown=cash_flow_breakdown,
            capital_gains_breakdown=portfolio_performance["capital_gains_breakdown"],
            rebalance_events=rebalance_events,
            performance_chart=performance_chart
        )

    async def _generate_price_data(self, request: SimulationRequest) -> Dict[str, pd.DataFrame]:
        """Generate synthetic price data based on asset characteristics"""
        # Define asset characteristics
        asset_characteristics = {
            "VTI": {"volatility": 0.15, "annual_return": 0.08, "yield": 0.02},
            "QQQ": {"volatility": 0.20, "annual_return": 0.12, "yield": 0.01},
            "BND": {"volatility": 0.05, "annual_return": 0.04, "yield": 0.03},
            "GLD": {"volatility": 0.12, "annual_return": 0.06, "yield": 0.00},
            "VNQ": {"volatility": 0.18, "annual_return": 0.07, "yield": 0.04},
            "BITO": {"volatility": 0.35, "annual_return": 0.15, "yield": 0.00},
        }

        # Generate date range
        start_date = datetime.now() - timedelta(days=request.time_horizon)
        dates = pd.date_range(start=start_date, end=datetime.now(), freq="D")

        price_data = {}

        for asset, weight in request.asset_weights.items():
            if weight > 0:
                char = asset_characteristics.get(asset, {
                    "volatility": 0.15, "annual_return": 0.08, "yield": 0.02
                })

                # Generate price series using geometric Brownian motion
                dt = 1/365  # Daily time step
                returns = np.random.normal(
                    char["annual_return"] * dt,
                    char["volatility"] * np.sqrt(dt),
                    len(dates)
                )

                # Add some market events based on the time period
                returns = await self._add_market_events(returns, dates, asset)

                # Calculate prices
                prices = [100]  # Start at 100
                for ret in returns:
                    prices.append(prices[-1] * (1 + ret))

                # Create DataFrame
                df = pd.DataFrame({
                    "date": dates,
                    "price": prices[1:],
                    "return": returns,
                    "yield": char["yield"] / 365  # Daily yield
                })

                price_data[asset] = df

        return price_data

    async def _add_market_events(self, returns: np.ndarray, dates: pd.DatetimeIndex, asset: str) -> np.ndarray:
        """Add market events to make the simulation more realistic"""
        # Add some volatility clustering
        for i in range(1, len(returns)):
            if abs(returns[i-1]) > 0.02:  # High volatility day
                returns[i] *= 1.2  # Increase volatility

        # Add some correlation between assets
        if asset in ["VTI", "QQQ"]:
            # Tech stocks correlation
            tech_factor = np.random.normal(0, 0.01, len(returns))
            returns += tech_factor * 0.3

        return returns

    async def _calculate_portfolio_performance(self, request: SimulationRequest, price_data: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
        """Calculate portfolio performance metrics"""

        # Initialize portfolio
        portfolio_value = request.initial_capital
        portfolio_history = []
        daily_returns = []

        # Get the date range
        dates = list(price_data.values())[0]["date"] if price_data else []

        for i, date in enumerate(dates):
            total_value = 0
            daily_return = 0

            for asset, weight in request.asset_weights.items():
                if weight > 0 and asset in price_data:
                    asset_value = portfolio_value * weight * \
                        price_data[asset].iloc[i]["price"] / 100
                    total_value += asset_value

                    # Add yield income
                    yield_income = asset_value * \
                        price_data[asset].iloc[i]["yield"]
                    total_value += yield_income

            if i > 0:
                daily_return = (total_value - portfolio_value) / \
                    portfolio_value
                daily_returns.append(daily_return)

            portfolio_value = total_value
            portfolio_history.append({
                "date": date,
                "value": portfolio_value,
                "return": daily_return
            })

        # Calculate metrics
        total_return = (portfolio_value -
                        request.initial_capital) / request.initial_capital
        annualized_return = (1 + total_return) ** (365 /
                                                   request.time_horizon) - 1
        volatility = np.std(daily_returns) * np.sqrt(365)
        sharpe_ratio = (annualized_return - self.risk_free_rate) / \
            volatility if volatility > 0 else 0

        # Calculate max drawdown
        peak = request.initial_capital
        max_drawdown = 0
        for point in portfolio_history:
            if point["value"] > peak:
                peak = point["value"]
            drawdown = (peak - point["value"]) / peak
            max_drawdown = max(max_drawdown, drawdown)

        return {
            "final_value": portfolio_value,
            "total_return": total_return,
            "annualized_return": annualized_return,
            "volatility": volatility,
            "sharpe_ratio": sharpe_ratio,
            "max_drawdown": max_drawdown,
            "portfolio_history": portfolio_history,
            "capital_gains_breakdown": await self._calculate_capital_gains_breakdown(request, price_data)
        }

    async def _calculate_cash_flow_breakdown(self, request: SimulationRequest, portfolio_performance: Dict[str, Any]) -> Dict[str, float]:
        """Calculate cash flow vs capital gains breakdown"""
        cash_flow_breakdown = {}

        for asset, weight in request.asset_weights.items():
            if weight > 0:
                # Estimate cash flow from yields
                asset_value = request.initial_capital * weight
                annual_yield = 0.03  # Default 3% yield
                cash_flow = asset_value * annual_yield * \
                    (request.time_horizon / 365)
                cash_flow_breakdown[asset] = cash_flow

        return cash_flow_breakdown

    async def _calculate_capital_gains_breakdown(self, request: SimulationRequest, price_data: Dict[str, pd.DataFrame]) -> Dict[str, float]:
        """Calculate capital gains breakdown by asset"""
        capital_gains_breakdown = {}

        for asset, weight in request.asset_weights.items():
            if weight > 0 and asset in price_data:
                initial_value = request.initial_capital * weight
                final_price = price_data[asset].iloc[-1]["price"]
                capital_gain = initial_value * (final_price / 100 - 1)
                capital_gains_breakdown[asset] = capital_gain

        return capital_gains_breakdown

    async def _calculate_rebalance_events(self, request: SimulationRequest, portfolio_performance: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Calculate rebalancing events"""
        rebalance_events = []

        if request.trading_type == "open" and request.rebalance_frequency > 0:
            # Simulate rebalancing events
            for i in range(0, request.time_horizon, request.rebalance_frequency):
                rebalance_events.append({
                    "date": (datetime.now() - timedelta(days=request.time_horizon - i)).isoformat(),
                    "action": "rebalance",
                    "description": f"Rebalanced portfolio to target weights"
                })

        return rebalance_events

    async def _generate_performance_chart(self, portfolio_performance: Dict[str, Any]) -> Dict[str, Any]:
        """Generate performance chart data"""
        history = portfolio_performance["portfolio_history"]

        return {
            "dates": [point["date"] for point in history],
            "values": [point["value"] for point in history],
            "returns": [point["return"] for point in history]
        }
