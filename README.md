SkillSwap

SkillSwap is a web application that allows users to connect and exchange skills with one another.
Users can register, specify what skills they offer and what skills they are looking to learn, and then get matched based on semantic similarity and geographic proximity.
Real-time chat is also supported to facilitate communication between matched users.
 
Features

User Authentication (Register & Login)
Smart Matching using OpenAI Embeddings + Cosine Similarity
Location-Based Filtering using MongoDB Geospatial Queries
Real-Time Messaging via Socket.IO
Modular Code Architecture (React + Express + MongoDB)
Responsive Frontend (React Hooks & Context)
Clean API Structure and Utility Layers

Backend
Node.js + Express
MongoDB + Mongoose
Socket.IO (WebSockets)
OpenAI Embedding API
JSON Web Token (JWT)
Bcrypt (for password hashing)
dotenv (environment config)

Installation

Backend Setup
cd server
npm install
npm start

Front end Setup
cd client
npm install
npm run dev


