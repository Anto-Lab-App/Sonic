"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Language } from '@/lib/translations';
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
  Heart,
  History,
  ChevronRight
} from 'lucide-react';

import { HistoryTabContent } from './HistoryTabContent';
import { getUserProfile } from '@/app/actions/user';

const getTabs = (t: any) => [
  { id: 'profile', label: t.settings.tabs.profile, icon: User },
  { id: 'history', label: t.settings.tabs.history, icon: History },
  { id: 'notifications', label: t.settings.tabs.notifications, icon: Bell },
  { id: 'security', label: t.settings.tabs.security, icon: Shield },
];

interface SettingsModalProps {
  onClose: () => void;
  onOpenReport?: (record: any) => void;
}

export function SettingsModal({ onClose, onOpenReport }: SettingsModalProps) {
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [profile, setProfile] = useState<{ email: string, fullName: string, initials: string, credits: number } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const TABS = getTabs(t);

  useEffect(() => {
    setMounted(true);
    getUserProfile().then(data => {
      setProfile(data);
      setLoadingProfile(false);
    });
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[100] min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 overflow-y-auto">
      {/* Header */}
      <header className="border-b border-border-subtle bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2.5 hover:bg-surface rounded-full transition-colors text-muted hover:text-foreground border border-transparent hover:border-border-subtle">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-semibold tracking-tight">{t.settings.title}</h1>
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
                    onClick={() => {
                      setActiveTab(tab.id);
                    }}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 ${isActive
                      ? 'bg-surface text-foreground shadow-sm border border-border-subtle'
                      : 'text-muted hover:bg-surface/60 hover:text-foreground border border-transparent'
                      }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}

              <div className="h-px bg-surface-hover my-4 mx-4" />

              <button className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 text-red-400 hover:bg-red-500/10 border border-transparent">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">{t.settings.logout}</span>
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 max-w-2xl">
            {activeTab === 'history' && (
              <HistoryTabContent onOpenReport={onOpenReport} />
            )}

            {activeTab === 'profile' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-3xl font-semibold mb-2 tracking-tight">{t.settings.profile.title}</h2>
                  <p className="text-muted text-lg">{t.settings.profile.desc}</p>
                </div>

                <section className="bg-surface rounded-[2rem] border border-border-subtle p-8 space-y-8">
                  <div className="flex items-center gap-8">
                    <div className="w-24 h-24 rounded-full bg-surface-hover border-2 border-border-subtle flex items-center justify-center text-3xl font-semibold text-[#00D1FF] shadow-inner">
                      {loadingProfile ? '...' : profile?.initials || 'US'}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-foreground">Twój Profil</h3>
                      <p className="text-sm text-muted mb-4">Profil powiązany z kontem Google / Clerk.</p>
                    </div>
                  </div>

                  <div className="h-px bg-surface-hover w-full" />

                  <div className="space-y-6">
                    <div className="space-y-2.5">
                      <label className="text-sm font-medium text-foreground/70">{t.settings.profile.name}</label>
                      <input
                        type="text"
                        value={profile?.fullName || ''}
                        readOnly
                        className="w-full bg-background/50 border border-border-subtle rounded-xl px-4 py-3.5 text-foreground/70 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-sm font-medium text-foreground/70">{t.settings.profile.email}</label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        readOnly
                        className="w-full bg-background/50 border border-border-subtle rounded-xl px-4 py-3.5 text-foreground/70 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </section>

                {/* Language & Theme combined into Profile tab */}
                <section className="bg-surface rounded-[2rem] border border-border-subtle overflow-hidden">
                  <div className="p-8 border-b border-border-subtle">
                    <h3 className="text-xl font-medium mb-2">{t.settings.preferences.title}</h3>
                    <p className="text-muted">{t.settings.preferences.desc}</p>
                  </div>

                  <div className="p-8 border-b border-border-subtle">
                    <h4 className="text-sm font-medium mb-4 text-foreground/70">{t.settings.preferences.langTitle}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'pl', name: 'Polski', native: 'PL' },
                        { id: 'en', name: 'Angielski', native: 'EN' },
                        { id: 'de', name: 'Niemiecki', native: 'DE' },
                      ].map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => setLanguage(lang.id as Language)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${language === lang.id ? 'bg-primary/10 border border-primary/30' : 'bg-surface-hover/30 border border-transparent hover:bg-surface-hover/50'
                            }`}
                        >
                          <span className={`font-medium ${language === lang.id ? 'text-primary' : 'text-muted'}`}>
                            {lang.name}
                          </span>
                          {language === lang.id && (
                            <Check className="w-4 h-4 text-primary" strokeWidth={3} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-8">
                    <h4 className="text-sm font-medium mb-4 text-foreground/70">{t.settings.preferences.themeTitle}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <button
                        onClick={() => setTheme('system')}
                        className="flex flex-col items-center gap-3 group"
                      >
                        <div className={`w-full aspect-[4/3] rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${theme === 'system' ? 'border-primary bg-surface-hover/30' : 'border-border-subtle bg-background group-hover:border-foreground/20'
                          }`}>
                          <Monitor className={`w-6 h-6 ${theme === 'system' ? 'text-primary' : 'text-muted'}`} />
                        </div>
                        <span className={`text-xs font-medium ${theme === 'system' ? 'text-foreground' : 'text-muted'}`}>{t.settings.preferences.themes.system}</span>
                      </button>

                      <button
                        onClick={() => setTheme('light')}
                        className="flex flex-col items-center gap-3 group"
                      >
                        <div className={`w-full aspect-[4/3] rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${theme === 'light' ? 'border-primary bg-[#F8FAFC]' : 'border-border-subtle bg-[#F8FAFC] group-hover:border-foreground/20'
                          }`}>
                          <Sun className={`w-6 h-6 ${theme === 'light' ? 'text-primary' : 'text-[#8A94A6]'}`} />
                        </div>
                        <span className={`text-xs font-medium ${theme === 'light' ? 'text-foreground' : 'text-muted'}`}>{t.settings.preferences.themes.light}</span>
                      </button>

                      <button
                        onClick={() => setTheme('dark')}
                        className="flex flex-col items-center gap-3 group"
                      >
                        <div className={`w-full aspect-[4/3] rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${theme === 'dark' ? 'border-primary bg-[#0B121A]' : 'border-border-subtle bg-[#0B121A] group-hover:border-foreground/20'
                          }`}>
                          <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-primary' : 'text-[#64748B]'}`} />
                        </div>
                        <span className={`text-xs font-medium ${theme === 'dark' ? 'text-foreground' : 'text-muted'}`}>{t.settings.preferences.themes.dark}</span>
                      </button>

                      <button
                        onClick={() => setTheme('pink')}
                        className="flex flex-col items-center gap-3 group"
                      >
                        <div className={`w-full aspect-[4/3] rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${theme === 'pink' ? 'border-primary bg-[#FFF1F2]' : 'border-border-subtle bg-[#FFF1F2] group-hover:border-foreground/20'
                          }`}>
                          <Heart className={`w-6 h-6 ${theme === 'pink' ? 'text-[#E11D48]' : 'text-[#FB7185]'}`} />
                        </div>
                        <span className={`text-xs font-medium ${theme === 'pink' ? 'text-foreground' : 'text-muted'}`}>{t.settings.preferences.themes.pink}</span>
                      </button>
                    </div>
                  </div>
                </section>

                <section className={`bg-surface rounded-[2rem] border p-8 space-y-6 transition-colors duration-300 ${!loadingProfile && profile?.credits === 0 ? 'border-red-500/30 bg-red-500/5' : 'border-border-subtle'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2 text-white flex items-center gap-2">
                        Twoje Kredyty
                        {!loadingProfile && profile?.credits === 0 && (
                          <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded-full uppercase tracking-wider">
                            Brak środków
                          </span>
                        )}
                      </h3>
                      <p className="text-muted text-sm max-w-sm">Doładuj konto, aby wykonywać nielimitowane, zaawansowane analizy z wykorzystaniem AI.</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-4xl font-black text-[#00D1FF] drop-shadow-md">
                        {loadingProfile ? '-' : profile?.credits || 0}
                      </span>
                      <span className="text-xs text-foreground/50 uppercase tracking-widest font-semibold mt-1">Dostępne Skanowania</span>
                    </div>
                  </div>

                  <div className="h-px bg-foreground/10 w-full my-6" />

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('open-pricing-modal'));
                      }}
                      className="px-8 py-4 bg-gradient-to-r from-[#00D1FF] via-[#0055FF] to-[#00D1FF] bg-[length:200%_auto] animate-gradient text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,209,255,0.4)] flex items-center gap-2"
                    >
                      <span className="text-lg">⚡</span> Doładuj Kredyty PRO
                    </button>
                  </div>
                </section>
              </div>
            )}

            {(activeTab === 'notifications' || activeTab === 'security') && (
              <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-20 h-20 rounded-full bg-surface border border-border-subtle flex items-center justify-center mb-6">
                  {activeTab === 'notifications' ? (
                    <Bell className="w-10 h-10 text-muted" />
                  ) : (
                    <Shield className="w-10 h-10 text-muted" />
                  )}
                </div>
                <h3 className="text-2xl font-medium text-foreground mb-3">{t.settings.comingSoon.title}</h3>
                <p className="text-muted max-w-sm text-lg">
                  {t.settings.comingSoon.desc}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
