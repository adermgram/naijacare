import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AvailableDoctors() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      const res = await axios.get("http://localhost:5000/api/doctors/available");
      setDoctors(res.data);
    };
    fetchDoctors();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Available Doctors</h2>
      <ul className="space-y-4">
        {doctors.map((doc, idx) => (
          <li key={idx} className="p-4 bg-white shadow rounded">
            <p className="font-semibold text-lg">{doc.name}</p>
            <p>Phone: {doc.phone}</p>
            <p>Language: {doc.language}</p>
            <a href={`tel:${doc.phone}`} className="inline-block mt-2 text-blue-600 underline">
              Call for Consultation
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}