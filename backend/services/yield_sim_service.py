import numpy as np
from typing import Dict, List, Any
from models import YieldSimRequest


class YieldSimService:
    def __init__(self):
        pass

    async def simulate(self, request: YieldSimRequest) -> Dict[str, Any]:
        """Simulate passive income from bonds, REITs, crypto"""

        initial_capital = request.initial_capital
        time_horizon = request.time_horizon

        # Calculate allocations
        bond_allocation = request.bond_allocation
        reit_allocation = request.reit_allocation
        crypto_allocation = request.crypto_allocation

        # Calculate capital allocation
        bond_capital = initial_capital * bond_allocation
        reit_capital = initial_capital * reit_allocation
        crypto_capital = initial_capital * crypto_allocation

        # Calculate daily yields
        bond_daily_yield = request.bond_yield / 365
        reit_daily_yield = request.reit_yield / 365
        crypto_daily_yield = request.crypto_apy / 365

        # Simulate daily income
        daily_income = []
        cumulative_income = 0

        for day in range(time_horizon):
            # Calculate daily income from each asset
            bond_income = bond_capital * bond_daily_yield
            reit_income = reit_capital * reit_daily_yield
            crypto_income = crypto_capital * crypto_daily_yield

            total_daily_income = bond_income + reit_income + crypto_income
            cumulative_income += total_daily_income

            daily_income.append({
                "day": day + 1,
                "bond_income": bond_income,
                "reit_income": reit_income,
                "crypto_income": crypto_income,
                "total_daily_income": total_daily_income,
                "cumulative_income": cumulative_income
            })

        # Calculate summary statistics
        total_income = cumulative_income
        annualized_yield = (total_income / initial_capital) * \
            (365 / time_horizon)

        # Breakdown by asset
        bond_total_income = bond_capital * \
            request.bond_yield * (time_horizon / 365)
        reit_total_income = reit_capital * \
            request.reit_yield * (time_horizon / 365)
        crypto_total_income = crypto_capital * \
            request.crypto_apy * (time_horizon / 365)

        return {
            "initial_capital": initial_capital,
            "time_horizon_days": time_horizon,
            "allocations": {
                "bonds": bond_allocation,
                "reits": reit_allocation,
                "crypto": crypto_allocation
            },
            "capital_allocation": {
                "bonds": bond_capital,
                "reits": reit_capital,
                "crypto": crypto_capital
            },
            "yields": {
                "bond_yield": request.bond_yield,
                "reit_yield": request.reit_yield,
                "crypto_apy": request.crypto_apy
            },
            "income_breakdown": {
                "bond_income": bond_total_income,
                "reit_income": reit_total_income,
                "crypto_income": crypto_total_income,
                "total_income": total_income
            },
            "summary": {
                "total_income": total_income,
                "annualized_yield": annualized_yield,
                "income_per_day": total_income / time_horizon,
                "income_per_month": total_income / (time_horizon / 30)
            },
            # Return first 30 days for chart
            "daily_income": daily_income[:30],
            "chart_data": {
                "dates": [f"Day {i+1}" for i in range(min(30, time_horizon))],
                "bond_income": [day["bond_income"] for day in daily_income[:30]],
                "reit_income": [day["reit_income"] for day in daily_income[:30]],
                "crypto_income": [day["crypto_income"] for day in daily_income[:30]],
                "total_income": [day["total_daily_income"] for day in daily_income[:30]],
                "cumulative_income": [day["cumulative_income"] for day in daily_income[:30]]
            }
        }
