import React, { useState } from 'react';
import { Sparkles, Download, Gamepad2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '../lib/sounds';

interface ShepFloatingGreeterProps {
  onOpenDownload: () => void;
}

export const ShepFloatingGreeter: React.FC<ShepFloatingGreeterProps> = ({ onOpenDownload }) => {
  const [isOpen, setIsOpen] = useState(false); // Start collapsed on mobile to keep view clean
  const [greetingIdx, setGreetingIdx] = useState(0);

  const greetings = [
    "Shalom & Hello! 👋 I'm Shep the Lamb! Welcome to BibleNote!",
    "God so loved the world! Tap John 3:16 on the phone to see how notes link!",
    "Did you know? BibleNote works 100% offline with English KJV and Cebuano Bugna!",
    "Try my Verse Scramble game down below to earn Wool Stars! ⭐",
  ];

  const handleShepClick = () => {
    playSound('tap');
    if (!isOpen) {
      setIsOpen(true);
    } else {
      setGreetingIdx((prev) => (prev + 1) % greetings.length);
    }
  };

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-40 flex flex-col items-end pointer-events-auto">
      {/* Speech Bubble */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="mb-2 max-w-[260px] sm:max-w-sm bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border-2 border-[#E5C158] shadow-2xl text-left relative z-40"
          >
            {/* Close / Dismiss */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2.5 right-2.5 text-[#6B6560] hover:text-[#1A1817] p-1 text-xs cursor-pointer"
              aria-label="Dismiss Shep message"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E3A8A] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#E5C158]" />
              <span>Shep says:</span>
            </div>

            <p className="font-serif-bible text-xs sm:text-sm text-[#1A1817] leading-snug mb-3">
              &quot;{greetings[greetingIdx]}&quot;
            </p>

            <div className="flex items-center gap-2 pt-1 border-t border-[#E8D8C8]">
              <button
                onClick={() => {
                  playSound('tap');
                  onOpenDownload();
                }}
                className="flex-1 py-1.5 px-2 rounded-xl bg-[#1E3A8A] hover:bg-[#152a65] text-white text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
              >
                <Download className="w-3 h-3 text-[#E5C158]" />
                <span>Get APK</span>
              </button>

              <a
                href="#games"
                onClick={() => {
                  playSound('tap');
                  setIsOpen(false);
                }}
                className="py-1.5 px-2 rounded-xl bg-[#F5EBE1] hover:bg-[#E8D8C8] text-[#1E3A8A] text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Gamepad2 className="w-3 h-3" />
                <span>Play Games</span>
              </a>
            </div>

            {/* Bubble arrow pointing to Shep */}
            <div className="absolute -bottom-1.5 right-6 sm:right-8 w-3.5 h-3.5 bg-white border-b-2 border-r-2 border-[#E5C158] rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Animated Mascot Button */}
      <motion.button
        onClick={handleShepClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="relative group focus:outline-none cursor-pointer"
        title="Tap Shep to say hello!"
      >
        {/* Deep Blue Circular Background Container */}
        <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full overflow-hidden border-2 sm:border-3 border-[#E5C158] shadow-2xl bg-[#1E3A8A] flex items-center justify-center p-1 relative z-10 transition-transform">
          <img
            src="/assets/mascot.gif"
            alt="Shep the Lamb waving hello"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Ambient Pulsing Glow */}
        <div className="absolute inset-0 bg-[#E5C158]/40 blur-lg rounded-full z-0 group-hover:bg-[#E5C158]/60 transition-colors animate-pulse" />

        {/* Mini Speech Badge - positioned high z-index on top so it never gets covered */}
        {!isOpen && (
          <div className="absolute -top-2.5 -left-2 px-2 py-0.5 rounded-full bg-[#1E3A8A] text-[#E5C158] text-[9px] sm:text-[10px] font-extrabold border-2 border-white shadow-xl z-30 whitespace-nowrap animate-bounce">
            Hello! 👋
          </div>
        )}
      </motion.button>
    </div>
  );
};
