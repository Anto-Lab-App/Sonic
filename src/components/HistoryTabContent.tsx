"use client";

import { useState, useEffect } from 'react';
import {
    FileAudio,
    Video,
    AlertCircle,
    Clock,
    ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getUserDiagnoses } from '@/app/actions/history';

export function HistoryTabContent({ onOpenReport }: { onOpenReport?: (record: any) => void }) {
    const { t } = useLanguage();
    const [diagnoses, setDiagnoses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUserDiagnoses().then(data => {
            console.log("[Sonic] Fetched history:", data);
            setDiagnoses(data);
            setLoading(false);
        });
    }, []);

    const getRiskDetails = (aiReport: any) => {
        if (!aiReport) return { label: 'Brak danych', colorClass: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };

        if (aiReport.confidence !== undefined) {
            return { label: 'Rozpoznano', colorClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
        }

        const confidence = aiReport.final_diagnosis?.confidence_score || 0;
        if (confidence > 80) return { label: 'Wysoka pewność', colorClass: 'bg-green-500/10 text-green-400 border-green-500/20' };
        if (confidence > 50) return { label: 'Wymaga uwagi', colorClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
        return { label: 'Wykryto anomalię', colorClass: 'bg-red-500/10 text-red-400 border-red-500/20' };
    };

    const getTitle = (item: any) => {
        if (item.aiReport?.final_diagnosis?.title) return item.aiReport.final_diagnosis.title;
        if (item.aiReport?.name) return item.aiReport.name;
        try {
            const parsed = JSON.parse(item.vehicleData);
            return parsed.make || 'Nieznany pojazd';
        } catch {
            return 'Diagnoza';
        }
    };

    const getIcon = (item: any) => {
        if (item.aiReport?.name) return <Video className="w-6 h-6 text-purple-500" />;
        return <FileAudio className="w-6 h-6 text-primary" />;
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-semibold mb-2 tracking-tight">{t.settings.history.title}</h2>
                <p className="text-muted text-lg">{t.settings.history.desc}</p>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-muted">Ładowanie historii...</div>
                ) : diagnoses.length === 0 ? (
                    <div className="text-center py-10 text-muted">Brak historii analiz. Wykonaj swój pierwszy skan!</div>
                ) : (
                    diagnoses.map((item) => {
                        const risk = getRiskDetails(item.aiReport);
                        return (
                            <div
                                key={item.id}
                                onClick={() => onOpenReport && onOpenReport(item)}
                                className="bg-surface rounded-[1.5rem] border border-border-subtle p-5 flex items-center gap-5 hover:bg-surface-hover transition-colors cursor-pointer group"
                            >
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    {getIcon(item)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-foreground font-medium truncate">{getTitle(item)}</h3>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${risk.colorClass}`}>
                                            {risk.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted">
                                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {item.symptoms && <span className="flex items-center gap-1.5 truncate"><AlertCircle className="w-4 h-4 shrink-0" /> {item.symptoms}</span>}
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center group-hover:bg-primary group-hover:text-foreground transition-colors text-muted">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
