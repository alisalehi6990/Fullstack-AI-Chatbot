import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Outlet } from "react-router";

const LayoutProviders: React.FC = () => {
  return (
    <>
      <Outlet />
      <Toaster />
      <Sonner />
    </>
  );
};

export default LayoutProviders;
