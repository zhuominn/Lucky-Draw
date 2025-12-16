import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Modal, Input, Button } from './ui-elements';
import { Trash2, Palette, Users, Music, PlayCircle } from 'lucide-react';
import { playWinSound } from '../utils/audioHelper';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetAll } = useAppStore();

  const handleReset = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      resetAll();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-6">
        
        {/* Title Setting */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Event Title
          </label>
          <Input 
            value={settings.title} 
            onChange={(e) => updateSettings({ title: e.target.value })}
            placeholder="e.g. Annual Lucky Draw"
          />
        </div>

        {/* Winner Count */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none flex items-center gap-2">
            <Users className="w-4 h-4" />
            Winners per Round
          </label>
          <Input 
            type="number" 
            min={1} 
            max={50}
            value={settings.winnerCount} 
            onChange={(e) => updateSettings({ winnerCount: Math.max(1, parseInt(e.target.value) || 1) })}
          />
        </div>

        {/* Music Toggle */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none flex items-center gap-2">
            <Music className="w-4 h-4" />
            Sound Effects
          </label>
          <div className="flex items-center justify-between border p-3 rounded-md bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800">
            <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="music-toggle"
                  checked={settings.musicEnabled}
                  onChange={(e) => updateSettings({ musicEnabled: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="music-toggle" className="text-sm font-medium cursor-pointer select-none">
                  Play sound when revealed
                </label>
            </div>
            <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => playWinSound(true)}
                title="Test Sound"
            >
                <PlayCircle className="w-3 h-3 mr-1" />
                Test
            </Button>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Theme
          </label>
          <div className="flex gap-4">
            <button 
              onClick={() => updateSettings({ theme: 'dark' })}
              className={`w-20 h-10 rounded-md border-2 ${settings.theme === 'dark' ? 'border-blue-500 bg-slate-900 text-white' : 'border-slate-200 bg-slate-900 text-slate-400'}`}
            >
              Dark
            </button>
            <button 
              onClick={() => updateSettings({ theme: 'pink' })}
              className={`w-20 h-10 rounded-md border-2 ${settings.theme === 'pink' ? 'border-pink-500 bg-pink-100 text-pink-900' : 'border-slate-200 bg-pink-50 text-pink-300'}`}
            >
              Pink
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="destructive" onClick={handleReset} className="w-full gap-2">
            <Trash2 className="w-4 h-4" />
            Reset Application Data
          </Button>
        </div>
      </div>
    </Modal>
  );
};
