import { gql } from "@apollo/client";

export const CHAT_MUTATION = gql`
  mutation Chat($message: String!, $chatHistory: [ChatHistoryInput!]!) {
    chat(message: $message, chatHistory: $chatHistory) {
      userMessage
      aiResponse
    }
  }
`;