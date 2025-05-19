import { gql } from "@apollo/client";

export const CHAT_MUTATION = gql`
  mutation Chat($message: String!) {
    chat(message: $message) {
      userMessage
      aiResponse
    }
  }
`;