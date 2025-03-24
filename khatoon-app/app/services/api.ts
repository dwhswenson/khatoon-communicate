import { mockThreads } from "../mock/threads";
import { mockMessagesByThread } from "../mock/messages";

// Simulate a delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
  getThreads: async () => {
    await delay(300); // fake network delay
    return mockThreads;
  },

  getMessages: async (threadId: string) => {
    await delay(300);
    return mockMessagesByThread[threadId] || [];
  },

  sendMessage: async (threadId: string, message: any) => {
    await delay(300);
    mockMessagesByThread[threadId] = [
      ...(mockMessagesByThread[threadId] || []),
      { id: Date.now().toString(), ...message }
    ];
    return { success: true };
  }
};
