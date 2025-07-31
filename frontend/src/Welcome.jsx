import React from "react";

export default function Welcome() {
  const token = localStorage.getItem("token");

  return (
    <div className="text-center mt-20">
      <h1 className="text-3xl font-bold">Welcome to NaijaCare! 🎉</h1>
      <p className="mt-4 text-lg">Your token is:</p>
      <code className="block mt-2 bg-gray-200 p-2 rounded break-words">{token}</code>
    </div>
  );
}