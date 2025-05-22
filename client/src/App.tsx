import { BrowserRouter, Route, Routes } from "react-router-dom";
import Chat from "./pages/Chat";
import { ApolloProvider } from "@apollo/client";
import client from "./services/apolloClient";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRedirect from "./components/AuthRedirect";
import Layout from "./components/Layout";
import SigninPage from "./pages/Signin";
import ClerkCallbackPage from "./pages/ClerkCallbackPage";
import HomePage from "./pages/Home";

function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route
              path="/signin"
              element={
                <AuthRedirect>
                  <SigninPage />
                </AuthRedirect>
              }
            />
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
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
