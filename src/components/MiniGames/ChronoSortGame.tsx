import React, { useState } from 'react';
import { ArrowUp, ArrowDown, CheckCircle2, RotateCcw, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CHRONO_BOOKS } from '../../data/scriptureData';
import type { ChronoBook } from '../../types';
import { playSound } from '../../lib/sounds';

// Shuffle helper
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const ChronoSortGame: React.FC = () => {
  const [books, setBooks] = useState<ChronoBook[]>(() => {
    return shuffleArray(CHRONO_BOOKS);
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isPerfect, setIsPerfect] = useState(false);

  // Move item up
  const moveUp = (index: number) => {
    if (index === 0 || hasSubmitted) return;
    playSound('tap');
    const updated = [...books];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setBooks(updated);
  };

  // Move item down
  const moveDown = (index: number) => {
    if (index === books.length - 1 || hasSubmitted) return;
    playSound('tap');
    const updated = [...books];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setBooks(updated);
  };

  // Check order
  const handleCheckOrder = () => {
    setHasSubmitted(true);
    const perfect = books.every((b, idx) => {
      if (idx === 0) return true;
      return b.order >= books[idx - 1].order;
    });

    setIsPerfect(perfect);
    if (perfect) {
      playSound('fanfare');
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#E5C158', '#1E3A8A', '#10B981', '#FDFBF7']
        });
      } catch {
        // ignore
      }
    } else {
      playSound('boing');
    }
  };

  const handleReset = () => {
    playSound('tap');
    setBooks(shuffleArray(CHRONO_BOOKS));
    setHasSubmitted(false);
    setIsPerfect(false);
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8D8C8] shadow-lg flex flex-col justify-between">
      <div>
        {/* Game Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#1E3A8A]/10 flex items-center justify-center text-[#1E3A8A]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif-bible font-bold text-lg text-[#1A1817]">
                Chrono-Sort Timeline
              </h4>
              <span className="text-xs text-[#6B6560]">Order books from Genesis to Revelation</span>
            </div>
          </div>

          <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#E5C158]/20 text-[#966E0C] border border-[#E5C158]/30">
            Timeline Challenge
          </span>
        </div>

        {/* Instructions */}
        <p className="text-xs text-[#6B6560] mb-4">
          Use the <span className="font-bold text-[#1A1817]">▲</span> and <span className="font-bold text-[#1A1817]">▼</span> arrows to position each Bible book into its proper canonical order.
        </p>

        {/* Books List */}
        <div className="space-y-2 mb-6">
          {books.map((book, idx) => {
            const isCorrectPosition = hasSubmitted && book.order === CHRONO_BOOKS[idx].order;
            const isIncorrect = hasSubmitted && book.order !== CHRONO_BOOKS[idx].order;

            return (
              <motion.div
                key={book.id}
                layout
                className={`p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  isCorrectPosition
                    ? 'bg-emerald-50 border-emerald-300'
                    : isIncorrect
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-[#FDFBF7] border-[#E8D8C8] hover:border-[#1E3A8A]/40'
                }`}
              >
                {/* Book info */}
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-white border border-[#E8D8C8] flex items-center justify-center text-xs font-bold text-[#6B6560]">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#1A1817] flex items-center gap-2">
                      <span>{book.name}</span>
                      <span className="text-[10px] font-normal text-[#6B6560]">
                        ({book.testament})
                      </span>
                    </div>
                    <div className="text-[10px] text-[#966E0C] font-medium">
                      Theme: {book.theme}
                    </div>
                  </div>
                </div>

                {/* Move Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0 || hasSubmitted}
                    className="p-1.5 rounded-lg bg-white border border-[#E8D8C8] text-[#1A1817] hover:bg-[#F5EBE1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === books.length - 1 || hasSubmitted}
                    className="p-1.5 rounded-lg bg-white border border-[#E8D8C8] text-[#1A1817] hover:bg-[#F5EBE1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-[#E8D8C8]/60 flex items-center justify-between">
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B6560] hover:text-[#1A1817] p-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Shuffle</span>
        </button>

        {hasSubmitted ? (
          isPerfect ? (
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Perfect Timeline! (+30 ⭐)</span>
            </div>
          ) : (
            <button
              onClick={() => {
                playSound('tap');
                setHasSubmitted(false);
              }}
              className="px-4 py-2 rounded-xl bg-[#1E3A8A] text-white text-xs font-bold"
            >
              Try Again
            </button>
          )
        ) : (
          <button
            onClick={handleCheckOrder}
            className="px-4 py-2 rounded-xl bg-[#1E3A8A] hover:bg-[#152a65] text-white text-xs font-bold shadow-md shadow-[#1E3A8A]/20"
          >
            Check Order
          </button>
        )}
      </div>
    </div>
  );
};
