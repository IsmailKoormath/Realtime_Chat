# NexChat - Real-Time Chat Application

A modern, scalable real-time chat application built with Next.js, Express.js, MongoDB, and Socket.io.

## Features

- 🔐 JWT Authentication
- 💬 Real-time messaging with Socket.io
- 👥 Direct & group chats
- 📱 Responsive design
- 🌓 Dark mode support
- 📁 File sharing
- ✅ Read receipts
- 💭 Typing indicators
- 🔔 Real-time notifications
- 🎨 Modern UI with Tailwind CSS
- 🔄 Redux state management
- 🚀 Production-ready architecture

## Tech Stack

**Frontend:**
- Next.js 14
- TypeScript
- Redux Toolkit
- Socket.io Client
- Tailwind CSS
- React Hook Form

**Backend:**
- Express.js
- TypeScript
- MongoDB with Mongoose
- Socket.io
- JWT Authentication
- Multer for file uploads

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Redis (optional, for production)

### Installation

1. Clone the repository:

git clone [https://github.com/yourusername/nexchat.git](https://github.com/IsmailKoormath/Realtime_Chat.git)
cd Realtime_Chat

2. Install dependencies:

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

3. Set up environment variables:

# Server
cp server/.env.example server/.env

# Client
cp client/.env.local.example client/.env.local

4. Start MongoDB locally or update the connection string in .env

5. Run the development servers:

# Start server (from server directory)
npm run dev

# Start client (from client directory)
npm run dev

Docker Deployment
docker-compose up -d

Project Structure

chat-app/
├── client/              # Next.js frontend
│   ├── src/
│   │   ├── app/        # App router pages
│   │   ├── components/ # React components
│   │   ├── store/      # Redux store
│   │   ├── services/   # API services
│   │   └── styles/     # Global styles
│   └── public/         # Static assets
├── server/             # Express.js backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── socket/
│   │   └── utils/
│   └── uploads/        # File uploads
└── shared/             # Shared types


