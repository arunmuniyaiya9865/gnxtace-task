# GNXTACE Task - Project Management Platform

This is a full-stack project management application developed to facilitate efficient task tracking and project coordination. The system utilizes a Node.js and Express backend coupled with a React frontend, following industry-standard architectural patterns for scalability and maintainability.

## Project Description

GNXTACE Task is a centralized platform for managing organizational workflows. It provides a secure environment for teams to create projects, assign tasks, and monitor progress. The application is built with a focus on security, using JSON Web Tokens (JWT) for authentication and a layered backend architecture to ensure clean separation of concerns.

## Features

- User Authentication: Secure login and logout functionality using JWT and refresh tokens.
- Role-Based Access Control (RBAC): Implementation of access levels based on user roles.
- Project Management: Comprehensive operations for creating, viewing, updating, and deleting projects.
- Task Management: Detailed task tracking within individual projects.
- Layered Architecture: Backend organization follows the Controller-Service-Repository pattern.
- API Health Monitoring: Standardized endpoint for monitoring server status.
- Responsive Interface: User interface designed to operate across multiple device formats.

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- Knex.js (Query Builder)

### Database and Security
- MySQL
- JWT (JSON Web Tokens)
- bcryptjs

## Project Structure

```text
gnxtace-task/
├── backend/                # Server-side application
│   ├── src/
│   │   ├── controllers/    # Request handling
│   │   ├── services/       # Business logic layer
│   │   ├── repositories/   # Data access layer
│   │   ├── routes/         # API endpoint definitions
│   │   ├── database/       # Migrations and schema management
│   │   └── utils/          # Utility functions
│   └── .env.example        # Environment variable template
├── frontend/               # Client-side application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # View modules
│   │   ├── services/       # API communication
│   │   └── layouts/        # Page layout definitions
└── docker-compose.yml      # Container configuration
```

## Installation Steps

### Prerequisites
- Node.js (version 18 or higher)
- MySQL Server
- npm (Node Package Manager)

### Local Setup

1. Clone the repository to your local machine.
2. Initialize the backend:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```
3. Initialize the frontend:
   ```bash
   cd frontend
   npm install
   ```

## Database Setup

1. Ensure MySQL is running on your system.
2. Create a new database named `gnxtace_db`.
3. Configure your database credentials in the `backend/.env` file.
4. Run the database migrations from the backend directory:
   ```bash
   cd backend
   npm run migrate
   ```

## Environment Variables

The application requires specific environment variables to function correctly. Create a `.env` file in the `backend` directory using the following format:

```text
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=gnxtace_db

# Security Configuration
JWT_SECRET=your_secure_secret_key
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

## How to Run the Project

The application requires both the backend and frontend servers to be running simultaneously.

### Running the Backend
```bash
cd backend
npm run dev
```

### Running the Frontend
```bash
cd frontend
npm run dev
```

## Scripts

### Backend Scripts
- `npm run dev`: Starts the development server using nodemon.
- `npm start`: Starts the production server.
- `npm run migrate`: Executes pending database migrations.

### Frontend Scripts
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles the application for production.
- `npm run preview`: Previews the production build locally.

---
End of Document
