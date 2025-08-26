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

# Import our modules
from database import get_db, init_db
from models import (
    PriceRequest, SimulationRequest, OptimizationRequest,
    RebalanceRequest, YieldSimRequest, CoachRequest,
    LeaderboardSubmit, LeaderboardResponse
)
from services.price_service import PriceService
from services.simulation_service import SimulationService
from services.optimization_service import OptimizationService
from services.rebalance_service import RebalanceService
from services.yield_sim_service import YieldSimService
from services.coach_service import CoachService
from services.leaderboard_service import LeaderboardService

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
    price_service = PriceService()
    return await price_service.get_prices(tickers.split(","), period, db)


@app.post("/simulate")
async def simulate_investment(request: SimulationRequest):
    """Simulate investment returns with cash flow breakdown"""
    simulation_service = SimulationService()
    return await simulation_service.simulate(request)


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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
