import React, { useState } from 'react';
import { 
  Languages, 
  BookOpen, 
  Copy, 
  Check, 
  Bookmark,
  Search
} from 'lucide-react';
import { PARALLEL_VERSES } from '../data/scriptureData';
import { playSound } from '../lib/sounds';

export const DualLanguageSection: React.FC = () => {
  const [selectedVerseIndex, setSelectedVerseIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const activeVerse = PARALLEL_VERSES[selectedVerseIndex];

  const handleCopyParallel = () => {
    playSound('tap');
    const text = `${activeVerse.reference}\nKJV: "${activeVerse.kjvText}"\nCebuano Bugna: "${activeVerse.cebuanoText}"`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="languages" className="py-24 sm:py-32 bg-[#FDFBF7] border-b border-[#E8D8C8]/60 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-[#1E3A8A]/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 text-[#1E3A8A] text-xs font-bold uppercase tracking-wider mb-4">
            <Languages className="w-3.5 h-3.5" />
            <span>Dual Scripture Translations</span>
          </div>

          <h2 className="font-serif-bible font-bold text-3xl sm:text-4xl lg:text-5xl text-[#1A1817] leading-tight mb-4">
            English KJV & <span className="text-gold-gradient">Cebuano Pinadayag</span>
          </h2>

          <p className="text-base sm:text-lg text-[#6B6560] leading-relaxed">
            Study side-by-side with complete offline access to all 66 books in both the historic Authorized King James Version (1769) and the beloved Cebuano Bugna / Pinadayag translation.
          </p>

          {/* Verse Selector Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {PARALLEL_VERSES.map((verse, idx) => (
              <button
                key={verse.reference}
                onClick={() => {
                  playSound('tap');
                  setSelectedVerseIndex(idx);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedVerseIndex === idx
                    ? 'bg-[#1E3A8A] text-white shadow-md scale-105'
                    : 'bg-white border border-[#E8D8C8] text-[#6B6560] hover:text-[#1A1817]'
                }`}
              >
                {verse.reference}
              </button>
            ))}
          </div>
        </div>

        {/* Parallel Verse Card Comparison */}
        <div className="p-6 sm:p-10 rounded-[36px] bg-white border-2 border-[#E8D8C8] shadow-xl mb-12 relative">
          
          {/* Header Info */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E8D8C8]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E5C158]/20 flex items-center justify-center text-[#966E0C]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-bible font-bold text-xl text-[#1A1817]">
                  {activeVerse.reference}
                </h3>
                <span className="text-xs text-[#966E0C] font-semibold">
                  Theme: {activeVerse.theme}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyParallel}
                className="px-3.5 py-2 rounded-xl bg-[#F5EBE1] hover:bg-[#E8D8C8] text-xs font-bold text-[#1E3A8A] flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Both Translations!' : 'Copy Parallel Verses'}</span>
              </button>
            </div>
          </div>

          {/* 2-Column Parallel Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            
            {/* Column 1: King James Version (KJV) */}
            <div className="p-6 rounded-3xl bg-[#FDFBF7] border border-[#E8D8C8] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A]" />
                    <span className="font-bold text-xs uppercase tracking-wider text-[#1E3A8A]">
                      King James Version (KJV)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#1E3A8A]/10 text-[#1E3A8A]">
                    English • 1769
                  </span>
                </div>

                <p className="font-serif-bible text-base sm:text-lg leading-relaxed text-[#1A1817]">
                  <span className="font-bold text-[#1E3A8A] text-xs align-super mr-1">
                    {activeVerse.verseNumber}
                  </span>
                  {activeVerse.kjvText}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E8D8C8]/60 flex items-center justify-between text-xs text-[#6B6560]">
                <span>Complete 66 Canonical Books</span>
                <span className="font-semibold text-[#1E3A8A]">Offline SQLite</span>
              </div>
            </div>

            {/* Column 2: Cebuano Bugna / Pinadayag (CEB) */}
            <div className="p-6 rounded-3xl bg-[#F7EFE7] border border-[#E8D8C8] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5C158]" />
                    <span className="font-bold text-xs uppercase tracking-wider text-[#966E0C]">
                      Cebuano Bugna / Pinadayag (CEB)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E5C158]/30 text-[#966E0C]">
                    Binisaya • Pinadayag
                  </span>
                </div>

                <p className="font-serif-bible text-base sm:text-lg leading-relaxed text-[#1A1817]">
                  <span className="font-bold text-[#966E0C] text-xs align-super mr-1">
                    {activeVerse.verseNumber}
                  </span>
                  {activeVerse.cebuanoText}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E8D8C8]/60 flex items-center justify-between text-xs text-[#6B6560]">
                <span>Tibuok Bibliya: Genesis ngadto sa Pinadayag</span>
                <span className="font-semibold text-[#966E0C]">100% Offline</span>
              </div>
            </div>

          </div>
        </div>

        {/* 3 Translation Feature Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-3xl bg-white border border-[#E8D8C8] space-y-2 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-[#1E3A8A]/10 flex items-center justify-center text-[#1E3A8A] mb-3">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-[#1A1817]">Instant SQLite FTS5 Search</h4>
            <p className="text-xs text-[#6B6560] leading-relaxed">
              Find any passage, keyword, or character across all 31,102 verses in less than 18 milliseconds without internet.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E8D8C8] space-y-2 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-[#E5C158]/20 flex items-center justify-center text-[#966E0C] mb-3">
              <Languages className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-[#1A1817]">1-Tap Translation Switch</h4>
            <p className="text-xs text-[#6B6560] leading-relaxed">
              Toggle between English KJV and Cebuano Pinadayag with a single tap in the reader, notes, and Verse of the Day.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E8D8C8] space-y-2 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
              <Bookmark className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-[#1A1817]">Bookmark & Highlight</h4>
            <p className="text-xs text-[#6B6560] leading-relaxed">
              Bookmark favorite verses in both languages and easily attach them to personal devotion notes.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
