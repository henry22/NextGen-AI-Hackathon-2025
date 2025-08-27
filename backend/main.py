from services.investment_metrics_service import InvestmentMetricsService
from services.leaderboard_service import LeaderboardService
from services.coach_service import CoachService
from services.yield_sim_service import YieldSimService
from services.rebalance_service import RebalanceService
from services.optimization_service import OptimizationService
from services.simulation_service import SimulationService
from services.price_service import PriceService
from models import (
    PriceRequest, SimulationRequest, OptimizationRequest,
    RebalanceRequest, YieldSimRequest, CoachRequest,
    LeaderboardSubmit, LeaderboardResponse
)
from database import get_db, init_db
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import sqlite3
import yfinance as yf
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import our modules

app = FastAPI(
    title="Legacy Guardians API",
    description="Financial Education Platform for Australian Teenagers",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
                   "http://localhost:8501"],  # React + Streamlit
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database


@app.on_event("startup")
async def startup_event():
    init_db()

# Health check


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Core endpoints


@app.get("/seed/events")
async def get_events():
    """Get historical financial events from CSV"""
    try:
        events_df = pd.read_csv("data/events.csv")
        return events_df.to_dict("records")
    except FileNotFoundError:
        # Return default events if CSV not found
        return [
            {
                "year": 1990,
                "title": "Japanese Bubble Economy Collapse",
                "description": "The bursting of Japan's real estate and stock market bubbles",
                "available_assets": ["NIKKEI", "GOLD", "BONDS"],
                "market_volatility": "high",
                "open_trading": True
            },
            {
                "year": 2000,
                "title": "Dot-com Bubble Burst",
                "description": "Tech stocks plummeted, Nasdaq fell 78%",
                "available_assets": ["QQQ", "GOLD", "BONDS"],
                "market_volatility": "high",
                "open_trading": True
            }
        ]


@app.get("/prices")
async def get_prices(
    tickers: str,
    period: str = "1y",
    db: sqlite3.Connection = Depends(get_db)
):
    """Get historical prices with caching"""
    # For now, return mock data spanning from 1990 to current year
    # This provides better chart visualization
    ticker_list = tickers.split(",")

    # Generate mock data spanning from 1990 to current year
    start_year = 1990
    current_year = datetime.now().year
    dates = pd.date_range(
        start=f"{start_year}-01-01", end=f"{current_year}-12-31", freq="D")
    data = {}

    for ticker in ticker_list:
        np.random.seed(hash(ticker) % 2**32)

        # Create realistic multi-decade trend with market cycles
        years = current_year - start_year + 1
        base_price = 100

        # Create different trends for different assets
        if ticker == "VTI":  # Stock market - long term growth with cycles
            # 200% growth over 30+ years
            trend = np.linspace(0, 2.0, len(dates))
            # Add market cycles (boom and bust)
            # 7-year cycle
            cycle1 = 0.3 * \
                np.sin(2 * np.pi * np.arange(len(dates)) / (365 * 7))
            # 3-year cycle
            cycle2 = 0.1 * \
                np.sin(2 * np.pi * np.arange(len(dates)) / (365 * 3))
            noise = np.random.randn(len(dates)) * 0.02
            prices = base_price * (1 + trend + cycle1 + cycle2 + noise)

        elif ticker == "BND":  # Bonds - steady growth
            # 80% growth over 30+ years
            trend = np.linspace(0, 0.8, len(dates))
            noise = np.random.randn(len(dates)) * 0.005
            prices = base_price * (1 + trend + noise)

        elif ticker == "GLD":  # Gold - volatile but upward
            # 120% growth over 30+ years
            trend = np.linspace(0, 1.2, len(dates))
            volatility = 0.3 * \
                np.sin(2 * np.pi * np.arange(len(dates)) / (365 * 5))
            noise = np.random.randn(len(dates)) * 0.03
            prices = base_price * (1 + trend + volatility + noise)

        else:  # Default for other assets
            # 150% growth over 30+ years
            trend = np.linspace(0, 1.5, len(dates))
            noise = np.random.randn(len(dates)) * 0.02
            prices = base_price * (1 + trend + noise)

        # Ensure prices don't go negative
        prices = np.maximum(prices, base_price * 0.1)

        ticker_data = []
        for i, date in enumerate(dates):
            ticker_data.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": prices[i] * 0.99,
                "high": prices[i] * 1.01,
                "low": prices[i] * 0.98,
                "close": prices[i],
                "volume": int(np.random.uniform(1000000, 5000000))
            })

        data[ticker] = ticker_data

    return {
        "data": data,
        "cached": False,
        "timestamp": datetime.now().isoformat()
    }


