import { BrowserRouter, Route, Routes } from "react-router-dom";
// import Chat from "./pages/Chat";
import { ApolloProvider } from "@apollo/client";
import client from "./services/apolloClient";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import ClerkCallbackPage from "./pages/ClerkCallbackPage";
// import Home from "./pages/Home";
import LayoutWithProviders from "./components/layout/LayoutWithProviders";
import ChatPage from "./pages/Chat";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NorFound";

function App() {
  return (
    <BrowserRouter>
      <ApolloProvider client={client}>
        <Routes>
          <Route path="/clerk-callback" element={<ClerkCallbackPage />} />
          <Route element={<LayoutWithProviders />}>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/chat" element={<ChatPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
              <Route path="/admin" element={<AdminPanel />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ApolloProvider>
    </BrowserRouter>
  );
}

export default App;
