"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bluetooth, BluetoothConnected, BluetoothSearching, X, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { obdManager } from '@/lib/obd';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface OBDManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCodesFound: (codes: string[]) => void;
}

export function OBDManagerModal({ isOpen, onClose, onCodesFound }: OBDManagerModalProps) {
    const { t } = useLanguage();
    const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'reading' | 'error' | 'success' | 'unsupported'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [dtcs, setDtcs] = useState<string[]>([]);

    useEffect(() => {
        if (!navigator.bluetooth) {
            setStatus('unsupported');
            return;
        }
        // If already connected, update status
        if (isOpen && obdManager.isConnected) {
            setStatus('connected');
        }
    }, [isOpen]);

    const handleConnect = async () => {
        try {
            setStatus('connecting');
            setErrorMsg('');
            await obdManager.connect();
            setStatus('connected');
        } catch (err: any) {
            setStatus('error');
            setErrorMsg(err.message || 'Failed to connect to OBD device.');
        }
    };

    const handleDisconnect = () => {
        obdManager.disconnect();
        setStatus('idle');
        setDtcs([]);
    };

    const handleReadCodes = async () => {
        try {
            setStatus('reading');
            setErrorMsg('');
            const codes = await obdManager.getDTCs();
            setDtcs(codes);
            if (codes.length > 0) {
                onCodesFound(codes);
            }
            setStatus('success');
        } catch (err: any) {
            setStatus('error');
            setErrorMsg('Failed to read data from vehicle.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/90 backdrop-blur-xl"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 w-full max-w-md bg-surface/80 border border-foreground/[0.05] shadow-2xl rounded-3xl overflow-hidden backdrop-blur-3xl"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.05]">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${status === 'connected' || status === 'success' ? 'bg-[#00D1FF]/20 text-[#00D1FF]' : 'bg-foreground/5 text-foreground/60'}`}>
                            {status === 'connected' || status === 'success' || status === 'reading' ? (
                                <BluetoothConnected className="w-5 h-5" />
                            ) : status === 'connecting' ? (
                                <BluetoothSearching className="w-5 h-5 animate-pulse" />
                            ) : (
                                <Bluetooth className="w-5 h-5" />
                            )}
                        </div>
                        <h2 className="text-lg font-bold">{t.auto.obd.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-foreground/50 hover:text-foreground" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="text-center mb-8">
                        <div className="w-24 h-24 mx-auto mb-4 relative flex items-center justify-center">
                            <div className={`absolute inset-0 rounded-full border-2 border-dashed ${status === 'connecting' || status === 'reading' ? 'border-[#00D1FF]/50 animate-spin-slow' : 'border-foreground/10'}`} />
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${status === 'connected' || status === 'success' || status === 'reading' ? 'bg-[#00D1FF] text-white shadow-[#00D1FF]/30' :
                                status === 'error' || status === 'unsupported' ? 'bg-red-500 text-white shadow-red-500/30' :
                                    'bg-surface-elevated text-foreground/50 border border-foreground/10'
                                }`}>
                                {status === 'connected' ? <CheckCircle2 className="w-8 h-8" /> :
                                    status === 'success' ? <CheckCircle2 className="w-8 h-8" /> :
                                        status === 'reading' ? <RefreshCw className="w-8 h-8 animate-spin" /> :
                                            status === 'error' || status === 'unsupported' ? <AlertCircle className="w-8 h-8" /> :
                                                status === 'connecting' ? <BluetoothSearching className="w-8 h-8 animate-pulse" /> :
                                                    <Bluetooth className="w-8 h-8" />}
                            </div>
                        </div>

                        <h3 className="text-xl font-bold mb-2">
                            {status === 'idle' ? t.auto.obd.connectPrompt :
                                status === 'connecting' ? t.auto.obd.searching :
                                    status === 'connected' ? t.auto.obd.connected :
                                        status === 'reading' ? t.auto.obd.reading :
                                            status === 'success' ? t.auto.obd.success :
                                                status === 'unsupported' ? t.auto.obd.unsupportedTitle :
                                                    t.auto.obd.error}
                        </h3>

                        <p className="text-sm text-foreground/60 leading-relaxed max-w-[280px] mx-auto">
                            {status === 'idle' ? t.auto.obd.instructions :
                                status === 'connecting' ? t.auto.obd.instructionsSearch :
                                    status === 'connected' ? t.auto.obd.instructionsConnected :
                                        status === 'reading' ? t.auto.obd.instructionsReading :
                                            status === 'success' ? `${t.auto.obd.codesFound}${dtcs.length > 0 ? dtcs.join(', ') : t.auto.obd.noCodes}` :
                                                status === 'unsupported' ? t.auto.obd.unsupportedDesc :
                                                    errorMsg}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        {status === 'idle' || status === 'error' ? (
                            <button
                                onClick={handleConnect}
                                className="w-full bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_4px_20px_rgba(0,209,255,0.3)]"
                            >
                                <Bluetooth className="w-5 h-5" />
                                {t.auto.obd.btnConnect}
                            </button>
                        ) : status === 'unsupported' ? (
                            <button
                                onClick={onClose}
                                className="w-full bg-surface-elevated border border-foreground/10 hover:bg-white/5 text-foreground font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                {t.auto.obd.btnDone}
                            </button>
                        ) : status === 'connected' ? (
                            <>
                                <button
                                    onClick={handleReadCodes}
                                    className="w-full bg-[#00D1FF]/10 border border-[#00D1FF]/30 text-[#00D1FF] hover:bg-[#00D1FF]/20 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    {t.auto.obd.btnScan}
                                </button>
                                <button
                                    onClick={handleDisconnect}
                                    className="w-full text-foreground/50 hover:text-red-400 font-medium py-3 text-sm transition-colors"
                                >
                                    {t.auto.obd.btnDisconnect}
                                </button>
                            </>
                        ) : status === 'success' ? (
                            <button
                                onClick={onClose}
                                className="w-full bg-surface-elevated border border-foreground/10 hover:bg-white/5 text-foreground font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                {t.auto.obd.btnDone}
                            </button>
                        ) : null}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}