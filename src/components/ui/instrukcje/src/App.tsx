/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Video, Timer, ChevronUp, Check } from 'lucide-react';

export default function App() {
  const [showModal, setShowModal] = useState(true);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B1017] text-white font-sans relative flex items-center justify-center p-4">
      {showModal && (
        <div className="bg-[#131A24] border border-[#1E2734] rounded-[32px] p-8 max-w-[420px] w-full shadow-2xl transform transition-all">
          <h2 className="text-[22px] font-semibold mb-8 text-gray-100 text-center leading-tight">
            Jak poprawnie nagrać<br/>pod analizę 🎯
          </h2>
          
          <div className="space-y-6 mb-10">
            <div className="flex items-start gap-4">
              <div className="bg-[#1A2330] border border-[#222B38] p-3 rounded-2xl text-blue-400 shrink-0 shadow-inner">
                <ChevronUp className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div className="pt-1">
                <p className="text-gray-400 text-[15px] leading-relaxed">
                  <span className="text-gray-100 font-medium">Otwórz maskę</span> (wyłącz radio i nawiew).
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-[#1A2330] border border-[#222B38] p-3 rounded-2xl text-purple-400 shrink-0 shadow-inner">
                <Video className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div className="pt-1">
                <p className="text-gray-400 text-[15px] leading-relaxed">
                  <span className="text-gray-100 font-medium">Nagrywaj wideo</span> (Diagnoza jest precyzyjniejsza).
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-[#1A2330] border border-[#222B38] p-3 rounded-2xl text-emerald-400 shrink-0 shadow-inner">
                <Timer className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div className="pt-1">
                <p className="text-gray-400 text-[15px] leading-relaxed">
                  <span className="text-gray-100 font-medium">Zrób to w 3 krokach:</span> Odpal silnik <span className="text-gray-500 mx-1">→</span> poczekaj 5 sekund <span className="text-gray-500 mx-1">→</span> lekko dodaj gazu.
                </p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setShowModal(false)}
            className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold py-4 rounded-2xl transition-colors text-[13px] tracking-widest uppercase shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            Rozumiem, odpal kamerę
          </button>
          
          <div 
            className="mt-6 flex items-center justify-center gap-3 cursor-pointer group" 
            onClick={() => setDontShowAgain(!dontShowAgain)}
          >
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${dontShowAgain ? 'bg-[#3B82F6] border-[#3B82F6]' : 'border-[#2A3646] bg-[#0D131B] group-hover:border-[#3B82F6]'}`}>
              {dontShowAgain && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
            </div>
            <span className="text-gray-500 text-[13px] select-none group-hover:text-gray-400 transition-colors">Nie pokazuj tego więcej</span>
          </div>
        </div>
      )}
    </div>
  );
}
