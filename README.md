# AuraTech - Developer Portfolio & RESTful API Showcase

A robust full-stack web application featuring an interactive developer portfolio dashboard powered by a secure Node.js/Express REST API backend and MongoDB data persistence.

---

## 📖 Description

**AuraTech** is a modern, high-performance developer portfolio and tech showcase application. It bridges a sleek frontend UI with an enterprise-grade RESTful Express API backend.

### Key Features
- 🚀 **RESTful API Backend**: Scalable Express server supporting structured endpoints for portfolio projects, skills, contacts, and authentication.
- 🛡️ **Security & Resilience**: Integrated header protection (`helmet`), CORS configuration, rate limiting (`express-rate-limit`), and centralized error handling.
- 🔑 **Authentication & Authorization**: Secure JWT-based authentication flow with `bcryptjs` password hashing.
- 📊 **Dynamic Data Management**: Automatic database seeding for initial portfolio projects and tech skills, with MongoDB schema validation via Mongoose.
- 🎨 **Interactive Frontend**: Rich UI dashboard showcasing featured projects, skill progress, interactive contact forms, and real-time backend status check.
- 🧪 **API Test Suite**: Automated test scripts verifying endpoint connectivity and response integrity.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB & Mongoose ORM
- **Security**: Helmet, CORS, Express-Rate-Limit, JSON Web Tokens (JWT), BcryptJS
- **Frontend**: HTML5, Vanilla CSS3 (Custom Glassmorphism Styling), Modern JavaScript (ES6+)

---

## ⚡ How to Run

Follow these simple steps to set up and run the project locally on your machine:

### 1. Prerequisites
Ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local server running or a MongoDB Atlas connection string)

### 2. Install Dependencies
Open your terminal in the project root directory and run:
```bash
npm install
