# LearnHub LMS — Frontend Application

This folder contains the frontend React.js application for LearnHub, a modern, full-stack Learning Management System. The user interface features a sleek dark mode dashboard, real-time messaging, interactive course directory, and an AI-powered tutor helper.

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org) (v16.0.0 or later) installed on your system.

### Installation

Navigate to this directory in your terminal and install dependencies:

```bash
cd frontend
npm install
```

### Environment Settings

Create a `.env` file inside the `frontend` folder using the structure below:

```env
PORT=3000

# Firebase configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id

REACT_APP_SOCKET_URL=http://localhost:8001
```

### Running Locally

Start the React development server:

```bash
npm start
```

The application will run locally at **http://localhost:3000**.

---

## 📁 Key Directories

- `public/` - Static assets and base HTML.
- `src/components/` - Shared interface elements (modals, route protection, page wrappers).
- `src/context/` - Global React State contexts, including user session and Firebase authentication.
- `src/pages/` - Application view files grouped by access level (admin, auth, student).
- `src/styles/` - Base stylesheet rules and theme token variables.
- `src/firebase.js` - Firebase client initialize configurations.
