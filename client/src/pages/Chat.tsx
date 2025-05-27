import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useChatStore } from "@/store/chatStore";
import { ChatInterface } from "@/components/chat/ChatInterface";

const ChatNew: React.FC = () => {
  const [searchParams] = useSearchParams();

  const { sessionId, setSession, chatHistory } = useChatStore();

  const navigate = useNavigate();

  useEffect(() => {
    const sessionIdInParam = searchParams.get("c");
    if (!sessionId && !sessionIdInParam) {
      navigate("/");
    } else if (sessionIdInParam && sessionId !== sessionIdInParam) {
      const isSessionValid = chatHistory.find(
        (chat) => chat.id === sessionIdInParam
      );
      if (isSessionValid) {
        setSession(sessionIdInParam);
      } else {
        navigate("/");
      }
    }
  }, [sessionId, searchParams, setSession, navigate, chatHistory]);

  if (!sessionId) {
    return <h1>Loading...</h1>;
  }

  return <ChatInterface />;
};

export default ChatNew;
