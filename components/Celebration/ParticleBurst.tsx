
import React, { useEffect, useState } from 'react';

interface ParticleBurstProps {
  onComplete?: () => void;
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  delay: number;
}

const ParticleBurst: React.FC<ParticleBurstProps> = ({ onComplete, className = '' }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const colors = ['#FBBF24', '#EC4899', '#7C3AED', '#F97316', '#1E3A5F'];
      const newParticles: Particle[] = [];
      
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: i,
          x: Math.cos((Math.PI * 2 * i) / 20) * 50,
          y: Math.sin((Math.PI * 2 * i) / 20) * 50,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 0.2,
        });
      }
      
      setParticles(newParticles);
      
      if (onComplete) {
        setTimeout(onComplete, 400);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`relative ${className}`}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: '50%',
            top: '50%',
            backgroundColor: particle.color,
            transform: `translate(${particle.x}px, ${particle.y}px)`,
            animation: `particle-burst ${0.4}s ease-out ${particle.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
};

export default ParticleBurst;
