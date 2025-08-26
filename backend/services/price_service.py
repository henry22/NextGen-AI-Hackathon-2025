import yfinance as yf
import pandas as pd
import sqlite3
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import asyncio
from concurrent.futures import ThreadPoolExecutor


class PriceService:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=4)

    async def get_prices(self, tickers: List[str], period: str = "1y", db: sqlite3.Connection = None) -> Dict[str, Any]:
        """Get historical prices with caching"""
        # Check cache first
        cached_data = await self._get_cached_prices(tickers, period, db)
        if cached_data:
            return cached_data

        # Fetch from yfinance
        price_data = await self._fetch_prices(tickers, period)

        # Cache the data
        await self._cache_prices(price_data, db)

        return price_data

    async def _get_cached_prices(self, tickers: List[str], period: str, db: sqlite3.Connection = None) -> Optional[Dict[str, Any]]:
        """Check if prices are cached and still valid"""
        if not db:
            return None
        cursor = db.cursor()

        # Calculate date range
        end_date = datetime.now()
        if period == "1y":
            start_date = end_date - timedelta(days=365)
        elif period == "2y":
            start_date = end_date - timedelta(days=730)
        elif period == "5y":
            start_date = end_date - timedelta(days=1825)
        else:
            start_date = end_date - timedelta(days=365)

        # Check if we have recent data for all tickers
        placeholders = ",".join(["?" for _ in tickers])
        query = f"""
            SELECT ticker, COUNT(*) as count, MAX(created_at) as last_update
            FROM prices 
            WHERE ticker IN ({placeholders}) 
            AND date >= ? 
            AND date <= ?
            GROUP BY ticker
        """

        cursor.execute(
            query, tickers + [start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d")])
        results = cursor.fetchall()

        # If we have data for all tickers and it's recent (within 1 hour), return cached data
        if len(results) == len(tickers):
            for result in results:
                last_update = datetime.fromisoformat(result["last_update"])
                if datetime.now() - last_update > timedelta(hours=1):
                    return None

            # Return cached data
            return await self._fetch_cached_data(tickers, start_date, end_date, db)

        return None

    async def _fetch_cached_data(self, tickers: List[str], start_date: datetime, end_date: datetime, db: sqlite3.Connection = None) -> Dict[str, Any]:
        """Fetch data from cache"""
        if not db:
            return None
        cursor = db.cursor()

        placeholders = ",".join(["?" for _ in tickers])
        query = f"""
            SELECT ticker, date, open, high, low, close, volume
            FROM prices 
            WHERE ticker IN ({placeholders}) 
            AND date >= ? 
            AND date <= ?
            ORDER BY ticker, date
        """

        cursor.execute(
            query, tickers + [start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d")])
        results = cursor.fetchall()

        # Convert to DataFrame format
        data = {}
        for ticker in tickers:
            ticker_data = [dict(row)
                           for row in results if row["ticker"] == ticker]
            if ticker_data:
                df = pd.DataFrame(ticker_data)
                if 'date' in df.columns:
                    df["date"] = pd.to_datetime(df["date"])
                    df.set_index("date", inplace=True)
                data[ticker] = df.to_dict("records")

        return {
            "data": data,
            "cached": True,
            "timestamp": datetime.now().isoformat()
        }

    async def _fetch_prices(self, tickers: List[str], period: str) -> Dict[str, Any]:
        """Fetch prices from yfinance"""
        loop = asyncio.get_event_loop()

        def fetch_ticker_data(ticker: str):
            try:
                stock = yf.Ticker(ticker)
                hist = stock.history(period=period)
                return ticker, hist
            except Exception as e:
                print(f"Error fetching data for {ticker}: {e}")
                return ticker, None

        # Fetch data concurrently
        tasks = [loop.run_in_executor(
            self.executor, fetch_ticker_data, ticker) for ticker in tickers]
        results = await asyncio.gather(*tasks)

        data = {}
        for ticker, hist in results:
            if hist is not None and not hist.empty:
                # Convert to records format
                hist_reset = hist.reset_index()
                hist_reset["date"] = hist_reset["Date"].dt.strftime("%Y-%m-%d")
                data[ticker] = hist_reset[["date", "Open", "High",
                                           "Low", "Close", "Volume"]].to_dict("records")

        return {
            "data": data,
            "cached": False,
            "timestamp": datetime.now().isoformat()
        }

    async def _cache_prices(self, price_data: Dict[str, Any], db: sqlite3.Connection = None):
        """Cache price data to database"""
        if not db:
            return
        cursor = db.cursor()

        for ticker, records in price_data["data"].items():
            for record in records:
                cursor.execute("""
                    INSERT OR REPLACE INTO prices 
                    (ticker, date, open, high, low, close, volume, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    ticker,
                    record["date"],
                    record["Open"],
                    record["High"],
                    record["Low"],
                    record["Close"],
                    record["Volume"],
                    datetime.now().isoformat()
                ))

        db.commit()

    def get_available_tickers(self) -> List[str]:
        """Get list of available tickers for the game"""
        return [
            # Stocks & ETFs
            "VTI",  # Total Stock Market
            "QQQ",  # Nasdaq 100
            "SPY",  # S&P 500
            "VEA",  # Developed Markets
            "VWO",  # Emerging Markets

            # Bonds
            "BND",  # Total Bond Market
            "TLT",  # 20+ Year Treasury
            "IEF",  # 7-10 Year Treasury
            "SHY",  # 1-3 Year Treasury

            # Commodities
            "GLD",  # Gold
            "SLV",  # Silver
            "DJP",  # Commodity Index

            # REITs
            "VNQ",  # Real Estate
            "IYR",  # Real Estate
            "SCHH",  # Real Estate

            # Crypto (through ETFs)
            "BITO",  # Bitcoin Strategy
            "ETHE",  # Ethereum Strategy
        ]
