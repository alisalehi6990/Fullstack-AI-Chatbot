# AI-Powered Document Analysis Chatbot

A full-stack application that combines the power of AI with document analysis capabilities. This project features a modern React frontend and a robust Node.js backend, providing an intelligent chatbot that can analyze documents and engage in meaningful conversations.

## 🌟 Key Features

- **Intelligent Chat Interface**: Real-time conversations with AI-powered responses
- **Document Analysis**: Upload and analyze PDF and TXT files
- **Streaming Responses**: Real-time streaming of AI responses for better user experience
- **Secure Authentication**: JWT-based authentication system
- **Modern UI**: Responsive design with a clean, intuitive interface
- **Vector Database**: Efficient document storage and retrieval using Qdrant
- **AI Integration**: Powered by LangChain and Ollama for advanced language processing

## 🏗️ Architecture

The project is divided into two main components:

### Frontend (`/client`)
- React 19 with TypeScript
- Apollo Client for GraphQL
- Zustand for state management
- Tailwind CSS for styling
- Real-time streaming support

### Backend (`/server`)
- Node.js with Express
- GraphQL API with Apollo Server
- Prisma for database management
- LangChain and Ollama integration
- Document processing capabilities

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database
- Ollama installed locally

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-chatbot.git
   cd ai-chatbot
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
DATABASE_URL="postgresql://user:password@localhost:5432/chatbot"
JWT_SECRET="your-secret-key"
PORT=4000
```

### Frontend Environment Variables
Create a `.env` file in the client directory:
```
REACT_APP_API_URL=http://localhost:4000
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
