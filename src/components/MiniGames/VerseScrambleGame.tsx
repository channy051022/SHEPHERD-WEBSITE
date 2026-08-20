import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { SCRAMBLE_PUZZLES } from '../../data/scriptureData';
import { playSound } from '../../lib/sounds';

export const VerseScrambleGame: React.FC = () => {
  const [selectedPuzzleIdx, setSelectedPuzzleIdx] = useState(0);
  const puzzle = SCRAMBLE_PUZZLES[selectedPuzzleIdx];

  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [placedWords, setPlacedWords] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setAvailableWords([...puzzle.words]);
    setPlacedWords([]);
    setIsCompleted(false);
    setShowHint(false);
  }, [selectedPuzzleIdx]);

  const handleWordClick = (word: string, fromPlaced: boolean, index: number) => {
    if (isCompleted) return;
    playSound('tap');

    if (fromPlaced) {
      const newPlaced = [...placedWords];
      newPlaced.splice(index, 1);
      setPlacedWords(newPlaced);
      setAvailableWords([...availableWords, word]);
    } else {
      const newAvailable = [...availableWords];
      newAvailable.splice(index, 1);
      const newPlaced = [...placedWords, word];
      setAvailableWords(newAvailable);
      setPlacedWords(newPlaced);

      if (newPlaced.length === puzzle.targetSentence.length) {
        const isMatch = newPlaced.every((w, i) => w === puzzle.targetSentence[i]);
        if (isMatch) {
          setIsCompleted(true);
          playSound('fanfare');
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#E5C158', '#1E3A8A', '#2563EB', '#FDFBF7']
            });
          } catch {
            // ignore
          }
        } else {
          playSound('boing');
        }
      }
    }
  };

  const handleReset = () => {
    playSound('tap');
    setAvailableWords([...puzzle.words]);
    setPlacedWords([]);
    setIsCompleted(false);
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8D8C8] shadow-lg flex flex-col justify-between">
      <div>
        {/* Game Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E5C158]/20 flex items-center justify-center text-[#966E0C]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif-bible font-bold text-lg text-[#1A1817]">
                Verse Scramble
              </h4>
              <span className="text-xs text-[#6B6560]">Reorder the scripture tiles</span>
            </div>
          </div>

          {/* Puzzle selector pills */}
          <div className="flex gap-1 bg-[#F5EBE1] p-1 rounded-xl">
            {SCRAMBLE_PUZZLES.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => {
                  playSound('tap');
                  setSelectedPuzzleIdx(idx);
                }}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  selectedPuzzleIdx === idx
                    ? 'bg-[#1E3A8A] text-white shadow-xs'
                    : 'text-[#6B6560] hover:text-[#1A1817]'
                }`}
              >
                P{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Verse Reference & Hint */}
        <div className="mb-6 p-3.5 rounded-2xl bg-[#F7EFE7] border border-[#E8D8C8] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#1E3A8A] block">
              {puzzle.reference}
            </span>
            {showHint ? (
              <p className="text-xs text-[#966E0C] mt-0.5 font-medium italic">
                Hint: "{puzzle.hint}"
              </p>
            ) : (
              <span className="text-[11px] text-[#6B6560]">
                Can you arrange the verse in canonical order?
              </span>
            )}
          </div>
          <button
            onClick={() => {
              playSound('tap');
              setShowHint(!showHint);
            }}
            className="p-1.5 rounded-lg text-[#6B6560] hover:text-[#1E3A8A] hover:bg-white/80 transition-colors"
            title="Toggle hint"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* User's Placed Sentence Area */}
        <div className="mb-6">
          <div className="text-xs font-bold text-[#6B6560] mb-2 flex items-center justify-between">
            <span>Your Assembled Verse:</span>
            {isCompleted && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verse Solved! (+25 Wool ⭐)
              </span>
            )}
          </div>

          <div className={`min-h-[72px] p-3 rounded-2xl border-2 transition-all flex flex-wrap gap-2 items-center ${
            isCompleted
              ? 'bg-emerald-50/80 border-emerald-300'
              : 'bg-[#FDFBF7] border-dashed border-[#E8D8C8]'
          }`}>
            {placedWords.length === 0 ? (
              <span className="text-xs text-[#9E968F] italic px-2">
                Click tiles below to start building the verse...
              </span>
            ) : (
              placedWords.map((word, idx) => (
                <motion.button
                  key={`${word}-${idx}`}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={() => handleWordClick(word, true, idx)}
                  className={`px-3 py-1.5 rounded-xl font-display font-semibold text-xs transition-all shadow-xs ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                      : 'bg-[#1E3A8A] text-white hover:bg-red-600'
                  }`}
                  title="Click to remove"
                >
                  {word}
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* Available Scrambled Tiles */}
        <div className="mb-6">
          <div className="text-xs font-bold text-[#6B6560] mb-2">Available Words:</div>
          <div className="flex flex-wrap gap-2">
            {availableWords.map((word, idx) => (
              <motion.button
                key={`${word}-${idx}`}
                layout
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleWordClick(word, false, idx)}
                className="px-3 py-2 rounded-xl bg-white border border-[#E8D8C8] hover:border-[#E5C158] hover:bg-[#E5C158]/10 text-xs font-bold text-[#1A1817] shadow-xs transition-all"
              >
                {word}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="pt-4 border-t border-[#E8D8C8]/60 flex items-center justify-between">
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B6560] hover:text-[#1A1817] p-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Puzzle</span>
        </button>

        {isCompleted ? (
          <button
            onClick={() => {
              playSound('tap');
              setSelectedPuzzleIdx((selectedPuzzleIdx + 1) % SCRAMBLE_PUZZLES.length);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
          >
            <span>Next Puzzle</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="text-[11px] text-[#6B6560]">
            {placedWords.length} / {puzzle.targetSentence.length} words placed
          </span>
        )}
      </div>
    </div>
  );
};
