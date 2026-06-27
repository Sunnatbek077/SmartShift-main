// ============================================================
// EduAI Platform - KONSTANTALAR VA MA'LUMOTLAR (11-sinf)
// ============================================================

import { algebraTopics } from "./constants/algebra";
import { geometriyaTopics } from "./constants/geometriya";
import { fizikaTopics } from "./constants/fizika";
import { kimyoTopics } from "./constants/kimyo";
import { biologiyaTopics } from "./constants/biologiya";
import { dasturlashTopics } from "./constants/dasturlash";
import {
  fizika1Topics,
  algebra1Topics,
  geometriya1Topics,
  kimyo1Topics,
  biologiya1Topics,
} from "./constants/kurs1";

// Mavjud bo'lmagan fayllar uchun bo'sh array
const onatiliTopics = [];
const oztarixTopics = [];
const jahontarixTopics = [];
const tarbiyaTopics = [];
const informatikaTopics = [];
const fizraTopics = [];
const harbiyTopics = [];
const matematikaTopics = [];
const inglizTopics = [];

// 7-sinf (yo'q fayllar uchun bo'sh)
const fizika7Topics = [];
const algebra7Topics = [];
const geometriya7Topics = [];
const kimyo7Topics = [];

export const COLORS = {
  bg: "var(--bg)",
  bgAlt: "var(--surface)",
  card: "var(--card)",
  cardHover: "var(--card-hover)",
  primary: "var(--primary)",
  primaryDark: "var(--primary-dark)",
  primaryLight: "rgba(37,99,235,0.1)",
  accent: "var(--accent)",
  accentDark: "var(--accent-dark)",
  accentLight: "rgba(5,150,105,0.1)",
  orange: "#D97706",
  orangeLight: "rgba(217,119,6,0.1)",
  purple: "#7C3AED",
  purpleLight: "rgba(124,58,237,0.1)",
  red: "#DC2626",
  redLight: "rgba(220,38,38,0.1)",
  pink: "#DB2777",
  text: "var(--text)",
  textMuted: "var(--muted)",
  textDim: "var(--dim)",
  border: "var(--border)",
  borderLight: "var(--border-light)",
  surface: "var(--surface)",
  glass: "var(--glass)",
};

export const FANS = [
  { id: "onatili", name: "Ona tili va adabiyot", icon: "✍️", color: "#2563EB", progress: 30, topics: 12, description: "Stilistika va Mumtoz adabiyot" },
  { id: "algebra", name: "Algebra", icon: "🧮", color: "#7C3AED", progress: 40, topics: 8, description: "Hosila, Integral va Funksiyalar" },
  { id: "geometriya", name: "Geometriya", icon: "📐", color: "#059669", progress: 25, topics: 8, description: "Stereometriya va Fazoviy shakllar" },
  { id: "fizika", name: "Fizika", icon: "⚛️", color: "#D97706", progress: 45, topics: 45, description: "Tebranishlar va Kvant fizikasi" },
  { id: "kimyo", name: "Kimyo", icon: "🧪", color: "#DC2626", progress: 20, topics: 10, description: "Organik kimyo asoslari" },
  { id: "biologiya", name: "Biologiya", icon: "🧬", color: "#DB2777", progress: 35, topics: 7, description: "Evolyutsiya va Ekologiya" },
  { id: "oztarix", name: "O'zbekiston tarixi", icon: "🏛️", color: "#2563EB", progress: 50, topics: 15, description: "Eng yangi davr tarixi" },
  { id: "jahontarix", name: "Jahon tarixi", icon: "🌍", color: "#7C3AED", progress: 15, topics: 12, description: "XX asr va zamonaviy dunyo" },
  { id: "tarbiya", name: "Tarbiya", icon: "🤝", color: "#059669", progress: 60, topics: 10, description: "Qadriyatlar va Ma'naviyat" },
  { id: "informatika", name: "Informatika", icon: "💻", color: "#D97706", progress: 70, topics: 4, description: "Dasturlash va Kiberxavfsizlik" },
  { id: "fizra", name: "Jismoniy tarbiya", icon: "⚽", color: "#DC2626", progress: 80, topics: 10, description: "Sog'lom hayot va Sport" },
  { id: "harbiy", name: "Harbiy tayyorgarlik", icon: "🪖", color: "#64748B", progress: 10, topics: 10, description: "Vatan himoyasi asoslari" },
  { id: "matematika", name: "Matematika", icon: "📊", color: "#7C3AED", progress: 20, topics: 45, description: "Hosila, Integral va Statistika" },
  { id: "ingliz", name: "Ingliz tili", icon: "🇬🇧", color: "#2563EB", progress: 30, topics: 45, description: "Grammar, IELTS va Speaking" },
  { id: "dasturlash", name: "Dasturlash (Python)", icon: "🐍", color: "#059669", progress: 15, topics: 45, description: "Python, OOP va Algoritmlar" },
];

