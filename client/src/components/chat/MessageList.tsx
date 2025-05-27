import React from "react";
import { Bot, User, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Message } from "@/types/chat";

interface MessageListProps {
  messages: Message[];
  aiTyping?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  aiTyping = false,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to AI Document Assistant
          </h3>
          <p className="text-gray-500 max-w-md">
            Upload documents and start a conversation. I can help you analyze
            PDFs, answer questions, and provide insights from your content.
          </p>
        </div>
      ) : (
        messages.map((message, index) => (
          <div
            key={index}
            className={`flex space-x-3 ${
              message.isUser ? "justify-end" : "justify-start"
            }`}
          >
            {!message.isUser && (
              <Avatar className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </Avatar>
            )}

            <Card
              className={`max-w-[80%] p-4 ${
                message.isUser
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "bg-white border shadow-sm"
              }`}
            >
              <div className="prose prose-sm max-w-none">
                <p
                  className={`${
                    message.isUser ? "text-white" : "text-gray-900"
                  } whitespace-pre-wrap`}
                >
                  {message.content}
                  {aiTyping && !message.isUser && (
                    <span className="inline-block w-2 h-5 bg-current ml-1 animate-pulse" />
                  )}
                </p>

                {message.documents && message.documents.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.documents.map((document, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg"
                      >
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {document.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div
                className={`text-xs mt-2 ${
                  message.isUser ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {message.timestamp?.toLocaleTimeString()}
              </div>
            </Card>

            {message.isUser && (
              <Avatar className="w-8 h-8 bg-gray-600 items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </Avatar>
            )}
          </div>
        ))
      )}
    </div>
  );
};
