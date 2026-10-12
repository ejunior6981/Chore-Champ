export const initializeSyncManager = async (): Promise<any> => {
  return {
    sync: async () => {
      console.log('Syncing data...');
    },
  };
};