@app.post("/simulate")
async def simulate_investment(request: SimulationRequest):
    """Simulate investment returns with cash flow breakdown"""
    # Generate realistic simulation results with extended timeline
    initial_capital = request.initial_capital

    # Simulate different scenarios based on asset allocation
    asset_weights = request.asset_weights

    # Calculate expected returns based on asset mix
    total_return = 0
    if "VTI" in asset_weights:
        total_return += asset_weights["VTI"] * 0.08  # 8% for stocks
    if "BND" in asset_weights:
        total_return += asset_weights["BND"] * 0.04  # 4% for bonds
    if "GLD" in asset_weights:
        total_return += asset_weights["GLD"] * 0.06  # 6% for gold

    # Add some randomness
    total_return += np.random.normal(0, 0.02)

    final_value = initial_capital * (1 + total_return)

    # Generate performance chart data (yearly from 1990 to current)
    years = list(range(1990, datetime.now().year + 1))
    performance_chart = []

    for year in years:
        # Simulate growth over time with some volatility
        years_elapsed = year - 1990
        total_years = len(years)

        # Add some market cycles
        cycle_factor = 1 + 0.2 * \
            np.sin(2 * np.pi * years_elapsed / 7)  # 7-year cycle
        growth_factor = (1 + total_return) ** (years_elapsed /
                                               total_years) * cycle_factor
        value = initial_capital * growth_factor

        performance_chart.append({
            "date": f"{year}-01-01",
            "value": max(value, initial_capital * 0.1)  # Ensure minimum value
        })

    return {
        "final_value": final_value,
        "total_return": total_return,
        "annualized_return": total_return,
        "volatility": 0.15 + np.random.normal(0, 0.05),
        "sharpe_ratio": max(0.1, total_return / 0.15),
        "max_drawdown": -0.1 - abs(np.random.normal(0, 0.05)),
        "performance_chart": performance_chart
    }


@app.post("/optimize")
async def optimize_portfolio(request: OptimizationRequest):
    """Optimize portfolio using Sharpe ratio"""
    optimization_service = OptimizationService()
    return await optimization_service.optimize(request)


@app.post("/rebalance")
async def rebalance_portfolio(request: RebalanceRequest):
    """Auto-rebalance portfolio to target weights"""
    rebalance_service = RebalanceService()
    return await rebalance_service.rebalance(request)


@app.post("/yield-sim")
async def simulate_yield(request: YieldSimRequest):
    """Simulate passive income from bonds, REITs, crypto"""
    yield_service = YieldSimService()
    return await yield_service.simulate(request)


@app.post("/coach")
async def get_coach_advice(request: CoachRequest):
    """Get personalized AI coach advice"""
    coach_service = CoachService()
    return await coach_service.get_advice(request)


@app.post("/leaderboard/submit")
async def submit_score(
    request: LeaderboardSubmit,
    db: sqlite3.Connection = Depends(get_db)
):
    """Submit player score to leaderboard"""
    leaderboard_service = LeaderboardService()
    return await leaderboard_service.submit_score(request, db)


@app.get("/leaderboard/top")
async def get_leaderboard(
    season: str = "current",
    limit: int = 10,
    db: sqlite3.Connection = Depends(get_db)
):
    """Get top players from leaderboard"""
    leaderboard_service = LeaderboardService()
    return await leaderboard_service.get_top_players(season, limit, db)

# Real historical data endpoints


@app.get("/investment-metrics/{ticker}")
async def get_investment_metrics(
    ticker: str,
    start_date: str,
    end_date: str,
    initial_investment: float = 100000
):
    """Get real investment metrics from historical data"""
    investment_metrics_service = InvestmentMetricsService()
    return await investment_metrics_service.calculate_investment_metrics(
        ticker=ticker,
        start_date=start_date,
        end_date=end_date,
        initial_investment=initial_investment
    )


@app.get("/historical-performance/{ticker}/{event_year}")
async def get_historical_performance(
    ticker: str,
    event_year: int
):
    """Get performance for a specific historical event"""
    investment_metrics_service = InvestmentMetricsService()
    return await investment_metrics_service.calculate_historical_performance(
        ticker=ticker,
        event_year=event_year
    )


@app.get("/asset-comparison")
async def get_asset_comparison(
    assets: str,
    start_date: str,
    end_date: str
):
    """Compare performance of multiple assets"""
    asset_list = assets.split(",")
    investment_metrics_service = InvestmentMetricsService()
    return await investment_metrics_service.get_asset_performance_comparison(
        assets=asset_list,
        start_date=start_date,
        end_date=end_date
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
