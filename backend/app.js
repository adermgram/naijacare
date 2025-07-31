const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
// Add other route imports as you create them

app.use(cors());
app.use(express.json());


app.get("/", (req, res)=>{
    res.send("game is game");
})

app.get("/me", (req, res)=>{
    res.send("wassup nigga");
})

app.use('/api/auth', authRoutes);
// app.use('/api/consultation', consultationRoutes);

module.exports = app;