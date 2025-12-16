import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button } from './ui-elements';
import { Participant } from '../types';
import { cn } from './ui-elements';

interface RollingBoardProps {
  isRolling: boolean;
  currentWinners: Participant[]; // The winners of the *current* round specifically
}

export const RollingBoard: React.FC<RollingBoardProps> = ({ isRolling, currentWinners }) => {
  const { participants, settings } = useAppStore();
  const [displayNames, setDisplayNames] = useState<string[]>([]);
  const animationRef = useRef<number>(0);

  // Initialize slots
  useEffect(() => {
    setDisplayNames(Array(settings.winnerCount).fill('Ready'));
  }, [settings.winnerCount]);

  // Rolling Logic
  useEffect(() => {
    if (isRolling && participants.length > 0) {
      const update = () => {
        const nextNames = [];
        for (let i = 0; i < settings.winnerCount; i++) {
          const randomIdx = Math.floor(Math.random() * participants.length);
          nextNames.push(participants[randomIdx].name);
        }
        setDisplayNames(nextNames);
        animationRef.current = requestAnimationFrame(update);
      };
      animationRef.current = requestAnimationFrame(update);
    } else if (!isRolling && currentWinners.length > 0) {
      // Stopped, show actual winners
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setDisplayNames(currentWinners.map(w => w.name));
      
      // Fire confetti
      if ((window as any).confetti) {
        const duration = 3000;
        const end = Date.now() + duration;

        (function frame() {
          (window as any).confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: settings.theme === 'pink' ? ['#ec4899', '#db2777'] : ['#60a5fa', '#3b82f6']
          });
          (window as any).confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: settings.theme === 'pink' ? ['#ec4899', '#db2777'] : ['#60a5fa', '#3b82f6']
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }());
      }
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRolling, participants, settings.winnerCount, currentWinners, settings.theme]);

  // Dynamic grid calculation
  const gridCols = settings.winnerCount === 1 ? 'grid-cols-1' :
                   settings.winnerCount <= 4 ? 'grid-cols-2' :
                   settings.winnerCount <= 9 ? 'grid-cols-3' : 'grid-cols-4';

  const textSize = settings.winnerCount === 1 ? 'text-6xl md:text-8xl' :
                   settings.winnerCount <= 4 ? 'text-4xl md:text-5xl' :
                   'text-2xl md:text-3xl';

  return (
    <div className={cn(
      "relative w-full aspect-video md:aspect-[21/9] rounded-2xl shadow-2xl overflow-hidden border-4 flex items-center justify-center p-8 transition-colors duration-500",
      settings.theme === 'pink' 
        ? "bg-gradient-to-br from-pink-500 to-rose-600 border-pink-300 shadow-pink-500/30" 
        : "bg-slate-900 border-slate-700 shadow-blue-900/20"
    )}>
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
         <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      {participants.length === 0 ? (
        <div className="text-white/50 text-xl font-medium text-center">
          Import participants to start
        </div>
      ) : (
        <div className={cn("grid gap-4 w-full h-full content-center", gridCols)}>
          {displayNames.map((name, idx) => (
            <div 
              key={idx} 
              className={cn(
                "flex items-center justify-center font-bold text-white text-center transition-all duration-100",
                textSize,
                !isRolling && currentWinners.length > 0 ? "animate-in zoom-in-50 duration-500 ease-out scale-110 text-yellow-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" : "opacity-90"
              )}
            >
              <span className="break-words line-clamp-1 px-4">{name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};