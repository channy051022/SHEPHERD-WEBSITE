export type ScreenType = 'notes' | 'bible' | 'today' | 'alarm' | 'verse-detection' | 'dual-language' | 'fts-search' | 'voice-assistant';

export interface ScriptureVerse {
  reference: string;
  book: string;
  chapter: number;
  verseNumber: number;
  kjvText: string;
  cebuanoText: string;
  theme: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  detectedVerses: string[];
  date: string;
  tags: string[];
  color?: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  bulletPoints: string[];
  screenType: ScreenType;
}

export interface StatItem {
  label: string;
  value: string;
  subtext: string;
}

export interface TestimonialItem {
  id: string;
  author: string;
  role: string;
  content: string;
  stars: number;
  highlight: string;
}

export interface ScramblePuzzle {
  id: string;
  reference: string;
  words: string[];
  targetSentence: string[];
  hint: string;
}

export interface ChronoBook {
  id: string;
  name: string;
  order: number;
  testament: 'Old Testament' | 'New Testament';
  theme: string;
  category?: string;
  chapters?: number;
}
