export const isNewJob = (createdAt: string) =>
  Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
