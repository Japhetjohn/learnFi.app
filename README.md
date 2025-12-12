# 🚀 LearnFi - Web3 Learning Platform

**Own your Web3 education. Learn. Build. Earn.**

LearnFi is a production-ready Web3 learning platform with wallet-based authentication, gamified XP system, NFT certificates, token economy, and career opportunities.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

### Core Features
- **Wallet Authentication**: SIWE (Sign-In with Ethereum) for secure wallet-based login
- **Course Management**: Create, enroll, and complete courses
- **Task System**: Submit tasks with auto-verification or manual review
- **XP & Gamification**: Earn XP, climb leaderboards, unlock badges
- **NFT Certificates**: Mint course completion badges as NFTs
- **Token Economy**: LEARN token with staking rewards
- **Jobs Portal**: Connect learners with Web3 job opportunities

### Technical Features
- Auto-verification engine for tasks
- Real-time WebSocket notifications
- Token & NFT staking pools
- Partner bounty system
- Comprehensive admin dashboard

## 🛠 Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **TailwindCSS** for styling
- **wagmi** + **viem** for Web3 integration
- **Zustand** for state management
- **TanStack Query** for server state
- **React Router** for routing

### Backend
- **Python 3.11+** with **FastAPI**
- **PostgreSQL 16** database
- **Redis** for caching and Celery
- **SQLAlchemy** ORM + **Alembic** migrations
- **Celery** for background tasks
- **SIWE** for wallet authentication

### Smart Contracts
- **Solidity 0.8.20+**
- **Hardhat** development environment
- Deployed on **Base** (Mainnet & Sepolia)

### Infrastructure
- **Docker Compose** for local development
- **Vercel** (frontend) + **Railway** (backend) for easy deployment
- Optional: **Kubernetes** for production scale

## 🚀 Quick Start

### Prerequisites

```bash
# Required
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- Git

# Optional
- Poetry (Python dependency manager)
- pnpm (Node package manager)
```

### 1. Clone the Repository

```bash
git clone https://github.com/learnfi/learnfi-platform.git
cd learnfi-platform
```

### 2. Start Infrastructure

```bash
# Start PostgreSQL, Redis, MinIO
docker-compose up -d

# Verify all services are running
docker-compose ps
```

### 3. Setup Backend

```bash
cd backend

# Install dependencies (using Poetry)
poetry install

# Or using pip
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env
# Edit .env and fill in required values

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload
# Backend running at http://localhost:8000
```

### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install
# Or: pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env and add your API URL, Alchemy key, etc.

# Start development server
npm run dev
# Frontend running at http://localhost:5173
```

### 5. Setup Smart Contracts (Optional)

```bash
cd contracts

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat node
# In another terminal:
npx hardhat run scripts/deploy.ts --network localhost
```

## 📁 Project Structure

```
learnfi-platform/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── pages/           # Route components
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── stores/          # Zustand stores
│   │   ├── lib/             # Utilities & API client
│   │   └── types/           # TypeScript types
│   ├── tests/               # Frontend tests
│   └── package.json
│
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   ├── core/           # Core configuration
│   │   └── workers/        # Celery tasks
│   ├── alembic/            # Database migrations
│   ├── tests/              # Backend tests
│   └── pyproject.toml
│
├── contracts/              # Smart contracts
│   ├── contracts/          # Solidity contracts
│   ├── scripts/            # Deployment scripts
│   ├── test/               # Contract tests
│   └── hardhat.config.ts
│
├── docs/                   # Documentation
├── docker-compose.yml      # Local infrastructure
└── README.md
```

## 💻 Development

### Backend Development

```bash
# Run with auto-reload
uvicorn app.main:app --reload --port 8000

# Run tests
pytest

# Run tests with coverage
pytest --cov=app --cov-report=html

# Lint & format
black app/
ruff check app/

# Type checking
mypy app/
```

### Frontend Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run E2E tests
npm run test:e2e

# Lint & format
npm run lint
npm run format
```

### Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history
```

### Smart Contract Development

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to testnet (Base Sepolia)
npx hardhat run scripts/deploy.ts --network base_sepolia

# Verify contract
npx hardhat verify --network base_sepolia DEPLOYED_CONTRACT_ADDRESS
```

## 🔧 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_ALCHEMY_API_KEY=your_key
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Backend (.env)
```env
DATABASE_URL=postgresql+asyncpg://learnfi:learnfi@localhost:5432/learnfi
REDIS_URL=redis://localhost:6379/0
JWT_SECRET_KEY=your_secret
ALCHEMY_API_KEY=your_key
```

## 📊 API Documentation

Once the backend is running, access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/api/v1/openapi.json

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
pytest --cov=app --cov-report=html
```

### Frontend Tests
```bash
cd frontend
npm run test              # Unit tests
npm run test:coverage     # With coverage
npm run test:e2e         # E2E tests
```

### Contract Tests
```bash
cd contracts
npx hardhat test
npx hardhat coverage
```

## 🚀 Deployment

### Option 1: Easy PaaS Deployment

**Frontend (Vercel)**
1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy! Auto-deploys on every push to main

**Backend (Railway)**
1. Connect GitHub repo to Railway
2. Add PostgreSQL and Redis services
3. Set environment variables
4. Deploy! Auto-deploys on every push to main

### Option 2: Kubernetes Production

See `docs/deployment/kubernetes.md` for detailed instructions.

## 🔐 Security

- Wallet-based authentication using SIWE (EIP-4361)
- JWT with RS256 asymmetric encryption
- Rate limiting on all endpoints
- Input validation with Pydantic
- SQL injection prevention with SQLAlchemy ORM
- Smart contract audits before mainnet deployment

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📞 Support

- **Documentation**: [docs.learnfi.com](https://docs.learnfi.com)
- **Discord**: [discord.gg/learnfi](https://discord.gg/learnfi)
- **Twitter**: [@LearnFiApp](https://twitter.com/LearnFiApp)
- **Email**: support@learnfi.com

---

**Built with ❤️ for the Web3 community**
# learnFi.app
