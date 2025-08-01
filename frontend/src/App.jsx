import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import axios from 'axios';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PatientDashboard from './components/patient/PatientDashboard';
import DoctorDashboard from './components/doctor/DoctorDashboard';
import AvailableDoctors from './components/patient/AvailableDoctors';
import Chat from './components/chat/Chat';
import ConsultationRoom from './components/consultation/ConsultationRoom';
import Prescriptions from './components/prescriptions/Prescriptions';
import Profile from './components/profile/Profile';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Styles
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Set axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Add auth token to requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          {/* Patient routes */}
          <Route index element={
            user?.role === 'patient' ? <PatientDashboard /> : <Navigate to="/doctor/dashboard" />
          } />
          <Route path="doctors" element={
            user?.role === 'patient' ? <AvailableDoctors /> : <Navigate to="/" />
          } />
          <Route path="consultations" element={
            user?.role === 'patient' ? <PatientDashboard /> : <Navigate to="/" />
          } />
          <Route path="prescriptions" element={
            user?.role === 'patient' ? <Prescriptions /> : <Navigate to="/" />
          } />
          
          {/* Doctor routes */}
          <Route path="doctor/dashboard" element={
            user?.role === 'doctor' ? <DoctorDashboard /> : <Navigate to="/" />
          } />
          <Route path="doctor/consultations" element={
            user?.role === 'doctor' ? <DoctorDashboard /> : <Navigate to="/" />
          } />
          <Route path="doctor/prescriptions" element={
            user?.role === 'doctor' ? <Prescriptions /> : <Navigate to="/" />
          } />
          
          {/* Common routes */}
          <Route path="chat/:consultationId" element={<Chat />} />
          <Route path="consultation/:consultationId" element={<ConsultationRoom />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
