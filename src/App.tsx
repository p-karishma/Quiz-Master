/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Home as HomeIcon,
  Grid,
  PlusCircle,
  Trophy,
} from 'lucide-react';

import { CategoryInfo, Question, QuizAttempt, QuizConfig, ScreenType } from './types/quiz';
import { CATEGORIES } from './data/initialQuestions';
import {
  getAllAvailableQuestions,
  getCustomQuestions,
  saveCustomQuestion,
  deleteCustomQuestion,
  getQuizHistory,
  saveQuizAttempt,
  clearQuizHistory,
  getUserStats,
  getQuestionsForCategory,
} from './services/storageService';
import { fetchQuestionsFromApi } from './services/apiService';
import { isSoundEnabled, setSoundEnabled, playTapSound } from './utils/soundEffects';

import { AndroidFrame } from './components/AndroidFrame';
import { Navbar } from './components/Navbar';
import { FlutterCodeModal } from './components/FlutterCodeModal';
import { QuizSetupModal } from './screens/QuizSetupModal';

import { HomeScreen } from './screens/HomeScreen';
import { CategoriesScreen } from './screens/CategoriesScreen';
import { QuizScreen } from './screens/QuizScreen';
import { ResultScreen } from './screens/ResultScreen';
import { AddQuestionScreen } from './screens/AddQuestionScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';

