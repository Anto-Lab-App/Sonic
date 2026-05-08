"use client";

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function Header() {
  const { isLoaded, isSignedIn } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] px-4 py-3 md:px-6 md:py-4 flex items-center justify-start pointer-events-none">
      <div className="flex items-center gap-4 pointer-events-auto">
        {isLoaded && !isSignedIn && (
          <SignInButton mode="modal">
            <button className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 hover:bg-white/10 transition-all active:scale-95 shadow-[0_4px_16px_rgba(0,0,0,0.3)] group">
              <Sparkles className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/90">{t.auth.login}</span>
            </button>
          </SignInButton>
        )}

        {isLoaded && isSignedIn && (
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-2xl border border-white/10 px-2.5 py-1 md:px-3 md:py-1.5 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-foreground/70 ml-1">{t.auth.account}</span>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8 border border-white/10",
                }
              }}
            />
          </div>
        )}
      </div>
    </header>
  );
}
