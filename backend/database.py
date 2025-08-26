import sqlite3
import pandas as pd
from typing import Generator
import os
import threading

DATABASE_URL = "legacy_guardians.db"

# Thread-local storage for database connections
_local = threading.local()


def get_db() -> Generator[sqlite3.Connection, None, None]:
    """Get database connection (thread-safe)"""
    if not hasattr(_local, 'conn') or _local.conn is None:
        _local.conn = sqlite3.connect(DATABASE_URL, check_same_thread=False)
        _local.conn.row_factory = sqlite3.Row
        # Enable WAL mode for better concurrency
        _local.conn.execute("PRAGMA journal_mode=WAL")

    try:
        yield _local.conn
    except Exception:
        # If there's an error, close the connection and create a new one
        if hasattr(_local, 'conn') and _local.conn:
            _local.conn.close()
            _local.conn = None
        raise


def init_db():
    """Initialize database tables"""
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()

    # Prices table for caching
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS prices (
            ticker TEXT,
            date DATE,
            open REAL,
            high REAL,
            low REAL,
            close REAL,
            volume INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (ticker, date)
        )
    """)

    # Events table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            year INTEGER,
            title TEXT,
            description TEXT,
            available_assets TEXT,
            market_volatility TEXT,
            open_trading BOOLEAN,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Leaderboard table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS leaderboard (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id TEXT,
            player_name TEXT,
            season TEXT,
            total_score REAL,
            risk_adjusted_return REAL,
            completed_missions INTEGER,
            exploration_breadth INTEGER,
            portfolio_performance TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Player progress table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS player_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id TEXT,
            mission_id TEXT,
            completed_at TIMESTAMP,
            score REAL,
            performance_data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Coach interactions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS coach_interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id TEXT,
            coach_level TEXT,
            request_data TEXT,
            response_data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()

    # Create data directory if it doesn't exist
    os.makedirs("data", exist_ok=True)

    # Create default events CSV if it doesn't exist
    if not os.path.exists("data/events.csv"):
        create_default_events_csv()


def create_default_events_csv():
    """Create default events CSV file"""
    events_data = [
        {
            "year": 1990,
            "title": "Japanese Bubble Economy Collapse",
            "description": "The bursting of Japan's real estate and stock market bubbles marked the beginning of the lost decade",
            "available_assets": "NIKKEI,GOLD,BONDS",
            "market_volatility": "high",
            "open_trading": True
        },
        {
            "year": 1997,
            "title": "Asian Financial Crisis",
            "description": "The financial crisis that began in Thailand swept across Asia",
            "available_assets": "VTI,GOLD,BONDS",
            "market_volatility": "high",
            "open_trading": True
        },
        {
            "year": 2000,
            "title": "Dot-com Bubble Burst",
            "description": "Tech stocks plummeted, with the Nasdaq index falling by 78%",
            "available_assets": "QQQ,GOLD,BONDS",
            "market_volatility": "high",
            "open_trading": True
        },
        {
            "year": 2008,
            "title": "Global Financial Crisis",
            "description": "The subprime mortgage crisis triggered a global financial system collapse",
            "available_assets": "VTI,GOLD,BONDS,REITs",
            "market_volatility": "extreme",
            "open_trading": True
        },
        {
            "year": 2020,
            "title": "COVID-19 Pandemic Impact",
            "description": "Global pandemic caused economic shutdowns and extreme market volatility",
            "available_assets": "VTI,QQQ,GOLD,BONDS,REITs",
            "market_volatility": "extreme",
            "open_trading": True
        },
        {
            "year": 2025,
            "title": "Current Challenges",
            "description": "Inflation, rising interest rates, and geopolitical risks",
            "available_assets": "VTI,QQQ,GOLD,BONDS,REITs,CRYPTO",
            "market_volatility": "medium",
            "open_trading": True
        }
    ]

    df = pd.DataFrame(events_data)
    df.to_csv("data/events.csv", index=False)