export default function App() {
  // Navigation & Screen state
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [screenTitle, setScreenTitle] = useState<string>('QuizMaster');

  // App Settings & Preferences
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('quizmaster_dark_mode');
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const [isFrameMode, setIsFrameMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('quizmaster_frame_mode');
      if (saved !== null) return JSON.parse(saved);
      // Default to true on larger screens to simulate the requested Android experience
      return window.innerWidth >= 640;
    } catch {
      return true;
    }
  });

  const [isSoundOn, setIsSoundOn] = useState<boolean>(isSoundEnabled);
  const [showFlutterCode, setShowFlutterCode] = useState(false);

  // Data State
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Active Quiz State
  const [setupCategory, setSetupCategory] = useState<CategoryInfo | null>(null);
  const [isQuizConfigLoading, setIsQuizConfigLoading] = useState(false);
  const [activeQuizConfig, setActiveQuizConfig] = useState<QuizConfig | null>(null);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<Question[]>([]);
  const [latestAttempt, setLatestAttempt] = useState<QuizAttempt | null>(null);

  // Sync Dark Mode to DOM
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('quizmaster_dark_mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Load Custom Questions and History
  useEffect(() => {
    setCustomQuestions(getCustomQuestions());
    setHistory(getQuizHistory());
  }, [refreshTrigger]);

  const userStats = useMemo(() => getUserStats(), [history, refreshTrigger]);
  const allAvailableQuestions = useMemo(() => getAllAvailableQuestions(), [customQuestions]);

  // Handlers
  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleToggleFrameMode = () => {
    setIsFrameMode((prev) => {
      const next = !prev;
      localStorage.setItem('quizmaster_frame_mode', JSON.stringify(next));
      return next;
    });
  };

  const handleToggleSound = () => {
    const next = !isSoundOn;
    setIsSoundOn(next);
    setSoundEnabled(next);
  };

  const handleNavigate = (screen: ScreenType) => {
    playTapSound();
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Quiz Setup Modal for a Category
  const handleOpenCategorySetup = (cat: CategoryInfo) => {
    setSetupCategory(cat);
  };

  // Start the Quiz after configuration
  const handleStartQuiz = async (config: QuizConfig) => {
    setIsQuizConfigLoading(true);
    let questionsToUse: Question[] = [];

    if (config.useOnlineApi) {
      const cat = CATEGORIES.find((c) => c.id === config.categoryId);
      questionsToUse = await fetchQuestionsFromApi(
        config.categoryId,
        cat?.openTdbId,
        config.categoryName,
        config.questionCount
      );
    } else {
      questionsToUse = getQuestionsForCategory(config.categoryId, {
        customOnly: config.includeCustomOnly,
        limit: config.questionCount,
      });
    }

    setIsQuizConfigLoading(false);
    setSetupCategory(null);

    if (questionsToUse.length === 0) {
      alert('No questions available matching your selection. Please add questions first!');
      return;
    }

    setActiveQuizConfig(config);
    setActiveQuizQuestions(questionsToUse);
    setCurrentScreen('quiz');
  };

  // Quiz Finished
  const handleFinishQuiz = (attempt: QuizAttempt) => {
    saveQuizAttempt(attempt);
    setLatestAttempt(attempt);
    setHistory(getQuizHistory());
    setRefreshTrigger((prev) => prev + 1);
    setCurrentScreen('result');
  };

  // Exit Quiz
  const handleExitQuiz = () => {
    setActiveQuizConfig(null);
    setActiveQuizQuestions([]);
    setCurrentScreen('home');
  };

  // Restart Quiz with same config
  const handleRestartQuiz = () => {
    if (activeQuizConfig) {
      handleStartQuiz(activeQuizConfig);
    } else {
      setCurrentScreen('categories');
    }
  };

  // Save new custom question
  const handleSaveQuestion = (newQuestion: Question) => {
    saveCustomQuestion(newQuestion);
    setRefreshTrigger((prev) => prev + 1);
  };

  // Delete custom question
  const handleDeleteQuestion = (questionId: string) => {
    deleteCustomQuestion(questionId);
    setRefreshTrigger((prev) => prev + 1);
  };

  // Clear quiz history
  const handleClearHistory = () => {
    clearQuizHistory();
    setHistory([]);
    setRefreshTrigger((prev) => prev + 1);
  };

  // Active question counts for setup modal
  const setupCatCounts = useMemo(() => {
    if (!setupCategory) return { total: 0, custom: 0 };
    const catQuestions = allAvailableQuestions.filter((q) => q.categoryId === setupCategory.id);
    return {
      total: catQuestions.length,
      custom: catQuestions.filter((q) => q.isCustom).length,
    };
  }, [setupCategory, allAvailableQuestions]);

  // Determine if bottom navigation bar should be visible (not during active quiz)
  const showBottomNav = currentScreen !== 'quiz';

  return (
    <AndroidFrame isFrameMode={isFrameMode} onToggleFrameMode={handleToggleFrameMode}>
      {/* Top App Bar */}
      <Navbar
        currentScreen={currentScreen}
        screenTitle={
          currentScreen === 'quiz' && activeQuizConfig
            ? `${activeQuizConfig.categoryName}`
            : undefined
        }
        onNavigate={handleNavigate}
        onBack={
          currentScreen === 'quiz'
            ? undefined // Handled inside QuizScreen via exit dialog
            : currentScreen !== 'home'
            ? () => handleNavigate('home')
            : undefined
        }
        isSoundOn={isSoundOn}
        onToggleSound={handleToggleSound}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        isFrameMode={isFrameMode}
        onToggleFrameMode={handleToggleFrameMode}
        onOpenFlutterCode={() => setShowFlutterCode(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 px-4 sm:px-6 pt-4 pb-20 flex flex-col">
        {currentScreen === 'home' && (
          <HomeScreen
            userStats={userStats}
            totalCustomQuestions={customQuestions.length}
            totalAvailableQuestions={allAvailableQuestions.length}
            onNavigate={handleNavigate}
            onSelectCategory={handleOpenCategorySetup}
          />
        )}

        {currentScreen === 'categories' && (
          <CategoriesScreen
            questions={allAvailableQuestions}
            onSelectCategory={handleOpenCategorySetup}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'quiz' && activeQuizConfig && activeQuizQuestions.length > 0 && (
          <QuizScreen
            config={activeQuizConfig}
            questions={activeQuizQuestions}
            onFinishQuiz={handleFinishQuiz}
            onExitQuiz={handleExitQuiz}
          />
        )}

        {currentScreen === 'result' && latestAttempt && (
          <ResultScreen
            attempt={latestAttempt}
            onRestartQuiz={handleRestartQuiz}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'add_question' && (
          <AddQuestionScreen
            customQuestions={customQuestions}
            onSaveQuestion={handleSaveQuestion}
            onDeleteQuestion={handleDeleteQuestion}
          />
        )}

        {currentScreen === 'leaderboard' && (
          <LeaderboardScreen
            history={history}
            onClearHistory={handleClearHistory}
            onRefreshData={() => setRefreshTrigger((prev) => prev + 1)}
          />
        )}
      </div>

      {/* Mobile Fixed Bottom Navigation Bar (Material 3 Style) */}
      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 max-w-[420px] mx-auto sm:max-w-none">
          <div className="max-w-lg mx-auto grid grid-cols-4 items-center h-16 px-2">
            {/* Nav: Home */}
            <button
              onClick={() => handleNavigate('home')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer min-h-[44px] ${
                currentScreen === 'home'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-full ${currentScreen === 'home' ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''}`}>
                <HomeIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight">Home</span>
            </button>

            {/* Nav: Categories */}
            <button
              onClick={() => handleNavigate('categories')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer min-h-[44px] ${
                currentScreen === 'categories'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-full ${currentScreen === 'categories' ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''}`}>
                <Grid className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight">Categories</span>
            </button>

            {/* Nav: Create Question */}
            <button
              onClick={() => handleNavigate('add_question')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer min-h-[44px] ${
                currentScreen === 'add_question'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-full ${currentScreen === 'add_question' ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''}`}>
                <PlusCircle className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight">Create</span>
            </button>

            {/* Nav: Leaderboard */}
            <button
              onClick={() => handleNavigate('leaderboard')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer min-h-[44px] ${
                currentScreen === 'leaderboard'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-full ${currentScreen === 'leaderboard' ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''}`}>
                <Trophy className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight">Rankings</span>
            </button>
          </div>
        </nav>
      )}

      {/* Category Setup Modal */}
      {setupCategory && (
        <QuizSetupModal
          category={setupCategory}
          availableCount={setupCatCounts.total}
          customCount={setupCatCounts.custom}
          isOpen={!!setupCategory}
          isLoading={isQuizConfigLoading}
          onClose={() => setSetupCategory(null)}
          onStartQuiz={handleStartQuiz}
        />
      )}

      {/* Flutter Source Code Modal */}
      <FlutterCodeModal
        isOpen={showFlutterCode}
        onClose={() => setShowFlutterCode(false)}
      />
    </AndroidFrame>
  );
}
