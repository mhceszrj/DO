import { Subject, TopicNode, UserProgress } from './types';

export const SUBJECTS: Record<Subject, { label: string; color: string; icon: string }> = {
  math: { label: '數學資優', color: 'bg-rose-500', icon: '📐' },
  physics: { label: '進階物理', color: 'bg-blue-500', icon: '⚡' },
  chemistry: { label: '奧林匹亞化學', color: 'bg-amber-500', icon: '🧪' },
  biology: { label: '高階生物', color: 'bg-emerald-500', icon: '🧬' },
};

export const INITIAL_PROGRESS: UserProgress = {
  xp: 0,
  level: 1,
  streak: 1,
  lastLoginDate: new Date().toISOString().split('T')[0],
  subjectMastery: {
    math: 20,
    physics: 15,
    chemistry: 10,
    biology: 5,
  },
  topicMastery: {},
  recentActivity: [],
};

// A sample of topics relevant to Taiwan Science Classes (grade 9-10 level)
export const TOPICS: TopicNode[] = [
  // Math
  { id: 'math_num', name: '數論與同餘', subject: 'math', description: '模運算、費馬小定理基礎' },
  { id: 'math_geo', name: '平面幾何進階', subject: 'math', description: '圓冪性質、孟氏定理' },
  { id: 'math_poly', name: '多項式與函數', subject: 'math', description: '根與係數、插值多項式' },
  // Physics
  { id: 'phy_mec', name: '牛頓力學應用', subject: 'physics', description: '斜面、滑輪與摩擦力綜合' },
  { id: 'phy_energy', name: '功與能量', subject: 'physics', description: '力學能守恆、彈性碰撞' },
  { id: 'phy_elec', name: '基本電路學', subject: 'physics', description: '克希荷夫定律初步、電功率' },
  // Chemistry
  { id: 'chem_stoich', name: '化學計量', subject: 'chemistry', description: '限量試劑、濃度換算' },
  { id: 'chem_gas', name: '氣體定律', subject: 'chemistry', description: '理想氣體方程式、分壓' },
  { id: 'chem_acid', name: '酸鹼鹽', subject: 'chemistry', description: 'pH值計算、中和滴定' },
  // Biology
  { id: 'bio_cell', name: '細胞生理', subject: 'biology', description: '胞器功能、滲透壓' },
  { id: 'bio_gen', name: '遺傳法則', subject: 'biology', description: '孟德爾遺傳、性聯遺傳' },
];

export const XP_PER_CORRECT = 50;
export const XP_LEVEL_UP_BASE = 500;
