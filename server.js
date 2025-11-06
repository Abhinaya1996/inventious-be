const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Swagger setups
const setupSwaggerAdmin = require('./swagger/swaggerAdmin');
const setupSwaggerWebsite = require('./swagger/swaggerWebsite');

// Routes
const authRoutes = require('./routes/authRoutes');
const websiteAuthRoutes = require('./routes/websiteAuthRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Swagger Docs
setupSwaggerAdmin(app);
setupSwaggerWebsite(app);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/website', websiteAuthRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
