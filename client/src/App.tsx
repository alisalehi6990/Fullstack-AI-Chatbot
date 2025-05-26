import { BrowserRouter, Route, Routes } from "react-router-dom";
import Chat from "./pages/Chat";
import { ApolloProvider } from "@apollo/client";
import client from "./services/apolloClient";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import ClerkCallbackPage from "./pages/ClerkCallbackPage";
import HomePage from "./pages/Home";
import Index from "./pages/Index";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";

function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Layout>
          <Toaster />
          <Sonner />
          <Routes>
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route path="/clerk-callback" element={<ClerkCallbackPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
        <Routes>
          <Route
            path="/new"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
