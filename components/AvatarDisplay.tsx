import React from 'react';

interface AvatarDisplayProps {
  avatarId?: string;
  sizeClass?: string;
  className?: string;
}

/**
 * AvatarDisplay Component
 * Displays user avatar with emoji
 */
const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatarId,
  sizeClass = 'w-16 h-16',
  className = '',
}) => {
  // Get avatar from localStorage for now (will migrate to server)
  const getAvatar = () => {
    if (!avatarId) return null;
    
    // Avatar definitions (same as in avatar.ts)
    const avatars = {
      'boy-robot': { emoji: '🤖', name: 'Robot' },
      'boy-astronaut': { emoji: '👨‍🚀', name: 'Astronaut' },
      'boy-gamer': { emoji: '🎮', name: 'Gamer' },
      'boy-scientist': { emoji: '🧑‍🔬', name: 'Scientist' },
      'girl-princess': { emoji: '👸', name: 'Princess' },
      'girl-artist': { emoji: '👩‍🎨', name: 'Artist' },
      'girl-explorer': { emoji: '🧭', name: 'Explorer' },
      'girl-musician': { emoji: '👩‍🎤', name: 'Musician' },
    };
    
    return avatars[avatarId] || null;
  };

  const avatar = getAvatar();
  const emoji = avatar?.emoji || '👤';

  return (
    <div
      className={`
        ${sizeClass}
        flex items-center justify-center
        rounded-full
        bg-gradient-to-br from-indigo-500 to-purple-600
        text-4xl
        shadow-lg
        ${className}
      `}
      role="img"
      aria-label={avatar ? `${avatar.name} avatar` : 'User avatar'}
    >
      {emoji}
    </div>
  );
};

export default AvatarDisplay;
