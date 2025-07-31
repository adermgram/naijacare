import React, { useState } from "react";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    role: "patient",
    language: "hausa",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", form);
      setMessage("Registration successful!");
    } catch (err) {
      setMessage(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4 font-semibold">Register on NaijaCare</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <input name="name" placeholder="Name" onChange={handleChange} required className="w-full border p-2 rounded" />
        <input name="phone" placeholder="Phone" onChange={handleChange} required className="w-full border p-2 rounded" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required className="w-full border p-2 rounded" />
        <select name="role" onChange={handleChange} className="w-full border p-2 rounded">
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>
        <select name="language" onChange={handleChange} className="w-full border p-2 rounded">
          <option value="hausa">Hausa</option>
          <option value="yoruba">Yoruba</option>
          <option value="igbo">Igbo</option>
          <option value="english">English</option>
        </select>
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
          Register
        </button>
      </form>
      {message && <p className="text-blue-600 mt-4">{message}</p>}
    </div>
  );
}
