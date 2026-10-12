export const initializeOfflineQueue = async (): Promise<any> => {
  return {
    queue: async (operation: string, data: any) => {
      console.log('Queued operation:', operation, data);
    },
    flush: async () => {
      console.log('Flushing queue...');
    },
  };
};
