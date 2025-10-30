const transporter = require('./config/mailer');
const fs = require('fs').promises;
//const handlebars = require('handlebars');
const path = require('path');
require('dotenv').config();

async function sendProductEmail(recipientEmail) {
  try {
    // Read template file
    const templatePath = path.join(__dirname, 'templates', 'product-list.html');
    const template = await fs.readFile(templatePath, 'utf8');

    // Read product data
    //const productsData = require('./data/products.json');

    // Compile template
    //const compiledTemplate = handlebars.compile(template);
    //const html = compiledTemplate(productsData);

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: 'Check out our latest products!',
      html: template
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;

  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Example usage
const mailingList = [
  'diana.sevillano.delazaro@gmail.com',
  'dianabergholz@outlook.com'
];

async function sendToMailingList() {
  for (const email of mailingList) {
    try {
      await sendProductEmail(email);
      console.log(`Email sent successfully to ${email}`);
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error);
    }
  }
}

sendToMailingList();