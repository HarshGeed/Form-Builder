// Main server entry point for the MERN form builder backend
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const formRoutes = require('./routes/formRoutes');
const responseRoutes = require('./routes/responseRoutes');
const authRoutes = require('./routes/authRoutes');
app.use('/api/forms', formRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
