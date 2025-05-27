import React from "react";
import { Sidebar } from "../components/layout/Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto h-full">{children}</main>
    </div>
  );
};

export default Layout;
