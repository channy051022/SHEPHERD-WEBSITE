import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Languages, 
  RotateCcw, 
  Copy, 
  Check 
} from 'lucide-react';
import { PARALLEL_VERSES } from '../data/scriptureData';
import { playSound } from '../lib/sounds';

export const InteractivePlayground: React.FC = () => {
  const [editorText, setEditorText] = useState<string>(
    'Reflecting on God\'s unconditional agape love in John 3:16. Even when trials surround us, Romans 8:28 reminds us that all things work together for good. Whenever you feel weak, meditate on Philippians 4:13 and Psalm 23:1.'
  );
  const [selectedVerseKey, setSelectedVerseKey] = useState<string | null>('John 3:16');
  const [activeVersion, setActiveVersion] = useState<'KJV' | 'Cebuano'>('KJV');
  const [copied, setCopied] = useState(false);

  // Verse detection regex pattern matching BibleNote app's parser
  const detectedVerseRefs = useMemo(() => {
    const pattern = /\b(John|Psalms?|Philippians|Phil|Proverbs|Prov|Romans|Rom|Genesis|Gen|Revelation|Rev)\.?\s*(\d+)(?:[:.](\d+)(?:[-–](\d+))?)?\b/gi;
    const matches: { raw: string; citation: string; index: number }[] = [];
    let match;

    while ((match = pattern.exec(editorText)) !== null) {
      let citation = match[0];
      // Normalize abbreviation to standard key
      if (/^John\s*3:16/i.test(citation)) citation = 'John 3:16';
      else if (/^(Psalms?|Salmo)\s*23:1/i.test(citation)) citation = 'Psalm 23:1';
      else if (/^Phil(ippians)?\s*4:13/i.test(citation)) citation = 'Philippians 4:13';
      else if (/^Rom(ans)?\s*8:28/i.test(citation)) citation = 'Romans 8:28';
      else if (/^Prov(erbs)?\s*3:5/i.test(citation)) citation = 'Proverbs 3:5-6';

      matches.push({
        raw: match[0],
        citation,
        index: match.index
      });
    }

    return matches;
  }, [editorText]);

  // Active scripture data lookup
  const activeScripture = useMemo(() => {
    if (!selectedVerseKey) return PARALLEL_VERSES[0];
    return PARALLEL_VERSES.find(v => v.reference === selectedVerseKey) || PARALLEL_VERSES[0];
  }, [selectedVerseKey]);

  const handleCopy = () => {
    playSound('tap');
    const textToCopy = activeVersion === 'KJV' 
      ? `${activeScripture.reference} (KJV) - "${activeScripture.kjvText}"`
      : `${activeScripture.reference} (Cebuano) - "${activeScripture.cebuanoText}"`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePresetInsert = (presetText: string) => {
    playSound('tap');
    setEditorText(presetText);
  };

  return (
    <section id="playground" className="py-24 sm:py-32 bg-[#FDFBF7] border-b border-[#E8D8C8]/60 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-[#E5C158]/10 via-[#1E3A8A]/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5C158]/20 border border-[#E5C158]/40 text-[#966E0C] text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Note Demo</span>
          </div>

          <h2 className="font-serif-bible font-bold text-3xl sm:text-4xl lg:text-5xl text-[#1A1817] leading-tight mb-4">
            Test the <span className="text-gold-gradient">Auto-Verse Parser</span>
          </h2>

          <p className="text-base sm:text-lg text-[#6B6560] leading-relaxed">
            Type any scripture citation (like <span className="font-bold text-[#1A1817]">John 3:16</span>, <span className="font-bold text-[#1A1817]">Psalm 23:1</span>, or <span className="font-bold text-[#1A1817]">Philippians 4:13</span>) into the journal below. Watch BibleNote's on-device parser detect it in real-time.
          </p>
        </div>

        {/* Live Playground Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Smart Journal Editor */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#E8D8C8] shadow-xl flex flex-col justify-between">
            <div>
              {/* Editor Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#E8D8C8]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-[#1A1817] ml-2">
                    Personal Journal Note Editor
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#6B6560]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-emerald-700">Regex Engine Active</span>
                </div>
              </div>

              {/* Sample Preset Buttons */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#6B6560]">Quick Presets:</span>
                <button
                  onClick={() => handlePresetInsert('Meditation on Psalm 23:1: The Lord is my shepherd. He promises rest and restoration, perfectly fulfilled in John 3:16.')}
                  className="px-2.5 py-1 rounded-lg bg-[#F5EBE1] hover:bg-[#E8D8C8] text-[#1E3A8A] text-xs font-bold transition-all"
                >
                  Psalm 23 + John 3
                </button>
                <button
                  onClick={() => handlePresetInsert('Strength in weakness: Philippians 4:13 reminds us we can overcome anything, while Romans 8:28 anchors our hope.')}
                  className="px-2.5 py-1 rounded-lg bg-[#F5EBE1] hover:bg-[#E8D8C8] text-[#1E3A8A] text-xs font-bold transition-all"
                >
                  Phil 4:13 + Rom 8:28
                </button>
              </div>

              {/* Live Interactive Text Area */}
              <div className="relative mb-4">
                <textarea
                  value={editorText}
                  onChange={(e) => setEditorText(e.target.value)}
                  placeholder="Type notes and cite scriptures like John 3:16 or Psalm 23:1..."
                  rows={6}
                  className="w-full p-4 rounded-2xl bg-[#FDFBF7] border border-[#E8D8C8] focus:border-[#E5C158] focus:ring-2 focus:ring-[#E5C158]/30 text-sm text-[#1A1817] leading-relaxed resize-none transition-all outline-none font-sans-main"
                />
              </div>

              {/* Auto-Detected Verse Pills Grid */}
              <div className="p-4 rounded-2xl bg-[#F7EFE7] border border-[#E8D8C8] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E3A8A] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#E5C158]" />
                    <span>Auto-Detected Scripture References ({detectedVerseRefs.length}):</span>
                  </span>
                  <span className="text-[10px] text-[#6B6560]">Tap pill to open passage</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {detectedVerseRefs.length === 0 ? (
                    <span className="text-xs text-[#6B6560] italic">
                      No verse citations detected yet. Try typing "John 3:16" or "Psalm 23:1".
                    </span>
                  ) : (
                    detectedVerseRefs.map((item, idx) => {
                      const isSelected = selectedVerseKey === item.citation;
                      return (
                        <button
                          key={`${item.raw}-${idx}`}
                          onClick={() => {
                            playSound('tap');
                            setSelectedVerseKey(item.citation);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-display text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                            isSelected
                              ? 'bg-[#1E3A8A] text-white shadow-md scale-105 ring-2 ring-[#E5C158]'
                              : 'bg-white border border-[#E5C158]/60 text-[#966E0C] hover:bg-[#E5C158]/20'
                          }`}
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>{item.raw}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-4 mt-4 border-t border-[#E8D8C8] flex justify-between items-center text-xs text-[#6B6560]">
              <span>On-device SQLite parser • Zero network latency</span>
              <button
                onClick={() => {
                  playSound('tap');
                  setEditorText('Reflecting on John 3:16 and Romans 8:28.');
                  setSelectedVerseKey('John 3:16');
                }}
                className="inline-flex items-center gap-1 hover:text-[#1A1817] font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Text</span>
              </button>
            </div>
          </div>

          {/* Right Column: Scripture Passage Preview Card */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#1A1817] text-white shadow-2xl flex flex-col justify-between border-2 border-[#2D2926] relative">
            <div>
              {/* Header: Reference & Language Toggle */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#E5C158]/20 flex items-center justify-center text-[#E5C158]">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif-bible font-bold text-lg text-white">
                      {activeScripture.reference}
                    </h4>
                    <span className="text-[10px] text-[#E5C158] font-bold">
                      {activeScripture.theme}
                    </span>
                  </div>
                </div>

                {/* Translation Switcher */}
                <div className="flex bg-white/10 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => {
                      playSound('tap');
                      setActiveVersion('KJV');
                    }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      activeVersion === 'KJV'
                        ? 'bg-[#1E3A8A] text-white shadow-xs'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    KJV
                  </button>
                  <button
                    onClick={() => {
                      playSound('tap');
                      setActiveVersion('Cebuano');
                    }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      activeVersion === 'Cebuano'
                        ? 'bg-[#1E3A8A] text-white shadow-xs'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Cebuano
                  </button>
                </div>
              </div>

              {/* Passage Body */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 mb-6">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#E5C158]">
                  <span>
                    {activeVersion === 'KJV' ? 'English King James Version' : 'Cebuano Bugna / Pinadayag'}
                  </span>
                  <span>Verse {activeScripture.verseNumber}</span>
                </div>

                <p className="font-serif-bible text-base sm:text-lg leading-relaxed text-white/95 italic">
                  "{activeVersion === 'KJV' ? activeScripture.kjvText : activeScripture.cebuanoText}"
                </p>
              </div>

              {/* Parallel Comparison Card */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70 space-y-1">
                <div className="flex items-center gap-1.5 text-[#E5C158] font-bold text-[11px]">
                  <Languages className="w-3 h-3" />
                  <span>Parallel Translation:</span>
                </div>
                <p className="font-serif-bible italic text-white/80 line-clamp-2">
                  "{activeVersion === 'KJV' ? activeScripture.cebuanoText : activeScripture.kjvText}"
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Passage'}</span>
              </button>

              <a
                href="#download"
                onClick={() => playSound('tap')}
                className="py-2.5 px-4 rounded-xl bg-[#1E3A8A] hover:bg-[#152a65] text-xs font-bold text-white shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Try in App</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
