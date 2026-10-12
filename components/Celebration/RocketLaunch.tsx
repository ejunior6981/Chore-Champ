
import React, { useEffect } from 'react';

interface RocketLaunchProps {
  onComplete: () => void;
  className?: string;
}

const RocketLaunch: React.FC<RocketLaunchProps> = ({ onComplete, className = '' }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`relative ${className}`}>
      <svg 
        viewBox="0 0 200 200" 
        className="w-32 h-32 sm:w-48 sm:h-48 animate-[rocket-launch_0.6s_ease-out]"
        style={{ 
          animation: 'rocket-launch 0.6s ease-out',
        }}
      >
        {/* Rocket body */}
        <path 
          d="M100 20 C 100 20, 180 50, 180 100 C 180 150, 130 180, 100 180 C 70 180, 20 150, 20 100 C 20 50, 100 20, 100 20 Z" 
          fill="#FBBF24"
          className="rocket-launch"
        />
        {/* Rocket window */}
        <circle cx="100" cy="70" r="15" fill="#3B82F6" />
        {/* Rocket fins */}
        <path d="M20 100 L 5 120 L 30 110 Z" fill="#EC4899" />
        <path d="M180 100 L 195 120 L 170 110 Z" fill="#EC4899" />
        {/* Flame */}
        <path 
          d="M90 180 Q 100 200, 110 180" 
          fill="none" 
          stroke="#F97316" 
          strokeWidth="8"
          strokeDasharray="5,5"
          className="animate-pulse"
        />
        <path 
          d="M95 185 Q 100 195, 105 185" 
          fill="none" 
          stroke="#FBBF24" 
          strokeWidth="6"
          strokeDasharray="3,3"
        />
      </svg>
    </div>
  );
};

export default RocketLaunch;
