import type { ScriptureVerse, NoteItem, ScramblePuzzle, ChronoBook } from '../types';

export const PARALLEL_VERSES: ScriptureVerse[] = [
  {
    reference: 'John 3:16',
    book: 'John',
    chapter: 3,
    verseNumber: 16,
    kjvText: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
    cebuanoText: 'Kay gihigugma gayud sa Dios ang kalibutan, nga tungod niana gihatag niya ang iyang bugtong Anak, aron ang tanan nga mosalig kaniya dili malaglag, kondili may kinabuhing dayon.',
    theme: 'Salvation & Agape Love'
  },
  {
    reference: 'Psalm 23:1',
    book: 'Psalms',
    chapter: 23,
    verseNumber: 1,
    kjvText: 'The LORD is my shepherd; I shall not want.',
    cebuanoText: 'Ang Ginoo maoy akong magbalantay; walay makulang kanako.',
    theme: 'Divine Guidance & Provision'
  },
  {
    reference: 'Philippians 4:13',
    book: 'Philippians',
    chapter: 4,
    verseNumber: 13,
    kjvText: 'I can do all things through Christ which strengtheneth me.',
    cebuanoText: 'Makahimo ako sa tanang mga butang pinaagi kang Cristo nga nagapalig-on kanako.',
    theme: 'Strength & Perseverance'
  },
  {
    reference: 'Proverbs 3:5-6',
    book: 'Proverbs',
    chapter: 3,
    verseNumber: 5,
    kjvText: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.',
    cebuanoText: 'Salig sa Ginoo uban sa bug-os mong kasingkasing; ug ayaw pagsalig sa imong kaugalingong pagsabut. Sa tanan nimong mga dalan ilha siya, ug siya magamando sa imong mga alagianan.',
    theme: 'Trust & Divine Direction'
  },
  {
    reference: 'Romans 8:28',
    book: 'Romans',
    chapter: 8,
    verseNumber: 28,
    kjvText: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
    cebuanoText: 'Ug kita nahibalo nga ang tanang mga butang nagatabang sa tingub alang sa kaayohan sa mga nahigugma sa Dios, sa mga gitawag sumala sa iyang katuyoan.',
    theme: 'God\'s Sovereign Purpose'
  }
];

export const SAMPLE_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: 'Morning Reflections on Agape Love',
    content: 'God\'s boundless grace is clearest in John 3:16. Even when life feels uncertain, we know from Romans 8:28 that He directs every season toward our spiritual good.',
    detectedVerses: ['John 3:16', 'Romans 8:28'],
    date: 'Today, 7:15 AM',
    tags: ['Devotion', 'Grace', 'Morning']
  },
  {
    id: 'note-2',
    title: 'The Shepherd Who Restores My Soul',
    content: 'Meditating on Psalm 23:1 this morning. The Great Shepherd provides everything we need—peace in the valley, protection in the storm, and strength through Christ as promised in Philippians 4:13.',
    detectedVerses: ['Psalm 23:1', 'Philippians 4:13'],
    date: 'Yesterday, 8:40 PM',
    tags: ['Peace', 'Prayer', 'Shepherd']
  },
  {
    id: 'note-3',
    title: 'Wisdom for Big Life Decisions',
    content: 'Whenever anxiety whispers doubt, Proverbs 3:5-6 reminds us not to lean on our own limited understanding, but to acknowledge God in all things.',
    detectedVerses: ['Proverbs 3:5-6'],
    date: 'Aug 14, 2026',
    tags: ['Wisdom', 'Guidance']
  }
];

export const SCRAMBLE_PUZZLES: ScramblePuzzle[] = [
  {
    id: 'puzzle-1',
    reference: 'Psalm 23:1 (KJV)',
    words: ['The', 'LORD', 'is', 'my', 'shepherd;', 'I', 'shall', 'not', 'want.'],
    targetSentence: ['The', 'LORD', 'is', 'my', 'shepherd;', 'I', 'shall', 'not', 'want.'],
    hint: 'David\'s beloved song of divine pastoral care.'
  },
  {
    id: 'puzzle-2',
    reference: 'Salmo 23:1 (Cebuano)',
    words: ['Ang', 'Ginoo', 'maoy', 'akong', 'magbalantay;', 'walay', 'makulang', 'kanako.'],
    targetSentence: ['Ang', 'Ginoo', 'maoy', 'akong', 'magbalantay;', 'walay', 'makulang', 'kanako.'],
    hint: 'Cebuano translation of Psalm 23:1.'
  },
  {
    id: 'puzzle-3',
    reference: 'Philippians 4:13 (KJV)',
    words: ['I', 'can', 'do', 'all', 'things', 'through', 'Christ', 'which', 'strengtheneth', 'me.'],
    targetSentence: ['I', 'can', 'do', 'all', 'things', 'through', 'Christ', 'which', 'strengtheneth', 'me.'],
    hint: 'Paul\'s anthem of supernatural fortitude.'
  }
];

export const CHRONO_BOOKS: ChronoBook[] = [
  { id: '1', name: 'Genesis', order: 1, testament: 'Old Testament', theme: 'Creation, Fall, & Covenant' },
  { id: '2', name: 'Exodus', order: 2, testament: 'Old Testament', theme: 'Deliverance & Law of God' },
  { id: '19', name: 'Psalms', order: 19, testament: 'Old Testament', theme: 'Prayers, Worship, & Messianic Praise' },
  { id: '20', name: 'Proverbs', order: 20, testament: 'Old Testament', theme: 'Wisdom & Righteous Living' },
  { id: '40', name: 'Matthew', order: 40, testament: 'New Testament', theme: 'Jesus the Promised Messiah King' },
  { id: '43', name: 'John', order: 43, testament: 'New Testament', theme: 'Jesus the Son of God' },
  { id: '45', name: 'Romans', order: 45, testament: 'New Testament', theme: 'Justification by Faith & Grace' },
  { id: '66', name: 'Revelation', order: 66, testament: 'New Testament', theme: 'The Victorious Return of Christ' }
];

export interface TriviaQuestionData {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  scriptureRef: string;
}

export const TRIVIA_QUESTIONS: TriviaQuestionData[] = [
  {
    id: 1,
    question: 'Who built the ark to survive the Great Flood?',
    options: ['Moses', 'Noah', 'Abraham', 'David'],
    correctIndex: 1,
    explanation: 'Noah was commanded by God to build the ark of gopher wood.',
    scriptureRef: 'Genesis 6:14'
  },
  {
    id: 2,
    question: 'What is the very first book of the Holy Bible?',
    options: ['Exodus', 'Matthew', 'Genesis', 'Psalms'],
    correctIndex: 2,
    explanation: 'Genesis chronicles the creation of heaven and earth.',
    scriptureRef: 'Genesis 1:1'
  },
  {
    id: 3,
    question: 'In what town was our Lord Jesus born?',
    options: ['Jerusalem', 'Nazareth', 'Bethlehem', 'Capernaum'],
    correctIndex: 2,
    explanation: 'Jesus was born in Bethlehem of Judea, fulfilling ancient prophecy.',
    scriptureRef: 'Micah 5:2 / Luke 2:4'
  }
];
