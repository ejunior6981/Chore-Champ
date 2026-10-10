import React, { useState } from 'react';
import { User } from '../types';
import AvatarDisplay from './AvatarDisplay';

interface ChildManagementProps {
  children: User[];
  onAddChild: () => void;
}

const ChildManagement: React.FC<ChildManagementProps> = ({ children: childUsers, onAddChild }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddChild = () => {
    onAddChild();
    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">
        Child Management
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {childUsers.map(child => (
          <div key={child.id} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <AvatarDisplay avatarId={child.avatarId || 'boy-robot'} sizeClass="w-12 h-12" />
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">{child.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {child.role}
                  </p>
                </div>
              </div>
              <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded text-sm font-semibold">
                {child.points} pts
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleAddChild}
        className="w-full py-3 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition-colors"
      >
        Add Child
      </button>
    </div>
  );
};

export default ChildManagement;
