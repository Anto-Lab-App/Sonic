import Link from 'next/link';
import { Mic, ArrowRight } from 'lucide-react';

export function SeoCtaBanner() {
  return (
    <div className="my-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 p-1 shadow-2xl">
      <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
      <div className="relative z-10 p-6 md:p-8 flex flex-col items-center text-center bg-black/40 backdrop-blur-xl rounded-xl">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <Mic className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
          Nie zgaduj w ciemno.
        </h3>
        <p className="text-slate-300 mb-6 max-w-md">
          Nagraj dźwięk silnika i pozwól AI zdiagnozować Twój problem w 10 sekund.
        </p>
        <Link 
          href="/"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full font-semibold transition-all hover:scale-105 active:scale-95"
        >
          <span>Uruchom Darmowy Skaner</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
