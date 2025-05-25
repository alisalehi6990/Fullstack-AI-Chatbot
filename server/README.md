# AI Chatbot Server

A robust backend server for an AI-powered chatbot application, built with Node.js, Express, and GraphQL. The server integrates with LangChain and Ollama for AI processing, supports document analysis, and provides real-time streaming responses.

## Features

- GraphQL API with Apollo Server
- Real-time streaming responses
- Document processing (PDF and TXT)
- Vector database integration with Qdrant
- Secure authentication with JWT
- File upload handling
- AI-powered chat responses using LangChain and Ollama

## Tech Stack

- Node.js with Express
- TypeScript
- Apollo Server for GraphQL
- Prisma for database management
- LangChain for AI processing
- Ollama for LLM integration
- Qdrant for vector storage
- JWT for authentication
- Multer for file handling

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Ollama installed locally
- PostgreSQL database

### Installation

1. Clone the repository
2. Navigate to the server directory:
   ```bash
   cd server
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:
   Create a `.env` file with the following variables:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/chatbot"
   JWT_SECRET="your-secret-key"
   PORT=4000
   ```

5. Initialize the database:
   ```bash
   npx prisma migrate dev
   ```

### Development

To start the development server:

```bash
npm run dev
```

The server will be available at [http://localhost:4000](http://localhost:4000)

### Building for Production

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## API Documentation

### GraphQL Endpoint

The GraphQL playground is available at `/graphql` when running in development mode.

### Main Operations

- Chat: Send messages and receive AI responses
- Document Upload: Upload and process PDF/TXT files
- Authentication: User registration and login
- Chat History: Retrieve and manage chat sessions

## Project Structure

```
src/
  ├── controllers/    # Request handlers
  ├── graphql/       # GraphQL schema and resolvers
  ├── middleware/    # Express middleware
  ├── models/        # Data models
  ├── services/      # Business logic
  ├── types/         # TypeScript type definitions
  └── utils/         # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 