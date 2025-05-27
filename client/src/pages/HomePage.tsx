import { useMutation } from "@apollo/client";
import React, { useState } from "react";
import { CHAT_MUTATION } from "@/graphql/mutations/chatMutation";
import { useNavigate } from "react-router-dom";
import { uploadDocument } from "@/services/api";
import { AttachedFileType } from "@/types/chat";
import { Button, Input } from "@/components/ui";
import { Bot, Menu, Paperclip, Send } from "lucide-react";
import { DocumentUpload } from "@/components/chat/DocumentUpload";
import { useLayoutStore } from "@/store/layoutStore";
import { useChatStore } from "@/store/chatStore";
import { MessageList } from "@/components/chat/MessageList";
import { useToast } from "@/hooks/use-toast";

export type MessageDocument = {
  id: string;
  name: string;
  type: string;
  sizeText: string;
};

export type Message = {
  isUser: boolean;
  content: string;
  documents?: MessageDocument[];
  timestamp?: Date;
};

const HomePage: React.FC = () => {
  const [message, setMessage] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const { isSidebarOpen, setIsSidebarOpen } = useLayoutStore();
  const { isLoading, setLoading, setChatHistory, chatHistory } = useChatStore();
  const { toast } = useToast();

  const [chat] = useMutation(CHAT_MUTATION);
  const navigate = useNavigate();
  const [attachedFiles, setAttachedFiles] = useState<AttachedFileType[]>([]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    const userMessage: Message = {
      isUser: true,
      content: message,
      timestamp: new Date(),
    };
    setLoading(true);

    try {
      const res = await chat({
        variables: {
          message,
          messageDocuments: attachedFiles.map((file) => ({
            id: file.id,
            name: file.name,
            type: file.type,
            sizeText: file.sizeText,
          })),
        },
      });

      const botMessage: Message = {
        content: res.data.chat.aiResponse,
        isUser: false,
        timestamp: new Date(),
      };
      setChatHistory([
        {
          id: res.data.chat.sessionId,
          messages: [userMessage, botMessage],
        },
        ...chatHistory,
      ]);

      navigate(`/chat?c=${res.data.chat.sessionId}`);
      setLoading(false);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Something went wrong",
        description: error.message,
      });
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      let size = Math.round(file.size / 1000); // KB
      let sizeText = `${size} KB`;
      if (size >= 2000) {
        console.log("File is bigger than 2MB, rejected!!!");
        return;
      }
      if (size >= 1000) {
        size = Math.round(size / 10) / 100;
        sizeText = `${size} MB`;
      }

      try {
        const response = await uploadDocument({
          file,
          fileInfo: {
            sizeText,
            name: file.name,
            type: file.type,
          },
        });
        setAttachedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            sizeText,
            id: response.documentId,
          },
        ]);
        e.target.value = "";
        console.log("File documentId:", response.documentId);
      } catch (error: any) {
        console.error("Error uploading file:", error.message);
        e.target.value = "";
      }
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
          <DocumentUpload onClose={() => setShowUpload(false)} />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1">
        <MessageList messages={[]} />
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

export default HomePage;
