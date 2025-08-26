// API service for Legacy Guardians
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface PriceData {
  data: Record<string, any[]>;
  cached: boolean;
  timestamp: string;
}

export interface SimulationRequest {
  initial_capital: number;
  asset_weights: Record<string, number>;
  trading_type: "open" | "closed";
  investment_goal: "cash_flow" | "capital_gains" | "balanced";
  time_horizon: number;
  rebalance_frequency?: number;
  start_date?: string;
  end_date?: string;
}

export interface SimulationResponse {
  final_value: number;
  total_return: number;
  annualized_return: number;
  volatility: number;
  sharpe_ratio: number;
  max_drawdown: number;
  cash_flow_breakdown: Record<string, number>;
  capital_gains_breakdown: Record<string, number>;
  rebalance_events: Array<{
    date: string;
    action: string;
    description: string;
  }>;
  performance_chart: {
    dates: string[];
    values: number[];
    returns: number[];
  };
}

export interface CoachRequest {
  player_level: "beginner" | "intermediate" | "advanced";
  current_portfolio: Record<string, number>;
  investment_goal: "cash_flow" | "capital_gains" | "balanced";
  risk_tolerance: number;
  time_horizon: number;
  completed_missions: string[];
  current_mission?: string;
  player_context?: string;
}

export interface CoachResponse {
  advice: string;
  recommendations: string[];
  next_steps: string[];
  risk_assessment: string;
  educational_insights: string[];
  encouragement: string;
}

export interface LeaderboardSubmit {
  player_id: string;
  player_name: string;
  season: string;
  total_score: number;
  risk_adjusted_return: number;
  completed_missions: number;
  exploration_breadth: number;
  portfolio_performance: Record<string, any>;
}

export interface LeaderboardResponse {
  rank: number;
  player_name: string;
  total_score: number;
  risk_adjusted_return: number;
  completed_missions: number;
  exploration_breadth: number;
  timestamp: string;
}

export const api = {
  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) throw new Error("Health check failed");
    return response.json();
  },

  // Get historical events
  async getEvents(): Promise<any[]> {
    const response = await fetch(`${API_BASE}/seed/events`);
    if (!response.ok) throw new Error("Failed to fetch events");
    return response.json();
  },

  // Get price data
  async getPrices(
    tickers: string[],
    period: string = "1y"
  ): Promise<PriceData> {
    const response = await fetch(
      `${API_BASE}/prices?tickers=${tickers.join(",")}&period=${period}`
    );
    if (!response.ok) throw new Error("Failed to fetch price data");
    return response.json();
  },

  // Simulate investment
  async simulateInvestment(
    request: SimulationRequest
  ): Promise<SimulationResponse> {
    const response = await fetch(`${API_BASE}/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error("Simulation failed");
    return response.json();
  },

  // Get AI coach advice
  async getCoachAdvice(request: CoachRequest): Promise<CoachResponse> {
    const response = await fetch(`${API_BASE}/coach`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error("Failed to get coach advice");
    return response.json();
  },

  // Submit to leaderboard
  async submitToLeaderboard(request: LeaderboardSubmit): Promise<any> {
    const response = await fetch(`${API_BASE}/leaderboard/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error("Failed to submit to leaderboard");
    return response.json();
  },

  // Get leaderboard
  async getLeaderboard(
    season: string = "current",
    limit: number = 10
  ): Promise<LeaderboardResponse[]> {
    const response = await fetch(
      `${API_BASE}/leaderboard/top?season=${season}&limit=${limit}`
    );
    if (!response.ok) throw new Error("Failed to fetch leaderboard");
    return response.json();
  },

  // Optimize portfolio
  async optimizePortfolio(
    available_assets: string[],
    risk_tolerance: number = 0.5
  ): Promise<any> {
    const response = await fetch(`${API_BASE}/optimize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        available_assets,
        risk_tolerance,
      }),
    });
    if (!response.ok) throw new Error("Portfolio optimization failed");
    return response.json();
  },

  // Rebalance portfolio
  async rebalancePortfolio(
    current_weights: Record<string, number>,
    target_weights: Record<string, number>
  ): Promise<any> {
    const response = await fetch(`${API_BASE}/rebalance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current_weights,
        target_weights,
        rebalance_threshold: 0.05,
        transaction_cost: 0.001,
      }),
    });
    if (!response.ok) throw new Error("Portfolio rebalancing failed");
    return response.json();
  },

  // Simulate yield
  async simulateYield(
    bond_allocation: number,
    reit_allocation: number,
    crypto_allocation: number,
    initial_capital: number = 100000,
    time_horizon: number = 365
  ): Promise<any> {
    const response = await fetch(`${API_BASE}/yield-sim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bond_allocation,
        reit_allocation,
        crypto_allocation,
        initial_capital,
        time_horizon,
        bond_yield: 0.04,
        reit_yield: 0.06,
        crypto_apy: 0.08,
      }),
    });
    if (!response.ok) throw new Error("Yield simulation failed");
    return response.json();
  },
};

// Error handling utility
export const handleApiError = (error: any) => {
  console.error("API Error:", error);
  if (error.message.includes("Failed to fetch")) {
    return "Unable to connect to the server. Please check if the backend is running.";
  }
  return error.message || "An unexpected error occurred";
};

// Loading state utility
export const withLoading = async <T>(
  promise: Promise<T>,
  setLoading: (loading: boolean) => void
): Promise<T> => {
  setLoading(true);
  try {
    const result = await promise;
    return result;
  } finally {
    setLoading(false);
  }
};
