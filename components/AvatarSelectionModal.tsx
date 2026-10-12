import React, { useState } from 'react';
import AvatarDisplay from './AvatarDisplay';

interface Avatar {
  id: string;
  name: string;
  category: 'boy' | 'girl' | 'neutral';
  emoji: string;
  description: string;
  tags: string[];
}

interface AvatarSelectionModalProps {
  selectedAvatarId?: string;
  onSelectAvatar: (avatarId: string) => void;
  onClose: () => void;
  className?: string;
}

const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({
  selectedAvatarId,
  onSelectAvatar,
  onClose,
  className = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'boy' | 'girl'>('all');

  // Avatar definitions (same as in avatar.ts)
  const avatars: Avatar[] = [
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

  const filteredAvatars = selectedCategory === 'all'
    ? avatars
    : avatars.filter(a => a.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Pick Your Avatar!</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Choose an avatar that represents you
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center gap-2 mb-6">
          {(['all', 'boy', 'girl'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-4 py-2 rounded-full font-medium transition-all
                ${selectedCategory === category
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }
              `}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Avatar Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {filteredAvatars.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => onSelectAvatar(avatar.id)}
              className={`
                relative p-4 rounded-xl border-2 transition-all text-center
                ${selectedAvatarId === avatar.id
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                }
              `}
            >
              <div className="text-6xl mb-2">{avatar.emoji}</div>
              <div className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
                {avatar.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {avatar.description}
              </div>
              
              {/* Selected indicator */}
              {selectedAvatarId === avatar.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Choose button */}
        <div className="flex justify-center">
          <button
            onClick={() => onSelectAvatar(selectedAvatarId || filteredAvatars[0]?.id)}
            className="
              bg-indigo-500 hover:bg-indigo-600 text-white font-semibold
              py-3 px-8 rounded-lg shadow-md transition-all
              transform hover:scale-105
            "
          >
            {selectedAvatarId ? 'Choose Avatar' : 'Select an Avatar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelectionModal;
