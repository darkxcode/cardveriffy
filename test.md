<!-- # Card Verification System

## Overview
This project is a web application that allows users to verify gift cards by uploading images and providing relevant details. The application processes the uploaded images and sends the information via email.

## Features
- Upload front and back images of gift cards.
- Input fields for card details such as card name, amount, currency, and codes.
- Validation for file uploads (only allows specific image formats).
- Displays success or error messages based on the verification result.

## Technologies Used
- **Node.js**: Server-side JavaScript runtime.
- **Express**: Web framework for Node.js.
- **Multer**: Middleware for handling file uploads.
- **Nodemailer**: Module for sending emails.
- **HTML/CSS**: Frontend structure and styling.
- **JavaScript**: Client-side scripting for form handling and validation.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd cardveriffy-main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (if needed) for email configuration in `server.js`.

4. Start the server:
   ```bash
   node server.js
   ```

5. Open your browser and navigate to `http://localhost:3000`.

## Usage
1. Select the type of card from the dropdown menu.
2. Enter the card amount and other required details.
3. Upload the front and back images of the card.
4. Click the "Verify Card" button to submit the form.
5. A modal will display the verification result.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- Thanks to the contributors and libraries that made this project possible. -->
