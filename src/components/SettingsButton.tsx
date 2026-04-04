"use client";

import { Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export function SettingsButton({ onClick }: { onClick?: () => void }) {
  return (
    <motion.button 
      onClick={onClick}
      className="fixed top-6 right-6 md:top-8 md:right-8 z-50 flex items-center justify-center w-12 h-12 backdrop-blur-2xl rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden"
      aria-label="Ustawienia"
      whileHover="hover"
      whileTap="tap"
      initial="rest"
      variants={{
        rest: { scale: 1, backgroundColor: "rgba(255, 255, 255, 0.05)" },
        hover: { scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" },
        tap: { scale: 0.95, backgroundColor: "rgba(255, 255, 255, 0.15)" }
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"
        variants={{
          rest: { opacity: 0 },
          hover: { opacity: 1 },
          tap: { opacity: 1 }
        }}
      />
      <motion.div
        variants={{
          rest: { rotate: 0, scale: 1, color: "rgba(255, 255, 255, 0.8)" },
          hover: { rotate: 90, scale: 1.1, color: "rgba(255, 255, 255, 1)" },
          tap: { rotate: 135, scale: 0.8, color: "rgba(255, 255, 255, 1)" }
        }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="relative z-10 flex items-center justify-center"
      >
        <Settings 
          className="w-[22px] h-[22px]" 
          strokeWidth={2.5} 
        />
      </motion.div>
    </motion.button>
  );
}
