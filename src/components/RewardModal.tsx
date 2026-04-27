import { useEffect, useState } from "react";
import { useCoinSound } from "@/hooks/useCoinSound";
import confetti from "canvas-confetti";

interface RewardModalProps {
  isOpen: boolean;
  reward: number;
  onClose: () => void;
}

const RewardModal = ({ isOpen, reward, onClose }: RewardModalProps) => {
  const [show, setShow] = useState(false);
  const { playBothSounds } = useCoinSound();

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      playBothSounds();
      
      try {
        const cashSound = new Audio("https://assets.mixkit.co/active_storage/sfx/88/88-preview.mp3");
        cashSound.volume = 0.5;
        cashSound.play().catch(() => {});
      } catch (e) {}
      
      // Lighter confetti on mobile / low-end devices
      const isLowEnd = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 4) <= 4;
      const particles = isLowEnd ? 40 : 80;

      confetti({
        particleCount: particles,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#FE2C55', '#25F4EE', '#FFD700', '#FF00FF']
      });
    }
  }, [isOpen, playBothSounds]);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => { setShow(false); onClose(); }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="absolute animate-confetti" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 0.8}s`, animationDuration: `${1.5 + Math.random()}s`, fontSize: `${1 + Math.random() * 1.5}rem` }}>
            {['💰', '🪙', '💵', '✨', '🔥', '🎉', '💎', '⭐'][Math.floor(Math.random() * 8)]}
          </div>
        ))}
      </div>

      <div className="relative bg-card border-2 border-primary rounded-2xl p-8 max-w-sm w-full animate-bounce-in">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center animate-money-pop">
          <div className="w-16 h-16 rounded-full gradient-tiktok flex items-center justify-center">
            <span className="text-4xl">💰</span>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground mb-1">
            🎉 Well done! Reward unlocked!
          </h3>
          <p className="text-muted-foreground text-sm mb-3">You earned:</p>
          
          <p className="text-5xl font-black text-gradient-tiktok mb-2 animate-count-up glow-text">
            +${reward.toFixed(2)}
          </p>
          
          <p className="text-primary text-sm font-medium">
            for evaluating this video
          </p>

          <p className="text-muted-foreground text-sm mt-4">
            Keep evaluating to earn more! 🚀
          </p>
        </div>

        <div className="absolute inset-0 -z-10 rounded-2xl blur-xl opacity-40 gradient-tiktok" />
        <div className="absolute -top-2 -left-2 text-2xl animate-pulse">✨</div>
        <div className="absolute -top-2 -right-2 text-2xl animate-pulse" style={{ animationDelay: '0.3s' }}>✨</div>
        <div className="absolute -bottom-2 -left-2 text-2xl animate-pulse" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute -bottom-2 -right-2 text-2xl animate-pulse" style={{ animationDelay: '0.7s' }}>✨</div>
      </div>
    </div>
  );
};

export default RewardModal;
