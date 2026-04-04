import React, { useState } from 'react';
import { X, Camera, Mic } from 'lucide-react';

export default function App() {
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);

  const quickTags = [
    'Stukanie', 'Piszczenie', 'Brak mocy', 'Szarpie', 'Dymi', 'Nierówna praca'
  ];

  const conditions = [
    'Cały czas', 'Na zimnym silniku', 'Po rozgrzaniu', 'Przy przyspieszaniu'
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="min-h-screen bg-[#060B11] text-slate-200 font-sans flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl bg-[#0D131F] border border-white/[0.03] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/[0.03]">
          <div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">Kontekst usterki</h2>
            <p className="text-sm text-[#5C6B82] mt-1 font-medium">Pomóż AI dokładniej zdiagnozować problem</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-[#131823] border border-white/[0.03] flex items-center justify-center text-[#8A9BB3] hover:text-white hover:bg-[#1A2130] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex flex-col gap-8">
          
          {/* Opis problemu */}
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C6B82]">Opis problemu</label>
            <div className="relative">
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Np. słychać metaliczne stukanie przy dodawaniu gazu..."
                className="w-full bg-[#060B11] border border-white/[0.03] rounded-2xl p-5 text-sm text-slate-200 placeholder:text-[#475569] focus:outline-none focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30 transition-all resize-none h-32"
              />
              <button className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-[#131823] border border-white/[0.03] flex items-center justify-center text-[#8A9BB3] hover:text-white hover:bg-[#1A2130] transition-colors">
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Szybkie tagi */}
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C6B82]">Szybkie tagi (objawy)</label>
            <div className="flex flex-wrap gap-3">
              {quickTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-5 py-3 rounded-2xl text-sm font-medium transition-all border ${
                    selectedTags.includes(tag) 
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                      : 'bg-[#131823] border-white/[0.03] text-[#8A9BB3] hover:border-white/[0.06] hover:text-slate-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Kiedy występuje */}
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C6B82]">Kiedy występuje?</label>
            <div className="grid grid-cols-2 gap-3">
              {conditions.map(cond => (
                <button
                  key={cond}
                  onClick={() => setSelectedCondition(cond === selectedCondition ? null : cond)}
                  className={`px-5 py-4 rounded-2xl text-sm font-medium text-center transition-all border ${
                    selectedCondition === cond
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                      : 'bg-[#131823] border-white/[0.03] text-[#8A9BB3] hover:border-white/[0.06] hover:text-slate-300'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Dodaj zdjęcie */}
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C6B82]">Załączniki wizualne</label>
            <button className="w-full bg-[#131823] border border-white/[0.03] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-[#1A2130] hover:border-white/[0.06] transition-all group">
              <div className="w-12 h-12 rounded-full bg-[#060B11] border border-white/[0.03] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Camera className="w-5 h-5 text-[#8A9BB3] group-hover:text-slate-300" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold tracking-[0.15em] text-[#8A9BB3] uppercase">Dodaj zdjęcie</span>
                <span className="text-xs text-[#5C6B82] font-medium">Opcjonalnie</span>
              </div>
            </button>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-white/[0.03] bg-[#0D131F] flex gap-4">
          <button className="flex-1 py-4 rounded-2xl font-bold text-xs tracking-[0.15em] uppercase text-[#8A9BB3] bg-[#131823] border border-white/[0.03] hover:bg-[#1A2130] hover:text-slate-300 transition-colors">
            Anuluj
          </button>
          <button className="flex-[2] py-4 rounded-2xl font-bold text-xs tracking-[0.15em] uppercase text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.2)]">
            Zapisz kontekst
          </button>
        </div>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1A2130;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2A3441;
        }
      `}</style>
    </div>
  );
}
