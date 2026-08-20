import React, { useState } from 'react';
import { 
  Sparkles, 
  Flame, 
  Star, 
  Award, 
  Gamepad2, 
  Heart, 
  CheckCircle2, 
  HelpCircle, 
  RotateCcw 
} from 'lucide-react';
import { VerseScrambleGame } from './MiniGames/VerseScrambleGame';
import { ChronoSortGame } from './MiniGames/ChronoSortGame';
import { TRIVIA_QUESTIONS } from '../data/scriptureData';
import { playSound } from '../lib/sounds';

export const ShepMascotShowcase: React.FC = () => {
  const [activeMood, setActiveMood] = useState<'waving' | 'studying' | 'celebrating'>('waving');
  const [activeGameTab, setActiveGameTab] = useState<'scramble' | 'sort' | 'trivia'>('scramble');
  const [woolStars, setWoolStars] = useState(140);

  // Trivia Game state
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const currentTrivia = TRIVIA_QUESTIONS[triviaIndex];

  const moods = [
    { 
      id: 'waving', 
      label: 'Waving Hello 👋', 
      img: '/assets/mascot.gif', 
      quote: '"Shalom and hello! I am Shep the Lamb, your faithful scripture companion!"' 
    },
    { 
      id: 'celebrating', 
      label: 'Celebrating ⭐', 
      img: '/assets/mascot_celebrating.gif', 
      quote: '"Hooray! 14 days reading streak achieved! +25 Wool Stars earned!"' 
    },
    { 
      id: 'studying', 
      label: 'Quiet Study 📖', 
      img: '/assets/mascot_study.gif', 
      quote: '"Diving deep into God\'s Word. Thy word is a lamp unto my feet, and a light unto my path (Psalm 119:105)."' 
    },
  ];

  const currentMoodObj = moods.find(m => m.id === activeMood) || moods[0];

  const handleMoodSelect = (moodId: 'waving' | 'studying' | 'celebrating') => {
    playSound('tap');
    setActiveMood(moodId);
  };

  const handleTriviaAnswer = (index: number) => {
    if (isAnswered) return;
    playSound('tap');
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentTrivia.correctIndex) {
      playSound('fanfare');
      setWoolStars(prev => prev + 15);
    } else {
      playSound('boing');
    }
  };

  const handleNextTrivia = () => {
    playSound('tap');
    setSelectedOption(null);
    setIsAnswered(false);
    setTriviaIndex((prev) => (prev + 1) % TRIVIA_QUESTIONS.length);
  };

  return (
    <section id="shep" className="py-20 sm:py-32 bg-[#F7EFE7]/60 border-b border-[#E8D8C8]/60 relative overflow-hidden">
      {/* Background Decorative Blob */}
      <div className="absolute top-1/3 right-0 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-[#E5C158]/15 blur-[100px] sm:blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5C158]/20 border border-[#E5C158]/40 text-[#966E0C] text-xs font-bold uppercase tracking-wider mb-4">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Meet Your Faithful Companion</span>
          </div>

          <h2 className="font-serif-bible font-bold text-3xl sm:text-4xl lg:text-5xl text-[#1A1817] leading-tight mb-3 sm:mb-4">
            Shep the Lamb & <span className="text-gold-gradient">Arcade Mini-Games</span>
          </h2>

          <p className="text-sm sm:text-lg text-[#6B6560] leading-relaxed">
            Spiritual growth is best nurtured with daily joy. Shep cheers your reading milestones, 
            helps you memorize verses through interactive games, and keeps your study streak alive.
          </p>
        </div>

        {/* Mascot Interactive Profile Card */}
        <div className="p-5 sm:p-10 rounded-3xl sm:rounded-[36px] bg-white border-2 border-[#E8D8C8] shadow-xl mb-12 sm:mb-16 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Mascot Animated GIF & Mood Switcher */}
            <div className="lg:col-span-5 flex flex-col items-center text-center">
              <div className="relative group">
                <button
                  onClick={() => playSound('tap')}
                  className="w-48 h-48 sm:w-64 sm:h-64 rounded-full overflow-hidden border-4 border-[#E5C158] shadow-2xl p-1 sm:p-2 bg-white relative z-10 transition-transform duration-300 group-hover:scale-105 active:scale-95 flex items-center justify-center"
                  title="Click Shep to hear him!"
                >
                  <img
                    key={currentMoodObj.id}
                    src={currentMoodObj.img}
                    alt={`Shep the Mascot in ${currentMoodObj.label}`}
                    className="w-full h-full object-contain"
                  />
                </button>
                {/* Glow ring */}
                <div className="absolute inset-0 bg-[#E5C158]/30 blur-2xl rounded-full -z-0" />
              </div>

              {/* Mood Buttons */}
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-5 sm:mt-6 bg-[#F5EBE1] p-1.5 rounded-2xl border border-[#E8D8C8]">
                {moods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleMoodSelect(m.id as any)}
                    className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeMood === m.id
                        ? 'bg-[#1E3A8A] text-white shadow-xs'
                        : 'text-[#6B6560] hover:text-[#1A1817]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mascot Details & Gamification Stats */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-display font-extrabold text-2xl sm:text-3xl text-[#1A1817]">
                    Shep the Lamb
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E5C158]/30 text-[#966E0C]">
                    Animated Companion
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#6B6560]">
                  Your warm, encouraging companion for morning devotions, scripture memorization, and quiet prayer times.
                </p>
              </div>

              {/* Dynamic Speech Bubble */}
              <div className="p-4 rounded-2xl bg-[#FDFBF7] border-2 border-[#E5C158] shadow-xs relative">
                <div className="text-[11px] font-bold text-[#1E3A8A] flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#E5C158]" />
                  <span>Shep says:</span>
                </div>
                <p className="font-serif-bible text-sm sm:text-base text-[#1A1817] italic leading-snug">
                  {currentMoodObj.quote}
                </p>
              </div>

              {/* Gamification Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F7EFE7] border border-[#E8D8C8]">
                  <div className="flex items-center gap-2 text-orange-600 mb-1">
                    <Flame className="w-4 h-4 fill-current" />
                    <span className="text-xs font-bold text-[#1A1817]">Daily Streak</span>
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-[#1A1817]">14 Days</div>
                  <span className="text-[10px] text-[#6B6560]">Consecutive study 🔥</span>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F7EFE7] border border-[#E8D8C8]">
                  <div className="flex items-center gap-2 text-[#966E0C] mb-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-xs font-bold text-[#1A1817]">Wool Stars</span>
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-[#966E0C]">{woolStars} ⭐</div>
                  <span className="text-[10px] text-[#6B6560]">Earned via devotions & games</span>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F7EFE7] border border-[#E8D8C8]">
                  <div className="flex items-center gap-2 text-[#1E3A8A] mb-1">
                    <Award className="w-4 h-4" />
                    <span className="text-xs font-bold text-[#1A1817]">4 Arcade Games</span>
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-[#1E3A8A]">Level 3</div>
                  <span className="text-[10px] text-[#6B6560]">Scramble, Sort, Trivia & Crossword</span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Playable Mini-Games Grid */}
        <div id="games" className="scroll-mt-20 sm:scroll-mt-24">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] text-xs font-bold mb-2">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Interactive In-Browser Play</span>
            </div>
            <h3 className="font-serif-bible font-bold text-2xl sm:text-3xl text-[#1A1817]">
              Play BibleNote's Scripture Memorization Games
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6560] max-w-xl mx-auto mt-1">
              Try the actual mini-games from the Android app to experience how BibleNote makes scripture retention joyful.
            </p>

            {/* Game Selector Pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-5 sm:mt-6">
              <button
                onClick={() => {
                  playSound('tap');
                  setActiveGameTab('scramble');
                }}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeGameTab === 'scramble'
                    ? 'bg-[#1E3A8A] text-white shadow-md'
                    : 'bg-white border border-[#E8D8C8] text-[#6B6560] hover:text-[#1A1817]'
                }`}
              >
                🧩 Verse Scramble
              </button>
              <button
                onClick={() => {
                  playSound('tap');
                  setActiveGameTab('sort');
                }}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeGameTab === 'sort'
                    ? 'bg-[#1E3A8A] text-white shadow-md'
                    : 'bg-white border border-[#E8D8C8] text-[#6B6560] hover:text-[#1A1817]'
                }`}
              >
                📚 Books Chrono Sort
              </button>
              <button
                onClick={() => {
                  playSound('tap');
                  setActiveGameTab('trivia');
                }}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeGameTab === 'trivia'
                    ? 'bg-[#1E3A8A] text-white shadow-md'
                    : 'bg-white border border-[#E8D8C8] text-[#6B6560] hover:text-[#1A1817]'
                }`}
              >
                ❓ Bible Trivia Party
              </button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {activeGameTab === 'scramble' && <VerseScrambleGame />}
            {activeGameTab === 'sort' && <ChronoSortGame />}
            {activeGameTab === 'trivia' && (
              <div className="p-5 sm:p-8 rounded-3xl bg-white border border-[#E8D8C8] shadow-lg text-left space-y-5 sm:space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8D8C8] pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#1E3A8A]/10 flex items-center justify-center text-[#1E3A8A] shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif-bible font-bold text-base sm:text-lg text-[#1A1817]">
                        Bible Trivia Party (Question {triviaIndex + 1} of {TRIVIA_QUESTIONS.length})
                      </h4>
                      <span className="text-xs text-[#6B6560]">Reference: {currentTrivia.scriptureRef}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#E5C158]/20 text-[#966E0C]">
                    +15 Wool ⭐
                  </span>
                </div>

                <div className="text-base sm:text-lg font-serif-bible font-bold text-[#1A1817]">
                  "{currentTrivia.question}"
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {currentTrivia.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === currentTrivia.correctIndex;
                    let btnStyle = 'bg-[#FDFBF7] border-[#E8D8C8] hover:border-[#1E3A8A] text-[#1A1817]';

                    if (isAnswered) {
                      if (isCorrect) btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                      else if (isSelected) btnStyle = 'bg-red-50 border-red-400 text-red-800';
                    }

                    return (
                      <button
                        key={opt}
                        onClick={() => handleTriviaAnswer(idx)}
                        disabled={isAnswered}
                        className={`p-3 sm:p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F7EFE7] border border-[#E8D8C8] space-y-1">
                    <span className="text-xs font-bold text-[#1E3A8A] block">Explanation & Scripture:</span>
                    <p className="text-xs text-[#6B6560]">
                      {currentTrivia.explanation} ({currentTrivia.scriptureRef})
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-[#E8D8C8] flex justify-between items-center">
                  <button
                    onClick={() => {
                      playSound('tap');
                      setSelectedOption(null);
                      setIsAnswered(false);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-[#6B6560] hover:text-[#1A1817]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Question</span>
                  </button>

                  {isAnswered && (
                    <button
                      onClick={handleNextTrivia}
                      className="px-4 py-2 rounded-xl bg-[#1E3A8A] text-white text-xs font-bold shadow-md"
                    >
                      Next Question
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
