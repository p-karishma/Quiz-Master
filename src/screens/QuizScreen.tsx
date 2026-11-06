import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  LogOut,
  Sparkles,
  Zap,
  Info,
} from 'lucide-react';
import { Question, QuizAttempt, QuizConfig, UserAnswerRecord } from '../types/quiz';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import {
  playTapSound,
  playCorrectSound,
  playWrongSound,
  playTickSound,
} from '../utils/soundEffects';

interface QuizScreenProps {
  config: QuizConfig;
  questions: Question[];
  onFinishQuiz: (attempt: QuizAttempt) => void;
  onExitQuiz: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  config,
  questions,
  onFinishQuiz,
  onExitQuiz,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [lifeline5050Used, setLifeline5050Used] = useState(false);
  const [timeBoostUsed, setTimeBoostUsed] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Timer state
  const timeLimit = config.timePerQuestion > 0 ? config.timePerQuestion : 0;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(timeLimit);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [quizStartTime] = useState<number>(Date.now());

  // Accumulated results
  const [answerRecords, setAnswerRecords] = useState<UserAnswerRecord[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [streakCount, setStreakCount] = useState(0);

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  // Countdown timer logic
  useEffect(() => {
    if (timeLimit === 0 || isAnswerSubmitted) return;

    setSecondsRemaining(timeLimit);
    setQuestionStartTime(Date.now());

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit timeout (unanswered)
          handleTimeExpired();
          return 0;
        }
        if (prev <= 5) {
          playTickSound();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isAnswerSubmitted, timeLimit]);

  const handleTimeExpired = () => {
    if (isAnswerSubmitted) return;
    playWrongSound();
    setIsAnswerSubmitted(true);
    setSelectedOption(null); // timed out
    setStreakCount(0);

    const timeSpent = Math.min(timeLimit, Math.round((Date.now() - questionStartTime) / 1000));
    const record: UserAnswerRecord = {
      questionId: currentQ.id,
      questionText: currentQ.question,
      options: currentQ.options,
      selectedOptionIndex: null,
      correctOptionIndex: currentQ.correctAnswerIndex,
      isCorrect: false,
      explanation: currentQ.explanation,
      timeSpentSeconds: timeSpent,
    };
    setAnswerRecords((prev) => [...prev, record]);
  };

  const handleSelectAnswer = (optionIdx: number) => {
    // Prevent multiple submissions for the same question
    if (isAnswerSubmitted || eliminatedOptions.includes(optionIdx)) return;

    playTapSound();
    setSelectedOption(optionIdx);
    setIsAnswerSubmitted(true);

    const isCorrect = optionIdx === currentQ.correctAnswerIndex;
    const timeSpent = timeLimit > 0 
      ? Math.max(1, timeLimit - secondsRemaining)
      : Math.round((Date.now() - questionStartTime) / 1000);

    // Calculate score points: 100 base + speed bonus + streak bonus
    if (isCorrect) {
      playCorrectSound();
      const speedBonus = timeLimit > 0 ? Math.round((secondsRemaining / timeLimit) * 50) : 10;
      const streakBonus = streakCount * 15;
      setCurrentScore((prev) => prev + 100 + speedBonus + streakBonus);
      setStreakCount((prev) => prev + 1);
    } else {
      playWrongSound();
      setStreakCount(0);
    }

    const record: UserAnswerRecord = {
      questionId: currentQ.id,
      questionText: currentQ.question,
      options: currentQ.options,
      selectedOptionIndex: optionIdx,
      correctOptionIndex: currentQ.correctAnswerIndex,
      isCorrect,
      explanation: currentQ.explanation,
      timeSpentSeconds: timeSpent,
    };
    setAnswerRecords((prev) => [...prev, record]);
  };

  const handleNextQuestion = () => {
    playTapSound();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setEliminatedOptions([]);
    } else {
      // Quiz Finished!
      finalizeQuiz();
    }
  };

  const finalizeQuiz = () => {
    const totalQ = questions.length;
    const correctCount = answerRecords.filter((r) => r.isCorrect).length;
    const incorrectCount = answerRecords.filter((r) => !r.isCorrect && r.selectedOptionIndex !== null).length;
    const unansweredCount = totalQ - (correctCount + incorrectCount);
    const percentage = Math.round((correctCount / totalQ) * 100);
    const totalTimeSeconds = Math.round((Date.now() - quizStartTime) / 1000);

    const attempt: QuizAttempt = {
      id: `attempt_${Date.now()}`,
      categoryId: config.categoryId,
      categoryName: config.categoryName,
      timestamp: Date.now(),
      formattedDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      totalQuestions: totalQ,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      unanswered: unansweredCount,
      score: currentScore,
      percentage,
      timeTakenSeconds: totalTimeSeconds,
      answers: answerRecords,
    };

    onFinishQuiz(attempt);
  };

