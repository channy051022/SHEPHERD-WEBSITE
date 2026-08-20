import React, { useState } from 'react';
import { 
  Eye, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Smartphone, 
  CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_SCREENS } from './AppDeviceMockup';
import type { AppScreenId } from './AppDeviceMockup';
import { playSound } from '../lib/sounds';

export const AppScreensGallery: React.FC = () => {
  const [selectedScreenId, setSelectedScreenId] = useState<AppScreenId>('widgets');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const activeIndex = APP_SCREENS.findIndex(s => s.id === selectedScreenId);
  const activeScreen = APP_SCREENS[activeIndex] || APP_SCREENS[0];

  const handleNext = () => {
    playSound('tap');
    const nextIdx = (activeIndex + 1) % APP_SCREENS.length;
    setSelectedScreenId(APP_SCREENS[nextIdx].id);
  };

  const handlePrev = () => {
    playSound('tap');
    const prevIdx = (activeIndex - 1 + APP_SCREENS.length) % APP_SCREENS.length;
    setSelectedScreenId(APP_SCREENS[prevIdx].id);
  };

  return (
    <section id="gallery" className="py-20 sm:py-32 bg-[#F7EFE7]/50 border-b border-[#E8D8C8]/60 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[800px] h-[350px] sm:h-[450px] bg-[#E5C158]/10 blur-[90px] sm:blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 text-[#1E3A8A] text-xs font-bold uppercase tracking-wider mb-4">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Official Android App UI Mockups</span>
          </div>

          <h2 className="font-serif-bible font-bold text-3xl sm:text-4xl lg:text-5xl text-[#1A1817] leading-tight mb-3 sm:mb-4">
            Explore the <span className="text-gold-gradient">BibleNote Experience</span>
          </h2>

          <p className="text-sm sm:text-lg text-[#6B6560] leading-relaxed">
            Directly from the production app. Designed with sleek dark aesthetics, live phone home screen previews, intuitive navigation, and frictionless Scripture access.
          </p>

          {/* Screen Switcher Chips with Mobile Horizontal Scroll */}
          <div className="flex items-center justify-start sm:justify-center gap-2 mt-6 sm:mt-8 overflow-x-auto pb-2 sm:pb-0 scrollbar-none px-1">
            {APP_SCREENS.map((screen) => {
              const isSelected = selectedScreenId === screen.id;
              const Icon = screen.icon;
              return (
                <button
                  key={screen.id}
                  onClick={() => {
                    playSound('tap');
                    setSelectedScreenId(screen.id);
                  }}
                  className={`px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-[#1E3A8A] text-white shadow-lg shadow-[#1E3A8A]/25 scale-102 ring-2 ring-[#E5C158]'
                      : 'bg-white border border-[#E8D8C8] text-[#6B6560] hover:text-[#1A1817] hover:bg-[#F5EBE1]'
                  }`}
                >
                  <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  <span>{screen.tabLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
          
          {/* Left Column: Screen Details & Highlights */}
          <div className="lg:col-span-6 space-y-6 text-left order-2 lg:order-1">
            <div className="p-5 sm:p-8 rounded-3xl sm:rounded-[36px] bg-white border-2 border-[#E8D8C8] shadow-xl space-y-5 sm:space-y-6">
              
              {/* Badge & Step */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E5C158]/20 text-[#966E0C] border border-[#E5C158]/40">
                  {activeScreen.badge} Screen
                </span>
                <span className="text-xs font-bold text-[#6B6560]">
                  0{activeIndex + 1} / 0{APP_SCREENS.length}
                </span>
              </div>

              {/* Title & Tagline */}
              <div>
                <h3 className="font-serif-bible font-bold text-2xl sm:text-3xl text-[#1A1817] mb-2 leading-snug">
                  {activeScreen.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#6B6560] leading-relaxed">
                  {activeScreen.tagline}
                </p>
              </div>

              {/* Detailed Breakdown for Active Screen */}
              <div className="space-y-3 pt-2 border-t border-[#E8D8C8]/80 text-xs sm:text-sm text-[#1A1817]">
                {activeScreen.id === 'widgets' && (
                  <>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Live Phone Home Screen preview with real dock icons and Galatians 5:22 Scripture card.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Custom Widget Sizes: Small (2×2), Medium (4×2), and Large (4×4).</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>5 Widget Themes: Frosted Glass, Pure Glass, Sunrise Gold, Midnight Blue, Emerald Olive.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>1-Tap "Sync to Native Phone Widget" and "Export as Lock Screen Wallpaper".</span>
                    </div>
                  </>
                )}

                {activeScreen.id === 'notes' && (
                  <>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Live regex engine scans text as you type for Scripture citations like John 3:16 or Psalm 23:1-6.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Rich-text styling toolbar for headers, bullet lists, quotes, and custom tags.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>100% private local storage—notes never leave your phone.</span>
                    </div>
                  </>
                )}

                {activeScreen.id === 'picker' && (
                  <>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Split-pane Old Testament (39 books) and New Testament (27 books) selector.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Instant chapter number matrix (1 to 50) for rapid, friction-free jumping.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Sub-18ms chapter loading time powered by on-device SQLite.</span>
                    </div>
                  </>
                )}

                {activeScreen.id === 'home' && (
                  <>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Daily Greeting & Encouragement with animated Shep the Lamb companion.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Curated Verse of the Day with instant 1-tap KJV / Cebuano toggle and chapter jump.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Quick-start Reading Plans and Continue Reading recent passage card.</span>
                    </div>
                  </>
                )}

                {activeScreen.id === 'arcade' && (
                  <>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Verse Scramble, Canonical Book Sorter, Scripture & Character Trivia.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Earn +10 to +40 Wool Stars per victory to level up and unlock badges.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Multi-difficulty tiers (Easy / Med / Hard) with live score tracking.</span>
                    </div>
                  </>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E8D8C8]/80">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    className="p-2.5 rounded-xl bg-[#F5EBE1] hover:bg-[#E8D8C8] text-[#1E3A8A] transition-colors"
                    aria-label="Previous screen"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-2.5 rounded-xl bg-[#F5EBE1] hover:bg-[#E8D8C8] text-[#1E3A8A] transition-colors"
                    aria-label="Next screen"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    playSound('tap');
                    setFullscreenImage(activeScreen.src);
                  }}
                  className="px-3.5 sm:px-4 py-2 rounded-xl bg-white border border-[#E8D8C8] hover:border-[#1E3A8A] text-xs font-bold text-[#1E3A8A] flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Zoom Fullscreen</span>
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: High-Res Phone Mockup Container */}
          <div className="lg:col-span-6 flex justify-center items-center order-1 lg:order-2">
            <div className="relative w-[280px] sm:w-[320px] h-[580px] sm:h-[640px] bg-[#121316] p-2.5 rounded-[46px] sm:rounded-[50px] shadow-2xl shadow-[#1A1817]/40 ring-1 ring-white/20 border-4 border-[#25282F]">
              
              {/* Dynamic Island / Notch */}
              <div className="absolute top-3.5 sm:top-4 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-4.5 sm:h-5 bg-[#121316] rounded-full z-40 flex items-center justify-between px-2">
                <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#090A0C] border border-white/10" />
                <div className="w-6 sm:w-8 h-1 bg-white/20 rounded-full" />
              </div>

              {/* Screen Display */}
              <div className="relative w-full h-full rounded-[38px] sm:rounded-[40px] overflow-hidden bg-[#090D16] border border-white/10">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeScreen.id}
                    src={activeScreen.src}
                    alt={activeScreen.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.25 }}
                    className="w-full h-full object-cover object-top cursor-pointer"
                    onClick={() => setFullscreenImage(activeScreen.src)}
                  />
                </AnimatePresence>
              </div>

              {/* Ambient Glow */}
              <div className="absolute -inset-3 bg-[#1E3A8A]/20 blur-2xl rounded-[56px] -z-10" />
            </div>
          </div>

        </div>

      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {fullscreenImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-xs sm:max-w-md w-full max-h-[90vh] flex flex-col items-center"
            >
              <button
                onClick={() => setFullscreenImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-[#E5C158] p-2 text-sm font-bold bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="rounded-[36px] sm:rounded-[40px] overflow-hidden border-4 border-[#E5C158] shadow-2xl bg-[#090D16]">
                <img
                  src={fullscreenImage}
                  alt="App Fullscreen Mockup"
                  className="w-full h-auto max-h-[85vh] object-contain"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
