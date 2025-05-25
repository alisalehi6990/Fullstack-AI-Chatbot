# AI Chatbot Client

A modern, responsive React-based frontend for an AI-powered chatbot application. This client application provides a user-friendly interface for interacting with an AI chatbot that supports document analysis and real-time streaming responses.

## Features

- Real-time chat interface with AI
- Document upload and analysis (PDF and TXT files)
- Streaming responses for enhanced user experience
- Modern UI with responsive design
- Secure authentication
- Message history persistence
- File attachment preview and management

## Tech Stack

- React 19
- TypeScript
- Apollo Client for GraphQL
- React Router for navigation
- Zustand for state management
- FontAwesome for icons
- Tailwind CSS for styling

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the client directory:
   ```bash
   cd client
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server:

```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
REACT_APP_API_URL=http://localhost:4000
```

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── pages/         # Page components
  ├── graphql/       # GraphQL queries and mutations
  ├── services/      # API services
  ├── store/         # State management
  ├── types/         # TypeScript type definitions
  └── utils/         # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
