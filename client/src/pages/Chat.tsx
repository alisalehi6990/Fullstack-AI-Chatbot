import { useMutation } from "@apollo/client";
import React, { useRef, useState } from "react";
import { CHAT_MUTATION } from "../graphql/mutations/chatMutation";
import { useUserStore } from "../store/userStore";

type Message = {
  isUser: boolean;
  content: string;
};

const Chat: React.FC = () => {
  const { user, clearUser } = useUserStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [chat] = useMutation(CHAT_MUTATION);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const loadingMessageRef = useRef<HTMLDivElement>(null);
  if (!user) {
    clearUser();
    window.location.href = "/signin";
    return null;
  }
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { isUser: true, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    if (loadingMessageRef.current) {
      (loadingMessageRef.current as HTMLDivElement).style.display = "block";
    }
    scrollToBottom();

    try {
      const res = await chat({
        variables: {
          message: input,
          sessionId,
        },
      });

      const botMessage: Message = {
        content: res.data.chat.aiResponse,
        isUser: false,
      };

      setMessages((prev) => [...prev, botMessage]);
      setSessionId(res.data.chat.sessionId);
      scrollToBottom();

      setLoading(false);
      if (loadingMessageRef.current) {
        (loadingMessageRef.current as HTMLDivElement).style.display = "none";
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        isUser: false,
        content: "Error contacting AI. Try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setLoading(false);
      if (loadingMessageRef.current) {
        (loadingMessageRef.current as HTMLDivElement).style.display = "none";
      }
      scrollToBottom();
    }
  };
  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    }, 0);
  };
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-4"
      >
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

        <div
          ref={loadingMessageRef}
          className={`p-3 rounded-lg max-w-md bg-white text-gray-800 shadow ${
            loading ? "flex" : "hidden"
          }`}
        >
          ...
        </div>
      </div>

      <div className="p-4 bg-white border-t">
        <div onSubmit={handleSend} className="flex space-x-2">
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

export default Chat;
