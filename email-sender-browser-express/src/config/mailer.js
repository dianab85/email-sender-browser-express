const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD // Gmail App Password
  }
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('Server connection failed:', error);
  } else {
    console.log('Server is ready to send messages');
  }
});


module.exports = transporter;