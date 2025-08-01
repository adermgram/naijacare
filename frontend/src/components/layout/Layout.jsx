import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  User, 
  MessageSquare, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();

  const patientNavItems = [
    { name: 'Dashboard', icon: Home, path: '/' },
    { name: 'Find Doctors', icon: Users, path: '/doctors' },
    { name: 'My Consultations', icon: MessageSquare, path: '/consultations' },
    { name: 'Prescriptions', icon: FileText, path: '/prescriptions' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  const doctorNavItems = [
    { name: 'Dashboard', icon: Home, path: '/doctor/dashboard' },
    { name: 'Consultations', icon: MessageSquare, path: '/doctor/consultations' },
    { name: 'Prescriptions', icon: FileText, path: '/doctor/prescriptions' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  const navItems = user?.role === 'doctor' ? doctorNavItems : patientNavItems;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          className="relative flex w-full max-w-xs flex-1 flex-col bg-white"
        >
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">HealthCare</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.path}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            ))}
          </nav>
        </motion.div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">HealthCare</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.path}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block h-full w-full border-0 py-0 pl-10 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                placeholder="Search..."
              />
            </div>
          </div>

          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* Connection status */}
            <div className="flex items-center gap-x-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm text-gray-500">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Notifications */}
            <button className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
              <Bell className="h-6 w-6" />
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <div className="flex items-center gap-x-3">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 