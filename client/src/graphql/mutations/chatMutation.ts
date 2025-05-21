import { gql } from "@apollo/client";

export const CHAT_MUTATION = gql`
  mutation Chat($message: String!, $sessionId: String) {
    chat(message: $message, sessionId: $sessionId) {
      aiResponse
      sessionId
      messages {
        isUser
        content
      }
    }
  }
`;