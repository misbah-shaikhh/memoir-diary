const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // ✅ Only declared once
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
// app.options('*', cors()); // Handles preflight OPTIONS requests

// Routes
app.use('/api/auth', authRoutes);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
  .catch(err => console.error('Failed to connect to MongoDB:', err.message));
