import { useState, useEffect } from "react";
import { Star, Trophy, Play, Volume2, Shield, AlertTriangle, CheckCircle2, Wallet, TrendingUp, Video } from "lucide-react";
import { useCoinSound } from "@/hooks/useCoinSound";
import confetti from "canvas-confetti";

interface FinalPageProps {
  totalEarned: number;
}

const WINNERS = [
  { rank: 1, name: "Marie L.", flag: "🇺🇸", badge: "👑", amount: "$9,847", verified: true, avatar: "https://randomuser.me/api/portraits/women/1.jpg" },
  { rank: 2, name: "Thomas P.", flag: "🇺🇸", badge: "💎", amount: "$8,523", verified: true, avatar: "https://randomuser.me/api/portraits/men/2.jpg" },
  { rank: 3, name: "Lea M.", flag: "🇺🇸", badge: "🔥", amount: "$7,105", verified: true, avatar: "https://randomuser.me/api/portraits/women/3.jpg" },
  { rank: 4, name: "Nicolas D.", flag: "🇺🇸", badge: "⭐", amount: "$6,289", verified: true, avatar: "https://randomuser.me/api/portraits/men/4.jpg" },
  { rank: 5, name: "Camille B.", flag: "🇺🇸", badge: "⭐", amount: "$5,534", verified: true, avatar: "https://randomuser.me/api/portraits/women/5.jpg" },
];

const WITHDRAWALS = [
  { name: "Antoine R.", amount: "$520.00", method: "PayPal", time: "2 min ago", avatar: "https://randomuser.me/api/portraits/men/21.jpg" },
  { name: "Sophie G.", amount: "$385.50", method: "Bank", time: "5 min ago", avatar: "https://randomuser.me/api/portraits/women/22.jpg" },
  { name: "Lucas K.", amount: "$720.00", method: "PayPal", time: "12 min ago", avatar: "https://randomuser.me/api/portraits/men/23.jpg" },
  { name: "Emily W.", amount: "$278.90", method: "Bank", time: "18 min ago", avatar: "https://randomuser.me/api/portraits/women/24.jpg" },
  { name: "Nicolas V.", amount: "$992.30", method: "PayPal", time: "25 min ago", avatar: "https://randomuser.me/api/portraits/men/25.jpg" },
];

