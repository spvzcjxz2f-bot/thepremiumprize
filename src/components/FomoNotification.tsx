import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAMES = [
  "Elena L.", "Lucas M.", "Lucy D.", "David B.", "Claire P.",
  "Nicolas R.", "Marie S.", "Thomas T.", "Camille V.", "Paul A.",
  "Sarah K.", "Theo G.", "Valentina F.", "Raphael N.", "Sophie C.",
  "Marc H.", "Ines W.", "Antoine J.", "Claudia E.", "Alexander Z."
];

const CITIES = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
  "Miami", "Dallas", "Atlanta", "Denver", "Seattle"
];

interface Notification {
  id: number;
  name: string;
  city: string;
  amount: number;
}

interface FomoNotificationProps {
  isActive: boolean;
}

const getInitialPeopleCount = () => Math.floor(Math.random() * 1300) + 1200;

const FomoNotification = ({ isActive }: FomoNotificationProps) => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [peopleEarnedToday, setPeopleEarnedToday] = useState(getInitialPeopleCount);

  useEffect(() => {
    if (!isActive) return;

    const generateNotification = () => {
      const newNotification: Notification = {
        id: Date.now(),
        name: NAMES[Math.floor(Math.random() * NAMES.length)],
        city: CITIES[Math.floor(Math.random() * CITIES.length)],
        amount: Number((Math.random() * 20 + 8).toFixed(2))
      };

      setNotification(newNotification);
      setPeopleEarnedToday(prev => prev + 1);

      setTimeout(() => {
        setNotification(null);
      }, 4000);
    };

    const initialTimeout = setTimeout(generateNotification, 5000);
    const interval = setInterval(() => {
      generateNotification();
    }, Math.random() * 6000 + 12000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isActive]);

  return (
    <div className="fixed bottom-20 left-4 z-50">
      <AnimatePresence>
        {notification && (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-card border border-border text-white px-3 py-2.5 rounded-lg shadow-xl flex items-center gap-2.5 max-w-[280px]"
          >
            <div className="w-8 h-8 gradient-tiktok rounded-full flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate text-white">{notification.name}</p>
              <p className="text-xs text-muted-foreground">{notification.city}</p>
            </div>
            
            <div className="flex items-center gap-0.5 gradient-tiktok px-2 py-1 rounded-full">
              <span className="text-xs text-white">$</span>
              <span className="font-bold text-sm text-white">+{notification.amount.toFixed(2)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
        <div className="w-2 h-2 gradient-tiktok rounded-full animate-pulse"></div>
        <span><strong className="text-white">{peopleEarnedToday.toLocaleString()}</strong> people earned today</span>
      </div>
    </div>
  );
};

export default FomoNotification;
