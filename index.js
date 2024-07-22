require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const estimateRoutes = require('./routes/estimateRoutes');

const app = express();
const port = process.env.PORT || 8000;

// Connect to MongoDB using the connection string from the .env file
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Connection error:', error);
});

app.use(bodyParser.json());

// Use the routes defined in estimateRoutes.js
app.use('/', estimateRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});