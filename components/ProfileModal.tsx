import React, { useState } from 'react';
import AvatarDisplay from './AvatarDisplay';

interface ProfileModalProps {
  currentAvatar: string | null;
  onSave: (avatarId: string) => void;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  currentAvatar,
  onSave,
  onClose,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || 'boy-robot');

  const avatars = [
    { id: 'boy-robot', name: 'Robot', emoji: '🤖', category: 'boy' },
    { id: 'boy-astronaut', name: 'Astronaut', emoji: '👨‍🚀', category: 'boy' },
    { id: 'boy-gamer', name: 'Gamer', emoji: '🎮', category: 'boy' },
    { id: 'boy-scientist', name: 'Scientist', emoji: '🧑‍🔬', category: 'boy' },
    { id: 'girl-princess', name: 'Princess', emoji: '👸', category: 'girl' },
    { id: 'girl-artist', name: 'Artist', emoji: '👩‍🎨', category: 'girl' },
    { id: 'girl-explorer', name: 'Explorer', emoji: '🧭', category: 'girl' },
    { id: 'girl-musician', name: 'Musician', emoji: '👩‍🎤', category: 'girl' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">
          Select Your Avatar
        </h2>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                Current Avatar
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {avatars.find(a => a.id === currentAvatar)?.name || 'Default'}
              </p>
            </div>
            <AvatarDisplay avatarId={currentAvatar} sizeClass="w-16 h-16" />
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                Selected Avatar
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {avatars.find(a => a.id === selectedAvatar)?.name || 'Default'}
              </p>
            </div>
            <AvatarDisplay avatarId={selectedAvatar} sizeClass="w-16 h-16" />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(selectedAvatar);
              onClose();
            }}
            className="flex-1 bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
