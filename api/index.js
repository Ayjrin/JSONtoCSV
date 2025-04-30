const express = require('express');
const cors = require('cors');

// Create Express app
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// API endpoint for testing
app.get('/api', (req, res) => {
  res.send('JSON to CSV API is running. Use POST /api/convert or POST /api/convert/file endpoints.');
});

// Export the Express API for Vercel serverless functions
module.exports = app;
