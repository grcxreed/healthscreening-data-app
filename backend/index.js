const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from the .env file
dotenv.config();

// Initialize the app
const app = express();

// Ensure MONGO_URI is defined in the environment variable
if (!process.env.MONGO_URI) {
  console.error('MongoDB URI is not defined in the .env file');
  process.exit(1); // Exit if MONGO_URI is missing
}

console.log('MongoDB URI:', process.env.MONGO_URI); // Log the URI for debugging

// Connect to MongoDB using the URI from the .env file
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });

// Example route
app.get('/', (req, res) => {
  res.send('Hello from the backend');
});

// Set up the server to listen on a port (default 5001)
const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
