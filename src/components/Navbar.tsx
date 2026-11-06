import React from 'react';
import { ArrowLeft, Volume2, VolumeX, Moon, Sun, Code, Sparkles, Monitor, Smartphone } from 'lucide-react';
import { ScreenType } from '../types/quiz';
import { playTapSound } from '../utils/soundEffects';

interface NavbarProps {
  currentScreen: ScreenType;
  screenTitle?: string;
  onNavigate: (screen: ScreenType) => void;
  onBack?: () => void;
  isSoundOn: boolean;
  onToggleSound: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isFrameMode: boolean;
  onToggleFrameMode: () => void;
  onOpenFlutterCode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  screenTitle,
  onNavigate,
  onBack,
  isSoundOn,
  onToggleSound,
  isDarkMode,
  onToggleDarkMode,
  isFrameMode,
  onToggleFrameMode,
  onOpenFlutterCode,
}) => {
  const isHomeScreen = currentScreen === 'home';

  const handleBack = () => {
    playTapSound();
    if (onBack) {
      onBack();
    } else {
      onNavigate('home');
    }
  };

  const getTitle = () => {
    if (screenTitle) return screenTitle;
    switch (currentScreen) {
      case 'home':
        return 'QuizMaster';
      case 'categories':
        return 'Quiz Categories';
      case 'quiz':
        return 'Active Quiz';
      case 'result':
        return 'Quiz Results';
      case 'add_question':
        return 'Create Question';
      case 'leaderboard':
        return 'Leaderboard & History';
      default:
        return 'QuizMaster';
    }
  };

  return (
    <header className="sticky top-0 z-20 px-4 py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
      {/* Left Zone: Back button or Logo icon */}
      <div className="flex items-center gap-2">
        {!isHomeScreen ? (
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
        )}

        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate max-w-[150px] sm:max-w-xs">
          {getTitle()}
        </h1>
      </div>

      {/* Right Zone: Controls */}
      <div className="flex items-center gap-1">
        {/* Flutter Code Button */}
        <button
          onClick={() => {
            playTapSound();
            onOpenFlutterCode();
          }}
          title="Inspect Flutter 3.35 & Dart Source Code"
          className="h-9 px-2.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Code className="w-4 h-4" />
          <span className="hidden sm:inline">Flutter Code</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={() => {
            onToggleSound();
            playTapSound();
          }}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isSoundOn ? 'Mute Sounds' : 'Unmute Sounds'}
          aria-label="Sound settings"
        >
          {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>

        {/* Dark/Light Mode */}
        <button
          onClick={() => {
            onToggleDarkMode();
            playTapSound();
          }}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Device Frame View Toggle */}
        <button
          onClick={() => {
            onToggleFrameMode();
            playTapSound();
          }}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isFrameMode ? 'Switch to Fullscreen Layout' : 'Switch to Android Phone Preview'}
          aria-label="Toggle device frame"
        >
          {isFrameMode ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4 text-indigo-500" />}
        </button>
      </div>
    </header>
  );
};
