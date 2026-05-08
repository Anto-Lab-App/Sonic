"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '../translations';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: typeof translations.pl;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedLang = localStorage.getItem('sonic_language') as Language;
        
        if (savedLang && ['pl', 'en', 'de', 'es'].includes(savedLang)) {
            setLanguage(savedLang);
        } else {
            // Auto-detect browser language
            const browserLang = navigator.language.split('-')[0].toLowerCase();
            if (['pl', 'de', 'es'].includes(browserLang)) {
                setLanguage(browserLang as Language);
                localStorage.setItem('sonic_language', browserLang);
            } else {
                setLanguage('en');
                localStorage.setItem('sonic_language', 'en');
            }
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('sonic_language', lang);
    };

    // During SSR or first render, use English to match the server HTML
    // Once mounted, use the client-side language
    const t = mounted ? translations[language] : translations.en;

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
