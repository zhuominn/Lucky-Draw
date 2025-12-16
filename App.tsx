import React, { useState, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { RollingBoard } from './components/RollingBoard';
import { Button } from './components/ui-elements';
import { SettingsPanel } from './components/SettingsPanel';
import { DataPanel } from './components/DataPanel';
import { WinnerList } from './components/WinnerList';
import { Settings as SettingsIcon, Users, Maximize, Play, Square } from 'lucide-react';
import { Participant } from './types';
import { cn } from './components/ui-elements';
import { playWinSound } from './utils/audioHelper';

const App = () => {
  const { settings, participants, winners, addWinner } = useAppStore();
  const [isRolling, setIsRolling] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showData, setShowData] = useState(false);
  const [currentRoundWinners, setCurrentRoundWinners] = useState<Participant[]>([]);

  // Apply Theme
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleStart = () => {
    if (participants.length === 0) {
      setShowData(true);
      return;
    }

    // Determine eligible participants
    const eligible = settings.allowRepeats 
      ? participants 
      : participants.filter(p => !winners.some(w => w.id === p.id));

    if (eligible.length < settings.winnerCount) {
      alert(`Not enough eligible participants! Only ${eligible.length} left.`);
      return;
    }

    setIsRolling(true);
    setCurrentRoundWinners([]);
  };

  const handleStop = () => {
    // 1. Calculate Winners
    const eligible = settings.allowRepeats 
      ? participants 
      : participants.filter(p => !winners.some(w => w.id === p.id));

    if (eligible.length === 0) {
      setIsRolling(false);
      return;
    }

    // Shuffle and pick
    const shuffled = [...eligible].sort(() => 0.5 - Math.random());
    const roundWinners = shuffled.slice(0, settings.winnerCount);

    // 2. State Updates
    setCurrentRoundWinners(roundWinners);
    setIsRolling(false);
    
    // 3. Play Sound (using robust helper)
    playWinSound(settings.musicEnabled);
    
    // 4. Persist winners
    roundWinners.forEach(w => addWinner(w));
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col p-4 md:p-8 transition-colors duration-500",
      settings.theme === 'pink' ? "bg-pink-50" : "bg-slate-950"
    )}>
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className={cn(
          "text-2xl md:text-4xl font-black tracking-tight",
          settings.theme === 'pink' ? "text-pink-600" : "text-white"
        )}>
          {settings.title}
        </h1>
        
        <div className="flex gap-2 md:gap-4">
           <Button variant="ghost" size="icon" onClick={() => setShowData(true)} title="Participants">
             <Users className={cn("w-5 h-5", settings.theme === 'pink' ? "text-pink-700" : "text-slate-300")} />
           </Button>
           <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} title="Settings">
             <SettingsIcon className={cn("w-5 h-5", settings.theme === 'pink' ? "text-pink-700" : "text-slate-300")} />
           </Button>
           <Button variant="ghost" size="icon" onClick={toggleFullscreen} title="Fullscreen">
             <Maximize className={cn("w-5 h-5", settings.theme === 'pink' ? "text-pink-700" : "text-slate-300")} />
           </Button>
        </div>
      </header>

      {/* Main Board */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto w-full">
        <RollingBoard isRolling={isRolling} currentWinners={currentRoundWinners} />
        
        <div className="mt-8 flex gap-4">
           {!isRolling ? (
             <Button 
                onClick={handleStart} 
                className={cn(
                  "h-16 px-12 text-2xl font-bold rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95",
                  settings.theme === 'pink' 
                    ? "bg-pink-500 hover:bg-pink-600 text-white shadow-pink-300" 
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/50"
                )}
              >
               <Play className="w-8 h-8 mr-3 fill-current" />
               START
             </Button>
           ) : (
             <Button 
                onClick={handleStop}
                className={cn(
                  "h-16 px-12 text-2xl font-bold rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95",
                  settings.theme === 'pink'
                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-300"
                    : "bg-red-600 hover:bg-red-500 text-white shadow-red-900/50"
                )}
              >
               <Square className="w-8 h-8 mr-3 fill-current" />
               STOP
             </Button>
           )}
        </div>

        <div className="w-full max-w-4xl">
           <WinnerList />
        </div>
      </main>
      
      {/* Footer / Status */}
      <footer className={cn("mt-12 text-center text-sm opacity-60", settings.theme === 'pink' ? "text-pink-800" : "text-slate-400")}>
        Total Participants: {participants.length} | Winners: {winners.length}
      </footer>

      {/* Modals */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <DataPanel isOpen={showData} onClose={() => setShowData(false)} />
    </div>
  );
};

export default App;
