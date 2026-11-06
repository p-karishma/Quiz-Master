import { INITIAL_QUESTIONS } from '../data/initialQuestions';
import { Question, QuizAttempt } from '../types/quiz';

const STORAGE_KEYS = {
  CUSTOM_QUESTIONS: 'quizmaster_custom_questions',
  QUIZ_HISTORY: 'quizmaster_quiz_history',
  USER_PROFILE: 'quizmaster_user_profile',
  PREFERENCES: 'quizmaster_preferences',
};

export interface UserStats {
  highestScore: number;
  highestPercentage: number;
  totalQuizzesTaken: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  globalAccuracyPercentage: number;
  bestCategory: string;
}

// Get all custom questions created by the user
export const getCustomQuestions = (): Question[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load custom questions', e);
    return [];
  }
};

// Save a new custom question or update an existing one
export const saveCustomQuestion = (question: Question): boolean => {
  try {
    const existing = getCustomQuestions();
    const index = existing.findIndex((q) => q.id === question.id);
    if (index >= 0) {
      existing[index] = question;
    } else {
      existing.unshift(question);
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(existing));
    return true;
  } catch (e) {
    console.error('Failed to save custom question', e);
    return false;
  }
};

// Delete a custom question
export const deleteCustomQuestion = (questionId: string): boolean => {
  try {
    const existing = getCustomQuestions();
    const filtered = existing.filter((q) => q.id !== questionId);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Failed to delete custom question', e);
    return false;
  }
};

// Combine initial questions with custom questions
export const getAllAvailableQuestions = (): Question[] => {
  const custom = getCustomQuestions();
  return [...custom, ...INITIAL_QUESTIONS];
};

// Get questions by category
export const getQuestionsForCategory = (
  categoryId: string,
  options?: { customOnly?: boolean; limit?: number }
): Question[] => {
  let list = getAllAvailableQuestions().filter((q) => q.categoryId === categoryId);
  if (options?.customOnly) {
    list = list.filter((q) => q.isCustom);
  }
  // Shuffle array for fresh quiz experience
  const shuffled = [...list].sort(() => Math.random() - 0.5);
  if (options?.limit && options.limit > 0) {
    return shuffled.slice(0, options.limit);
  }
  return shuffled;
};

// Save completed quiz attempt to history
export const saveQuizAttempt = (attempt: QuizAttempt): void => {
  try {
    const history = getQuizHistory();
    history.unshift(attempt);
    localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save quiz attempt', e);
  }
};

// Retrieve quiz history
export const getQuizHistory = (): QuizAttempt[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to retrieve quiz history', e);
    return [];
  }
};

// Clear all quiz history
export const clearQuizHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.QUIZ_HISTORY);
  } catch (e) {
    console.error('Failed to clear quiz history', e);
  }
};

// Calculate user statistics from history
export const getUserStats = (): UserStats => {
  const history = getQuizHistory();
  if (history.length === 0) {
    return {
      highestScore: 0,
      highestPercentage: 0,
      totalQuizzesTaken: 0,
      totalQuestionsAnswered: 0,
      totalCorrectAnswers: 0,
      globalAccuracyPercentage: 0,
      bestCategory: 'None yet',
    };
  }

  let highestScore = 0;
  let highestPercentage = 0;
  let totalQuestions = 0;
  let totalCorrect = 0;
  const categoryScores: Record<string, { correct: number; total: number; name: string }> = {};

  history.forEach((att) => {
    if (att.score > highestScore) highestScore = att.score;
    if (att.percentage > highestPercentage) highestPercentage = att.percentage;
    totalQuestions += att.totalQuestions;
    totalCorrect += att.correctAnswers;

    if (!categoryScores[att.categoryId]) {
      categoryScores[att.categoryId] = { correct: 0, total: 0, name: att.categoryName };
    }
    categoryScores[att.categoryId].correct += att.correctAnswers;
    categoryScores[att.categoryId].total += att.totalQuestions;
  });

  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Find best performing category
  let bestCategoryName = 'General Knowledge';
  let bestCatRate = -1;
  Object.values(categoryScores).forEach((cat) => {
    const rate = cat.total > 0 ? cat.correct / cat.total : 0;
    if (rate > bestCatRate) {
      bestCatRate = rate;
      bestCategoryName = cat.name;
    }
  });

  return {
    highestScore,
    highestPercentage,
    totalQuizzesTaken: history.length,
    totalQuestionsAnswered: totalQuestions,
    totalCorrectAnswers: totalCorrect,
    globalAccuracyPercentage: accuracy,
    bestCategory: bestCategoryName,
  };
};

// Export user data as JSON
export const exportUserData = (): string => {
  const customQuestions = getCustomQuestions();
  const history = getQuizHistory();
  return JSON.stringify({
    customQuestions,
    history,
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  }, null, 2);
};

// Import user data from JSON
export const importUserData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (Array.isArray(data.customQuestions)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(data.customQuestions));
    }
    if (Array.isArray(data.history)) {
      localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(data.history));
    }
    return true;
  } catch (e) {
    console.error('Failed to parse backup data', e);
    return false;
  }
};
