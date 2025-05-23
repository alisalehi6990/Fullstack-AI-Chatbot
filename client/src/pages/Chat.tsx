import { useMutation } from "@apollo/client";
import React, { useEffect, useRef, useState } from "react";
import { CHAT_MUTATION } from "../graphql/mutations/chatMutation";
import { useUserStore } from "../store/userStore";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Message } from "./Home";

const Chat: React.FC = () => {
  const { user, clearUser } = useUserStore();
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState(searchParams.get("c") || "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [aiTyping, setAiTyping] = useState<boolean>(false);

  const [chat] = useMutation(CHAT_MUTATION);
  const navigate = useNavigate();

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const loadingMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sessionIdInParam = searchParams.get("c");
    if (sessionIdInParam && sessionId !== sessionIdInParam) {
      setSessionId(sessionIdInParam);
      return;
    }
    if (!sessionId) {
      navigate("/");
    }
    const existingChat = user!.chatHistories?.find(
      (chat) => chat.id === sessionId
    );
    if (existingChat) {
      setMessages(existingChat.messages);
      scrollToBottom();
    } else {
      navigate("/");
    }
    scrollToBottom();
  }, [user, sessionId, clearUser, searchParams, navigate]);

  const handleSend = async () => {
    if (!input.trim() || aiTyping) return;

    const userMessage: Message = { isUser: true, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    scrollToBottom();

    try {
      if (streaming) {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:4000/chat/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: input,
            sessionId,
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error("Stream failed");
        }
        setLoading(false);
        setAiTyping(true);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let aiResponse = "";
        const botMessage: Message = {
          content: "",
          isUser: false,
        };
        setMessages((prev) => [...prev, botMessage]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk
            .split("\n")
            .filter((line: string) => line.startsWith("data: "));

          for (const line of lines) {
            const jsonStr = line.replace("data: ", "").trim();
            const parsed = JSON.parse(jsonStr);
            aiResponse += parsed.content;
            botMessage.content = aiResponse;
            setMessages((prev) => {
              const updatedMessages = [...prev];
              updatedMessages[updatedMessages.length - 1] = botMessage;
              return updatedMessages;
            });
            scrollToBottom();
          }
        }
        setAiTyping(false);
      } else {
        if (loadingMessageRef.current) {
          (loadingMessageRef.current as HTMLDivElement).style.display = "block";
        }
        scrollToBottom();
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
        if (sessionId === "") {
          setSessionId(res.data.chat.sessionId);
          searchParams.set("c", res.data.chat.sessionId);
        }
      }
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
        <div className="flex space-x-2">
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
        <div className="flex w-full">
          <input
            type="checkbox"
            checked={streaming}
            onChange={(e) => setStreaming(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="">Enable Streaming</label>
        </div>
      </div>
    </div>
  );
};

export default Chat;
