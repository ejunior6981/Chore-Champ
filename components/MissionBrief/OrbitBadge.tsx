
import React from 'react';

interface OrbitBadgeProps {
  streak: number;
  className?: string;
}

const OrbitBadge: React.FC<OrbitBadgeProps> = ({ streak, className = '' }) => {
  if (streak === 0) return null;

  return (
    <div 
      className={`inline-flex items-center space-x-1 text-[#F97316] font-semibold ${className}`}
      title={`${streak} days in orbit`}
    >
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
        <path d="M12 2a10 10 0 0 1 10 10" strokeDasharray="2 2" />
        <path d="M12 2v10" />
      </svg>
      <span className="text-sm">Days in orbit: {streak}</span>
    </div>
  );
};

export default OrbitBadge;
