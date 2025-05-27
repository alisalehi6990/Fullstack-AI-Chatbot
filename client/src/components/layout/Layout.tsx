import { Outlet } from "react-router";
import { Sidebar } from "@/components/layout/Sidebar";

const LayoutWithProviders: React.FC = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto h-full">
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutWithProviders;
