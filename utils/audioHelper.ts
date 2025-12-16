// Audio Helper to handle sound effects with fallback

const WIN_SOUND_URL = 'https://codeskulptor-demos.commondatastorage.googleapis.com/pang/paza-moduless.mp3'; // A reliable arcade win sound

export const playWinSound = (enabled: boolean) => {
  if (!enabled) return;

  try {
    const audio = new Audio(WIN_SOUND_URL);
    audio.volume = 0.5;
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn('Audio file playback failed, switching to synth fallback:', error);
        playSynthSound();
      });
    }
  } catch (e) {
    playSynthSound();
  }
};

// Fallback: Synthesize a "Ta-Da" sound using Web Audio API (No download needed)
const playSynthSound = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  
  // Create a sequence of notes: C5, E5, G5, C6 (Major Arpeggio)
  const notes = [523.25, 659.25, 783.99, 1046.50];
  const start = ctx.currentTime;
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = i === notes.length - 1 ? 'triangle' : 'sine';
    osc.frequency.value = freq;
    
    // Envelope
    gain.gain.setValueAtTime(0, start + i * 0.1);
    gain.gain.linearRampToValueAtTime(0.3, start + i * 0.1 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, start + i * 0.1 + 0.4);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(start + i * 0.1);
    osc.stop(start + i * 0.1 + 0.5);
  });
};
