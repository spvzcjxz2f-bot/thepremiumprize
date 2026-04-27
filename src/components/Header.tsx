import { Wallet } from "lucide-react";

interface HeaderProps {
  balance: number;
  onlineUsers: number;
}

const Header = ({ balance, onlineUsers }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/30">
      <div className="max-w-md mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Super VIP Branding */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] sm:text-xs font-black tracking-wider text-gradient-tiktok uppercase truncate">SUPER VIP</span>
        </div>

        {/* Balance Badge */}
        <div className="balance-badge !px-3 !py-1.5">
          <Wallet className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm sm:text-base whitespace-nowrap">${balance.toFixed(2)}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;