const TESTIMONIALS = [
  { name: "Julie D.", text: "At first I didn't believe it, then I received my first $500. It's real! Now I evaluate videos every day.", amount: "$3,340 earned", avatar: "https://randomuser.me/api/portraits/women/31.jpg" },
  { name: "Marc S.", text: "Super easy! You just watch TikToks and give your opinion. I've already made 3 withdrawals to my bank account.", amount: "$2,890 earned", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { name: "Claire B.", text: "I was skeptical at first, but after the first payment I was convinced. The best side income!", amount: "$4,120 earned", avatar: "https://randomuser.me/api/portraits/women/33.jpg" },
];

const FinalPage = ({ totalEarned }: FinalPageProps) => {
  const [activeTab, setActiveTab] = useState<"ranking" | "withdrawals" | "testimonials">("ranking");
  const [spotsLeft, setSpotsLeft] = useState(17);
  
  const { playBothSounds } = useCoinSound();

  // Load Vturb player script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/vendor/player-69f510b3429b5d0eef508546.js";
    script.async = true;
    document.head.appendChild(script);
    
    return () => {
      const existingScript = document.querySelector(`script[src="${script.src}"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // UTMify tracking
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).utmify) {
      (window as any).utmify.trackPageView({ page: 'final_step' });
    }
  }, []);

  // Celebration effects
  useEffect(() => {
    playBothSounds();
    
    const cashRegisterAudio = new Audio("https://assets.mixkit.co/active_storage/sfx/88/88-preview.mp3");
    cashRegisterAudio.volume = 0.6;
    cashRegisterAudio.play().catch(() => {});
    
    setTimeout(() => {
      const applauseAudio = new Audio("https://assets.mixkit.co/active_storage/sfx/2194/2194-preview.mp3");
      applauseAudio.volume = 0.4;
      applauseAudio.play().catch(() => {});
    }, 300);
    
    const isLowEnd = (navigator.hardwareConcurrency || 4) <= 4;
    confetti({
      particleCount: isLowEnd ? 60 : 120,
      spread: 160,
      origin: { y: 0.5 },
      colors: ['#FE2C55', '#25F4EE', '#ffffff', '#FFD700', '#FF00FF']
    });
  }, []);

  // Spots countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setSpotsLeft(prev => Math.max(3, prev - Math.floor(Math.random() * 2)));
    }, 15000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="animate-slide-up">
      {/* VSL Video Section */}
      <div id="vsl-video" className="card-tiktok p-4 mb-4">
        <p className="text-primary text-center font-bold mb-2">
          To make your withdrawal
        </p>
        <p className="text-center text-foreground text-sm mb-4">
          and evaluate more creators,{" "}
          <span className="font-bold underline">watch the tutorial below (4 minutes)</span>!
        </p>

        {/* Vturb Video Player */}
        <div className="rounded-xl overflow-hidden mb-3 border border-primary/30">
        <div 
          dangerouslySetInnerHTML={{
            __html: `
              <vturb-smartplayer id="vid-69f510b3429b5d0eef508546" style="display: block; margin: 0 auto; width: 100%; max-width: 400px;"></vturb-smartplayer>
            `
          }}
        />
        </div>

        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <Volume2 className="w-4 h-4" />
          <span>🔊 Make sure your sound is on</span>
        </div>
      </div>

      {/* Success Card */}
      <div className="card-tiktok p-4 mb-4 text-center border-2 border-primary/50">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">🎬</span>
          <span className="text-3xl font-black text-gradient-tiktok glow-text animate-count-up">
            +${totalEarned.toFixed(2)}
          </span>
        </div>
        <p className="text-primary text-xs">
          You received ${totalEarned.toFixed(2)} for evaluating our TikTok creators.
        </p>
      </div>

      {/* New User Notice */}
      <div className="card-tiktok p-3 mb-4">
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-primary mt-1.5 animate-pulse" />
          <div>
            <p className="font-bold text-foreground text-sm">You are a new user!</p>
            <p className="text-muted-foreground text-xs mt-1">
              Watch the tutorial to register your bank account and make a withdrawal.
            </p>
          </div>
        </div>
      </div>

      {/* FOMO Banner */}
      <div className="bg-orange-500/20 border border-orange-500/50 rounded-xl p-3 mb-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <p className="text-foreground text-sm">
            Only <span className="font-bold text-orange-400">{spotsLeft} spots</span> available today
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="card-tiktok p-3 text-center">
          <p className="text-xl font-bold text-primary">$7.2M+</p>
          <p className="text-xs text-muted-foreground">Paid</p>
        </div>
        <div className="card-tiktok p-3 text-center">
          <p className="text-xl font-bold text-foreground">347K+</p>
          <p className="text-xs text-muted-foreground">Users</p>
        </div>
        <div className="card-tiktok p-3 text-center">
          <p className="text-xl font-bold text-primary flex items-center justify-center gap-1">
            4.9<Star className="w-4 h-4 fill-primary" />
          </p>
          <p className="text-xs text-muted-foreground">Rating</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-secondary/50 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("ranking")}
          className={`flex-1 py-2 px-2 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-1 ${
            activeTab === "ranking"
              ? "gradient-tiktok text-white"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Trophy className="w-3 h-3" />
          Ranking
        </button>
        <button
          onClick={() => setActiveTab("withdrawals")}
          className={`flex-1 py-2 px-2 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-1 ${
            activeTab === "withdrawals"
              ? "gradient-tiktok text-white"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wallet className="w-3 h-3" />
          Withdrawals
        </button>
        <button
          onClick={() => setActiveTab("testimonials")}
          className={`flex-1 py-2 px-2 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-1 ${
            activeTab === "testimonials"
              ? "gradient-tiktok text-white"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Star className="w-3 h-3" />
          Reviews
        </button>
      </div>

      {/* Tab Content: Ranking */}
      {activeTab === "ranking" && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-foreground text-sm">Live Ranking - January 2025</h3>
            <span className="ml-auto text-xs text-primary animate-pulse">● LIVE</span>
          </div>
          <div className="space-y-2 mb-4">
            {WINNERS.map((winner) => (
              <div 
                key={winner.rank} 
                className={`card-tiktok p-3 flex items-center gap-2 ${
                  winner.rank <= 3 ? 'border border-primary/30' : ''
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  winner.rank === 1 ? 'bg-yellow-500 text-black' :
                  winner.rank === 2 ? 'bg-gray-400 text-black' :
                  winner.rank === 3 ? 'bg-amber-600 text-black' :
                  'bg-secondary text-muted-foreground'
                }`}>
                  {winner.rank}
                </div>
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img src={winner.avatar} alt={winner.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground text-sm truncate">{winner.name}</span>
                    <span className="text-xs">{winner.flag}</span>
                    <span className="text-xs">{winner.badge}</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary text-xs">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-primary font-bold text-sm">{winner.amount}</p>
                  <p className="text-xs text-muted-foreground">this month</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Tab Content: Withdrawals */}
      {activeTab === "withdrawals" && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-foreground text-sm">Recent Withdrawals</h3>
            <span className="ml-auto text-xs text-primary animate-pulse">● LIVE</span>
          </div>
          <div className="space-y-2 mb-4">
            {WITHDRAWALS.map((withdrawal, i) => (
              <div key={i} className="card-tiktok p-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img src={withdrawal.avatar} alt={withdrawal.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground text-sm">{withdrawal.name}</span>
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">{withdrawal.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-primary font-bold text-sm">{withdrawal.amount}</p>
                  <p className="text-xs text-muted-foreground">{withdrawal.method}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Tab Content: Testimonials */}
      {activeTab === "testimonials" && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-foreground text-sm">User Testimonials</h3>
          </div>
          <div className="space-y-3 mb-4">
            {TESTIMONIALS.map((testimonial, i) => (
              <div key={i} className="card-tiktok p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="font-medium text-foreground text-sm">{testimonial.name}</span>
                    <div className="flex">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className="w-3 h-3 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                  <span className="ml-auto text-xs text-primary font-bold">{testimonial.amount}</span>
                </div>
                <p className="text-muted-foreground text-sm">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Security Badge */}
      <div className="card-tiktok p-3 mb-4">
        <div className="flex items-start gap-2">
          <Shield className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <p className="font-bold text-foreground text-sm">100% Secure Platform</p>
            <p className="text-muted-foreground text-xs mt-1">
              227,000+ active users. Instant payments via PayPal and bank transfer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalPage;
