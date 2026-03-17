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

## 🚀 One-Click Deployment (Render Blueprint)

I have included a `render.yaml` blueprint to make deployment extremely simple. This will set up both the **Backend** and **Frontend** in one go.

### Steps:
1.  Push your code to **GitHub**.
2.  Go to your [Render Dashboard](https://dashboard.render.com).
3.  Click **New +** and select **Blueprint**.
4.  Connect your repository.
5.  Render will automatically detect the `render.yaml` file. 
6.  **Fill in the placeholders**:
    - `MONGODB_URI`: Your MongoDB Atlas connection string.
    - `JUDGE0_API_KEY`: Your RapidAPI key for coding execution.
7.  Click **Apply**. Render will deploy the backend first, then the frontend, and automatically link them.

---

## 🛠️ Individual Manual Deployment

### 1. Database (MongoDB Atlas)
- Create a free cluster.
- Whitelist `0.0.0.0/0` in Network Access.
- Create a user and copy the connection string.

### 2. Backend (Render)
- **Service Type**: Web Service
- **Build Command**: `cd backend && npm install`
- **Start Command**: `node server.js`
- **Env Vars**: `MONGODB_URI`, `JWT_SECRET`, `JUDGE0_API_KEY`, etc.

### 3. Frontend (Netlify / Vercel)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Env Vars**: Set `VITE_API_BASE_URL` to your Backend URL.

---

## License
MIT
