import chatResolvers from "./chat.resolver.js";
import adminResolvers from "./admin.resolver.js";

const resolvers = {
  Query: {
    ...adminResolvers.Query,
  },
  Mutation: {
    ...chatResolvers.Mutation,
    ...adminResolvers.Mutation,
  },
};

export default resolvers; 