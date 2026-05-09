# EdTech AI Platform

An advanced, full-stack EdTech application powered by artificial intelligence. This platform features a responsive React frontend, a robust Node.js backend, and utilizes a PostgreSQL database with the `pgvector` extension to power semantic AI features.

## 🚀 Tech Stack

### Frontend
- **React.js** (via Vite)
- **Tailwind CSS** for modern styling
- **React Router** for navigation

### Backend
- **Node.js & Express.js**
- **OpenAI API** integration for AI features

### Database
- **PostgreSQL**
- **pgvector** extension for storing and querying AI embeddings

## 📁 Project Structure

```text
EdTech/
├── frontend/       # React frontend application
├── backend/        # Node.js Express server
├── schema.sql      # Database schema and table definitions
└── README.md       # Project documentation
```

## 🛠️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [PostgreSQL](https://www.postgresql.org/) installed and running
- A PostgreSQL hosting provider (like Supabase or Neon) or a local instance that supports the `pgvector` extension.

### 1. Database Setup
1. Create a new PostgreSQL database.
2. Ensure the `pgvector` extension is enabled in your database.
3. Run the SQL commands in `schema.sql` to initialize your tables and schema.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory and configure the necessary environment variables (e.g., `DATABASE_URL`, `OPENAI_API_KEY`, `JWT_SECRET`, `FRONTEND_URL`).
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` directory if needed (e.g., for `VITE_API_URL`).
4. Start the development server:
   ```bash
   npm run dev
   ```

## ☁️ Deployment

For production deployment, it is recommended to use:
- **Database**: Supabase or Neon (for native `pgvector` support)
- **Backend**: Render, Heroku, or AWS
- **Frontend**: Vercel or Netlify

## 📝 License

This project is licensed under the MIT License.
