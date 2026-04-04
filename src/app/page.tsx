"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from '@/components/BottomNav';
import { SettingsButton } from '@/components/SettingsButton';
import { SettingsModal } from '@/components/SettingsModal';
import { Scanner } from '@/components/Scanner';
import { Chat } from '@/components/Chat';
import { ShazamScanner } from '@/components/ShazamScanner';
import { BikeScanner } from '@/components/BikeScanner';

export default function Home() {
  const [activeTab, setActiveTab] = useState('auto');
  const [previousTab, setPreviousTab] = useState('auto');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-hide nav after 4 seconds of inactivity on small screens
  const resetNavTimer = useCallback(() => {
    setIsNavVisible(true);
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    
    // Only auto-hide on small screens (< 700px height)
    if (typeof window !== 'undefined' && window.innerHeight < 700) {
      navTimerRef.current = setTimeout(() => {
        setIsNavVisible(false);
      }, 4000);
    }
  }, []);

  useEffect(() => {
    resetNavTimer();
    return () => {
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, [resetNavTimer]);

  const handleTabChange = (tabId: string) => {
    if (tabId === 'chat' && activeTab !== 'chat') {
      setPreviousTab(activeTab);
    }
    setActiveTab(tabId);
    resetNavTimer();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'auto':
        return (
          <motion.div 
            key="auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-[100dvh]"
          >
            <Scanner />
          </motion.div>
        );
      case 'chat':
        return (
          <motion.div 
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-[100dvh]"
          >
            <Chat onBack={() => setActiveTab(previousTab)} />
          </motion.div>
        );
      case 'rower':
        return (
          <motion.div 
            key="rower"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-[100dvh]"
          >
            <BikeScanner />
          </motion.div>
        );
      case 'shazam':
        return (
          <motion.div 
            key="shazam"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-[100dvh]"
          >
            <ShazamScanner />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <main 
      className="min-h-[100dvh] bg-background text-foreground flex flex-col relative overflow-hidden font-sans selection:bg-primary/30"
      onPointerDown={resetNavTimer}
    >
      <SettingsButton onClick={() => setIsSettingsOpen(true)} />

      <AnimatePresence>
        {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>

      <AnimatePresence>
        {activeTab !== 'chat' && (
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} isVisible={isNavVisible} />
        )}
      </AnimatePresence>
    </main>
  );
}
