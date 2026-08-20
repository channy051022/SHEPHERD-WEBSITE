import type { FeatureItem, StatItem, TestimonialItem } from '../types';

export const CORE_FEATURES: FeatureItem[] = [
  {
    id: 'notes-verse-detection',
    title: 'Smart Markdown Journal & Auto-Verse Detection',
    description: 'Write devotions and sermons freely. The on-device parser automatically recognizes citations like "John 3:16" or "Romans 8:28", turning them into clickable gold scripture pills with instant passage popups.',
    badge: 'Smart Notes',
    bulletPoints: [
      'Automatic regex verse detection while typing',
      'Instant scripture passage popups with zero lag',
      'Full markdown formatting: bold, italic, quotes & tags',
      '100% offline local SQLite journal storage'
    ],
    screenType: 'notes'
  },

];

export const APP_STATS: StatItem[] = [
  {
    label: 'Canonical Books',
    value: '66',
    subtext: 'Complete Old & New Testaments'
  },
  {
    label: 'Offline Search Speed',
    value: '<18ms',
    subtext: 'High-speed SQLite FTS5 index'
  },
  {
    label: 'Arcade Mini-Games',
    value: '4',
    subtext: 'Scramble, Sort, Trivia & Crossword'
  },
  {
    label: 'Internet Required',
    value: '0%',
    subtext: '100% fully functional offline'
  }
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: '1',
    author: 'Pastor Ronald M.',
    role: 'Cebuano Bible Study Leader',
    content: 'Having English KJV and Cebuano Bugna right alongside each other without requiring mobile data has transformed our mountain outreach ministry. The auto-verse detection in notes saves so much preparation time.',
    stars: 5,
    highlight: 'Essential for Cebuano ministry'
  },
  {
    id: '2',
    author: 'Hannah G.',
    role: 'Daily Devotion Reader',
    content: 'The Home Screen Verse Widget in Medium (4×2) Frosted Glass keeps God\'s Word visible every time I unlock my phone. Best devotion companion!',
    stars: 5,
    highlight: 'Beautiful home screen widgets'
  },
  {
    id: '3',
    author: 'David K.',
    role: 'Sunday School Teacher',
    content: 'The arcade games—especially the Canonical Book Sorter and Scripture Crosswords—keep our youth group engaged and excited to memorize verses.',
    stars: 5,
    highlight: 'Wonderful gamified scripture learning'
  }
];
