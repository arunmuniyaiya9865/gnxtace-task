# Gnxtace — Project Management Platform

A full-stack project management platform built with:

- **Backend**: Node.js + Express.js (Layered Architecture)
- **Frontend**: React + Vite
- **Database**: MySQL via Knex.js
- **DevOps**: Docker Compose

---

## Project Structure

```
gnxtace/
├── backend/          # Express API (controllers, services, repositories, routes)
├── frontend/         # React + Vite SPA
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js >= 18
- Docker & Docker Compose
- MySQL 8 (or use Docker)

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Database (Docker)
```bash
docker-compose up -d
```

---

## API Health Check
```
GET /api/health
```
