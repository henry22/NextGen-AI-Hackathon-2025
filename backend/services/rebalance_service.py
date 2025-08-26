from typing import Dict, List, Any
from models import RebalanceRequest


class RebalanceService:
    def __init__(self):
        pass

    async def rebalance(self, request: RebalanceRequest) -> Dict[str, Any]:
        """Auto-rebalance portfolio to target weights"""

        current_weights = request.current_weights
        target_weights = request.target_weights
        threshold = request.rebalance_threshold
        transaction_cost = request.transaction_cost

        # Calculate deviations
        deviations = {}
        total_deviation = 0

        for asset in target_weights:
            current = current_weights.get(asset, 0)
            target = target_weights[asset]
            deviation = abs(current - target)
            deviations[asset] = {
                "current": current,
                "target": target,
                "deviation": deviation,
                "needs_rebalance": deviation > threshold
            }
            total_deviation += deviation

        # Determine if rebalancing is needed
        needs_rebalance = total_deviation > threshold

        if not needs_rebalance:
            return {
                "needs_rebalance": False,
                "message": "Portfolio is within rebalancing threshold",
                "deviations": deviations,
                "total_deviation": total_deviation,
                "rebalance_actions": []
            }

        # Calculate rebalancing actions
        rebalance_actions = []
        total_transaction_cost = 0

        for asset, data in deviations.items():
            if data["needs_rebalance"]:
                current = data["current"]
                target = data["target"]
                difference = target - current

                action = {
                    "asset": asset,
                    "current_weight": current,
                    "target_weight": target,
                    "adjustment": difference,
                    "action": "buy" if difference > 0 else "sell",
                    "amount": abs(difference)
                }

                # Calculate transaction cost
                cost = abs(difference) * transaction_cost
                action["transaction_cost"] = cost
                total_transaction_cost += cost

                rebalance_actions.append(action)

        return {
            "needs_rebalance": True,
            "message": f"Portfolio needs rebalancing (deviation: {total_deviation:.1%})",
            "deviations": deviations,
            "total_deviation": total_deviation,
            "rebalance_actions": rebalance_actions,
            "total_transaction_cost": total_transaction_cost,
            "new_weights": target_weights
        }
