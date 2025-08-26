# 🏆 Legacy Guardians — Time-Warp Wealth

> **Empowering Australian Teens (12-18) with AI-Powered Investment Education**

A gamified investment education platform that takes players on a journey through financial history, from the Japanese Bubble Economy (1990) to current market challenges, teaching real investment strategies through interactive missions and AI-powered coaching.

## 🎯 Project Overview

**Legacy Guardians** is an innovative educational game designed specifically for Australian teenagers aged 12-18. Players navigate through major financial events in history, make investment decisions, and learn from AI coaches while competing in real-time investment competitions.

### 🌟 Key Features

- **📚 Historical Financial Missions**: Journey through 35+ years of financial history
- **🤖 AI-Powered Coaching**: Personalized investment advice from specialized AI coaches
- **📊 Real-Time Trading Simulation**: Practice with $1,000 virtual capital
- **🏆 Competitive Leaderboards**: Compete with players globally
- **📈 Advanced Analytics**: Performance charts and risk analysis
- **🎮 Gamified Learning**: XP system, achievements, and progressive unlocking

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.8+
- npm or yarn
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd financial-timeline-game
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# OpenAI API Key (for AI Coach functionality)
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Install Dependencies

**Frontend:**

```bash
npm install
# or if you encounter dependency issues:
npm install --legacy-peer-deps
```

**Backend:**

```bash
cd backend
pip install -r requirements.txt
cd ..
```

### 4. Start the Application

**Start Backend:**

```bash
./start_backend.sh
```

**Start Frontend (in a new terminal):**

```bash
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🎮 How to Play

### 1. Historical Missions

- Start with the Japanese Bubble Economy (1990)
- Complete missions chronologically to unlock new events
- Make investment decisions based on historical context
- Learn from AI coaches about market dynamics

### 2. Investment Competition

- Unlock after completing all historical missions
- Allocate your $1,000 starting capital across various assets
- Choose from 4 specialized AI coaches
- Trade in real-time with market simulation

### 3. Performance Tracking

- View detailed performance charts
- Analyze risk metrics (Sharpe ratio, volatility, max drawdown)
- Compare your results with global leaderboards
- Earn XP and achievements

## 🏗️ Architecture

### Frontend (React/Next.js)

- **Framework**: Next.js 14 with TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Charts**: Recharts for data visualization
- **State Management**: React hooks and context

### Backend (FastAPI)

- **Framework**: FastAPI with Python
- **Database**: SQLite with thread-safe connections
- **AI Integration**: OpenAI API for coaching
- **Data Generation**: Mock market data with realistic trends

### Key Components

```
components/
├── PerformanceChart.tsx      # Investment performance visualization
├── AICoach.tsx              # AI coaching interface
├── investment-competition.tsx # Competition setup
├── trading-dashboard.tsx    # Real-time trading interface
└── competition-results.tsx  # Results and leaderboards

backend/
├── main.py                  # FastAPI application
├── models.py               # Pydantic data models
├── database.py             # Database management
└── services/               # Business logic services
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Backend
./start_backend.sh   # Start FastAPI backend
```

### API Endpoints

- `GET /health` - Health check
- `GET /events` - Get financial events
- `GET /prices` - Get market price data
- `POST /simulate` - Simulate investment returns
- `POST /coach/advice` - Get AI coaching advice
- `GET /leaderboard` - Get competition rankings

### Environment Variables

| Variable              | Description                    | Required |
| --------------------- | ------------------------------ | -------- |
| `NEXT_PUBLIC_API_URL` | Backend API URL                | Yes      |
| `OPENAI_API_KEY`      | OpenAI API key for AI coaching | Yes      |

## 🎯 Game Features

### Historical Events (1990-2025)

- Japanese Bubble Economy Collapse (1990)
- Asian Financial Crisis (1997)
- Dot-com Bubble Burst (2000)
- Global Financial Crisis (2008)
- COVID-19 Market Crash (2020)
- Current Challenges (2025)

### Investment Assets

- **Stocks**: Apple, Microsoft, NVIDIA, Tesla
- **ETFs**: S&P 500, Global Diversified
- **Cryptocurrency**: Bitcoin, Ethereum

### AI Coaches

- **Steady Sam** (Conservative): Risk control and stable returns
- **Balanced Bella** (Balanced): Optimal risk-return balance
- **Adventure Alex** (Aggressive): High returns, high risk
- **Tech Taylor** (Tech-focused): AI and technology trends

## 📊 Performance Metrics

- **Total Return**: Overall portfolio performance
- **Sharpe Ratio**: Risk-adjusted returns
- **Volatility**: Portfolio risk measurement
- **Max Drawdown**: Maximum loss from peak
- **Annualized Return**: Yearly performance rate

## 🚀 Deployment

### Production Build

```bash
# Build frontend
npm run build

# Set production environment variables
NEXT_PUBLIC_API_URL=https://your-api-domain.com
OPENAI_API_KEY=your_production_api_key

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🎉 Acknowledgments

- Built for NextGen AI Hackathon 2025
- Designed for Australian teenagers aged 12-18
- Powered by OpenAI's GPT models for AI coaching
- Inspired by real financial market events

**Start your investment journey today!** 🚀💰
