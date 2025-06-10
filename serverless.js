const express = require('express');
const bodyParser = require('body-parser');
const { handler: chatHandler } = require('./api/chat');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// API route for chat
app.post('/api/chat', chatHandler);

// Serve static files
app.use(express.static('.'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
