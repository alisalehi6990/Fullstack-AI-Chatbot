import { prisma } from "../app";

export const updateUserTokenUsage = async ({
  userId,
  inputTokens = 0,
  outputTokens = 0,
  quota = 0,
}: {
  userId: string;
  inputTokens: number;
  outputTokens: number;
  quota?: number;
}) => {
  if (!userId || (!inputTokens && !outputTokens && !quota)) return;
  const data: any = {};

  if (inputTokens > 0) {
    data.inputTokens = {
      increment: inputTokens,
    };
  }

  if (outputTokens > 0) {
    data.outputTokens = {
      increment: outputTokens,
    };
  }
  if (quota) {
    data.quota = quota;
  }
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data,
  });
};
