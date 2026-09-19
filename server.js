const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { HTTP_STATUS } = require('./config/constants');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Route Modules
const authRoutes = require('./routes/authRoutes');
const projectsRoutes = require('./routes/projectsRoutes');
const contactsRoutes = require('./routes/contactsRoutes');
const skillsRoutes = require('./routes/skillsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Resilience Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Allows loading external Google Fonts & FontAwesome icons
}));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsing Middleware for Clean JSON Data Exchange
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply General Rate Limiter to API routes
app.use('/api', apiLimiter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'AuraTech REST API Service is healthy and operational.',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount Resource API Routes (RESTful Plural Naming)
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/skills', skillsRoutes);

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname)));

// 404 Handler for Unmatched API Routes
app.use('/api/*', notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

const connectDB = require('./config/db');
const seedDatabase = require('./services/seed');

// Start Server Function
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(` AuraTech REST API Server running on port ${PORT}`);
        console.log(` Health Check : http://localhost:${PORT}/api/health`);
        console.log(` Projects API : http://localhost:${PORT}/api/projects`);
        console.log(` Contacts API : http://localhost:${PORT}/api/contacts`);
        console.log(` Skills API   : http://localhost:${PORT}/api/skills`);
        console.log(` Auth API     : http://localhost:${PORT}/api/auth`);
        console.log(` Frontend Web : http://localhost:${PORT}`);
        console.log(`=======================================================`);
      });
    }
  } catch (err) {
    console.error('Failed to start server due to DB connection error:', err.message);
  }
};

startServer();

module.exports = app;
