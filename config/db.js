const mongoose = require('mongoose');
const config = require('config');

const connectDB = async () => {
  try {
    const db = config.get('mongoURI');
    await mongoose.connect(db, {
      useNewUrlParser: true,
      // useCreateIndex: true
    });
    console.log('mongodb successfully connected!');
  } catch (error) {
    console.log('error: ', error);
    process.exit(1);
  }
}

module.exports = connectDB;