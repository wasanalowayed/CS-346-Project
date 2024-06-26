const express = require('express'); 
const mongoose = require('mongoose'); 
const bodyParser = require('body-parser'); // Import body-parser to parse incoming request bodies
const path = require('path'); // Import path to handle file and directory paths

const app = express(); 
const port = process.env.PORT || 3000; // Define the port, use environment variable if available, otherwise default to 3000

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/createAccountDB';

// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(bodyParser.json()); // Parse JSON bodies

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected')) // Log a success message if connection is successful
  .catch(err => console.error('MongoDB connection error:', err)); // Log an error message if connection fails

// Define User schema and model
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true }, 
  lastName: { type: String, required: true }, 
  birthDate: { type: Date, required: true }, 
  email: { type: String, required: true, unique: true }, 
  phone: { type: String, required: true }, 
  gender: { type: String, required: true }, 
  password: { type: String, required: true } 
});

const User = mongoose.model('User', userSchema); // Create a User model using the schema

// To Serve the registration form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'createAccount.html')); // Send the HTML file for account creation
});

// Route to handle user registration
app.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, birthDate, email, phone, gender, password } = req.body; // Destructure request body

    // Create a new user
    const newUser = new User({ firstName, lastName, birthDate, email, phone, gender, password });

    // Save the user to the database
    await newUser.save();

    res.status(201).send('User registered successfully'); // Send success response if user is saved
  } catch (err) {
    console.error(err); // Log any errors
    if (err.code === 11000) {
      // Duplicate key error (e.g., email already exists)
      res.status(400).send('Email already exists'); // Send error response if email is already in use
    } else {
      res.status(500).send('Server error'); // Send general server error response for other issues
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`); // Log message indicating server is running
});
