const fs = require('fs');
const path = require('path');

// Create backend .env file
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const backendEnvContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/healthcare

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

if (!fs.existsSync(backendEnvPath)) {
  fs.writeFileSync(backendEnvPath, backendEnvContent);
  console.log('✅ Backend .env file created');
} else {
  console.log('✅ Backend .env file already exists');
}

// Create frontend .env file
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
const frontendEnvContent = `# API Configuration
VITE_API_URL=http://localhost:5000/api

# Socket Configuration
VITE_SOCKET_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=Healthcare Platform
VITE_APP_VERSION=1.0.0
`;

if (!fs.existsSync(frontendEnvPath)) {
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log('✅ Frontend .env file created');
} else {
  console.log('✅ Frontend .env file already exists');
}

// Create uploads directory
const uploadsPath = path.join(__dirname, 'backend', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('✅ Uploads directory created');
} else {
  console.log('✅ Uploads directory already exists');
}

console.log('\n🎉 Environment setup completed!');
console.log('\nNext steps:');
console.log('1. Make sure MongoDB is running');
console.log('2. In backend directory: npm install && npm run dev');
console.log('3. In frontend directory: npm install && npm run dev'); 