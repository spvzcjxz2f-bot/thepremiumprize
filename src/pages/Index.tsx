import { useState, useEffect, useCallback } from "react";
import SpinWheel from "@/components/SpinWheel";
import VideoEvaluation from "@/components/VideoEvaluation";
import RewardModal from "@/components/RewardModal";
import FinalPage from "@/components/FinalPage";
import Header from "@/components/Header";

export type FunnelStep = "evaluation" | "wheel" | "final";

export interface EvaluationTrack {
  id: number;
  title: string;
  artist: string;
  image: string;
  reward: number;
}

const VIDEOS: EvaluationTrack[] = [
  { id: 1, title: "My first viral dance 💃", artist: "Marie Creator", image: "/video-1.jpg", reward: 12.50 },
  { id: 2, title: "Grandma's secret recipe 🍳", artist: "Chef Lucas", image: "/video-2.jpg", reward: 14.80 },
  { id: 3, title: "Magic transition ✨", artist: "Hugo Edit", image: "/video-3.jpg", reward: 15.20 },
];

const Index = () => {
  const [step, setStep] = useState<FunnelStep>("evaluation");
  const [balance, setBalance] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [lastReward, setLastReward] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(2841);
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleWheelComplete = (_evaluations: number, _bonusBalance: number) => {
    // Wheel now triples the balance
    const tripled = balance * 3;
    setBalance(tripled);
    setTotalEarned(tripled);
    setStep("final");
  };

  const handleEvaluationComplete = useCallback((reaction: string) => {
    const track = VIDEOS[currentTrackIndex];
    const reward = track.reward;
    
    setLastReward(reward);
    setBalance(prev => {
      const newBalance = prev + reward;
      setTotalEarned(newBalance);
      return newBalance;
    });
    setShowRewardModal(true);
  }, [currentTrackIndex]);

  const handleRewardModalClose = useCallback(() => {
    setShowRewardModal(false);
    
    if (currentTrackIndex < VIDEOS.length - 1) {
      setCurrentTrackIndex(prev => prev + 1);
    } else {
      // After all evaluations, go to wheel to triple balance
      setStep("wheel");
    }
  }, [currentTrackIndex]);

  const currentTrack = VIDEOS[currentTrackIndex];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header balance={balance} onlineUsers={onlineUsers} />
      
      <main className="pt-16 pb-6 px-3 sm:px-4 min-h-screen">
        <div className="max-w-md mx-auto w-full">
          {step === "evaluation" && currentTrack && (
            <VideoEvaluation
              track={currentTrack}
              currentIndex={currentTrackIndex}
              totalTracks={VIDEOS.length}
              onComplete={handleEvaluationComplete}
            />
          )}

          {step === "wheel" && (
            <SpinWheel onComplete={handleWheelComplete} onlineUsers={onlineUsers} />
          )}

          {step === "final" && (
            <FinalPage totalEarned={totalEarned} />
          )}
        </div>
      </main>

      <RewardModal
        isOpen={showRewardModal}
        reward={lastReward}
        onClose={handleRewardModalClose}
      />
    </div>
  );
};

export default Index;
