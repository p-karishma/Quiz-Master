import React, { useState } from 'react';
import {
  Trophy,
  History,
  Medal,
  Calendar,
  Clock,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  Filter,
  BarChart2,
  Sparkles,
} from 'lucide-react';
import { QuizAttempt } from '../types/quiz';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { exportUserData, importUserData } from '../services/storageService';
import { playTapSound } from '../utils/soundEffects';

interface LeaderboardScreenProps {
  history: QuizAttempt[];
  onClearHistory: () => void;
  onRefreshData: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  history,
  onClearHistory,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'history'>('leaderboard');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [backupToast, setBackupToast] = useState<string | null>(null);

  // Filter history
  const filteredHistory = history.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.categoryId === selectedCategory;
  });

  // Sort by highest score for Leaderboard
  const sortedByScore = [...filteredHistory].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.percentage - a.percentage;
  });

  // Extract unique categories from history
  const historyCategories = Array.from(new Set(history.map((h) => h.categoryId)));

  // Handle Export
  const handleExport = () => {
    playTapSound();
    const dataStr = exportUserData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quizmaster_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setBackupToast('Backup successfully exported!');
    setTimeout(() => setBackupToast(null), 3000);
  };

  // Handle Import
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importUserData(content);
        if (success) {
          onRefreshData();
          setBackupToast('Data restored successfully!');
        } else {
          setBackupToast('Invalid backup file format.');
        }
        setTimeout(() => setBackupToast(null), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex-1 flex flex-col gap-5 pb-8">
      {/* Toast Notification */}
      {backupToast && (
        <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>{backupToast}</span>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl">
        <button
          onClick={() => {
            playTapSound();
            setActiveTab('leaderboard');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'leaderboard'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Leaderboard & Best Scores</span>
        </button>

        <button
          onClick={() => {
            playTapSound();
            setActiveTab('history');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4 text-sky-500" />
          <span>Attempt History ({history.length})</span>
        </button>
      </div>

      {/* Category Filter & Utilities Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {historyCategories.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-semibold py-1.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              {historyCategories.map((catId) => {
                const sample = history.find((h) => h.categoryId === catId);
                return (
                  <option key={catId} value={catId}>
                    {sample ? sample.categoryName : catId}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Data Import/Export Tools */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleExport}
            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export local data to JSON file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <label
            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Import backup JSON file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          {history.length > 0 && (
            <button
              onClick={() => {
                playTapSound();
                setShowClearDialog(true);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Clear all quiz history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Rendering */}
      {history.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6">
          <BarChart2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No quiz records yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Take your first quiz from the Home or Categories screen to see your highest scores and track performance here.
          </p>
        </div>
      ) : activeTab === 'leaderboard' ? (
        /* Leaderboard View */
        <div className="space-y-3">
          {sortedByScore.map((att, rank) => {
            const isTop1 = rank === 0;
            const isTop2 = rank === 1;
            const isTop3 = rank === 2;

            let rankBadge = (
              <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
                #{rank + 1}
              </span>
            );

            if (isTop1) {
              rankBadge = (
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 ring-2 ring-amber-400/40">
                  🥇
                </div>
              );
            } else if (isTop2) {
              rankBadge = (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0 ring-2 ring-slate-400/40">
                  🥈
                </div>
              );
            } else if (isTop3) {
              rankBadge = (
                <div className="w-8 h-8 rounded-full bg-amber-700/20 text-amber-800 dark:text-amber-500 flex items-center justify-center font-bold text-xs shrink-0 ring-2 ring-amber-600/40">
                  🥉
                </div>
              );
            }

            return (
              <div
                key={att.id}
                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border flex items-center justify-between gap-3 transition-all ${
                  isTop1
                    ? 'border-amber-300 dark:border-amber-800 shadow-sm ring-1 ring-amber-400/20'
                    : 'border-slate-200/80 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {rankBadge}
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {att.categoryName}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{att.formattedDate}</span>
                      <span>·</span>
                      <span>{att.correctAnswers}/{att.totalQuestions} correct</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                    {att.score} <span className="text-xs font-semibold text-slate-400">pts</span>
                  </div>
                  <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {att.percentage}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Chronological History View */
        <div className="space-y-3">
          {filteredHistory.map((att) => (
            <div
              key={att.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {att.categoryName}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    att.percentage >= 75
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : att.percentage >= 50
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}>
                    {att.percentage}%
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {att.formattedDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    {att.correctAnswers}/{att.totalQuestions}
                  </span>
                  {att.timeTakenSeconds > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-500" />
                      {att.timeTakenSeconds}s
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tabular-nums block">
                  +{att.score} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear History Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showClearDialog}
        title="Clear Quiz History?"
        message="This action will permanently delete all your quiz history, leaderboard rankings, and saved attempts. Custom questions will remain safe."
        confirmLabel="Clear All History"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={() => {
          setShowClearDialog(false);
          onClearHistory();
        }}
        onCancel={() => setShowClearDialog(false)}
      />
    </div>
  );
};
