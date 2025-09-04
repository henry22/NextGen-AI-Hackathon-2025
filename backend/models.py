from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum


class TradingType(str, Enum):
    OPEN = "open"
    CLOSED = "closed"


class InvestmentGoal(str, Enum):
    CASH_FLOW = "cash_flow"
    CAPITAL_GAINS = "capital_gains"
    BALANCED = "balanced"


class CoachLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class PriceRequest(BaseModel):
    tickers: List[str]
    period: str = "1y"
    interval: str = "1d"


class SimulationRequest(BaseModel):
    initial_capital: float = Field(
        100000, description="Initial investment amount")
    asset_weights: Dict[str,
                        float] = Field(..., description="Asset allocation weights")
    trading_type: TradingType = TradingType.OPEN
    investment_goal: InvestmentGoal = InvestmentGoal.BALANCED
    time_horizon: int = Field(365, description="Investment period in days")
    rebalance_frequency: int = Field(
        30, description="Rebalance frequency in days")
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class OptimizationRequest(BaseModel):
    available_assets: List[str]
    risk_tolerance: float = Field(
        0.5, ge=0, le=1, description="Risk tolerance 0-1")
    target_return: Optional[float] = None
    constraints: Optional[Dict[str, float]] = None  # Min/max weights per asset


class RebalanceRequest(BaseModel):
    current_weights: Dict[str, float]
    target_weights: Dict[str, float]
    rebalance_threshold: float = Field(
        0.05, description="Threshold for rebalancing")
    transaction_cost: float = Field(
        0.001, description="Transaction cost as percentage")


class YieldSimRequest(BaseModel):
    bond_allocation: float = Field(0.3, ge=0, le=1)
    reit_allocation: float = Field(0.2, ge=0, le=1)
    crypto_allocation: float = Field(0.1, ge=0, le=1)
    initial_capital: float = Field(100000)
    time_horizon: int = Field(365)
    bond_yield: float = Field(0.04, description="Annual bond yield")
    reit_yield: float = Field(0.06, description="Annual REIT yield")
    crypto_apy: float = Field(0.08, description="Annual crypto APY")


class CoachRequest(BaseModel):
    player_level: CoachLevel = CoachLevel.BEGINNER
    current_portfolio: Dict[str, float]
    investment_goal: InvestmentGoal
    recent_performance: Optional[Dict[str, Any]] = None
    risk_tolerance: float = Field(0.5, ge=0, le=1)
    time_horizon: int = Field(365)
    completed_missions: List[str] = []
    current_mission: Optional[str] = None
    player_context: Optional[str] = None


class LeaderboardSubmit(BaseModel):
    player_id: str
    player_name: str
    season: str = "current"
    total_score: float
    risk_adjusted_return: float
    completed_missions: int
    exploration_breadth: int
    portfolio_performance: Dict[str, Any]


class LeaderboardResponse(BaseModel):
    rank: int
    player_name: str
    total_score: float
    risk_adjusted_return: float
    completed_missions: int
    exploration_breadth: int
    timestamp: datetime


class SimulationResponse(BaseModel):
    final_value: float
    total_return: float
    annualized_return: float
    volatility: float
    sharpe_ratio: float
    max_drawdown: float
    cash_flow_breakdown: Dict[str, float]
    capital_gains_breakdown: Dict[str, float]
    rebalance_events: List[Dict[str, Any]]
    performance_chart: Dict[str, Any]


class OptimizationResponse(BaseModel):
    optimal_weights: Dict[str, float]
    expected_return: float
    expected_volatility: float
    sharpe_ratio: float
    risk_contribution: Dict[str, float]
    recommendations: List[str]


class CoachResponse(BaseModel):
    advice: str
    recommendations: List[str]
    next_steps: List[str]
    risk_assessment: str
    educational_insights: List[str]
    encouragement: str


class RewardRedeemRequest(BaseModel):
    user_email: str = Field(..., description="User's email address")
    reward_name: str = Field(..., description="Name of the reward")
    partner: str = Field(..., description="Partner brand name")
    reward_description: str = Field(...,
                                    description="Description of the reward")
    player_xp: int = Field(..., description="Player's current XP")
    reward_cost: int = Field(..., description="Cost of the reward in XP")


class RewardRedeemResponse(BaseModel):
    success: bool
    message: str
    coupon_code: Optional[str] = None
    simulated: bool = False
    email_sent: bool = False

class Holding(BaseModel):
    shares: float
    avgPrice: float
    currentPrice: Optional[float] = None
    dailyChange: Optional[float] = None

class AICoach(BaseModel):
    id: str
    name: str
    avatar: Optional[str] = None
    style: Optional[str] = None
    gif: Optional[str] = None

class Action(BaseModel):
    type: str  # "buy" | "sell"
    asset: str
    amount: float
    price: Optional[float] = None

class CoachReplyRequest(BaseModel):
    selectedCoach: AICoach
    userMessage: Optional[str] = None
    portfolio: Optional[Dict[str, Holding]] = None
    cash: Optional[float] = 0.0
    action: Optional[Action] = None

class CoachReplyResponse(BaseModel):
    reply: str
