export type Subject = 'math' | 'physics' | 'chemistry' | 'biology';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topicTag: string;
}

export interface QuizResult {
  totalQuestions: number;
  correctCount: number;
  timestamp: number;
  subject: Subject;
  weakTopics: string[];
}

export interface UserProgress {
  xp: number;
  level: number;
  streak: number;
  lastLoginDate: string;
  subjectMastery: Record<Subject, number>; // 0-100
  topicMastery: Record<string, 'locked' | 'learning' | 'mastered'>;
  recentActivity: QuizResult[];
}

export interface TopicNode {
  id: string;
  name: string;
  subject: Subject;
  description: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  QUIZ_SETUP = 'QUIZ_SETUP',
  QUIZ_SESSION = 'QUIZ_SESSION',
  QUIZ_RESULT = 'QUIZ_RESULT',
  MASTERY_MAP = 'MASTERY_MAP',
}
