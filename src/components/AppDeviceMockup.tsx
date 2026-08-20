import React, { useState } from 'react';
import { 
  Home, 
  BookOpen, 
  Layers, 
  FileText, 
  Gamepad2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '../lib/sounds';

export type AppScreenId = 'home' | 'picker' | 'notes' | 'widgets' | 'arcade';

interface ScreenMeta {
  id: AppScreenId;
  name: string;
  tabLabel: string;
  icon: any;
  src: string;
  tagline: string;
  badge: string;
}

export const APP_SCREENS: ScreenMeta[] = [
  {
    id: 'widgets',
    name: 'Home Screen Widgets',
    tabLabel: 'Widgets',
    icon: Layers,
    src: '/assets/screenshots/widgets.png',
    tagline: 'Live Phone Preview, Widget Sizes (2×2, 4×2, 4×4) & 5 Themes',
    badge: 'Widgets'
  },
  {
    id: 'notes',
    name: 'Smart Markdown Note Editor',
    tabLabel: 'Notes',
    icon: FileText,
    src: '/assets/screenshots/notes.png',
    tagline: 'Auto-Verse Detection with Regex & Scripture Popups',
    badge: 'Smart Notes'
  },
  {
    id: 'picker',
    name: 'Book & Chapter Selector',
    tabLabel: 'Bible',
    icon: BookOpen,
    src: '/assets/screenshots/picker.png',
    tagline: 'Old & New Testament 66-Book Quick Jump Matrix',
    badge: 'E-Bible'
  },
  {
    id: 'home',
    name: 'Home / Today Dashboard',
    tabLabel: 'Home',
    icon: Home,
    src: '/assets/screenshots/home.png',
    tagline: 'Verse of the Day, Daily Prayer, Streaks & Reading Plans',
    badge: 'Dashboard'
  },
  {
    id: 'arcade',
    name: 'Shepherd Arcade & Word Games',
    tabLabel: 'Arcade',
    icon: Gamepad2,
    src: '/assets/screenshots/arcade.png',
    tagline: 'Verse Scramble, Book Sorter, Trivia & Crossword',
    badge: 'Mini-Games'
  }
];

interface AppDeviceMockupProps {
  initialScreen?: AppScreenId;
  onOpenDownload?: () => void;
  interactive?: boolean;
}

export const AppDeviceMockup: React.FC<AppDeviceMockupProps> = ({
  initialScreen = 'widgets',
  onOpenDownload,
  interactive = true,
}) => {
  const [activeScreenId, setActiveScreenId] = useState<AppScreenId>(initialScreen);

  const activeScreen = APP_SCREENS.find(s => s.id === activeScreenId) || APP_SCREENS[0];

  const handleTabClick = (id: AppScreenId) => {
    playSound('tap');
    setActiveScreenId(id);
  };

  return (
    <div className="relative flex flex-col items-center select-none">
      
      {/* Screen Selector Pills on top (if interactive) */}
      {interactive && (
        <div className="flex items-center gap-1 sm:gap-1.5 mb-4 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#E8D8C8] shadow-md max-w-full overflow-x-auto">
          {APP_SCREENS.map((screen) => {
            const Icon = screen.icon;
            const isCurrent = activeScreenId === screen.id;
            return (
              <button
                key={screen.id}
                onClick={() => handleTabClick(screen.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isCurrent
                    ? 'bg-[#1E3A8A] text-white shadow-md scale-105'
                    : 'text-[#6B6560] hover:text-[#1A1817] hover:bg-[#F5EBE1]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{screen.tabLabel}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Realistic Mobile Device Frame with Real App Screenshot */}
      <div className="relative w-[300px] sm:w-[325px] h-[640px] bg-[#121316] p-2.5 rounded-[50px] shadow-2xl shadow-[#1A1817]/50 ring-1 ring-white/20 border-4 border-[#25282F] group">
        
        {/* Dynamic Island / Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#121316] rounded-full z-40 flex items-center justify-between px-2 pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-[#090A0C] border border-white/10" />
          <div className="w-8 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Screen Container displaying actual Screenshot */}
        <div className="relative w-full h-full rounded-[40px] overflow-hidden bg-[#090D16] flex flex-col justify-between border border-white/10 shadow-inner">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScreen.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full h-full relative cursor-pointer"
              onClick={() => {
                if (onOpenDownload) onOpenDownload();
              }}
            >
              <img
                src={activeScreen.src}
                alt={activeScreen.name}
                className="w-full h-full object-cover object-top"
              />

              {/* Subtle Screen Gloss Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
            </motion.div>
          </AnimatePresence>

          {/* Interactive In-Mockup Overlay Bottom Navigation Tabs */}
          {interactive && (
            <div className="absolute bottom-0 inset-x-0 h-14 bg-transparent z-30 grid grid-cols-5">
              <button 
                onClick={() => handleTabClick('home')} 
                className="w-full h-full focus:outline-none" 
                title="Home Tab" 
              />
              <button 
                onClick={() => handleTabClick('picker')} 
                className="w-full h-full focus:outline-none" 
                title="Bible Tab" 
              />
              <button 
                onClick={() => handleTabClick('widgets')} 
                className="w-full h-full focus:outline-none" 
                title="Widgets Tab" 
              />
              <button 
                onClick={() => handleTabClick('notes')} 
                className="w-full h-full focus:outline-none" 
                title="Notes Tab" 
              />
              <button 
                onClick={() => handleTabClick('arcade')} 
                className="w-full h-full focus:outline-none" 
                title="Arcade Tab" 
              />
            </div>
          )}
        </div>

        {/* Outer Device Ambient Glow */}
        <div className="absolute -inset-2 bg-[#1E3A8A]/20 blur-xl rounded-[54px] -z-10 group-hover:bg-[#E5C158]/20 transition-colors" />
      </div>

      {/* Screen Caption Underneath */}
      <div className="mt-3 text-center">
        <span className="text-xs font-bold text-[#1E3A8A] block">
          {activeScreen.name}
        </span>
        <span className="text-[11px] text-[#6B6560]">
          {activeScreen.tagline}
        </span>
      </div>

    </div>
  );
};
