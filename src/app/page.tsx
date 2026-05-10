"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from '@/components/BottomNav';
import { SettingsButton } from '@/components/SettingsButton';
import { SettingsModal } from '@/components/SettingsModal';
import { Scanner } from '@/components/Scanner';
import { Chat } from '@/components/Chat';
import { ShazamScanner } from '@/components/ShazamScanner';
import { BikeScanner } from '@/components/BikeScanner';

import { Header } from '@/components/Header';
import { DiagnosisReport } from '@/components/DiagnosisReport';
import { BikeDiagnosisReport } from '@/components/BikeDiagnosisReport';
import { IdentificationReport } from '@/components/IdentificationReport';
import { NoCreditsModal } from '@/components/NoCreditsModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState('auto');
  const [previousTab, setPreviousTab] = useState('auto');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  useEffect(() => {
    const handleOpenPricingModal = () => setShowPricingModal(true);
    window.addEventListener('open-pricing-modal', handleOpenPricingModal);

    // Check if returning from Stripe checkout
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success');
      const diagnosisId = urlParams.get('diagnosisId');

      if (success === 'true' && diagnosisId) {
        import('@/app/actions/history').then(({ getDiagnosisById }) => {
          getDiagnosisById(diagnosisId).then((record) => {
            if (record) {
              setSelectedRecord(record);
              // Clean up the URL
              window.history.replaceState({}, '', window.location.pathname);
            }
          });
        });
      }
    }

    return () => window.removeEventListener('open-pricing-modal', handleOpenPricingModal);
  }, []);

  const handleTabChange = (tabId: string) => {
    if (tabId === 'chat' && activeTab !== 'chat') {
      setPreviousTab(activeTab);
    }
    setActiveTab(tabId);
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
            <Scanner onOpenChat={(id: string) => {
              setSelectedDiagnosisId(id);
              handleTabChange('chat');
            }} />
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
            <Chat onBack={() => setActiveTab(previousTab)} diagnosisId={selectedDiagnosisId} onSelectDiagnosis={(id: string) => setSelectedDiagnosisId(id)} />
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
            <BikeScanner onOpenChat={(id: string) => {
              setSelectedDiagnosisId(id);
              handleTabChange('chat');
            }} />
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
            <ShazamScanner onOpenChat={(id: string) => {
              setSelectedDiagnosisId(id);
              handleTabChange('chat');
            }} />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-[100dvh] bg-background text-foreground flex flex-col relative overflow-hidden font-sans selection:bg-primary/30">
      <Header />
      <SettingsButton onClick={() => setIsSettingsOpen(true)} />

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal
            onClose={() => setIsSettingsOpen(false)}
            onOpenReport={(record: any) => {
              setSelectedRecord(record);
              setIsSettingsOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-[150] flex flex-col">
            {selectedRecord.aiReport?.final_diagnosis ? (
              // Enhanced detection logic using 'type' or content tags
              selectedRecord.vehicleData.includes('"type":"bike"') || selectedRecord.vehicleData.includes('"make":"Rower"') ? (
                <BikeDiagnosisReport
                  data={selectedRecord.aiReport.final_diagnosis}
                  diagnosisId={selectedRecord.id}
                  isUnlocked={selectedRecord.isUnlocked}
                  onClose={() => setSelectedRecord(null)}
                  onOpenChat={(id) => {
                    setSelectedDiagnosisId(id);
                    setSelectedRecord(null);
                    handleTabChange('chat');
                  }}
                />
              ) : (
                <DiagnosisReport
                  data={selectedRecord.aiReport.final_diagnosis}
                  diagnosisId={selectedRecord.id}
                  isUnlocked={selectedRecord.isUnlocked}
                  onClose={() => setSelectedRecord(null)}
                  onOpenChat={(id) => {
                    setSelectedDiagnosisId(id);
                    setSelectedRecord(null);
                    handleTabChange('chat');
                  }}
                />
              )
            ) : (selectedRecord.aiReport?.name || selectedRecord.vehicleData.includes('"type":"audio"')) ? (
              <IdentificationReport
                identifiedCar={selectedRecord.aiReport}
                diagnosisId={selectedRecord.id}
                isUnlocked={selectedRecord.isUnlocked}
                onClose={() => setSelectedRecord(null)}
                onOpenChat={(id) => {
                  setSelectedDiagnosisId(id);
                  setSelectedRecord(null);
                  handleTabChange('chat');
                }}
              />
            ) : (
              <DiagnosisReport
                data={selectedRecord.aiReport}
                diagnosisId={selectedRecord.id}
                isUnlocked={selectedRecord.isUnlocked}
                onClose={() => setSelectedRecord(null)}
                onOpenChat={(id) => {
                  setSelectedDiagnosisId(id);
                  setSelectedRecord(null);
                  handleTabChange('chat');
                }}
              />
            )}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>

      <AnimatePresence>
        {activeTab !== 'chat' && (
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        )}
      </AnimatePresence>

      <NoCreditsModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />
    </main>
  );
}
