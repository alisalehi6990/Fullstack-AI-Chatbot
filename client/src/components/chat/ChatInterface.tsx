import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Menu, Bot, User } from "lucide-react";
import { useChatStore } from "../../store/chatStore";
import { Button } from "../ui/button";
import { DocumentUpload } from "./DocumentUpload";
import { MessageList } from "./MessageList";
import { Input } from "../ui/input";

interface ChatInterfaceProps {
  onToggleSidebar: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onToggleSidebar,
}) => {
  const [message, setMessage] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const { messages, addMessage, isLoading } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      content: message,
      isUser: true,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setMessage("");

    // Simulate AI response with streaming
    const aiMessage = {
      content: "",
      isUser: false,
      timestamp: new Date(),
    };

    addMessage(aiMessage);

    // Simulate streaming response
    const responses = [
      "I understand you'd like to discuss your document.",
      " Let me analyze the content for you.",
      " Based on the information provided, I can help you with insights and answer any questions you might have.",
      " What specific aspects would you like me to focus on?",
    ];

    for (let i = 0; i < responses.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const updatedContent = responses.slice(0, i + 1).join("");
      // In real implementation, this would update the streaming message
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                AI Document Assistant
              </h1>
              <p className="text-sm text-gray-500">Powered by advanced AI</p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center space-x-2"
        >
          <Paperclip className="h-4 w-4" />
          <span>Upload Document</span>
        </Button>
      </div>

      {/* Document Upload */}
      {showUpload && (
        <div className="p-4 border-b bg-blue-50">
          <DocumentUpload onClose={() => setShowUpload(false)} />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your documents..."
              className="pr-12 py-3 resize-none rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
