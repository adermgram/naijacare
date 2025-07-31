import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DoctorDashboard() {
  const [available, setAvailable] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Optional: fetch current availability on mount
  }, []);

  const toggleAvailability = async () => {
    try {
      const res = await axios.put("http://localhost:5000/api/doctor/availability", {
        available: !available,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      setAvailable(res.data.available);
      setMessage(`Status updated: ${res.data.available ? "Available" : "Unavailable"}`);
    } catch (err) {
      setMessage("Error updating availability");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 mt-10 rounded shadow text-center">
      <h2 className="text-2xl font-bold mb-4">Doctor Dashboard</h2>
      <p className="mb-4">You are currently: 
        <span className={`ml-2 font-semibold ${available ? "text-green-600" : "text-red-600"}`}>
          {available ? "Available" : "Unavailable"}
        </span>
      </p>
      <button
        onClick={toggleAvailability}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Toggle Availability
      </button>
      <p className="mt-4 text-sm text-gray-600">{message}</p>
    </div>
  );
}