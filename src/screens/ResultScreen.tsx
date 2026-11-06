import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Home,
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Share2,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
} from 'lucide-react';
import { QuizAttempt, ScreenType } from '../types/quiz';
import { playTapSound, playVictorySound } from '../utils/soundEffects';

interface ResultScreenProps {
  attempt: QuizAttempt;
  onRestartQuiz: () => void;
  onNavigate: (screen: ScreenType) => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  attempt,
  onRestartQuiz,
  onNavigate,
}) => {
  const [showReview, setShowReview] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    // Fire celebratory confetti and play victory audio if score is good (>= 60%)
    if (attempt.percentage >= 60) {
      playVictorySound();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // canvas-confetti error fallback
      }
    }
  }, [attempt.percentage]);

  const getPerformanceMessage = (percent: number) => {
    if (percent >= 90) {
      return {
        badge: 'Outstanding Mastery! 🏆',
        color: 'text-amber-500',
        bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
        subtext: 'Flawless execution! You have demonstrated exceptional command of this subject.',
      };
    }
    if (percent >= 75) {
      return {
        badge: 'Great Performance! 🌟',
        color: 'text-emerald-500',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
        subtext: 'Impressive work! You answered the vast majority of questions correctly.',
      };
    }
    if (percent >= 50) {
      return {
        badge: 'Good Effort! 📚',
        color: 'text-indigo-500',
        bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
        subtext: 'Solid attempt! Review your incorrect answers to elevate your score even higher.',
      };
    }
    return {
      badge: 'Keep Practicing! 💪',
      color: 'text-rose-500',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      subtext: 'Every master begins with curiosity. Try again and turn mistakes into breakthroughs.',
    };
  };

  const performance = getPerformanceMessage(attempt.percentage);

  const handleShare = () => {
    playTapSound();
    const shareText = `🎯 QuizMaster - ${attempt.categoryName}\n` +
      `Score: ${attempt.score} pts (${attempt.percentage}%)\n` +
      `Correct: ${attempt.correctAnswers}/${attempt.totalQuestions}\n` +
      `Date: ${attempt.formattedDate}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 pb-8">
      {/* Result Hero Header */}
      <div className={`p-6 sm:p-8 rounded-3xl border text-center flex flex-col items-center shadow-sm ${performance.bg}`}>
        <div className="w-16 h-16 rounded-3xl bg-white dark:bg-slate-900 shadow-md flex items-center justify-center mb-3">
          <Award className={`w-8 h-8 ${performance.color}`} />
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">
          {performance.badge}
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mb-4">
          {performance.subtext}
        </p>

        {/* Circular Radial Score Badge */}
        <div className="relative w-32 h-32 flex items-center justify-center my-2">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              className="stroke-slate-200 dark:stroke-slate-800 fill-none"
              strokeWidth="9"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              className="stroke-indigo-600 fill-none transition-all duration-1000 ease-out"
              strokeWidth="9"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 * (1 - attempt.percentage / 100)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
              {attempt.percentage}%
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-500">
              Accuracy
            </span>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
          Category: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{attempt.categoryName}</span>
        </div>
      </div>

      {/* 4-Stat Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Questions */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col">
          <span className="text-xs text-slate-500 dark:text-slate-400">Total Questions</span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
            {attempt.totalQuestions}
          </span>
        </div>

        {/* Correct Answers */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Correct</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {attempt.correctAnswers}
          </span>
        </div>

        {/* Incorrect / Missed */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Incorrect</span>
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <span className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
            {attempt.incorrectAnswers + attempt.unanswered}
          </span>
        </div>

        {/* Final Points */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Points Earned</span>
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
            {attempt.score}
          </span>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            playTapSound();
            onRestartQuiz();
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer min-h-[48px]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restart Quiz</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playTapSound();
            onNavigate('home');
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-98 text-slate-800 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer min-h-[48px]"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Share Score Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleShare}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer min-h-[40px]"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copiedShare ? 'Copied to Clipboard!' : 'Share Score Summary'}</span>
        </button>
      </div>

      {/* Detailed Question Review Accordion */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 overflow-hidden">
        <button
          type="button"
          onClick={() => {
            playTapSound();
            setShowReview(!showReview);
          }}
          className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Review Question Breakdown ({attempt.answers.length})
            </span>
          </div>
          {showReview ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showReview && (
          <div className="p-4 pt-0 space-y-4 border-t border-slate-100 dark:border-slate-800/80 mt-2">
            {attempt.answers.map((ans, idx) => (
              <div
                key={ans.questionId || idx}
                className={`p-3.5 rounded-2xl border text-xs ${
                  ans.isCorrect
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                    : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                    {idx + 1}. {ans.questionText}
                  </span>
                  {ans.isCorrect ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-bold shrink-0 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="font-medium">Your Answer: </span>
                    <span className={ans.isCorrect ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400 font-semibold'}>
                      {ans.selectedOptionIndex !== null ? ans.options[ans.selectedOptionIndex] : '(Timed out / Unanswered)'}
                    </span>
                  </div>
                  {!ans.isCorrect && (
                    <div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">Correct Answer: </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {ans.options[ans.correctOptionIndex]}
                      </span>
                    </div>
                  )}
                  {ans.explanation && (
                    <p className="text-[11px] text-slate-500 italic mt-1 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                      💡 {ans.explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