  // Lifeline: 50/50 eliminate two wrong options
  const handleUse5050 = () => {
    if (lifeline5050Used || isAnswerSubmitted) return;
    playTapSound();
    const wrongIndices = [0, 1, 2, 3].filter((idx) => idx !== currentQ.correctAnswerIndex);
    // Shuffle and pick 2
    const toEliminate = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
    setEliminatedOptions(toEliminate);
    setLifeline5050Used(true);
  };

  // Lifeline: +15s time boost
  const handleTimeBoost = () => {
    if (timeBoostUsed || isAnswerSubmitted || timeLimit === 0) return;
    playTapSound();
    setSecondsRemaining((prev) => prev + 15);
    setTimeBoostUsed(true);
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="flex-1 flex flex-col justify-between gap-4 pb-6 select-none">
      {/* Quiz Top Control Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          {/* Question Counter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Question {currentIndex + 1} of {questions.length}
            </span>
            {streakCount >= 2 && (
              <span className="text-[11px] font-bold text-amber-500 flex items-center gap-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                {streakCount}x Streak
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Countdown Timer */}
            {timeLimit > 0 && (
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  secondsRemaining <= 5
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span className="tabular-nums">{secondsRemaining}s</span>
              </div>
            )}

            {/* Exit Quiz Button */}
            <button
              onClick={() => setShowExitDialog(true)}
              className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Exit Quiz"
              aria-label="Exit ongoing quiz"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Center Question Card */}
      <div className="flex-1 flex flex-col justify-center my-auto">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-5">
          <div className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">
            Category: {config.categoryName}
          </div>
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {currentQ.question}
          </h2>
        </div>

        {/* 4 Multiple Choice Options (A, B, C, D) */}
        <div className="space-y-3">
          {currentQ.options.map((optionText, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.correctAnswerIndex;
            const isEliminated = eliminatedOptions.includes(idx);

            let optionStyle = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-600';
            let badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';

            if (isEliminated) {
              optionStyle = 'opacity-30 line-through bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 pointer-events-none';
            } else if (isAnswerSubmitted) {
              if (isCorrect) {
                // Correct answer is highlighted in green
                optionStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-semibold ring-2 ring-emerald-500/20';
                badgeStyle = 'bg-emerald-500 text-white font-bold';
              } else if (isSelected) {
                // Chosen wrong answer highlighted in red
                optionStyle = 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-100 ring-2 ring-rose-500/20';
                badgeStyle = 'bg-rose-500 text-white font-bold';
              } else {
                optionStyle = 'opacity-50 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800';
              }
            } else if (isSelected) {
              optionStyle = 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-600 text-indigo-900 dark:text-indigo-100 ring-2 ring-indigo-500/20';
              badgeStyle = 'bg-indigo-600 text-white font-bold';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectAnswer(idx)}
                disabled={isAnswerSubmitted || isEliminated}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer min-h-[56px] ${optionStyle}`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${badgeStyle}`}>
                    {optionLetters[idx]}
                  </span>
                  <span className="text-sm sm:text-base leading-snug">
                    {optionText}
                  </span>
                </div>

                {/* State Icons */}
                {isAnswerSubmitted && (
                  <div className="shrink-0">
                    {isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    )}
                    {isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Note when answered */}
        {isAnswerSubmitted && currentQ.explanation && (
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5 animate-in fade-in duration-200">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block mb-0.5">
                Explanation:
              </span>
              <p className="leading-relaxed">{currentQ.explanation}</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Area: Lifelines & Next Question */}
      <div className="pt-2">
        {!isAnswerSubmitted ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Lifelines:
            </span>
            <div className="flex items-center gap-2">
              {/* 50:50 Lifeline */}
              <button
                type="button"
                onClick={handleUse5050}
                disabled={lifeline5050Used}
                className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer min-h-[40px] ${
                  lifeline5050Used
                    ? 'opacity-40 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>50:50</span>
              </button>

              {/* Time Boost (+15s) */}
              {timeLimit > 0 && (
                <button
                  type="button"
                  onClick={handleTimeBoost}
                  disabled={timeBoostUsed}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer min-h-[40px] ${
                    timeBoostUsed
                      ? 'opacity-40 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-sky-500" />
                  <span>+15s Boost</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleNextQuestion}
            className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer min-h-[48px]"
          >
            <span>
              {currentIndex === questions.length - 1 ? 'Finish & See Results' : 'Next Question'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Confirmation Before Exiting Ongoing Quiz */}
      <ConfirmationDialog
        isOpen={showExitDialog}
        title="Exit Ongoing Quiz?"
        message="Are you sure you want to quit? Your current quiz progress and unanswered questions will not be saved."
        confirmLabel="Exit Quiz"
        cancelLabel="Continue Quiz"
        isDestructive={true}
        onConfirm={() => {
          setShowExitDialog(false);
          onExitQuiz();
        }}
        onCancel={() => setShowExitDialog(false)}
      />
    </div>
  );
};
