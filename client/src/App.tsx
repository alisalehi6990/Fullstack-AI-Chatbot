import { BrowserRouter, Route, Routes } from "react-router-dom";
import Chat from "./pages/Chat";
import { ApolloProvider } from "@apollo/client";
import client from "./services/apolloClient";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import ClerkCallbackPage from "./pages/ClerkCallbackPage";
import HomePage from "./pages/Home";
import Index from "./pages/Index";
import LayoutWithProviders from "./components/layout/LayoutWithProviders";

function App() {
  return (
    <BrowserRouter>
      <ApolloProvider client={client}>
        <Routes>
          <Route path="/clerk-callback" element={<ClerkCallbackPage />} />
          <Route element={<LayoutWithProviders />}>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/new" element={<Index />} />
            </Route>

            <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
              <Route path="/admin" element={<AdminPanel />} />
            </Route>
          </Route>
        </Routes>
      </ApolloProvider>
    </BrowserRouter>
  );
}

export default App;
