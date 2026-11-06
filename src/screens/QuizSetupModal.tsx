import React, { useState } from 'react';
import { X, Play, Clock, HelpCircle, Globe, Sparkles, Loader2 } from 'lucide-react';
import { CategoryInfo, QuizConfig } from '../types/quiz';
import { CategoryIcon } from '../components/CategoryIcon';
import { playTapSound } from '../utils/soundEffects';

interface QuizSetupModalProps {
  category: CategoryInfo;
  availableCount: number;
  customCount: number;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onStartQuiz: (config: QuizConfig) => void;
}

export const QuizSetupModal: React.FC<QuizSetupModalProps> = ({
  category,
  availableCount,
  customCount,
  isOpen,
  isLoading,
  onClose,
  onStartQuiz,
}) => {
  const [questionCount, setQuestionCount] = useState<number>(Math.min(10, Math.max(5, availableCount)));
  const [timerSeconds, setTimerSeconds] = useState<number>(30); // 30s default
  const [useOnlineApi, setUseOnlineApi] = useState<boolean>(false);
  const [customOnly, setCustomOnly] = useState<boolean>(false);

  if (!isOpen) return null;

  const countOptions = [5, 10, 15].filter((n) => n <= Math.max(5, availableCount));
  if (!countOptions.includes(availableCount) && availableCount > 0) {
    countOptions.push(availableCount);
  }

  const handleStart = () => {
    playTapSound();
    onStartQuiz({
      categoryId: category.id,
      categoryName: category.name,
      questionCount: Math.min(questionCount, useOnlineApi ? 10 : availableCount),
      timePerQuestion: timerSeconds,
      useOnlineApi,
      includeCustomOnly: customOnly,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        role="dialog"
      >
        {/* Handle bar on mobile */}
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto sm:hidden -mt-2" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
              style={{ backgroundColor: category.color }}
            >
              <CategoryIcon name={category.iconName} className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {category.name} Quiz
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {availableCount} available question{availableCount === 1 ? '' : 's'}
                {customCount > 0 && ` (${customCount} custom)`}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Count Selector */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            Number of Questions
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 15, Math.max(availableCount, 20)].map((count, idx) => {
              const label = idx === 3 ? `${availableCount} (All)` : `${count}`;
              const isSelected = questionCount === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setQuestionCount(count);
                  }}
                  className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer min-h-[44px] flex items-center justify-center ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timer Per Question */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            Timer Per Question
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { val: 15, label: '15s Fast' },
              { val: 30, label: '30s Std' },
              { val: 45, label: '45s Relax' },
              { val: 0, label: 'No Limit' },
            ].map(({ val, label }) => {
              const isSelected = timerSeconds === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setTimerSeconds(val);
                  }}
                  className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer min-h-[44px] flex items-center justify-center ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Source Options */}
        <div className="space-y-2.5 pt-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Question Source
          </label>

          {/* Toggle: OpenTDB Public Trivia API */}
          {category.openTdbId && (
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-sky-500" />
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                    Fetch Live Questions from OpenTDB
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pull fresh dynamic trivia from the public database
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={useOnlineApi}
                onChange={(e) => {
                  playTapSound();
                  setUseOnlineApi(e.target.checked);
                  if (e.target.checked) setCustomOnly(false);
                }}
                className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500 border-slate-300"
              />
            </label>
          )}

          {/* Toggle: Custom questions only */}
          {customCount > 0 && !useOnlineApi && (
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                  Only User-Created Custom Questions
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Quiz strictly on your {customCount} custom question{customCount === 1 ? '' : 's'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={customOnly}
                onChange={(e) => {
                  playTapSound();
                  setCustomOnly(e.target.checked);
                }}
                className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500 border-slate-300"
              />
            </label>
          )}
        </div>

        {/* Start Button */}
        <button
          type="button"
          onClick={handleStart}
          disabled={isLoading || (customOnly && customCount === 0)}
          className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer min-h-[48px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Fetching Trivia Questions...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Start Quiz Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