// 7-sinf fanlari
export const FANS_7 = [
  { id: "fizika7", name: "Fizika", icon: "⚛️", color: "#D97706", progress: 0, topics: 68, description: "Mexanika, Issiqlik, Elektr va Optika", sinf: 7 },
  { id: "algebra7", name: "Algebra", icon: "🧮", color: "#7C3AED", progress: 0, topics: 7, description: "Sonlar, tenglamalar, foizlar", sinf: 7 },
  { id: "geometriya7", name: "Geometriya", icon: "📐", color: "#059669", progress: 0, topics: 6, description: "Shakllar, o'lchashlar", sinf: 7 },
  { id: "kimyo7", name: "Kimyo", icon: "🧪", color: "#DC2626", progress: 0, topics: 5, description: "Moddalar va reaksiyalar", sinf: 7 },
];

export const TOPICS_MAP_7 = {
  fizika7: fizika7Topics,
  algebra7: algebra7Topics,
  geometriya7: geometriya7Topics,
  kimyo7: kimyo7Topics,
};

// 1-kurs fanlari
export const FANS_1KURS = [
  { id: "fizika1", name: "Fizika", icon: "⚛️", color: "#D97706", progress: 0, topics: 5, description: "Mexanika, Termodinamika, Elektrostatika", kurs: 1 },
  { id: "algebra1", name: "Algebra", icon: "🧮", color: "#7C3AED", progress: 0, topics: 5, description: "To'plamlar, Funksiyalar, Tenglamalar", kurs: 1 },
  { id: "geometriya1", name: "Geometriya", icon: "📐", color: "#059669", progress: 0, topics: 5, description: "Vektorlar, To'g'ri chiziq, Tekislik", kurs: 1 },
  { id: "kimyo1", name: "Kimyo", icon: "🧪", color: "#DC2626", progress: 0, topics: 5, description: "Davriy qonun, Bog'lanish, Reaksiyalar", kurs: 1 },
  { id: "biologiya1", name: "Biologiya", icon: "🧬", color: "#DB2777", progress: 0, topics: 5, description: "Hujayra, DNK, Genetika", kurs: 1 },
];

export const TOPICS_MAP_1KURS = {
  fizika1: fizika1Topics,
  algebra1: algebra1Topics,
  geometriya1: geometriya1Topics,
  kimyo1: kimyo1Topics,
  biologiya1: biologiya1Topics,
};

export const TOPICS_MAP = {
  onatili: onatiliTopics,
  algebra: algebraTopics,
  geometriya: geometriyaTopics,
  fizika: fizikaTopics,
  kimyo: kimyoTopics,
  biologiya: biologiyaTopics,
  oztarix: oztarixTopics,
  jahontarix: jahontarixTopics,
  tarbiya: tarbiyaTopics,
  informatika: informatikaTopics,
  fizra: fizraTopics,
  harbiy: harbiyTopics,
  matematika: matematikaTopics,
  ingliz: inglizTopics,
  dasturlash: dasturlashTopics,
};

export const LESSON_STEPS = [
  { icon: "🎯", name: "Kirish", short: "Kirish" },
  { icon: "🎬", name: "Video", short: "Video" },
  { icon: "🔬", name: "Lab", short: "Lab" },
  { icon: "🤖", name: "AI Ustoz", short: "AI" },
  { icon: "❓", name: "Quiz", short: "Quiz" },
  { icon: "✍️", name: "Mashq", short: "Mashq" },
  { icon: "📝", name: "Vazifa", short: "Vazifa" },
  { icon: "🎮", name: "O'yin", short: "O'yin" },
];

export const USER_PROFILE = {
  name: "Aziz Toshmatov", initials: "AT",
  university: "TATU", course: "1-kurs Informatika",
  streak: 12, bestStreak: 18, totalLessons: 47, totalHours: 126,
  totalScore: 1250, averageScore: 85,
  badges: [{ icon: "🚀", name: "Boshlang'ich", earned: true }, { icon: "🏆", name: "Chempion", earned: false }],
  weaknesses: [
    { topic: "Fizika: Nyuton 2-qonuni", level: "low", tag: "Zaif" },
    { topic: "Matematika: Integrallar", level: "mid", tag: "O'rta" },
  ],
  homework: [{ task: "Dasturlash: Loop loyihasi", status: "pending", date: "1-aprel" }],
};

export const AI_RECOMMENDATIONS = [
  { icon: "⚠️", text: "Fizika: Nyuton qonunlari bo'yicha mashqlar kam.", color: "#D97706" },
];

// ===== YouTube QIDIRUV YORDAMCHI FUNKSIYA =====
export function getYouTubeSearchUrl(topicName, fanName) {
  const query = encodeURIComponent(`${topicName} ${fanName || ""} dars o'zbek tilida`);
  return `https://www.youtube.com/results?search_query=${query}`;
}

export function getYouTubeEmbedSearch(topicName, fanName) {
  const query = encodeURIComponent(`${topicName} ${fanName || ""} dars o'zbek tilida`);
  return `https://www.youtube.com/embed?listType=search&list=${query}`;
}
