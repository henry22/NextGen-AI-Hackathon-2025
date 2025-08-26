#!/bin/bash

echo "🚀 Starting Legacy Guardians Backend API (Final Version)"
echo "====================================================="

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "backend/.venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv backend/.venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source backend/.venv/bin/activate

# Upgrade pip first
echo "📥 Upgrading pip..."
pip install --upgrade pip

# Install dependencies one by one to avoid conflicts
echo "📥 Installing dependencies..."
pip install fastapi
pip install "uvicorn[standard]"
pip install pydantic
pip install pandas
pip install numpy
pip install yfinance
pip install scipy
pip install openai
pip install python-multipart
pip install python-dotenv

# Create data directory
mkdir -p data

# Start the server
echo "🚀 Starting FastAPI server..."
echo "🌐 API will be available at: http://localhost:8000"
echo "📚 API documentation at: http://localhost:8000/docs"
echo ""

cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
