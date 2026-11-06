export type CategoryId =
  | 'general_knowledge'
  | 'science'
  | 'mathematics'
  | 'computer_science'
  | 'programming'
  | 'sports'
  | 'history'
  | 'english'
  | string;

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  iconName: string;
  description: string;
  color: string;
  accentBg: string;
  textColor: string;
  openTdbId?: number;
}

export interface Question {
  id: string;
  categoryId: CategoryId;
  categoryName: string;
  question: string;
  options: [string, string, string, string]; // Exactly 4 options A, B, C, D
  correctAnswerIndex: number; // 0 for A, 1 for B, 2 for C, 3 for D
  explanation?: string;
  isCustom?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  createdAt?: string;
}

export interface UserAnswerRecord {
  questionId: string;
  questionText: string;
  options: [string, string, string, string];
  selectedOptionIndex: number | null; // null if timed out
  correctOptionIndex: number;
  isCorrect: boolean;
  explanation?: string;
  timeSpentSeconds: number;
}

export interface QuizAttempt {
  id: string;
  categoryId: CategoryId;
  categoryName: string;
  timestamp: number; // unix epoch
  formattedDate: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  score: number; // Points (e.g. 100 pts per correct + speed bonus)
  percentage: number;
  timeTakenSeconds: number;
  answers: UserAnswerRecord[];
}

export interface QuizConfig {
  categoryId: CategoryId;
  categoryName: string;
  questionCount: number;
  timePerQuestion: number; // 0 for unlimited, or 15, 30, 45 seconds
  useOnlineApi?: boolean;
  includeCustomOnly?: boolean;
}

export type ScreenType =
  | 'home'
  | 'categories'
  | 'quiz'
  | 'result'
  | 'add_question'
  | 'leaderboard';
