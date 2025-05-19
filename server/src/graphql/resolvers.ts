import chatResolvers from "./chat.resolver";
import adminResolvers from "./admin.resolver";

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