const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // ✅ Only declared once
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'https://memoir-diary.netlify.app'],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
// app.options('*', cors()); // Handles preflight OPTIONS requests

// Routes
app.use('/api/auth', authRoutes);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

console.log("Starting server on port:", process.env.PORT);
console.log("Mongo URI defined:", !!process.env.MONGO_URI); // just shows true/false

// mongoose.connect(process.env.MONGO_URI)
 //  .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
  // .catch(err => console.error('Failed to connect to MongoDB:', err.message));

  mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB Atlas");

    // 👇 Dummy user to test saving
    const testUser = new User({ email: "test@live.com", password: "testpass" });
    await testUser.save()
      .then(() => console.log("🚀 Dummy user saved to MongoDB Atlas!"))
      .catch(err => console.log("❌ Error saving user:", err.message));

    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error("❌ Failed to connect to MongoDB:", err.message));

  mongoose.connection.once('open', () => {
    console.log("✅ Connected to MongoDB Atlas");
  });