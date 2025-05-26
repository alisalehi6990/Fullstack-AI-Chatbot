import React from "react";
import {
  X,
  Plus,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { SignOutButton } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { chatHistory, setMessages } = useChatStore();
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const handleNewChat = () => {
    setMessages([]);
    navigate("/");
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Chat History</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={() => handleNewChat()}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {chatHistory.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No chat history yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  Start a conversation to see your history
                </p>
              </div>
            ) : (
              chatHistory.map((chat, index) => (
                <Card
                  key={index}
                  className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Link to={`/chat?c=${chat.id}`}>
                    <div className="flex items-start space-x-3">
                      <MessageSquare className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {"Untitled Chat"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {chat.messages[0].content.substring(0, 10)}...
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {chat.createdAt &&
                            new Date(chat.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))
            )}
          </div>
        </div>

        <Separator />

        {/* User Info & Actions */}
        <div className="p-4 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.displayName?.charAt(0) || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.displayName || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            {/* <Button variant="ghost" className="w-full justify-start" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button> */}
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              size="sm"
              onClick={handleLogout}
            >
              <SignOutButton signOutOptions={{ redirectUrl: "/" }}>
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </>
              </SignOutButton>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
