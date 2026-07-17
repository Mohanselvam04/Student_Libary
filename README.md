# 🎓 LearnHub — Full-Stack LMS

A complete Learning Management System built with **React.js**, **Node.js**, **Express**, and **MongoDB**.

## Features

- 🔐 JWT Authentication (Student / Instructor / Admin roles)
- 📚 Course Management (create, enroll, browse)
- 📁 Materials Library (upload PDFs, videos, docs, images)
- 🤖 AI Tutor (OpenAI GPT-powered chat)
- 💬 Real-time Messaging (Socket.IO)
- 🛡️ Admin Dashboard (manage users, courses, stats)
- 🌙 Dark theme UI

---

## 📁 Project Structure

```
lms/
├── backend/
│   ├── config/         ← DB connection
│   ├── controllers/    ← Business logic
│   ├── middleware/     ← Auth, upload
│   ├── models/         ← MongoDB schemas
│   ├── routes/         ← API endpoints
│   ├── uploads/        ← Uploaded files (auto-created)
│   ├── .env            ← Environment variables
│   ├── server.js       ← Main server
│   └── seed.js         ← Demo data seeder
└── frontend/
    ├── public/
    └── src/
        ├── components/ ← Sidebar, ProtectedRoute
        ├── context/    ← AuthContext
        ├── pages/
        │   ├── auth/   ← Login, Register
        │   ├── student/← Dashboard, Courses, Materials, Chat
        │   └── admin/  ← AdminDashboard
        └── styles/     ← global.css
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 16+ → https://nodejs.org
- MongoDB → https://www.mongodb.com/try/download/community  
  (Or use MongoDB Atlas free cloud: https://www.mongodb.com/atlas)

---

### Step 1: Clone & Open

```bash
# Open the lms folder in your terminal
cd lms
```

---

### Step 2: Setup Backend

```bash
cd backend
npm install
```

Edit `backend/.env` with your values:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms_db
JWT_SECRET=change_this_to_a_long_random_string
OPENAI_API_KEY=sk-your-openai-key-here    ← Get from https://platform.openai.com
CLIENT_URL=http://localhost:3000
```

> **No OpenAI key?** The app still works — AI chat will show a setup message.

Seed the database with demo data:
```bash
node seed.js
```

Start the backend:
```bash
npm run dev
```

Backend runs at: **http://localhost:5000**

---

### Step 3: Setup Frontend

Open a **new terminal** window:

```bash
cd frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🌐 API Endpoints

| Method | URL                          | Description              | Auth       |
|--------|------------------------------|--------------------------|------------|
| POST   | /api/auth/register           | Register user            | Public     |
| POST   | /api/auth/login              | Login                    | Public     |
| GET    | /api/auth/me                 | Get current user         | Token      |
| GET    | /api/courses                 | List all courses         | Public     |
| POST   | /api/courses                 | Create course            | Instructor |
| POST   | /api/courses/:id/enroll      | Enroll in course         | Student    |
| GET    | /api/materials               | List materials           | Token      |
| POST   | /api/materials               | Upload material          | Instructor |
| GET    | /api/messages/conversations  | Get conversations        | Token      |
| GET    | /api/messages/:userId        | Get messages             | Token      |
| POST   | /api/ai/chat                 | AI tutor chat            | Token      |
| GET    | /api/admin/stats             | Dashboard stats          | Admin      |
| GET    | /api/admin/users             | All users                | Admin      |
| PUT    | /api/admin/users/:id         | Update user role/status  | Admin      |

---

## 🤖 AI Tutor Setup

1. Go to https://platform.openai.com
2. Create an account and generate an API key
3. Add it to `backend/.env`: `OPENAI_API_KEY=sk-...`
4. Restart the backend

---

## 💡 Troubleshooting

**MongoDB connection failed?**
- Make sure MongoDB is running: `mongod` (Mac/Linux) or start from Windows Services
- Or use MongoDB Atlas (cloud) and update MONGODB_URI

**Port already in use?**
- Backend: Change `PORT=5001` in .env
- Frontend: It will automatically ask to use another port

**CORS error?**
- Ensure `CLIENT_URL` in backend `.env` matches your frontend URL exactly

---

## 🛠️ Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | React.js, React Router  |
| Backend   | Node.js, Express.js     |
| Database  | MongoDB, Mongoose       |
| Auth      | JWT, bcryptjs           |
| Realtime  | Socket.IO               |
| AI        | OpenAI GPT-3.5-turbo    |
| Storage   | Local filesystem        |
| Styling   | Custom CSS + Google Fonts |
