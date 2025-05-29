import { gql } from "@apollo/client";

export const CHAT_MUTATION = gql`
  mutation Chat($message: String!, $sessionId: String, $messageDocuments: [MessageDocument]) {
    chat(message: $message, sessionId: $sessionId, messageDocuments: $messageDocuments) {
      aiResponse
      sessionId
      usedToken
    }
  }
`;