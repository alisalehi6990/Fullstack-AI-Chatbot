import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Menu, Bot } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { Button, Input } from "@/components/ui";
import { DocumentUpload } from "@/components/chat/DocumentUpload";
import { MessageList } from "@/components/chat/MessageList";
import { useLayoutStore } from "@/store/layoutStore";
import { useAuthStore } from "@/store/authStore";
import { Message, MessageDocument } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

export const ChatInterface: React.FC = () => {
  const [message, setMessage] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const { isSidebarOpen, setIsSidebarOpen } = useLayoutStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [aiTyping, setAiTyping] = useState<boolean>(false);
  const [attachedFiles, setAttachedFiles] = useState<MessageDocument[]>([]);
  const {
    messages,
    sessionId,
    addMessage,
    isLoading,
    setLoading,
    updateMessage,
  } = useChatStore();
  const { user, updateUsedToken } = useAuthStore();
  const { toast } = useToast();
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;
    if (user && user?.usedToken >= user?.quota) {
      toast({
        title: "Quota Exceeded",
        description: "You have exceeded your token quota.",
        variant: "destructive",
      });
      return;
    }
    const userMessage = {
      content: message,
      isUser: true,
      timestamp: new Date(),
      documents: attachedFiles,
    };

    if (sessionId) {
      addMessage(userMessage);
      setMessage("");
    }
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        process.env.REACT_APP_BASE_API_URL + "/chat/stream",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message,
            sessionId,
            messageDocuments: attachedFiles,
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error(response.statusText || "Stream failed");
      }
      setLoading(false);
      setAiTyping(true);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";
      const botMessage: Message = {
        content: "",
        isUser: false,
        timestamp: new Date(),
      };
      addMessage(botMessage);
      let done = false;
      while (!done) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        const chunk = decoder.decode(value);
        const lines = chunk
          .split("\n")
          .filter((line: string) => line.startsWith("data: "));

        for (const line of lines) {
          const jsonStr = line.replace("data: ", "").trim();
          let parsed;
          try {
            parsed = JSON.parse(jsonStr);
          } catch {
            continue;
          }
          if (parsed.done) {
            // Final message with usedToken
            updateUsedToken(parsed.usedToken);
            done = true;
            break;
          }
          aiResponse += parsed.content;
          botMessage.content = aiResponse;
          updateMessage(botMessage, messages.length + 1);
        }
      }

      setAiTyping(false);
      scrollToBottom();
      setAttachedFiles([]);
      setLoading(false);
    } catch (error: any) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        isUser: false,
        content: "Error contacting AI. Try again.",
      };
      addMessage(errorMessage);
      setLoading(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      scrollToBottom();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (file: MessageDocument) => {
    setAttachedFiles((prev) => [...prev, file]);
  };

  const handleFileRemove = async (documentId: string) => {
    setAttachedFiles((prev) => prev.filter((file) => file.id !== documentId));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b bg-white shadow-sm sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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
          <DocumentUpload
            onClose={() => setShowUpload(false)}
            onFileUpload={handleFileUpload}
            onFileRemove={handleFileRemove}
            initialFiles={attachedFiles}
            sessionId={sessionId}
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1">
        <MessageList messages={messages} aiTyping={aiTyping} />
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
