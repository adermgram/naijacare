import React, { useEffect, useState } from "react";
import socket from "./socket";

export default function Chat({ receiverId }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const sendMessage = () => {
    const msg = { to: receiverId, text: message };
    socket.emit("sendMessage", msg);
    setMessages((prev) => [...prev, { ...msg, fromSelf: true }]);
    setMessage("");
  };

  return (
    <div className="p-4 border rounded bg-white shadow max-w-md mx-auto">
      <h3 className="text-xl mb-2">Chat</h3>
      <div className="h-48 overflow-y-auto border p-2 mb-2">
        {messages.map((msg, i) => (
          <p key={i} className={msg.fromSelf ? "text-right text-blue-600" : "text-left text-gray-700"}>
            {msg.text}
          </p>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border p-1 rounded"
        />
        <button onClick={sendMessage} className="bg-blue-600 text-white px-3 py-1 rounded">
          Send
        </button>
      </div>
    </div>
  );
}