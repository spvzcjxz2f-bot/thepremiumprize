// Coin/money sound effect hook
const COIN_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3";
const CASH_REGISTER_URL = "https://assets.mixkit.co/active_storage/sfx/888/888-preview.mp3";

let coinAudio: HTMLAudioElement | null = null;
let cashAudio: HTMLAudioElement | null = null;

// Preload sounds
if (typeof window !== 'undefined') {
  coinAudio = new Audio(COIN_SOUND_URL);
  coinAudio.volume = 0.5;
  coinAudio.preload = 'auto';
  
  cashAudio = new Audio(CASH_REGISTER_URL);
  cashAudio.volume = 0.6;
  cashAudio.preload = 'auto';
}

export const useCoinSound = () => {
  const playCoinSound = () => {
    if (coinAudio) {
      coinAudio.currentTime = 0;
      coinAudio.play().catch(() => {});
    }
  };

  const playCashSound = () => {
    if (cashAudio) {
      cashAudio.currentTime = 0;
      cashAudio.play().catch(() => {});
    }
  };

  const playBothSounds = () => {
    playCoinSound();
    setTimeout(() => playCashSound(), 200);
  };

  return { playCoinSound, playCashSound, playBothSounds };
};
