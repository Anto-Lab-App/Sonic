import { Car, Bike, AudioLines, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'auto', label: 'Auto', icon: Car },
    { id: 'rower', label: 'rower', icon: Bike },
    { id: 'shazam', label: 'shazam', icon: AudioLines },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
      {/* Main Navigation Pill - Glassmorphism */}
      <div className="relative flex items-center bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex flex-col items-center justify-center w-[84px] h-[68px] rounded-[2rem] z-10 group transition-colors duration-300 ${
                !isActive ? 'hover:bg-white/10' : ''
              }`}
            >
              {/* Fluid Active Background */}
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-white/10 rounded-[2rem] border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <Icon 
                strokeWidth={isActive ? 2.5 : 2}
                className={`relative z-20 w-[26px] h-[26px] mb-1.5 transition-colors duration-300 ${
                  isActive ? 'text-[#4F95FF]' : 'text-white/60 group-hover:text-white/90'
                }`} 
              />
              <span 
                className={`relative z-20 text-[11px] font-medium tracking-wide transition-colors duration-300 ${
                  isActive ? 'text-[#4F95FF]' : 'text-white/60 group-hover:text-white/90'
                }`}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Chat Action Button - Glassmorphism */}
      <motion.button 
        onClick={() => onTabChange('chat')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative flex items-center justify-center w-[80px] h-[80px] bg-white/5 backdrop-blur-2xl rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 transition-colors duration-300 group overflow-hidden ${
          activeTab === 'chat' ? 'bg-white/10 border-white/20 shadow-[0_0_20px_rgba(79,149,255,0.3)]' : 'hover:bg-white/20'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <MessageCircle 
          className={`relative z-10 w-8 h-8 transition-all duration-300 ${
            activeTab === 'chat' ? 'text-[#4F95FF] scale-110' : 'text-white/80 group-hover:text-white group-hover:scale-110'
          }`} 
          strokeWidth={2.5} 
        />
      </motion.button>
    </div>
  );
}
