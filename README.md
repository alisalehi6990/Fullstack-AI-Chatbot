# AI-Powered Document Analysis Chatbot 🧠💬

> A fully custom-built full-stack AI chatbot with document analysis capabilities using modern web technologies.

This project is a **from-scratch implementation** of an intelligent chatbot application that allows users to engage in real-time conversations and analyze documents (PDFs and TXT files) using AI. It combines a React frontend with a Node.js backend, powered by LangChain, Ollama, and Qdrant for advanced language processing and vector storage.

Built entirely without templates or starter kits, this repo demonstrates solid full-stack development practices including GraphQL, JWT authentication, streaming responses, and scalable architecture.

---

A full-stack application that combines the power of AI with document analysis capabilities. This project features a modern React frontend and a robust Node.js backend, providing an intelligent chatbot that can analyze documents and engage in meaningful conversations.

## 🌟 Key Features

- 🔁 Real-time streaming AI responses  
- 📄 Upload and analyze PDF/TXT documents  
- 🔐 Secure user authentication with JWT  
- 💬 Interactive chat interface  
- 📊 Vector database integration via Qdrant  
- ⚙️ Modular GraphQL API with Apollo Server  
- 🗂 Prisma ORM for MongoDB  
- 🎨 Responsive UI with Tailwind CSS  
- 📦 Custom state management with Zustand 

## 🏗️ Architecture

### Frontend
- [React 19](https://reactjs.org/)  + TypeScript  
- [Apollo Client](https://www.apollographql.com/client/)   
- [Zustand](https://zustand.docs.page/)  for global state  
- [Tailwind CSS](https://tailwindcss.com/)   
- WebSocket-based streaming UI updates  

### Backend
- [Node.js](https://nodejs.org/)  + Express  
- [Apollo Server](https://www.apollographql.com/server/)  for GraphQL  
- [Prisma ORM](https://www.prisma.io/)   
- [LangChain](https://js.langchain.com/)  & [Ollama](https://ollama.ai/)   
- [Qdrant](https://qdrant.tech/)  for vector embeddings  
- JWT-based authentication  

---

## 🚀 Getting Started

### Prerequisites

- Node.js v16 or higher  
- Yarn or npm  
- MongoDB (optional if using as fallback DB)  
- Ollama running locally (Or online AI model services) 
- Docker (recommended for Qdrant setup or online service from thei website)  

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/alisalehi6990/Fullstack-AI-Chatbot.git 
   cd Fullstack-AI-Chatbot
   ```

2. Set up the backend:

   ```bash
   cd server
   npm install
   # Configure .env file
   npx prisma migrate dev
   npm run dev
   ```

3. Set up the frontend:
   ```bash
   cd ../client
   npm install
   # Configure .env file
   npm start
   ```

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the server directory:

```
DATABASE_URL="mongodb://user:password@localhost:27017/chatbot"
JWT_SECRET="your-secret-key"
PORT=4000
QDRANT_API_KEY="your-secret-key"
QDRANT_COLLECTION="your-collection-name"
TOGETHER_AI_API_KEY="your-secret-key"
```

### Frontend Environment Variables

Create a `.env` file in the client directory:

```
REACT_APP_API_URL=http://localhost:4000
REACT_APP_CLERK_PUBLISHABLE_KEY="your-secret-key"
```

## 📚 Documentation

- [Frontend Documentation](./client/README.md)
- [Backend Documentation](./server/README.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [LangChain](https://github.com/hwchase17/langchain)
- [Ollama](https://github.com/ollama/ollama)
- [Apollo GraphQL](https://www.apollographql.com/)
- [React](https://reactjs.org/)
- [Prisma](https://www.prisma.io/)
