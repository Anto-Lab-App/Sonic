"use client";

import { Car, Bike, AudioLines, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isVisible?: boolean;
}

export function BottomNav({ activeTab, onTabChange, isVisible = true }: BottomNavProps) {
  const tabs = [
    { id: 'auto', label: 'Auto', icon: Car },
    { id: 'rower', label: 'rower', icon: Bike },
    { id: 'shazam', label: 'shazam', icon: AudioLines },
  ];

  return (
    <motion.div 
      initial={{ y: 150, opacity: 0 }}
      animate={{ 
        y: isVisible ? 0 : 120, 
        opacity: isVisible ? 1 : 0 
      }}
      exit={{ y: 150, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50 w-max"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Main Navigation Pill - Glassmorphism */}
      <div className="relative flex items-center bg-foreground/5 backdrop-blur-2xl rounded-[2.5rem] p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-foreground/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex flex-col items-center justify-center w-[72px] h-[58px] sm:w-[84px] sm:h-[68px] rounded-[2rem] z-10 group transition-colors duration-300 ${
                !isActive ? 'hover:bg-foreground/10' : ''
              }`}
            >
              {/* Fluid Active Background */}
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-foreground/10 rounded-[2rem] border border-foreground/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <Icon 
                strokeWidth={isActive ? 2.5 : 2}
                className={`relative z-20 w-[22px] h-[22px] sm:w-[26px] sm:h-[26px] mb-1 transition-colors duration-300 ${
                  isActive ? 'text-[#4F95FF]' : 'text-foreground/60 group-hover:text-foreground/90'
                }`} 
              />
              <span 
                className={`relative z-20 text-[10px] sm:text-[11px] font-medium tracking-wide transition-colors duration-300 ${
                  isActive ? 'text-[#4F95FF]' : 'text-foreground/60 group-hover:text-foreground/90'
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
        className={`relative flex items-center justify-center w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] bg-foreground/5 backdrop-blur-2xl rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-foreground/10 transition-colors duration-300 group overflow-hidden ${
          activeTab === 'chat' ? 'bg-foreground/10 border-foreground/20 shadow-[0_0_20px_rgba(79,149,255,0.3)]' : 'hover:bg-foreground/20'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <MessageCircle 
          className={`relative z-10 w-6 h-6 sm:w-8 sm:h-8 transition-all duration-300 ${
            activeTab === 'chat' ? 'text-[#4F95FF] scale-110' : 'text-foreground/80 group-hover:text-foreground group-hover:scale-110'
          }`} 
          strokeWidth={2.5} 
        />
      </motion.button>
    </motion.div>
  );
}
