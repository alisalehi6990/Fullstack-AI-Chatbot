import axios from "axios";
import React, { useState } from "react";
import { useFormStatus } from "react-dom";

type Message = {
  isUser: boolean;
  content: string;
};

const SubmitButton = ({ input }: { input: string }) => {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending || !input.trim()}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
    >
      Send
    </button>
  );
};

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { isUser: true, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    try {
      const res = await axios.post("http://localhost:4000/chat", {
        message: input,
      });
      const botMessage: Message = {
        isUser: false,
        content: res.data.message,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        isUser: false,
        content: "Error contacting AI. Try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-md ${
              msg.isUser
                ? "bg-blue-500 text-white ml-auto"
                : "bg-white text-gray-800 shadow"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white border-t">
        <form action={handleSend} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded focus:outline-none"
          />
          <SubmitButton input={input} />
        </form>
      </div>
    </div>
  );
};

export default Chat;
