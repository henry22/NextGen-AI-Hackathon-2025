import numpy as np
from scipy.optimize import minimize
from typing import Dict, List, Any
from models import OptimizationRequest, OptimizationResponse


class OptimizationService:
    def __init__(self):
        self.risk_free_rate = 0.02

    async def optimize(self, request: OptimizationRequest) -> OptimizationResponse:
        """Optimize portfolio using Sharpe ratio"""

        # Mock asset characteristics
        asset_characteristics = {
            "VTI": {"return": 0.08, "volatility": 0.15},
            "QQQ": {"return": 0.12, "volatility": 0.20},
            "BND": {"return": 0.04, "volatility": 0.05},
            "GLD": {"return": 0.06, "volatility": 0.12},
            "VNQ": {"return": 0.07, "volatility": 0.18},
            "BITO": {"return": 0.15, "volatility": 0.35},
        }

        # Get available assets with characteristics
        available_assets = []
        returns = []
        cov_matrix = []

        for asset in request.available_assets:
            if asset in asset_characteristics:
                available_assets.append(asset)
                char = asset_characteristics[asset]
                returns.append(char["return"])
                cov_matrix.append([char["volatility"] ** 2])

        if not available_assets:
            # Return default allocation
            return OptimizationResponse(
                optimal_weights={"VTI": 0.6, "BND": 0.4},
                expected_return=0.06,
                expected_volatility=0.10,
                sharpe_ratio=0.4,
                risk_contribution={"VTI": 0.6, "BND": 0.4},
                recommendations=["Consider diversifying your portfolio"]
            )

        # Convert to numpy arrays
        returns = np.array(returns)
        cov_matrix = np.array(cov_matrix)

        # Simple optimization: maximize Sharpe ratio
        def negative_sharpe(weights):
            portfolio_return = np.dot(weights, returns)
            portfolio_volatility = np.sqrt(
                np.dot(weights.T, np.dot(cov_matrix, weights)))
            if portfolio_volatility == 0:
                return -1000
            sharpe = (portfolio_return - self.risk_free_rate) / \
                portfolio_volatility
            return -sharpe

        # Constraints: weights sum to 1
        constraints = {'type': 'eq', 'fun': lambda x: np.sum(x) - 1}

        # Bounds: weights between 0 and 1
        bounds = [(0, 1) for _ in available_assets]

        # Initial guess: equal weights
        x0 = np.array([1.0 / len(available_assets) for _ in available_assets])

        # Optimize
        result = minimize(negative_sharpe, x0, method='SLSQP',
                          bounds=bounds, constraints=constraints)

        if result.success:
            optimal_weights = {asset: weight for asset,
                               weight in zip(available_assets, result.x)}
            portfolio_return = np.dot(result.x, returns)
            portfolio_volatility = np.sqrt(
                np.dot(result.x.T, np.dot(cov_matrix, result.x)))
            sharpe_ratio = (portfolio_return - self.risk_free_rate) / \
                portfolio_volatility if portfolio_volatility > 0 else 0

            return OptimizationResponse(
                optimal_weights=optimal_weights,
                expected_return=portfolio_return,
                expected_volatility=portfolio_volatility,
                sharpe_ratio=sharpe_ratio,
                risk_contribution=optimal_weights,
                recommendations=[
                    f"Optimal allocation found with {len(available_assets)} assets",
                    f"Expected return: {portfolio_return:.1%}",
                    f"Expected volatility: {portfolio_volatility:.1%}",
                    f"Sharpe ratio: {sharpe_ratio:.2f}"
                ]
            )
        else:
            # Fallback to equal weights
            equal_weights = {
                asset: 1.0 / len(available_assets) for asset in available_assets}
            portfolio_return = np.mean(returns)
            portfolio_volatility = np.mean(
                [char["volatility"] for char in asset_characteristics.values()])

            return OptimizationResponse(
                optimal_weights=equal_weights,
                expected_return=portfolio_return,
                expected_volatility=portfolio_volatility,
                sharpe_ratio=0.5,
                risk_contribution=equal_weights,
                recommendations=["Using equal weight allocation as fallback"]
            )
