# 📋 TaskMate

TaskMate is a modern web application designed to connect clients with service providers (taskers). The application supports task posting, application tracking, a real-time messaging system, transaction wallet processing, automated email notifications, and AI-powered assistance using the Gemini API.

---

## 🛠️ Technology Stack

### Frontend
- **Core Framework:** React (v19) + Vite
- **Routing:** React Router DOM (v7)
- **Real-Time Communication:** Socket.io-client
- **Styling:** Custom Vanilla CSS with built-in dynamic dark mode support

### Backend
- **Core Framework:** Node.js + Express.js (v5)
- **Database:** MongoDB + Mongoose
- **Real-Time Events:** Socket.io
- **AI Integrations:** Google Gen AI SDK (`@google/generative-ai`)
- **Automated Tasks:** Node-cron
- **Email Notifications:** Nodemailer

---

## ✨ Features

- **Authentication & Security:** Role-based access control (Clients, Taskers, and Admin) using JWT and password hashing (bcryptjs).
- **Task Management:** Real-time flow for task posting, browsing, application submission, approval, and completion state updates.
- **In-App Wallet:** Simulated wallet transactions, support for tracking service payments, and transaction history log.
- **Real-Time Chat:** Integrated Socket.IO room chats matching clients and taskers directly under active tasks.
- **Admin Dashboard:** Access portal to monitor system activities, manage complaints, and view overall statistics.
- **Background Actions:** Automated status checks and notification schedules handled by cron jobs.
- **AI Helper Integration:** Generative AI support powered by Google Gemini API.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **MongoDB** (local database instance or MongoDB Atlas URL)

---

### Setup Instructions

#### 1. Backend Configuration
1. Open the `/server` directory:
   ```bash
   cd server
   ```
2. Install the server-side dependencies:
   ```bash
   npm install
   ```
3. Create your environment variables file by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your credentials:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ADMIN_EMAIL=admin@example.com
   CLIENT_URL=http://localhost:5173
   GEMINI_API_KEY=your_gemini_api_key

   # Email configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   ```

#### 2. Frontend Configuration
1. Open the `/client` directory:
   ```bash
   cd client
   ```
2. Install the client-side dependencies:
   ```bash
   npm install
   ```
3. Ensure you have the client-side `.env` set up or created:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

---

## 💻 Running the App

### Start the Server (Backend)
From the `/server` directory:
- **Development Mode** (auto-reloads on changes using Nodemon):
  ```bash
  npm run dev
  ```
- **Production Mode:**
  ```bash
  npm start
  ```

### Start the Client (Frontend)
From the `/client` directory:
- **Development Server:**
  ```bash
  npm run dev
  ```
  *The app will be accessible at http://localhost:5173 by default.*

- **Production Build:**
  ```bash
  npm run build
  ```

---

## 🔌 API Documentation Overview

The server mounts the following router prefixes in `server.js`:

| Route Prefix | Controller / Handler Description |
| :--- | :--- |
| `/api/auth` | User signup, login, and validation |
| `/api/tasks` | Task creation, listing, updates, and deletion |
| `/api/apply` | Task applications flow and approval states |
| `/api/users` | Profile information and wallet management |
| `/api/notifications` | User alerts and notification settings |
| `/api/transactions` | Logged wallet transaction history |
| `/api/admin` | Dashboard actions and user moderation |
| `/api/complaints` | Lodging and resolution of system complaints |
| `/api/messages` | Retrieving room/task-based message threads |
| `/api/ai` | Accessing generative features with Gemini |
