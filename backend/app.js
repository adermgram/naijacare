const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
// Add other route imports as you create them

const doctorRoutes = require('./routes/doctor');

app.use(cors());
app.use(express.json());



app.use('/api/auth', authRoutes);
// app.use('/api/consultation', consultationroutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/doctor', doctorRoutes);

module.exports = app;