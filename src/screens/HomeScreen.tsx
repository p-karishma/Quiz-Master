import React from 'react';
import {
  Play,
  Trophy,
  Target,
  Sparkles,
  Layers,
  PlusCircle,
  BarChart3,
  Flame,
  ChevronRight,
  BookOpenCheck,
} from 'lucide-react';
import { CATEGORIES } from '../data/initialQuestions';
import { CategoryInfo, ScreenType } from '../types/quiz';
import { UserStats } from '../services/storageService';
import { CategoryIcon } from '../components/CategoryIcon';
import { playTapSound } from '../utils/soundEffects';

interface HomeScreenProps {
  userStats: UserStats;
  totalCustomQuestions: number;
  totalAvailableQuestions: number;
  onNavigate: (screen: ScreenType) => void;
  onSelectCategory: (category: CategoryInfo) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userStats,
  totalCustomQuestions,
  totalAvailableQuestions,
  onNavigate,
  onSelectCategory,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning, Scholar! ☀️';
    if (hour < 17) return 'Good Afternoon, Scholar! 🌤️';
    return 'Good Evening, Scholar! 🌙';
  };

  return (
    <div className="flex-1 flex flex-col gap-6 pb-8">
      {/* Hero Welcome Card (Material 3 Surface) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white p-6 sm:p-8 shadow-xl shadow-indigo-900/20">
        {/* Subtle background decorative shapes */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-12 top-6 w-24 h-24 rounded-full bg-violet-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Learning Hub</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-white">
            {getGreeting()}
          </h2>

          <p className="text-sm text-indigo-100 max-w-md leading-relaxed mb-6">
            Sharpen your intellect with questions across 8 domains, create custom exams, or tackle timed challenges.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                playTapSound();
                onSelectCategory(CATEGORIES[0]);
              }}
              className="px-6 py-3.5 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm flex items-center gap-2 shadow-lg shadow-black/10 transition-all active:scale-98 cursor-pointer min-h-[48px]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Rapid Quiz</span>
            </button>

            <button
              onClick={() => {
                playTapSound();
                onNavigate('categories');
              }}
              className="px-5 py-3.5 rounded-2xl bg-indigo-500/30 hover:bg-indigo-500/40 text-white font-semibold text-sm border border-white/20 transition-all cursor-pointer min-h-[48px] flex items-center gap-1.5"
            >
              <span>Explore Categories</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Highest Score */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Highest Score</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
            {userStats.highestScore}
            <span className="text-xs font-normal text-slate-500 ml-1">pts</span>
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Best: {userStats.highestPercentage}% accuracy
          </span>
        </div>

        {/* Quizzes Taken */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Completed</span>
            <BookOpenCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
            {userStats.totalQuizzesTaken}
            <span className="text-xs font-normal text-slate-500 ml-1">quizzes</span>
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {userStats.totalQuestionsAnswered} answered
          </span>
        </div>

        {/* Global Accuracy */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Accuracy</span>
            <Target className="w-4 h-4 text-sky-500" />
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
            {userStats.globalAccuracyPercentage}%
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {userStats.totalCorrectAnswers} correct
          </span>
        </div>

        {/* Total Bank Questions */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Total Questions</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
            {totalAvailableQuestions}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {totalCustomQuestions} custom built
          </span>
        </div>
      </div>

      {/* Quick Access Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Create Custom Question Card */}
        <button
          onClick={() => {
            playTapSound();
            onNavigate('add_question');
          }}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 shadow-xs flex items-center gap-4 transition-all group text-left cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Create Custom Questions
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Design questions, set 4 options, and quiz yourself or peers
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Leaderboard Card */}
        <button
          onClick={() => {
            playTapSound();
            onNavigate('leaderboard');
          }}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 shadow-xs flex items-center gap-4 transition-all group text-left cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Leaderboard & History
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Review previous attempts, best scores, and accuracy trends
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Available Quiz Categories Preview Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              Quiz Categories
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any category to configure timer & start
            </p>
          </div>
          <button
            onClick={() => {
              playTapSound();
              onNavigate('categories');
            }}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All (8)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4x2 Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                playTapSound();
                onSelectCategory(cat);
              }}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer min-h-[110px]"
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-2 shadow-xs group-hover:scale-105 transition-transform"
                style={{ backgroundColor: cat.color }}
              >
                <CategoryIcon name={cat.iconName} className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {cat.name}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>8+ Questions</span>
                  <span>·</span>
                  <span>MCQ</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
