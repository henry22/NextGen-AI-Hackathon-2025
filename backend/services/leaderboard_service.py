import sqlite3
from typing import Dict, List, Any
from datetime import datetime
from models import LeaderboardSubmit, LeaderboardResponse


class LeaderboardService:
    def __init__(self):
        pass

    async def submit_score(self, request: LeaderboardSubmit, db: sqlite3.Connection = None) -> Dict[str, Any]:
        """Submit player score to leaderboard"""
        if not db:
            return {"success": False, "message": "Database connection required"}

        cursor = db.cursor()

        # Insert or update player score
        cursor.execute("""
            INSERT OR REPLACE INTO leaderboard 
            (player_id, player_name, season, total_score, risk_adjusted_return, 
             completed_missions, exploration_breadth, portfolio_performance, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            request.player_id,
            request.player_name,
            request.season,
            request.total_score,
            request.risk_adjusted_return,
            request.completed_missions,
            request.exploration_breadth,
            str(request.portfolio_performance),
            datetime.now().isoformat()
        ))

        db.commit()

        # Get updated rank
        cursor.execute("""
            SELECT COUNT(*) + 1 as rank
            FROM leaderboard 
            WHERE season = ? AND total_score > ?
        """, (request.season, request.total_score))

        rank_result = cursor.fetchone()
        rank = rank_result[0] if rank_result else 1

        return {
            "success": True,
            "rank": rank,
            "message": f"Score submitted successfully! You are ranked #{rank}",
            "player_id": request.player_id,
            "total_score": request.total_score
        }

    async def get_top_players(self, season: str = "current", limit: int = 10, db: sqlite3.Connection = None) -> List[LeaderboardResponse]:
        """Get top players from leaderboard"""
        if not db:
            return []

        cursor = db.cursor()

        cursor.execute("""
            SELECT player_name, total_score, risk_adjusted_return, 
                   completed_missions, exploration_breadth, created_at
            FROM leaderboard 
            WHERE season = ?
            ORDER BY total_score DESC, risk_adjusted_return DESC
            LIMIT ?
        """, (season, limit))

        results = cursor.fetchall()

        leaderboard = []
        for i, row in enumerate(results):
            leaderboard.append(LeaderboardResponse(
                rank=i + 1,
                player_name=row[0],
                total_score=row[1],
                risk_adjusted_return=row[2],
                completed_missions=row[3],
                exploration_breadth=row[4],
                timestamp=row[5]
            ))

        return leaderboard
