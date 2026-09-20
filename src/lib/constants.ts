import { Subject, ClassLevel, Board, TutorProfile, PlatformSettings } from './types';

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  commission_percentage: 25,
  currency: 'INR',
  min_fee: 50,
  enable_instant_booking: true,
};

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub-1', name: 'Mathematics', slug: 'mathematics', description: 'Calculus, Algebra, Geometry, Trigonometry & JEE Advanced', icon_name: 'Calculator' },
  { id: 'sub-2', name: 'Physics', slug: 'physics', description: 'Mechanics, Electromagnetism, Quantum & Optics', icon_name: 'Zap' },
  { id: 'sub-3', name: 'Chemistry', slug: 'chemistry', description: 'Organic mechanisms, Thermodynamics & NEET Prep', icon_name: 'FlaskConical' },
  { id: 'sub-4', name: 'Computer Science', slug: 'computer-science', description: 'Python, DSA, Web Dev, Java & AP Computer Science', icon_name: 'Code' },
  { id: 'sub-5', name: 'Biology', slug: 'biology', description: 'Genetics, Physiology, Botany & NEET Medical Focus', icon_name: 'Dna' },
  { id: 'sub-6', name: 'English Literature', slug: 'english', description: 'Academic Writing, Critical Reading & IELTS/SAT', icon_name: 'BookOpen' },
  { id: 'sub-7', name: 'Economics', slug: 'economics', description: 'Micro/Macroeconomics, Econometrics & IB/CBSE', icon_name: 'TrendingUp' },
  { id: 'sub-8', name: 'Accountancy', slug: 'accountancy', description: 'Financial Statements, Partnership & Commerce', icon_name: 'PieChart' },
];

export const INITIAL_CLASS_LEVELS: ClassLevel[] = [
  { id: 'lvl-1', name: 'Class 6 - 8 (Middle School)', order_index: 1 },
  { id: 'lvl-2', name: 'Class 9 - 10 (Secondary)', order_index: 2 },
  { id: 'lvl-3', name: 'Class 11 - 12 (Senior Secondary)', order_index: 3 },
  { id: 'lvl-4', name: 'Competitive (JEE / NEET / SAT)', order_index: 4 },
  { id: 'lvl-5', name: 'University / Undergraduate', order_index: 5 },
];

export const INITIAL_BOARDS: Board[] = [
  { id: 'brd-1', name: 'CBSE', full_name: 'Central Board of Secondary Education' },
  { id: 'brd-2', name: 'ICSE / ISC', full_name: 'Indian Certificate of Secondary Education' },
  { id: 'brd-3', name: 'IB (International Baccalaureate)', full_name: 'International Baccalaureate DP/MYP' },
  { id: 'brd-4', name: 'Cambridge (IGCSE/A-Levels)', full_name: 'Cambridge International' },
  { id: 'brd-5', name: 'State Board', full_name: 'State Secondary Education Boards' },
];

export const SAMPLE_TUTORS: TutorProfile[] = [];
