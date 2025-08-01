
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { SocketContext } from "../contexts/SocketContext";

export default function AvailableDoctors() {
  const [doctors, setDoctors] = useState([]);
  const socket = useContext(SocketContext);

  const fetchDoctors = async () => {
    const res = await axios.get("http://localhost:5000/api/doctors/available");
    setDoctors(res.data);
  };

  useEffect(() => {
    fetchDoctors();

    // Listen for updates
    socket.on("doctorAvailabilityChanged", () => {
      fetchDoctors(); // re-fetch on any change
    });

    return () => {
      socket.off("doctorAvailabilityChanged");
    };
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
