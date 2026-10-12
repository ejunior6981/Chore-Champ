
import React, { useEffect, useState } from 'react';

interface ConfettiBurstProps {
  onComplete?: () => void;
  className?: string;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  delay: number;
}

const ConfettiBurst: React.FC<ConfettiBurstProps> = ({ onComplete, className = '' }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const colors = ['#FBBF24', '#EC4899', '#7C3AED', '#F97316', '#1E3A5F', '#F3F4F6'];
      const newPieces: ConfettiPiece[] = [];
      
      for (let i = 0; i < 30; i++) {
        newPieces.push({
          id: i,
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          delay: Math.random() * 0.3,
        });
      }
      
      setPieces(newPieces);
      
      if (onComplete) {
        setTimeout(onComplete, 600);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`relative ${className}`}>
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            left: '50%',
            top: '50%',
            backgroundColor: piece.color,
            transform: `translate(${piece.x}px, ${piece.y}px) rotate(${piece.rotation}deg)`,
            animation: `confetti-burst ${0.6}s ease-out ${piece.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiBurst;
