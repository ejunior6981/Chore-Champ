import type { Session } from '../types';

export interface AuthConfig {
  clientId: string;
  apiDomain: string;
}

let authManagerInstance: any = null;

export const initializeAuth = async (config: AuthConfig): Promise<any> => {
  // Mock auth manager for now
  return {
    getSession: async (): Promise<Session | null> => {
      const token = localStorage.getItem('chore-champ-token');
      if (!token) return null;
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          token,
          user: payload.sub ? { id: payload.sub, name: payload.name || 'User' } : null,
          familyId: payload.family_id || '',
          role: payload.role || null,
          isAuthenticated: true,
          lastActivity: Date.now(),
        };
      } catch (e) {
        return null;
      }
    },
  };
};

export const getAuthManager = (): any => {
  if (!authManagerInstance) {
    authManagerInstance = {
      getSession: async (): Promise<Session | null> => {
        const token = localStorage.getItem('chore-champ-token');
        if (!token) return null;
        
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return {
            token,
            user: payload.sub ? { id: payload.sub, name: payload.name || 'User' } : null,
            familyId: payload.family_id || '',
            role: payload.role || null,
            isAuthenticated: true,
            lastActivity: Date.now(),
          };
        } catch (e) {
          return null;
        }
      },
    };
  }
  return authManagerInstance;
};

export const setAuthManager = (manager: any): void => {
  authManagerInstance = manager;
};
