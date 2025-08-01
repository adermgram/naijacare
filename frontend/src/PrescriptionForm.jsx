import React, { useState } from "react";
import axios from "axios";

export default function PrescriptionForm({ patientId }) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");

  const submitPrescription = async () => {
    try {
      await axios.post("http://localhost:5000/api/prescription", {
        patientId,
        text
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setMessage("Prescription sent!");
      setText("");
    } catch (err) {
      setMessage("Error sending prescription");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6 bg-white p-4 rounded shadow">
      <h3 className="text-xl mb-2 font-bold">Prescribe Medicine</h3>
      <textarea
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full border p-2 rounded"
        placeholder="Write prescription..."
      />
      <button onClick={submitPrescription} className="mt-2 bg-green-600 text-white px-4 py-2 rounded">
        Submit
      </button>
      {message && <p className="mt-2 text-blue-600">{message}</p>}
    </div>
  );
}