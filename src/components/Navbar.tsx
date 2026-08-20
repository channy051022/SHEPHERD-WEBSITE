import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Menu, 
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { playSound } from '../lib/sounds';

interface NavbarProps {
  onOpenDownload: () => void;
  onOpenInstallGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDownload, onOpenInstallGuide }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'App Mockups', href: '#gallery' },
    { name: 'Verse Parser', href: '#playground' },
    { name: 'Shep & Games', href: '#shep' },
    { name: 'Multi-Translations', href: '#languages' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-4">
      <div 
        className={`max-w-7xl mx-auto rounded-2xl sm:rounded-3xl transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/90 backdrop-blur-md shadow-lg shadow-[#1A1817]/5 border border-[#E8D8C8] px-3 sm:px-6 py-2 sm:py-3' 
            : 'bg-white/70 backdrop-blur-xs border border-[#E8D8C8]/60 px-3 sm:px-6 py-2.5 sm:py-3'
        }`}
      >
        <div className="flex items-center justify-between">
          
          {/* Brand Logo & Title */}
          <a 
            href="#" 
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none"
            onClick={() => playSound('tap')}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-[#E5C158] shadow-md group-hover:scale-105 transition-transform bg-white shrink-0">
              <img 
                src="/assets/icon.png" 
                alt="BibleNote App Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-serif-bible font-bold text-base sm:text-xl text-[#1A1817] tracking-tight">
                  BibleNote
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-[#E5C158]/30 text-[#966E0C]">
                  SHEPHERD
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-[#6B6560] font-medium hidden sm:inline-block">
                100% Offline Scripture Companion
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => playSound('tap')}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#6B6560] hover:text-[#1A1817] hover:bg-[#F5EBE1] rounded-xl transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={() => {
                playSound('tap');
                onOpenInstallGuide();
              }}
              className="px-3.5 py-2 text-xs font-semibold text-[#1E3A8A] hover:bg-[#F5EBE1] rounded-xl transition-colors duration-200"
            >
              Install Guide
            </button>

            <button
              onClick={() => {
                playSound('tap');
                onOpenDownload();
              }}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-[#1E3A8A] hover:bg-[#152a65] text-white text-xs font-bold shadow-md shadow-[#1E3A8A]/20 transition-all duration-200 flex items-center gap-2 transform active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-[#E5C158]" />
              <span>Get App (.apk)</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex sm:hidden items-center gap-1.5">
            <button
              onClick={() => {
                playSound('tap');
                onOpenDownload();
              }}
              className="p-2 rounded-xl bg-[#1E3A8A] text-white text-xs font-bold flex items-center justify-center active:scale-95"
              aria-label="Download APK"
            >
              <Download className="w-4 h-4 text-[#E5C158]" />
            </button>

            <button
              onClick={() => {
                playSound('tap');
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              className="p-2 rounded-xl text-[#1A1817] hover:bg-[#F5EBE1] transition-colors focus:outline-none active:scale-95"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden mt-2 max-w-7xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl border border-[#E8D8C8] shadow-2xl p-3.5 space-y-2 text-left"
          >
            <div className="space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => {
                    playSound('tap');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block px-3.5 py-2 text-sm font-semibold text-[#1A1817] hover:bg-[#F5EBE1] rounded-xl transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="pt-2 border-t border-[#E8D8C8] space-y-2">
              <button
                onClick={() => {
                  playSound('tap');
                  setIsMobileMenuOpen(false);
                  onOpenInstallGuide();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#F5EBE1] text-[#1E3A8A] text-xs font-bold text-center"
              >
                Sideloading Instructions
              </button>

              <button
                onClick={() => {
                  playSound('tap');
                  setIsMobileMenuOpen(false);
                  onOpenDownload();
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#1E3A8A] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <Download className="w-4 h-4 text-[#E5C158]" />
                <span>Download BibleNote APK</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
