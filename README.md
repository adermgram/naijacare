# Healthcare Telemedicine Platform

A comprehensive telemedicine platform with real-time chat, video calls, and prescription management.

## Features

- 🔐 **Authentication & Authorization** - Secure user registration and login
- 💬 **Real-time Chat** - Instant messaging between patients and doctors
- 📹 **Video/Audio Calls** - WebRTC-based video and voice calls
- 📋 **Prescription Management** - Create, view, and manage prescriptions
- 👨‍⚕️ **Doctor Dashboard** - Manage consultations and patient records
- 👤 **Patient Dashboard** - View consultations and prescriptions
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **PDFKit** - PDF generation
- **Multer** - File uploads

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Socket.IO Client** - Real-time communication
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Query** - Data fetching
- **WebRTC** - Video/audio calls

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

### 1. Clone the repository


### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install



# Edit .env file with your configuration
# Make sure MongoDB is running

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev
```

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/healthcare
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Usage

### For Patients
1. Register/Login with your phone number
2. Browse available doctors
3. Schedule consultations
4. Join video calls or chat with doctors
5. View prescriptions and medical records

### For Doctors
1. Register/Login with your credentials
2. Set your availability and consultation fee
3. Accept consultation requests
4. Conduct video calls or chat with patients
5. Create and manage prescriptions

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Consultations
- `GET /api/consultations` - Get consultations
- `POST /api/consultations` - Create consultation
- `PUT /api/consultations/:id/status` - Update status

### Chat
- `POST /api/chat` - Send message
- `GET /api/chat/:consultationId` - Get messages
- `PUT /api/chat/:consultationId/read` - Mark as read

### Prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions` - Get prescriptions
- `GET /api/prescriptions/:id/pdf` - Download PDF

## Troubleshooting

### Common Issues

1. **Socket Connection Failed**
   - Check if backend is running on port 5000
   - Verify CORS settings in backend
   - Check browser console for errors

2. **Video Call Not Working**
   - Ensure HTTPS in production (WebRTC requirement)
   - Check camera/microphone permissions
   - Verify STUN server configuration

3. **Database Connection Error**
   - Make sure MongoDB is running
   - Check MONGODB_URI in .env file
   - Verify network connectivity

4. **Prescription PDF Generation Fails**
   - Check if fs-extra is installed
   - Verify uploads directory exists
   - Check file permissions

### Development Tips

1. **Enable Debug Logging**
   ```javascript
   // In backend/server.js
   console.log('Socket events:', socket.eventNames());
   ```

2. **Test Socket Connection**
   ```javascript
   // In browser console
   socket.emit('test', { message: 'Hello' });
   ```

3. **Check Database**
   ```bash
   # Connect to MongoDB
   mongosh
   use healthcare
   db.users.find()
   ```
