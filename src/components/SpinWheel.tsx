import { useState, useRef, useEffect } from "react";
import { Video, Users, Clock, Gift, Play, X, Zap } from "lucide-react";
import { useCoinSound } from "@/hooks/useCoinSound";

// Global audio instance for wheel spinning sound
let wheelAudio: HTMLAudioElement | null = null;

interface SpinWheelProps {
  onComplete: (evaluations: number, bonusBalance: number) => void;
  onlineUsers: number;
}

const SEGMENTS = [
  { value: "3x", color: "hsl(341, 100%, 50%)" },
  { value: "2x", color: "hsl(0, 0%, 12%)" },
  { value: "3x", color: "hsl(180, 100%, 50%)" },
  { value: "2x", color: "hsl(0, 0%, 12%)" },
  { value: "3x", color: "hsl(341, 100%, 50%)" },
  { value: "2x", color: "hsl(0, 0%, 12%)" },
  { value: "3x", color: "hsl(180, 100%, 50%)" },
  { value: "2x", color: "hsl(0, 0%, 12%)" },
];

const SpinWheel = ({ onComplete, onlineUsers }: SpinWheelProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [showExtraSpin, setShowExtraSpin] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [showLoseMessage, setShowLoseMessage] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const { playBothSounds } = useCoinSound();

  // UTMify tracking - Step 1: Wheel
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).utmify) {
      (window as any).utmify.trackPageView({ page: 'wheel_step' });
    }
  }, []);

  const playErrorSound = () => {
    try {
      const errorAudio = new Audio("https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3");
      errorAudio.volume = 0.6;
      errorAudio.play().catch(() => {});
    } catch (e) {
      console.log("Could not play error sound");
    }
  };

  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setShowLoseMessage(false);
    const currentSpinCount = spinCount + 1;
    setSpinCount(currentSpinCount);
    
    try {
      wheelAudio = new Audio("https://assets.mixkit.co/active_storage/sfx/146/146-preview.mp3");
      wheelAudio.volume = 0.7;
      wheelAudio.playbackRate = 1.2;
      wheelAudio.play().catch(() => {});
    } catch (e) {
      console.log("Could not play wheel sound");
    }

    const isFirstSpin = currentSpinCount === 1;
    const targetSegments = isFirstSpin ? [1, 3, 5, 7] : [0, 2, 4, 6]; // first spin lands on 2x, second on 3x
    const targetSegment = targetSegments[Math.floor(Math.random() * targetSegments.length)];
    
    const segmentAngle = 360 / SEGMENTS.length;
    const targetAngle = targetSegment * segmentAngle;
    const fullRotations = 5 * 360;
    const finalRotation = fullRotations + (360 - targetAngle) - segmentAngle / 2;

    if (wheelRef.current) {
      wheelRef.current.style.setProperty('--spin-degrees', `${finalRotation}deg`);
      wheelRef.current.classList.add('wheel-spinning');
    }

    setTimeout(() => {
      if (wheelAudio) {
        wheelAudio.pause();
        wheelAudio.currentTime = 0;
        wheelAudio = null;
      }
      
      setIsSpinning(false);
      
      if (isFirstSpin) {
        setResult(0);
        setShowLoseMessage(true);
        playErrorSound();
        
        setTimeout(() => {
          setShowLoseMessage(false);
          setShowExtraSpin(true);
        }, 1500);
      } else {
        setResult(3);
        setHasSpun(true);
        playBothSounds();
      }
    }, 4000);
  };

  const handleContinue = () => {
    onComplete(3, 43.40);
  };

  const handleExtraSpin = () => {
    setShowExtraSpin(false);
    setResult(null);
    if (wheelRef.current) {
      wheelRef.current.classList.remove('wheel-spinning');
      wheelRef.current.style.transform = 'rotate(0deg)';
    }
    setTimeout(() => spinWheel(), 100);
  };

  return (
    <div className="animate-fade-in">
      {/* Info Card */}
      <div className="card-tiktok p-5 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl gradient-tiktok flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              🎰 Multiply your balance!
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Spin the wheel and triple your earnings before withdrawing!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{onlineUsers.toLocaleString()} online</span>
          </div>
          <div className="flex items-center gap-2 text-primary">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Only 20 spots today</span>
          </div>
        </div>

        {/* Lose Message (First Spin) */}
        {showLoseMessage && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl animate-bounce-in">
            <div className="flex items-center justify-center gap-2 mb-2">
              <X className="w-6 h-6 text-red-500" />
              <p className="text-center text-foreground font-bold text-lg">
                Almost! Only 2x this time
              </p>
            </div>
            <p className="text-center text-red-400 text-sm">
              But don't give up...
            </p>
          </div>
        )}

        {/* Extra Spin Banner */}
        {showExtraSpin && (
          <div className="mt-4 p-3 bg-secondary rounded-xl border border-primary/30 animate-bounce-in">
            <p className="text-center text-foreground">
              <span className="text-primary font-bold">Almost!</span> You still have{" "}
              <span className="text-accent font-bold">1 bonus spin</span> for the 3x
            </p>
          </div>
        )}

        {/* Win Result Banner */}
        {hasSpun && result === 3 && (
          <div className="mt-4 p-4 bg-secondary rounded-xl border-2 border-primary animate-bounce-in">
            <p className="text-center text-foreground font-bold text-lg">
              🎉 You got the 3x multiplier!
            </p>
            <p className="text-center text-gradient-tiktok font-bold text-2xl mt-1">
              Your balance will be TRIPLED!
            </p>
            <p className="text-center text-muted-foreground text-sm mt-1">
              Click below to continue
            </p>
          </div>
        )}
      </div>

      {/* Wheel */}
      <div className="relative flex justify-center mb-8">
        <div className="absolute -top-2 z-10">
          <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-primary drop-shadow-lg" />
        </div>

        <div className="relative w-[min(18rem,80vw)] h-[min(18rem,80vw)]">
          <div
            ref={wheelRef}
            className="w-full h-full rounded-full relative overflow-hidden shadow-2xl"
            style={{
              background: `conic-gradient(
                ${SEGMENTS.map((seg, i) => {
                  const start = (i * 100) / SEGMENTS.length;
                  const end = ((i + 1) * 100) / SEGMENTS.length;
                  return `${seg.color} ${start}% ${end}%`;
                }).join(", ")}
              )`,
              boxShadow: '0 0 40px hsl(341 100% 50% / 0.3), 0 0 40px hsl(180 100% 50% / 0.3)'
            }}
          >
            {SEGMENTS.map((seg, i) => {
              const angle = (i * 360) / SEGMENTS.length + 360 / SEGMENTS.length / 2;
              return (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 font-bold text-xl select-none"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-90px) rotate(0deg)`,
                    color: "white",
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                  }}
                >
                  <span style={{ display: 'inline-block', transform: `rotate(-${angle}deg)` }}>
                    {seg.value}
                  </span>
                </div>
              );
            })}

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-card border-4 border-border flex items-center justify-center shadow-xl">
              <Video className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      {(!hasSpun && !showExtraSpin && !showLoseMessage) ? (
        <button
          onClick={spinWheel}
          disabled={isSpinning}
          className="btn-tiktok w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Gift className="w-5 h-5" />
          <span>{isSpinning ? "Spinning..." : "SPIN THE WHEEL"}</span>
        </button>
      ) : showExtraSpin ? (
        <button
          onClick={handleExtraSpin}
          disabled={isSpinning}
          className="btn-tiktok w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-scale"
        >
          <Gift className="w-5 h-5" />
          <span>🎁 FREE BONUS SPIN!</span>
        </button>
      ) : hasSpun && result === 3 ? (
        <button onClick={handleContinue} className="btn-tiktok w-full">
          TRIPLE & CONTINUE 🚀
        </button>
      ) : null}
    </div>
  );
};

export default SpinWheel;
