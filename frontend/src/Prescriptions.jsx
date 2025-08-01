
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      const res = await axios.get("http://localhost:5000/api/prescription", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setPrescriptions(res.data);
    };
    fetchPrescriptions();
  }, []);

  const download = (text, index) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `prescription-${index + 1}.txt`;
    link.click();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">My Prescriptions</h2>
      <ul className="space-y-4">
        {prescriptions.map((p, i) => (
          <li key={i} className="bg-white shadow p-4 rounded">
            <p className="mb-2">{p.text}</p>
            <button
              onClick={() => download(p.text, i)}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              Download
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}