require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

//import your Staff routes here once created
//const staffRoutes = require('./routes/staffRoutes');
const authRoutes = require('./routes/authRoutes'); //ADDED: Import the auth routes

const app = express();

// Middleware
app.use(cors()); //Allows frontend React app too make requests to this API
app.use(express.json()); //Parses incoming JSON payloads (e.g., from POST/PUT requests)
app.use(express.urlencoded({ extended: true })); //Parses incoming URL-encoded payloads (e.g., from HTML forms)

//Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[Database] MongoDB connected successfully on host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Connection error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
}; 


//initialize connection to the database
connectDB();

//API routes
//Mount your staff routes to a specific endpoint path
//app.use('/api/staff', staffRoutes);
app.use('/api/auth', authRoutes); //ADDED: Mount the auth routes to /api/auth

//Basic health check route to verify that the server is running
app.get('/', (req, res) => {
  res.status(200).json({ message: 'E-Kakuma Backend is running' });
});

//Catch-all route for undefined endpoints
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

//Global error handling middleware
app.use((err, req, res, next) => {
  console.error(`[Error] ${err.stack}`);
  res.status(500).json({ 
    error: 'Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

//Server Initialization
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
