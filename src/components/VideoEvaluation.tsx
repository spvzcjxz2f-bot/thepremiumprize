import { useState, useEffect, useCallback, useRef } from "react";
import { Volume2, Play, Pause, Heart, MessageCircle, Share2, Bookmark, Plus, VolumeX } from "lucide-react";
import { EvaluationTrack } from "@/pages/Index";
import FomoNotification from "./FomoNotification";
import { useReactionSound } from "@/hooks/useReactionSound";

interface VideoEvaluationProps {
  track: EvaluationTrack;
  currentIndex: number;
  totalTracks: number;
  onComplete: (reaction: string) => void;
}

const TIKTOK_VIDEOS = [
  "/videos/tiktok-1.mp4",
  "/videos/tiktok-2.mp4",
  "/videos/tiktok-3.mp4",
];

const CREATOR_AVATARS = [
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
];

const VideoEvaluation = ({ track, currentIndex, totalTracks, onComplete }: VideoEvaluationProps) => {
  const [countdown, setCountdown] = useState(5);
  const [canRate, setCanRate] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 50000) + 10000);
  const [comments, setComments] = useState(Math.floor(Math.random() * 5000) + 500);
  const [saves, setSaves] = useState(Math.floor(Math.random() * 3000) + 200);
  const [shares, setShares] = useState(Math.floor(Math.random() * 2000) + 100);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const trackIdRef = useRef<number>(track.id);
  const { playReactionSound } = useReactionSound();

  // Handle video playback
  useEffect(() => {
    trackIdRef.current = track.id;
    const v = videoRef.current;
    if (v) {
      v.load();
      // Try autoplay muted first (mobile browsers require this)
      v.muted = true;
      setIsMuted(true);
      const playPromise = v.play();
      if (playPromise) {
        playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
    return () => { if (v) v.pause(); };
  }, [currentIndex, track.id]);

  // Reset on track change
  useEffect(() => {
    setCountdown(5);
    setCanRate(false);
    setIsPlaying(false);
    setIsMuted(false);
    setLikes(Math.floor(Math.random() * 50000) + 10000);
    setComments(Math.floor(Math.random() * 5000) + 500);
    setSaves(Math.floor(Math.random() * 3000) + 200);
    setShares(Math.floor(Math.random() * 2000) + 100);
  }, [track.id]);

  // UTMify tracking
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).utmify) {
      (window as any).utmify.trackPageView({ page: `evaluation_step_${currentIndex + 1}` });
    }
  }, [currentIndex]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0 && isPlaying) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanRate(true);
    }
  }, [countdown, isPlaying]);

  const handleReaction = useCallback((reaction: string) => {
    if (!canRate) return;
    playReactionSound(reaction);
    if (videoRef.current) videoRef.current.pause();
    setIsPlaying(false);
    onComplete(reaction);
  }, [canRate, onComplete, playReactionSound]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="animate-fade-in">
      <div className="rounded-2xl overflow-hidden mb-4 relative bg-black mx-auto" style={{ maxHeight: '70vh' }}>
        <div className="relative aspect-[9/16] overflow-hidden mx-auto" style={{ maxHeight: '70vh', maxWidth: 'calc(70vh * 9 / 16)' }}>
          <video
            ref={videoRef}
            src={TIKTOK_VIDEOS[currentIndex % TIKTOK_VIDEOS.length]}
            className="w-full h-full object-cover"
            loop
            playsInline
            preload="metadata"
            muted={isMuted}
            onClick={togglePlay}
          />
          
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

          {!canRate && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="48" cy="48" r="44" stroke="hsl(180 100% 50%)" strokeWidth="3" fill="none" strokeOpacity="0.3" />
                  <circle cx="48" cy="48" r="44" stroke="url(#tiktokGradient)" strokeWidth="3" fill="none" strokeDasharray={276} strokeDashoffset={276 - (276 * (5 - countdown)) / 5} strokeLinecap="round" className="transition-all duration-1000" />
                  <defs>
                    <linearGradient id="tiktokGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(180 100% 50%)" />
                      <stop offset="100%" stopColor="hsl(341 100% 50%)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white drop-shadow-lg">{countdown}</span>
                </div>
              </div>
              <p className="text-center text-white text-sm mt-2 font-medium drop-shadow-lg">
                Watch before rating
              </p>
            </div>
          )}

          <div className="absolute right-3 bottom-28 flex flex-col items-center gap-4">
            <div className="relative mb-2">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                <img src={CREATOR_AVATARS[currentIndex % CREATOR_AVATARS.length]} alt="Creator" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Plus className="w-3 h-3 text-white" />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <Heart className="w-7 h-7 text-white" fill="white" />
              </div>
              <span className="text-white text-xs mt-1 font-semibold">{formatNumber(likes)}</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" fill="white" />
              </div>
              <span className="text-white text-xs mt-1 font-semibold">{formatNumber(comments)}</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <Bookmark className="w-7 h-7 text-white" />
              </div>
              <span className="text-white text-xs mt-1 font-semibold">{formatNumber(saves)}</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <Share2 className="w-7 h-7 text-white" />
              </div>
              <span className="text-white text-xs mt-1 font-semibold">{formatNumber(shares)}</span>
            </div>

            <div className={`w-10 h-10 rounded-full border-2 border-gray-600 overflow-hidden ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}>
              <img src={CREATOR_AVATARS[currentIndex % CREATOR_AVATARS.length]} alt="Music" className="w-full h-full object-cover" />
            </div>
          </div>

          <button onClick={togglePlay} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors">
            {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
          </button>

          <button onClick={toggleMute} className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full hover:bg-black/70 transition-colors">
            {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
            <span className="text-xs text-white font-medium">{isMuted ? 'MUTED' : 'MAX'}</span>
          </button>

          <div className="absolute bottom-4 left-4 right-20 pointer-events-none">
            <p className="text-white font-bold text-base mb-1">@{track.artist.toLowerCase().replace(/\s+/g, '_')}</p>
            <p className="text-white text-sm mb-2">{track.title}</p>
            <p className="text-white/80 text-xs">#fyp #foryou #viral #beginner</p>
          </div>
        </div>
      </div>

      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-foreground mb-2">
          Choose your reaction! 🎮
        </h2>
        <p className="text-muted-foreground text-sm">
          Watch <span className="text-primary font-bold">5 seconds</span> before rating.{" "}
          <span className="font-medium">Turn on the sound.</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button onClick={() => handleReaction("viral")} disabled={!canRate}
          className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 ${!canRate ? "opacity-40 cursor-not-allowed bg-secondary" : "bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 hover:border-green-400 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]"}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🚀</span>
            <span className="font-bold text-green-400 text-sm">VIRAL</span>
          </div>
          <p className="text-foreground text-xs font-medium">"It's going to blow up!"</p>
        </button>

        <button onClick={() => handleReaction("top")} disabled={!canRate}
          className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 ${!canRate ? "opacity-40 cursor-not-allowed bg-secondary" : "bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 hover:border-blue-400 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🔥</span>
            <span className="font-bold text-blue-400 text-sm">TOP</span>
          </div>
          <p className="text-foreground text-xs font-medium">"Quality content"</p>
        </button>

        <button onClick={() => handleReaction("pasmal")} disabled={!canRate}
          className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 ${!canRate ? "opacity-40 cursor-not-allowed bg-secondary" : "bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 hover:border-yellow-400 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]"}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">👀</span>
            <span className="font-bold text-yellow-400 text-sm">NOT BAD</span>
          </div>
          <p className="text-foreground text-xs font-medium">"It has potential"</p>
        </button>

        <button onClick={() => handleReaction("bof")} disabled={!canRate}
          className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 ${!canRate ? "opacity-40 cursor-not-allowed bg-secondary" : "bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 hover:border-orange-400 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]"}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">😬</span>
            <span className="font-bold text-orange-400 text-sm">MEH</span>
          </div>
          <p className="text-foreground text-xs font-medium">"Not convinced..."</p>
        </button>

        <button onClick={() => handleReaction("danger")} disabled={!canRate}
          className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 ${!canRate ? "opacity-40 cursor-not-allowed bg-secondary" : "bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 hover:border-red-400 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">⚠️</span>
            <span className="font-bold text-red-400 text-sm">DANGER</span>
          </div>
          <p className="text-foreground text-xs font-medium">"This won't end well..."</p>
        </button>

        <button onClick={() => handleReaction("flop")} disabled={!canRate}
          className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 ${!canRate ? "opacity-40 cursor-not-allowed bg-secondary" : "bg-gradient-to-br from-gray-500/20 to-gray-600/10 border border-gray-500/30 hover:border-gray-400 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(107,114,128,0.3)]"}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🚫</span>
            <span className="font-bold text-gray-400 text-sm">FLOP</span>
          </div>
          <p className="text-foreground text-xs font-medium">"Doesn't work at all"</p>
        </button>
      </div>

      <div className="card-tiktok p-4 text-center">
        <p className="text-muted-foreground text-sm">
          Reward for this evaluation:{" "}
          <span className="text-gradient-tiktok font-bold text-lg">+${track.reward.toFixed(2)}</span>
        </p>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: totalTracks }).map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-all ${i < currentIndex ? "gradient-tiktok" : i === currentIndex ? "gradient-tiktok pulse-glow" : "bg-muted"}`} />
        ))}
      </div>

      <FomoNotification isActive={isPlaying} />
    </div>
  );
};

export default VideoEvaluation;
