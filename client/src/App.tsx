import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import { ApolloProvider } from "@apollo/client";
import client from "./services/apolloClient";

function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
