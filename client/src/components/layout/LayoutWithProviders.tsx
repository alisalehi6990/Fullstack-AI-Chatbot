import { Toaster } from "../ui/toaster";
import { Toaster as Sonner } from "../ui/sonner";
import Layout from "../Layout";
import { Outlet } from "react-router";

const LayoutWithProviders: React.FC = () => {
  return (
    <>
      <Layout>
        <Outlet />
      </Layout>
      <Toaster />
      <Sonner />
    </>
  );
};

export default LayoutWithProviders;
