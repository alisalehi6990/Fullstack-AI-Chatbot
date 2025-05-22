import { useMutation } from "@apollo/client";
import React, { useEffect, useRef, useState } from "react";
import { CHAT_MUTATION } from "../graphql/mutations/chatMutation";
import { useUserStore } from "../store/userStore";
import { useNavigate } from "react-router-dom";

type Message = {
  isUser: boolean;
  content: string;
};

const HomePage: React.FC = () => {
  const { user, clearUser, addUserChatHistory } = useUserStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [chat] = useMutation(CHAT_MUTATION);
  const navigate = useNavigate();

  const loadingMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      clearUser();
      window.location.href = "/signin";
    }
  }, [user, clearUser]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { isUser: true, content: input };
    setLoading(true);

    if (loadingMessageRef.current) {
      (loadingMessageRef.current as HTMLDivElement).style.display = "block";
    }

    try {
      const res = await chat({
        variables: {
          message: input,
        },
      });

      const botMessage: Message = {
        content: res.data.chat.aiResponse,
        isUser: false,
      };
      addUserChatHistory({
        id: res.data.chat.sessionId,
        messages: [userMessage, botMessage],
      });
      navigate(`/chat?c=${res.data.chat.sessionId}`);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        isUser: false,
        content: "Error contacting AI. Try again.",
      };
      alert(errorMessage);
      setLoading(false);
      if (loadingMessageRef.current) {
        (loadingMessageRef.current as HTMLDivElement).style.display = "none";
      }
    }
  };

  return (
    <div className="bg-gray-100 flex flex-col h-screen items-center justify-center">
      <div className="bg-white max-w-[700px] p-4 w-full">
        <div onSubmit={handleSend} className="flex space-x-2">
          <div
            ref={loadingMessageRef}
            className={`p-3 rounded-lg max-w-md bg-white text-gray-800 shadow ${
              loading ? "flex" : "hidden"
            }`}
          >
            ...
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded focus:outline-none"
          />
          <button
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
