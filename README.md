# 💬 Real-Time Chat App

A full-stack real-time messaging application built with the **MERN stack** — featuring instant message delivery, user authentication, and a clean, responsive interface.

---

## 🚀 Overview

This project is a real-time chat application that allows users to register, log in, and exchange messages instantly with other users. Built on a modern TypeScript-first stack with WebSockets powering live communication, it demonstrates production-ready patterns including JWT-based auth, persistent message storage, and scalable backend architecture.

---

## ✨ Features

- 🔐 **User Authentication** — Secure signup and login with JWT & hashed passwords
- ⚡ **Real-Time Messaging** — Instant bi-directional communication via Socket.IO
- 🗂️ **Persistent Chat History** — All messages stored and retrieved from MongoDB Atlas
- 👥 **Online User Status** — See who's currently active in real time
- 📱 **Responsive UI** — Clean interface that works across devices
- 🔒 **Protected Routes** — Authenticated-only access to chat features

---

## 🛠️ Tech Stack

| **Frontend** | React, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | MongoDB Atlas, Mongoose |
| **Real-Time** | Socket.IO |
| **Auth** | JWT, bcrypt |
| **Dev Tools** | ts-node, nodemon, dotenv |

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Muhammad-Umar-063/Chat-Application.git
cd Chat-Application

# Install backend dependencies
cd Backend && npm install

# Install frontend dependencies
cd ../Frontend && npm install
```

### Environment Variables

Create a `.env` file inside the `Backend/` directory:

```env
PORT=5001
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

### Running the App

```bash
# Start the backend (from /Backend)
npm run dev

# Start the frontend (from /Frontend)
npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:5001`.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> Built by **Muhammad Umar Mehboob** 