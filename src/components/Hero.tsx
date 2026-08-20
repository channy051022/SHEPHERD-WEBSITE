import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Sparkles, 
  ShieldCheck, 
  WifiOff, 
  Languages, 
  ChevronRight,
  Flame,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { playSound } from '../lib/sounds';
import { getActiveRelease, subscribeReleaseChanges, type ApkRelease } from '../lib/releases';

interface HeroProps {
  onOpenDownload: () => void;
  onOpenInstallGuide: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenDownload, onOpenInstallGuide }) => {
  const [activeRelease, setActiveReleaseState] = useState<ApkRelease | null>(null);
  const [shepQuoteIndex, setShepQuoteIndex] = useState(0);

  const shepQuotes = [
    '“The LORD is my shepherd; I shall not want.” — Psalm 23:1',
    '“Hello! 👋 Tap download to study Scripture offline anytime!”',
    '“Your word is a lamp to my feet and a light to my path.” — Psalm 119:105',
    '“Have a blessed day! I am here to companion your Bible journaling!”'
  ];

  useEffect(() => {
    getActiveRelease().then(setActiveReleaseState);
    const unsubscribe = subscribeReleaseChanges((rel) => {
      if (rel) setActiveReleaseState(rel);
    });
    return unsubscribe;
  }, []);

  const handleShepClick = () => {
    playSound('tap');
    setShepQuoteIndex((prev) => (prev + 1) % shepQuotes.length);
  };

  const versionText = activeRelease?.version || 'Direct APK';
  const fileSizeText = activeRelease?.fileSizeFormatted ? `(~${activeRelease.fileSizeFormatted})` : '';
  const isBeta = Boolean(activeRelease?.isBeta);

  return (
    <section className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 overflow-hidden bg-gradient-to-b from-[#FDFBF7] via-[#F7EFE7]/40 to-[#FDFBF7]">
      {/* Decorative ambient background lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[500px] bg-gradient-to-tr from-[#E5C158]/20 via-[#1E3A8A]/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headlines, Highlights, and CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-7 text-left space-y-6"
          >
            {/* Top Badge: Bilingual Offline or Beta */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 text-[#1E3A8A] text-xs font-bold uppercase tracking-wider shadow-xs">
              {isBeta ? (
                <>
                  <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span className="text-amber-700">Beta Testing Release • Preview Build</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#E5C158]" />
                  <span>100% Offline Standalone Android App</span>
                </>
              )}
            </div>

            {/* Main Punchy Value Proposition */}
            <h1 className="font-serif-bible font-bold text-4xl sm:text-5xl lg:text-6xl text-[#1A1817] leading-[1.12] tracking-tight">
              Study, Journal & Memorize Scripture{' '}
              <span className="text-gold-gradient block sm:inline">
                Anywhere, Anytime.
              </span>
            </h1>

            {/* Sub-headline description */}
            <p className="text-base sm:text-lg text-[#6B6560] leading-relaxed max-w-xl font-normal">
              A private, lightning-fast Bible study companion designed for focused devotion. Features instant
              <strong className="text-[#1A1817] font-semibold"> verse reference detection</strong>, parallel 
              <strong className="text-[#1E3A8A] font-semibold"> English KJV & Cebuano Pinadayag</strong> translations, 
              home screen widgets, and your faithful mascot <strong className="text-[#966E0C] font-semibold">Shep the Lamb</strong>.
            </p>

            {/* Beta Warning Notice if release is marked as beta */}
            {isBeta && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5 max-w-xl">
                <Flame className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Beta Testing Phase:</strong> This build is in active beta. Features and indexes are being tuned. Thank you for testing!
                </span>
              </div>
            )}

            {/* Direct Actions & Download Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-6 sm:mb-8">
              {/* Primary APK Download CTA */}
              <button
                onClick={() => {
                  playSound('tap');
                  onOpenDownload();
                }}
                className="w-full sm:w-auto px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl bg-[#1E3A8A] hover:bg-[#152a65] text-white font-display font-bold text-sm sm:text-base shadow-xl shadow-[#1E3A8A]/30 hover:shadow-2xl hover:shadow-[#1E3A8A]/40 transition-all duration-200 transform active:scale-98 flex items-center justify-center gap-3 group relative overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[400%] transition-transform duration-1000" />
                <Download className="w-5 h-5 text-[#E5C158] transition-transform group-hover:translate-y-0.5 shrink-0" />
                <div className="flex flex-col items-start text-left">
                  <div className="flex items-center gap-2">
                    <span>Download BibleNote APK</span>
                    <span className="px-1.5 py-0.2 text-[10px] uppercase font-bold bg-[#E5C158] text-[#1A1817] rounded">
                      {isBeta ? `${versionText} [BETA]` : versionText}
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-normal text-white/80">
                    Direct Standalone Package {fileSizeText || '(Official Android Build)'}
                  </span>
                </div>
              </button>

              {/* Secondary Sideloading Instructions */}
              <button
                onClick={() => {
                  playSound('tap');
                  onOpenInstallGuide();
                }}
                className="w-full sm:w-auto px-5 py-3.5 sm:py-4 rounded-2xl bg-[#F5EBE1] hover:bg-[#E8D8C8] text-[#1E3A8A] font-display font-bold text-xs sm:text-sm border border-[#E8D8C8] hover:border-[#1E3A8A]/30 transition-all duration-200 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                <span>How to Install Guide</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>

            {/* Value Badges & Offline Guarantee */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 w-full text-left">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 border border-[#E8D8C8]/80 shadow-xs">
                <WifiOff className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#1A1817]">100% Offline</span>
                  <span className="text-[10px] text-[#6B6560]">Zero data needed</span>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 border border-[#E8D8C8]/80 shadow-xs">
                <Languages className="w-4 h-4 text-[#E5C158] shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#1A1817]">KJV + Cebuano</span>
                  <span className="text-[10px] text-[#6B6560]">66 Books Complete</span>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 border border-[#E8D8C8]/80 shadow-xs">
                <Sparkles className="w-4 h-4 text-[#966E0C] shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#1A1817]">Auto Verse Links</span>
                  <span className="text-[10px] text-[#6B6560]">Instant note popup</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Bigger Waving Mascot (Shep the Lamb GIF) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="lg:col-span-5 relative flex flex-col justify-center items-center pt-6 sm:pt-2"
          >
            {/* Ambient Warm Golden & Blue Glow behind Shep */}
            <div className="absolute w-72 sm:w-96 lg:w-[460px] h-72 sm:h-96 lg:h-[460px] bg-gradient-to-b from-[#E5C158]/35 via-[#1E3A8A]/20 to-transparent blur-3xl rounded-full pointer-events-none" />

            {/* Interactive Mascot Speech Bubble */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative z-20 bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border-2 border-[#E5C158] text-left max-w-xs sm:max-w-sm mb-4 cursor-pointer hover:border-[#1E3A8A] transition-all group"
              onClick={handleShepClick}
              title="Click Shep to hear more!"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-extrabold text-[#1E3A8A] flex items-center gap-1.5">
                  <span>🐑 Shep says:</span>
                </span>
                <span className="text-[10px] text-[#966E0C] font-bold bg-[#E5C158]/20 px-2 py-0.5 rounded-full group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors">
                  Tap Shep 👋
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#1A1817] font-medium leading-snug">
                {shepQuotes[shepQuoteIndex]}
              </p>
              {/* Speech Bubble Downward Arrow */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-[#E5C158] rotate-45" />
            </motion.div>

            {/* Large Waving GIF Mascot Avatar */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              className="relative z-10 flex items-center justify-center cursor-pointer group"
              onClick={handleShepClick}
            >
              {/* Rich Deep Blue Circular Backdrop with Gold Accents */}
              <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-tr from-[#1E3A8A] via-[#152a65] to-[#0F172A] p-4 sm:p-6 shadow-2xl border-4 border-[#E5C158] group-hover:scale-103 transition-all duration-300 flex items-center justify-center relative overflow-hidden">
                {/* Internal ambient radial glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,193,88,0.25)_0%,transparent_70%)] pointer-events-none" />

                <img 
                  src="/assets/mascot.gif" 
                  alt="Shep the Lamb waving hello" 
                  className="w-full h-full object-contain drop-shadow-2xl relative z-10"
                />

                {/* Floating Heart Reaction Badge */}
                <div className="absolute top-4 right-4 p-2.5 rounded-full bg-rose-500 text-white shadow-lg border-2 border-white animate-bounce z-20">
                  <Heart className="w-4 h-4 fill-white" />
                </div>
              </div>
            </motion.div>

            {/* Mascot Introduction Pill */}
            <div className="relative z-20 mt-4 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#E8D8C8] shadow-sm flex items-center gap-2 text-xs text-[#1A1817]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold">Shep the Lamb</span>
              <span className="text-[#6B6560]">• Your Faithful Bible Study Companion</span>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};
