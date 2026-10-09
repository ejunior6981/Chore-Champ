/**
 * User data access layer
 * Handles CRUD operations for users (parents and children)
 */

export interface User {
  id: string;
  familyId: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'parent' | 'child';
  avatarId: string;
  points: number;
  pinHash?: string; // Encrypted PIN for parent access
  settings: UserSettings;
  createdAt: number;
  updatedAt: number;
}

export interface UserSettings {
  themeMode: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  language: string;
  avatarId: string;
}

export interface CreateUserInput {
  familyId: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'parent' | 'child';
  avatarId?: string;
  pinHash?: string;
}

export interface UpdateUserInput {
  name?: string;
  avatarId?: string;
  points?: number;
  settings?: Partial<UserSettings>;
}

/**
 * User operations
 */

export async function getUserById(userId: string, familyId: string): Promise<User | null> {
  // TODO: Implement with D1 database
  console.log('getUserById:', { userId, familyId });
  return null;
}

export async function getUserByEmail(email: string, familyId: string): Promise<User | null> {
  // TODO: Implement with D1 database
  console.log('getUserByEmail:', { email, familyId });
  return null;
}

export async function listUsers(familyId: string): Promise<User[]> {
  // TODO: Implement with D1 database
  console.log('listUsers:', familyId);
  return [];
}

export async function createUser(input: CreateUserInput): Promise<User> {
  // TODO: Implement with D1 database
  console.log('createUser:', input);
  const user: User = {
    id: crypto.randomUUID(),
    ...input,
    points: 0,
    settings: {
      themeMode: 'system',
      notificationsEnabled: true,
      language: 'en-US',
      avatarId: input.avatarId || 'default-boy-robot',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  return user;
}

export async function updateUser(userId: string, familyId: string, input: UpdateUserInput): Promise<User | null> {
  // TODO: Implement with D1 database
  console.log('updateUser:', { userId, familyId, input });
  return null;
}

export async function deleteUser(userId: string, familyId: string): Promise<void> {
  // TODO: Implement with D1 database
  console.log('deleteUser:', { userId, familyId });
}

export async function resetUserPoints(userId: string, familyId: string): Promise<void> {
  // TODO: Implement with D1 database
  console.log('resetUserPoints:', { userId, familyId });
}

export async function getFamilyMembers(familyId: string): Promise<User[]> {
  // TODO: Implement with D1 database
  console.log('getFamilyMembers:', familyId);
  return [];
}
