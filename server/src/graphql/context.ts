import { ExpressContext } from "apollo-server-express";

export const context = async ({ req }: ExpressContext) => {
  // You can add auth logic here later
  return {};
};