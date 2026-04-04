/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  User, 
  Globe, 
  Bell, 
  Shield, 
  LogOut,
  ChevronLeft,
  Check,
  Moon,
  Sun,
  Monitor,
  History,
  FileAudio,
  Video,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'history', label: 'Historia analiz', icon: History },
  { id: 'preferences', label: 'Preferencje', icon: Globe },
  { id: 'notifications', label: 'Powiadomienia', icon: Bell },
  { id: 'security', label: 'Bezpieczeństwo', icon: Shield },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('history');
  const [language, setLanguage] = useState('pl');
  const [theme, setTheme] = useState('dark');

  return (
    <div className="min-h-screen bg-[#0B121A] text-white font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-[#232C3B] bg-[#0B121A]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2.5 hover:bg-[#151B26] rounded-full transition-colors text-[#8A94A6] hover:text-white border border-transparent hover:border-[#232C3B]">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-semibold tracking-tight">Ustawienia</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <nav className="flex flex-col gap-1.5">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-[#151B26] text-white shadow-sm border border-[#232C3B]' 
                        : 'text-[#8A94A6] hover:bg-[#151B26]/60 hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : ''}`} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
              
              <div className="h-px bg-[#232C3B] my-4 mx-4" />
              
              <button className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 text-red-400 hover:bg-red-500/10 border border-transparent">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Wyloguj się</span>
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 max-w-2xl">
            {activeTab === 'preferences' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-3xl font-semibold mb-2 tracking-tight">Preferencje</h2>
                  <p className="text-[#8A94A6] text-lg">Zarządzaj ustawieniami języka, wyglądu i regionu.</p>
                </div>

                {/* Language Section */}
                <section className="bg-[#151B26] rounded-[2rem] border border-[#232C3B] overflow-hidden">
                  <div className="p-8 border-b border-[#232C3B]">
                    <h3 className="text-xl font-medium mb-2">Język aplikacji</h3>
                    <p className="text-[#8A94A6]">Wybierz język, w którym chcesz korzystać z interfejsu.</p>
                  </div>
                  <div className="p-3">
                    {[
                      { id: 'pl', name: 'Polski', native: 'Polski' },
                      { id: 'en', name: 'Angielski', native: 'English' },
                      { id: 'de', name: 'Niemiecki', native: 'Deutsch' },
                    ].map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setLanguage(lang.id)}
                        className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-200 ${
                          language === lang.id ? 'bg-[#232C3B]/50' : 'hover:bg-[#232C3B]/30'
                        }`}
                      >
                        <div className="flex flex-col items-start gap-0.5">
                          <span className={`font-medium ${language === lang.id ? 'text-white' : 'text-[#8A94A6]'}`}>
                            {lang.name}
                          </span>
                          <span className="text-sm text-[#8A94A6]">{lang.native}</span>
                        </div>
                        {language === lang.id && (
                          <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-blue-500" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Theme Section */}
                <section className="bg-[#151B26] rounded-[2rem] border border-[#232C3B] overflow-hidden">
                  <div className="p-8 border-b border-[#232C3B]">
                    <h3 className="text-xl font-medium mb-2">Motyw</h3>
                    <p className="text-[#8A94A6]">Dostosuj wygląd aplikacji do swoich preferencji.</p>
                  </div>
                  <div className="p-8">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Theme options */}
                      <button 
                        onClick={() => setTheme('system')}
                        className="flex flex-col items-center gap-4 group"
                      >
                        <div className={`w-full aspect-[4/3] rounded-2xl border-2 flex items-center justify-center transition-all duration-200 ${
                          theme === 'system' ? 'border-blue-500 bg-[#232C3B]/30' : 'border-[#232C3B] bg-[#0B121A] group-hover:border-[#334155]'
                        }`}>
                          <Monitor className={`w-8 h-8 ${theme === 'system' ? 'text-blue-500' : 'text-[#64748B]'}`} />
                        </div>
                        <span className={`text-sm font-medium ${theme === 'system' ? 'text-white' : 'text-[#8A94A6]'}`}>Systemowy</span>
                      </button>
                      
                      <button 
                        onClick={() => setTheme('light')}
                        className="flex flex-col items-center gap-4 group"
                      >
                        <div className={`w-full aspect-[4/3] rounded-2xl border-2 flex items-center justify-center transition-all duration-200 ${
                          theme === 'light' ? 'border-blue-500 bg-[#F8FAFC]' : 'border-[#232C3B] bg-white group-hover:border-[#334155]'
                        }`}>
                          <Sun className={`w-8 h-8 ${theme === 'light' ? 'text-blue-500' : 'text-[#8A94A6]'}`} />
                        </div>
                        <span className={`text-sm font-medium ${theme === 'light' ? 'text-white' : 'text-[#8A94A6]'}`}>Jasny</span>
                      </button>
                      
                      <button 
                        onClick={() => setTheme('dark')}
                        className="flex flex-col items-center gap-4 group"
                      >
                        <div className={`w-full aspect-[4/3] rounded-2xl border-2 flex items-center justify-center transition-all duration-200 ${
                          theme === 'dark' ? 'border-blue-500 bg-[#0B121A]' : 'border-[#232C3B] bg-[#0B121A] group-hover:border-[#334155]'
                        }`}>
                          <Moon className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-500' : 'text-[#64748B]'}`} />
                        </div>
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-[#8A94A6]'}`}>Ciemny</span>
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-3xl font-semibold mb-2 tracking-tight">Historia analiz</h2>
                  <p className="text-[#8A94A6] text-lg">Przeglądaj swoje poprzednie diagnozy i wygenerowane raporty.</p>
                </div>

                <div className="space-y-4">
                  {/* Item 1 */}
                  <div className="bg-[#151B26] rounded-[1.5rem] border border-[#232C3B] p-5 flex items-center gap-5 hover:border-[#334155] transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <FileAudio className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-medium truncate">Silnik spalinowy (Diesel)</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">Wykryto anomalię</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#8A94A6]">
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Dziś, 14:30</span>
                        <span className="flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> Podejrzenie: Wtryskiwacze</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#232C3B] flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors text-[#8A94A6]">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                  
                  {/* Item 2 */}
                  <div className="bg-[#151B26] rounded-[1.5rem] border border-[#232C3B] p-5 flex items-center gap-5 hover:border-[#334155] transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                      <Video className="w-6 h-6 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-medium truncate">Pompa wody (V8)</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">W normie</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#8A94A6]">
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Wczoraj, 09:15</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Praca równomierna</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#232C3B] flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors text-[#8A94A6]">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="bg-[#151B26] rounded-[1.5rem] border border-[#232C3B] p-5 flex items-center gap-5 hover:border-[#334155] transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <FileAudio className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-medium truncate">Silnik motocyklowy (R4)</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium border border-yellow-500/20">Wymaga uwagi</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#8A94A6]">
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 25 Mar, 16:45</span>
                        <span className="flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> Luzy zaworowe</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#232C3B] flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors text-[#8A94A6]">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
               <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div>
                  <h2 className="text-3xl font-semibold mb-2 tracking-tight">Profil</h2>
                  <p className="text-[#8A94A6] text-lg">Zarządzaj swoimi danymi osobowymi.</p>
                </div>
                
                <section className="bg-[#151B26] rounded-[2rem] border border-[#232C3B] p-8 space-y-8">
                  <div className="flex items-center gap-8">
                    <div className="w-24 h-24 rounded-full bg-[#232C3B] border-2 border-[#334155] flex items-center justify-center text-3xl font-semibold text-[#8A94A6]">
                      JD
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-white">Zdjęcie profilowe</h3>
                      <p className="text-sm text-[#8A94A6] mb-4">Zalecany rozmiar to 256x256px. Maksymalnie 2MB.</p>
                      <button className="px-5 py-2.5 bg-[#232C3B] hover:bg-[#334155] text-white rounded-xl font-medium transition-colors text-sm border border-[#334155]">
                        Zmień zdjęcie
                      </button>
                    </div>
                  </div>
                  
                  <div className="h-px bg-[#232C3B] w-full" />

                  <div className="space-y-6">
                    <div className="space-y-2.5">
                      <label className="text-sm font-medium text-[#E2E8F0]">Imię i nazwisko</label>
                      <input 
                        type="text" 
                        defaultValue="Jan Kowalski" 
                        className="w-full bg-[#0B121A] border border-[#232C3B] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-sm font-medium text-[#E2E8F0]">Adres email</label>
                      <input 
                        type="email" 
                        defaultValue="jan.kowalski@example.com" 
                        className="w-full bg-[#0B121A] border border-[#232C3B] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button className="px-8 py-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20">
                      Zapisz zmiany
                    </button>
                  </div>
                </section>
               </div>
            )}

            {/* Other tabs placeholders */}
            {(activeTab === 'notifications' || activeTab === 'security') && (
              <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-20 h-20 rounded-full bg-[#151B26] border border-[#232C3B] flex items-center justify-center mb-6">
                  {activeTab === 'notifications' ? (
                    <Bell className="w-10 h-10 text-[#64748B]" />
                  ) : (
                    <Shield className="w-10 h-10 text-[#64748B]" />
                  )}
                </div>
                <h3 className="text-2xl font-medium text-white mb-3">Wkrótce dostępne</h3>
                <p className="text-[#8A94A6] max-w-sm text-lg">
                  Ta sekcja ustawień jest w trakcie przygotowywania i będzie dostępna wkrótce.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
