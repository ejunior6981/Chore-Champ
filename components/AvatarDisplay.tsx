
import React from 'react';
import { UserCircleIcon } from './icons';

// Simple, fun SVG avatars
const PredefinedAvatars: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  bot: (props) => (
    <svg viewBox="0 0 100 100" {...props}><rect x="20" y="30" width="60" height="50" rx="10" fill="#a7f3d0" /><circle cx="35" cy="55" r="5" fill="white" /><circle cx="65" cy="55" r="5" fill="white" /><rect x="40" y="70" width="20" height="5" fill="#34d399" /><rect x="45" y="20" width="10" height="10" fill="#a7f3d0" /></svg>
  ),
  cat: (props) => (
    <svg viewBox="0 0 100 100" {...props}><path d="M20 90 C 20 70, 80 70, 80 90 Z" fill="#fbcfe8" /><path d="M20 90 C 20 60, 30 50, 50 50 C 70 50, 80 60, 80 90 Z" fill="#f9a8d4" /><path d="M30 40 L20 20 L40 40 Z" fill="#fbcfe8" /><path d="M70 40 L80 20 L60 40 Z" fill="#fbcfe8" /><circle cx="40" cy="65" r="5" fill="black" /><circle cx="60" cy="65" r="5" fill="black" /><path d="M45 75 Q 50 85, 55 75" stroke="black" fill="none" strokeWidth="2" /></svg>
  ),
  ghost: (props) => (
    <svg viewBox="0 0 100 100" {...props}><path d="M20 100 V 40 Q 50 10, 80 40 V 100 L 70 90 L 60 100 L 50 90 L 40 100 L 30 90 Z" fill="#e0e7ff" /><circle cx="40" cy="55" r="6" fill="#4f46e5" /><circle cx="60" cy="55" r="6" fill="#4f46e5" /><circle cx="50" cy="70" r="10" fill="white" stroke="#4f46e5" strokeWidth="2" /></svg>
  ),
  dino: (props) => (
    <svg viewBox="0 0 100 100" {...props}><path d="M30 90 V 60 H 70 V 50 H 80 V 70 H 90 V 40 L 60 20 H 40 L 30 40 Z" fill="#d9f99d" /><circle cx="50" cy="40" r="4" fill="black" /><rect x="35" y="60" width="30" height="5" fill="#a3e635" /></svg>
  ),
};

export const AVATAR_KEYS = Object.keys(PredefinedAvatars);

interface AvatarDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  avatar: string | null;
  sizeClass?: string;
}

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ avatar, sizeClass = 'w-10 h-10', ...rest }) => {
  const commonClasses = "rounded-full overflow-hidden bg-white/30 flex items-center justify-center";

  if (!avatar) {
    return (
      <div className={`${sizeClass} ${commonClasses}`} {...rest}>
        <UserCircleIcon className="w-full h-full text-white/80" />
      </div>
    );
  }

  if (avatar.startsWith('data:image')) {
    return (
      <div className={`${sizeClass} ${commonClasses}`} {...rest}>
        <img src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
      </div>
    );
  }

  const AvatarComponent = PredefinedAvatars[avatar];
  if (AvatarComponent) {
    return (
      <div className={`${sizeClass} ${commonClasses} p-1`} {...rest}>
        <AvatarComponent className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className={`${sizeClass} ${commonClasses}`} {...rest}>
      <UserCircleIcon className="w-full h-full text-white/80" />
    </div>
  );
};

export default AvatarDisplay;
