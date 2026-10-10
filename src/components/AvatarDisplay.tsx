import React from 'react';

export interface AvatarDisplayProps {
  avatarId: string;
  sizeClass?: string;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ avatarId, sizeClass = 'w-8 h-8' }) => {
  const avatars: Record<string, string> = {
    'boy-robot': '🤖',
    'boy-robot-0': '🤖',
    'boy-robot-1': '🤖',
    'girl-robot': '🤖',
    'girl-robot-0': '🤖',
    'girl-robot-1': '🤖',
    'boy-scifi': '👨',
    'girl-scifi': '👩',
    'boy-classic': '👨',
    'girl-classic': '👩',
  };

  const emoji = avatars[avatarId] || '👤';

  return (
    <div className={`${sizeClass} flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full border-2 border-slate-200 dark:border-slate-700`}>
      <span className="text-2xl">{emoji}</span>
    </div>
  );
};
