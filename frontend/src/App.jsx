import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Welcome from './Welcome.jsx';

export default function App() {
  return (
    <Router>
      <div className="p-6 bg-gray-100 min-h-screen">
        <nav className="mb-6 flex gap-4">
          <Link to="/login" className="text-blue-600">Login</Link>
          <Link to="/register" className="text-blue-600">Register</Link>
        </nav>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/welcome" element={<Welcome />} />
        </Routes>
      </div>
    </Router>
  );
}
