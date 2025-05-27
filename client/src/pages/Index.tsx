
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { AuthModal } from '../components/layout/AuthModal';
import { Sidebar } from '../components/layout/Sidebar';
import { ChatInterface } from '../components/chat/ChatInterface';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <ChatInterface onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      </div>
    </div>
  );
};

export default Index;
