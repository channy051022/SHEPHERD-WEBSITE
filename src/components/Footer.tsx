import React, { useState, useEffect } from 'react';
import { 
  Download, 
  MessageCircle
} from 'lucide-react';
import { playSound } from '../lib/sounds';
import { getActiveRelease, subscribeReleaseChanges, type ApkRelease } from '../lib/releases';

interface FooterProps {
  onOpenDownload: () => void;
  onOpenInstallGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDownload, onOpenInstallGuide }) => {
  const [activeRelease, setActiveReleaseState] = useState<ApkRelease | null>(null);

  useEffect(() => {
    getActiveRelease().then(setActiveReleaseState);
    const unsubscribe = subscribeReleaseChanges((rel) => {
      if (rel) setActiveReleaseState(rel);
    });
    return unsubscribe;
  }, []);

  const versionText = activeRelease?.version 
    ? (activeRelease.isBeta ? `${activeRelease.version} [BETA]` : activeRelease.version) 
    : 'Direct APK';

  return (
    <footer className="bg-[#1A1817] text-white/80 border-t border-white/10 pt-14 sm:pt-16 pb-12 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#E5C158] shadow-md bg-white">
                <img src="/assets/icon.png" alt="BibleNote Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-serif-bible font-bold text-xl text-white tracking-wide block">
                  BibleNote (SHEPHERD)
                </span>
                <span className="text-[11px] text-[#E5C158] font-bold">
                  100% Offline Scripture Companion
                </span>
              </div>
            </div>

            <p className="text-xs text-white/60 leading-relaxed max-w-sm">
              An offline rich-text Bible journal and devotion app featuring on-device SQLite FTS5 search, multi-translation Scripture support, automatic verse link detection, home screen widgets, and Shep the Lamb.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  playSound('tap');
                  onOpenDownload();
                }}
                className="px-4 py-2 rounded-xl bg-[#1E3A8A] hover:bg-[#152a65] text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#E5C158]" />
                <span>Get APK ({versionText})</span>
              </button>

              <button
                onClick={() => {
                  playSound('tap');
                  onOpenInstallGuide();
                }}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Install Guide
              </button>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li>
                <a href="#gallery" className="hover:text-[#E5C158] transition-colors">
                  App Mockups & UI
                </a>
              </li>
              <li>
                <a href="#playground" className="hover:text-[#E5C158] transition-colors">
                  Verse Parser Demo
                </a>
              </li>
              <li>
                <a href="#shep" className="hover:text-[#E5C158] transition-colors">
                  Shep the Lamb & Mini-Games
                </a>
              </li>
              <li>
                <a href="#languages" className="hover:text-[#E5C158] transition-colors">
                  Multi-Translations Available
                </a>
              </li>
              <li>
                <a href="#download" className="hover:text-[#E5C158] transition-colors">
                  Direct APK Download
                </a>
              </li>
            </ul>
          </div>

          {/* Core Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Core Features
            </h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li>Automatic Regex Verse Detection</li>
              <li>Multiple Offline Translations (KJV, Cebuano, ADB & More)</li>
              <li>Home Screen Verse Widgets</li>
              <li>Spiritual Alarms & Devotions</li>
              <li>4 Arcade Mini-Games</li>
              <li>8 Aesthetic Color Themes</li>
            </ul>
          </div>

          {/* Developer & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Developer Support
            </h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li>
                <a 
                  href="https://m.me/christian.mestola.7" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#E5C158] transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#E5C158]" />
                  <span>Messenger Support</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.facebook.com/christian.mestola.7" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#E5C158] transition-colors"
                >
                  Facebook: Christian Mestola
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/channy051022" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#E5C158] transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 fill-[#E5C158]" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>GitHub: channy051022</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.facebook.com/share/14trCWWT33L/?mibextid=wwXIfr" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#E5C158] transition-colors flex items-center gap-1.5 font-bold text-[#E5C158]"
                >
                  <span>🐑 Support Shepherd</span>
                </a>
              </li>
              <li>Build: Android Production APK {versionText}</li>
            </ul>
          </div>

        </div>

        {/* 🐑 Support Shepherd Dedicated Banner */}
        <div className="my-8 p-5 sm:p-6 rounded-3xl bg-white/[0.04] border border-[#E5C158]/30 hover:border-[#E5C158]/60 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#E5C158]/20 border border-[#E5C158]/40 flex items-center justify-center text-2xl shrink-0">
              🐑
            </div>
            <div className="text-left space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="font-serif-bible font-bold text-base sm:text-lg text-white">
                  Support Shepherd
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-[#00C77E]/20 text-[#00C77E] text-[10px] font-extrabold">
                  ☕ Donation
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/60 max-w-xl leading-relaxed">
                Help us continue developing Shepherd and making Bible study more accessible.
              </p>
            </div>
          </div>

          <a
            href="https://www.facebook.com/share/14trCWWT33L/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSound('tap')}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#E5C158] hover:bg-[#d4b045] text-[#0F172A] font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#E5C158]/10 transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <span>Support Us</span>
            <span>→</span>
          </a>
        </div>

        {/* Bottom Credits & Public Domain Notice */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
            <span>Built with faith and devotion by</span>
            <a 
              href="https://www.christianfaithmestola.dev/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-bold text-white hover:text-[#E5C158] underline underline-offset-2 transition-colors"
            >
              Christian Mestola
            </a>
            <span>•</span>
            <span>All Glory to God alone</span>
          </div>

          <div className="text-[11px] text-white/40">
            Scripture texts: Authorized King James Version (KJV) & Multiple Offline Translations (Public Domain).
          </div>
        </div>

      </div>
    </footer>
  );
};
