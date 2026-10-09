/**
 * Avatar data access layer
 * Handles avatar selection and management
 */

export interface Avatar {
  id: string;
  name: string;
  category: 'boy' | 'girl' | 'neutral';
  emoji: string;
  description: string;
  tags: string[];
}

export interface AvatarSelection {
  userId: string;
  familyId: string;
  avatarId: string;
  selectedAt: number;
}

export interface AvatarSelectionInput {
  userId: string;
  familyId: string;
  avatarId: string;
}

export interface AvatarDefinition {
  id: string;
  name: string;
  category: 'boy' | 'girl' | 'neutral';
  emoji: string;
  description: string;
  tags: string[];
}

/**
 * Avatar operations
 */

export const AVATARS: AvatarDefinition[] = [
  // Boy-oriented avatars
  {
    id: 'boy-robot',
    name: 'Robot',
    category: 'boy',
    emoji: '🤖',
    description: 'Tech-savvy, futuristic robot companion',
    tags: ['tech', 'futuristic', 'smart'],
  },
  {
    id: 'boy-astronaut',
    name: 'Astronaut',
    category: 'boy',
    emoji: '👨‍🚀',
    description: 'Space explorer ready for any mission',
    tags: ['space', 'explorer', 'adventure'],
  },
  {
    id: 'boy-gamer',
    name: 'Gamer',
    category: 'boy',
    emoji: '🎮',
    description: 'Gaming enthusiast with headset and controller',
    tags: ['gaming', 'fun', 'relaxed'],
  },
  {
    id: 'boy-scientist',
    name: 'Scientist',
    category: 'boy',
    emoji: '🧑‍🔬',
    description: 'Lab coat and goggles ready for discovery',
    tags: ['science', 'learning', 'curious'],
  },
  // Girl-oriented avatars
  {
    id: 'girl-princess',
    name: 'Princess',
    category: 'girl',
    emoji: '👸',
    description: 'Sparkly crown and elegant dress',
    tags: ['royal', 'elegant', 'magical'],
  },
  {
    id: 'girl-artist',
    name: 'Artist',
    category: 'girl',
    emoji: '👩‍🎨',
    description: 'Creative with paintbrush and palette',
    tags: ['creative', 'artistic', 'colorful'],
  },
  {
    id: 'girl-explorer',
    name: 'Explorer',
    category: 'girl',
    emoji: '🧭',
    description: 'Adventure gear and map for discovery',
    tags: ['adventure', 'explorer', 'brave'],
  },
  {
    id: 'girl-musician',
    name: 'Musician',
    category: 'girl',
    emoji: '👩‍🎤',
    description: 'Musical notes and instrument ready to perform',
    tags: ['music', 'artistic', 'performance'],
  },
];

export async function getAvatars(): Promise<AvatarDefinition[]> {
  // TODO: Implement with D1 database
  console.log('getAvatars');
  return AVATARS;
}

export async function getAvatarById(avatarId: string): Promise<AvatarDefinition | null> {
  // TODO: Implement with D1 database
  console.log('getAvatarById:', avatarId);
  return AVATARS.find(a => a.id === avatarId) || null;
}

export async function listAvatars(category?: 'boy' | 'girl' | 'neutral'): Promise<AvatarDefinition[]> {
  // TODO: Implement with D1 database
  console.log('listAvatars:', category);
  return category 
    ? AVATARS.filter(a => a.category === category)
    : AVATARS;
}

export async function selectAvatar(input: AvatarSelectionInput): Promise<AvatarSelection> {
  // TODO: Implement with D1 database
  console.log('selectAvatar:', input);
  const selection: AvatarSelection = {
    userId: input.userId,
    familyId: input.familyId,
    avatarId: input.avatarId,
    selectedAt: Date.now(),
  };
  return selection;
}

export async function getUserAvatar(userId: string, familyId: string): Promise<string> {
  // TODO: Implement with D1 database
  console.log('getUserAvatar:', { userId, familyId });
  return 'default-boy-robot'; // Default fallback
}

export async function updateUserAvatar(userId: string, familyId: string, avatarId: string): Promise<void> {
  // TODO: Implement with D1 database
  console.log('updateUserAvatar:', { userId, familyId, avatarId });
}

export async function getAllAvatars(): Promise<Avatar[]> {
  // TODO: Implement with D1 database
  console.log('getAllAvatars');
  return AVATARS.map(av => ({ ...av, id: av.id }));
}
