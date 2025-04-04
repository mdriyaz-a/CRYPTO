# CryptoLearn - Cryptography Learning Platform

A comprehensive platform for learning about cryptographic algorithms, message integrity, and secure authentication.

## Features

- **Classical Ciphers**: Caesar, Substitution, Vigenère
- **Modern Ciphers**: AES, Triple DES
- **Message Integrity**: Hash functions, MAC
- **User Authentication**: Secure login with MFA support
  - TOTP-based authentication (Google Authenticator)
  - Email OTP verification
- **Account Management**: Update profile, change password, configure MFA

## Tech Stack

### Backend
- Flask
- PostgreSQL
- SQLAlchemy
- Flask-JWT-Extended
- Flask-Bcrypt
- Flask-Mail
- PyOTP

### Frontend
- React
- React Router
- Tailwind CSS
- ShadCN UI
- Framer Motion
- Axios

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL

### Database Setup
1. Create a PostgreSQL database named `cryptolearn`:
   ```sql
   CREATE DATABASE cipherlab_auth;
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Configure environment variables:
   - Update the `.env` file with your database credentials and email settings

6. Run the Flask application:
   ```bash
   python app.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Access the application at `http://localhost:5173`

## Authentication Flow

### Registration
1. User provides username, email, password, and MFA preference
2. If TOTP is selected, a QR code is displayed for scanning with an authenticator app
3. User account is created in the database

### Login
1. User enters username/email and password
2. If MFA is enabled:
   - For TOTP: User is prompted to enter a 6-digit code from their authenticator app
   - For Email OTP: A 6-digit code is sent to the user's email, which they must enter
3. Upon successful verification, a JWT token is issued

### Account Management
1. User can view and update their profile information
2. Password can be changed
3. MFA settings can be configured:
   - Enable/disable MFA
   - Choose between TOTP and Email OTP methods
   - For TOTP, a new QR code can be generated

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- TOTP secrets are stored securely
- Email OTPs expire after a configurable time period
- HTTPS should be used in production# Cryptography Learning Platform

An interactive web-based platform for learning cryptography concepts through visual demonstrations.

## Features

- Interactive demonstrations of classical ciphers (Caesar, Substitution, Vigenère)
- Modern encryption algorithms (AES with ECB, CBC, CTR modes, and 3DES)
- Step-by-step visualizations of encryption processes
- Real-time encryption/decryption with visual feedback
- Educational content and quizzes

## Tech Stack

- **Frontend**: React, Tailwind CSS, Framer Motion, ShadCN UI
- **Backend**: Flask, Python Cryptography library

## Project Structure

```
/
├── frontend/           # React application
│   ├── src/            # Source code
│   │   ├── components/ # Reusable UI components
│   │   ├── lib/        # Utilities and API services
│   │   ├── pages/      # Page components
│   │   └── App.jsx     # Main application component
│   ├── public/         # Static assets
│   └── package.json    # Dependencies
│
└── backend/            # Flask application
    ├── app.py          # Main application file
    ├── ciphers/        # Cipher implementations
    │   ├── classical.py # Classical cipher implementations
    │   └── modern.py   # Modern cipher implementations
    └── requirements.txt # Python dependencies
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cryptography-learning-platform
```

2. Install dependencies:
```bash
# Install project dependencies
npm run install:all
```

### Running the Application

Start both the frontend and backend servers:

```bash
npm start
```

This will start:
- The Flask backend server at http://localhost:5000
- The React frontend development server at http://localhost:5173

### Development

#### Frontend

The frontend is built with React and uses Vite as the build tool. To run only the frontend:

```bash
cd frontend
npm run dev
```

#### Backend

The backend is built with Flask. To run only the backend:

```bash
cd backend
flask run
```

## Cipher Implementations

### Classical Ciphers

- **Caesar Cipher**: A substitution cipher where each letter is shifted by a fixed number of positions.
- **Substitution Cipher**: A method where each letter is replaced with another letter according to a fixed mapping.
- **Vigenère Cipher**: A polyalphabetic substitution cipher that uses a keyword to determine the shift value.

### Modern Encryption

- **AES**: Advanced Encryption Standard with ECB, CBC, and CTR modes of operation.
- **3DES**: Triple DES encryption, applying the DES algorithm three times to each data block.

## Building for Production

To build the frontend for production:

```bash
npm run build
```

This will create a production build in the `frontend/dist` directory, which can be served by the Flask backend or any static file server.

## License

This project is licensed under the MIT License - see the LICENSE file for details.#   C R Y P T O  
 