const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all HTTP requests
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Todo list backend server is running');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});