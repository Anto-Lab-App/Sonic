import { motion } from 'framer-motion';
import { X, Search, CheckCircle2, Car, Gauge, Wind, Hash } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface IdentificationReportProps {
  onClose: () => void;
  identifiedCar?: {
    name: string;
    engine: string;
    confidence: number;
    description: string;
    specs: { label: string; value: string; icon: any }[];
  };
}

export function IdentificationReport({
  onClose,
  identifiedCar = {
    name: "Ford Mustang GT (S550)",
    engine: "5.0L Coyote V8",
    confidence: 96,
    description: "Charakterystyczny, gardłowy ryk wolnossacego 5-litrowego silnika widlastego. Częstotliwości wskazują na brak doładowania wymuszonego.",
    specs: [
      { label: "Pojemność", value: "4951 cm³", icon: Gauge },
      { label: "Moc szacunkowa", value: "450-480 KM", icon: Wind },
      { label: "Układ", value: "V8 DOHC", icon: Hash },
      { label: "Rodzaj", value: "Wolnossący", icon: Car },
    ]
  }
}: IdentificationReportProps) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-[100] h-[100dvh] overflow-y-auto bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="max-w-5xl mx-auto md:p-6 lg:p-8 min-h-full flex flex-col pt-16 md:pt-0">

        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4 shrink-0 absolute top-0 left-0 right-0 md:static bg-background/80 backdrop-blur-md z-20 border-b border-white/5 md:border-none md:bg-transparent">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 shadow-[0_0_15px_rgba(0,180,255,0.2)]">
              <Search className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm md:text-xl font-semibold tracking-tight leading-tight">Identyfikacja zakończona</h1>
              <p className="text-[10px] md:text-xs text-muted font-medium">{t.shazam.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface-hover border border-border-subtle hover:bg-surface-elevated transition-colors cursor-pointer">
            <X className="w-5 h-5 text-muted hover:text-foreground transition-colors" />
          </button>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="flex-1 w-full bg-surface border-x md:border border-border-subtle md:rounded-[2rem] p-6 md:p-10 flex flex-col my-auto relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row gap-10 items-center justify-center flex-1 z-10">

            {/* Visual Representation (Left) */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center relative">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-background border-4 border-surface-hover shadow-2xl flex items-center justify-center relative z-10 overflow-hidden">
                {/* Simulated Car Image Placeholder */}
                <Car className="w-24 h-24 text-muted/50" strokeWidth={1} />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
              </div>

              {/* Confidence Badge */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
                className="absolute bottom-[-15px] z-20 px-6 py-2 rounded-full bg-surface border border-green-500/30 shadow-[0_4px_20px_rgba(34,197,94,0.2)] flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-bold text-green-400 text-lg">{identifiedCar.confidence}% Pewności</span>
              </motion.div>
            </div>

            {/* Information (Right) */}
            <div className="w-full md:w-1/2 flex flex-col gap-6 text-center md:text-left">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground mb-2 shadow-sm">{identifiedCar.name}</h2>
                <h3 className="text-2xl font-semibold text-primary">{identifiedCar.engine}</h3>
              </div>

              <div className="p-5 bg-background border border-border-subtle rounded-2xl shadow-inner">
                <p className="text-foreground/80 leading-relaxed text-sm">
                  {identifiedCar.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {identifiedCar.specs.map((spec, idx) => {
                  const Icon = spec.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + (idx * 0.1) }}
                      className="bg-background border border-border-subtle p-4 rounded-xl flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-muted" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-muted font-bold">{spec.label}</span>
                        <span className="text-sm font-semibold text-foreground/90">{spec.value}</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
}
