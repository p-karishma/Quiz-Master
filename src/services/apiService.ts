import { CategoryId, Question } from '../types/quiz';
import { getQuestionsForCategory } from './storageService';

// Decode HTML entities commonly returned by OpenTDB
function decodeHtmlEntities(str: string): string {
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

interface OpenTdbQuestion {
  category: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface OpenTdbResponse {
  response_code: number;
  results: OpenTdbQuestion[];
}

export const fetchQuestionsFromApi = async (
  categoryId: CategoryId,
  openTdbId: number | undefined,
  categoryName: string,
  amount: number = 10
): Promise<Question[]> => {
  if (!openTdbId) {
    return getQuestionsForCategory(categoryId, { limit: amount });
  }

  try {
    const url = `https://opentdb.com/api.php?amount=${amount}&category=${openTdbId}&type=multiple`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    
    if (!response.ok) {
      throw new Error(`OpenTDB error: ${response.statusText}`);
    }

    const data: OpenTdbResponse = await response.json();

    if (data.response_code !== 0 || !data.results || data.results.length === 0) {
      console.warn('OpenTDB returned response_code', data.response_code, '- falling back to built-in bank');
      return getQuestionsForCategory(categoryId, { limit: amount });
    }

    // Convert each OpenTDB item into our Question format
    const transformed: Question[] = data.results.map((item, index) => {
      const decodedQuestion = decodeHtmlEntities(item.question);
      const decodedCorrect = decodeHtmlEntities(item.correct_answer);
      const decodedIncorrect = item.incorrect_answers.map(decodeHtmlEntities);

      // Randomly position correct answer among options
      const allOptions = [...decodedIncorrect];
      const correctIndex = Math.floor(Math.random() * 4);
      allOptions.splice(correctIndex, 0, decodedCorrect);

      return {
        id: `api_${openTdbId}_${Date.now()}_${index}`,
        categoryId,
        categoryName,
        question: decodedQuestion,
        options: allOptions.slice(0, 4) as [string, string, string, string],
        correctAnswerIndex: correctIndex,
        difficulty: item.difficulty,
        explanation: `The verified correct answer is "${decodedCorrect}".`,
      };
    });

    return transformed;
  } catch (err) {
    console.warn('Network issue fetching from OpenTDB API, seamlessly using local question bank:', err);
    return getQuestionsForCategory(categoryId, { limit: amount });
  }
};
