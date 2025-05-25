import { gql } from "@apollo/client";

export const CHAT_MUTATION = gql`
  mutation Chat($message: String!, $sessionId: String, $documents: [String]) {
    chat(message: $message, sessionId: $sessionId, documents: $documents) {
      aiResponse
      sessionId
      messages {
        isUser
        content
      }
    }
  }
`;