import { useCallback, useRef } from "react";

// TikTok-style sound effects using Web Audio API
export const useReactionSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Pop/click sound for positive reactions
  const playPopSound = useCallback(() => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  }, [getAudioContext]);

  // Success/ding sound for viral/top reactions
  const playSuccessSound = useCallback(() => {
    const ctx = getAudioContext();
    
    // First note
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    gain1.gain.setValueAtTime(0.25, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.2);
    
    // Second note
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc2.start(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.3);
    
    // Third note
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
    gain3.gain.setValueAtTime(0.3, ctx.currentTime + 0.2);
    gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc3.start(ctx.currentTime + 0.2);
    osc3.stop(ctx.currentTime + 0.5);
  }, [getAudioContext]);

  // Neutral click sound
  const playClickSound = useCallback(() => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  }, [getAudioContext]);

  // Negative/warning sound
  const playWarningSound = useCallback(() => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(300, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  }, [getAudioContext]);

  // Play sound based on reaction type
  const playReactionSound = useCallback((reaction: string) => {
    switch (reaction) {
      case "viral":
        playSuccessSound();
        break;
      case "top":
        playPopSound();
        break;
      case "pasmal":
        playClickSound();
        break;
      case "bof":
        playClickSound();
        break;
      case "danger":
        playWarningSound();
        break;
      case "flop":
        playWarningSound();
        break;
      default:
        playClickSound();
    }
  }, [playSuccessSound, playPopSound, playClickSound, playWarningSound]);

  return { playReactionSound, playPopSound, playSuccessSound, playClickSound, playWarningSound };
};
