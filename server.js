const express = require('express');
const connectDB = require('./config/db');
const path = require('path');

const port = process.env.PORT || 5000;
const server = express();

//connect database

connectDB();

//Init middleware
server.use(express.json({ extended: false }));

server.use('/api/v1/auth', require('./routes/api/auth'));
server.use('/api/v1/user', require('./routes/api/user'));
server.use('/api/v1/profile', require('./routes/api/profile'));
server.use('/api/v1/posts', require('./routes/api/posts'));

// Serve static assets in production
if(process.env.NODE_ENV === 'production') {
  //set static folder
  server.use(express.static('client/build'));

  server.get('*', (req,res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

server.listen(port, () => console.log(`server is running on port ${port}`));