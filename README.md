# TCS NQT Exam Simulator

This is a production-ready, full-stack web application that simulates the TCS NQT exam environment. It features a realistic exam interface, a coding editor (Monaco), real-time code execution via Judge0, score analytics, and a leaderboard.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Monaco Editor, Framer Motion, Chart.js
- **Backend**: Node.js, Express.js, JWT Auth
- **Database**: MongoDB Atlas
- **Execution**: Judge0 API

## Features
- **TCS Style UI**: Top timer, question palette, section-based navigation.
- **Sections**: Numerical, Reasoning, Verbal, Programming Logic, and Coding.
- **Coding Section**: Support for Python, C++, and Java with real-time feedback.
- **Analytics**: Performance breakdown by section, accuracy tracking, and score history.
- **Admin Panel**: Add, edit, and manage questions.
- **Leaderboard**: Global ranking of top performers.

---

## Local Setup Instructions

### 1. Prerequisites
- Node.js installed.
- MongoDB Atlas account (free tier).
- Judge0 API Key (Get a free one from [RapidAPI](https://rapidapi.com/judge0/api/judge0-ce)).

### 2. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the template:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secret_key
   JUDGE0_API_URL=https://judge0-ce.p.sulu.sh
   JUDGE0_API_KEY=your_rapidapi_key
   ```
4. Seed the database with sample questions:
   ```bash
   node seed.js
   ```
5. Start the server:
   ```bash
   npm start
   ```

### 3. Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## Deployment Instructions

### 1. Database (MongoDB Atlas)
- Create a new project and a free cluster.
- Add your IP address to the Network Access whitelist.
- Create a Database User.
- Copy the Connection String.

### 2. Backend (Render)
- Link your GitHub repository.
- Use the provided `render.yaml` blueprint for one-click setup.
- Alternatively, create a new **Web Service**.
- Select the `backend` directory.
- Build Command: `npm install`
- Start Command: `node server.js`
- Set `NODE_ENV` to `production` to serve the frontend automatically from the backend.
- Add all environment variables from your `.env` file to the "Environment" tab in Render settings.

### 3. Frontend (Vercel)
- Link your GitHub repository.
- Select the `frontend` directory.
- Vercel will automatically detect Vite.
- Set the `VITE_API_URL` environment variable if you changed the backend URL.
- Deploy!

---

## License
MIT
