import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import client from "@/services/apolloClient";
import AdminPanel from "@/pages/AdminPanel";
import ProtectedRoute from "@/components/ProtectedRoute";
import ClerkCallbackPage from "@/pages/ClerkCallbackPage";
import Layout from "@/components/layout/Layout";
import ChatPage from "@/pages/Chat";
import HomePage from "@/pages/HomePage";
import NotFound from "@/pages/NorFound";
import LayoutProviders from "@/components/layout/LayoutProviders";

function App() {
  return (
    <BrowserRouter>
      <ApolloProvider client={client}>
        <Routes>
          <Route element={<LayoutProviders />}>
            <Route path="/clerk-callback" element={<ClerkCallbackPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
                  <Route path="/admin" element={<AdminPanel />} />
                </Route>
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ApolloProvider>
    </BrowserRouter>
  );
}

export default App;
