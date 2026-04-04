/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { SettingsButton } from './components/SettingsButton';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('auto');

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
            className="text-center relative z-10"
          >
            <h1 className="text-4xl font-bold mb-4 tracking-tight">Auto</h1>
            <p className="text-white/60 text-lg">Zarządzaj swoimi pojazdami i trasami.</p>
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
            className="text-center relative z-10"
          >
            <h1 className="text-4xl font-bold mb-4 tracking-tight">Rower</h1>
            <p className="text-white/60 text-lg">Śledź swoje wycieczki rowerowe i statystyki.</p>
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
            className="text-center relative z-10"
          >
            <h1 className="text-4xl font-bold mb-4 tracking-tight">Shazam</h1>
            <p className="text-white/60 text-lg">Rozpoznawaj muzykę w swoim otoczeniu.</p>
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
            className="text-center relative z-10"
          >
            <h1 className="text-4xl font-bold mb-4 tracking-tight">Chat</h1>
            <p className="text-white/60 text-lg">Rozmawiaj ze znajomymi i asystentem AI.</p>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center font-sans relative overflow-hidden">
      {/* Decorative background elements to highlight the glass effect */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      
      <SettingsButton />
      
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
