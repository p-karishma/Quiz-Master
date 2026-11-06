import React, { useState } from 'react';
import { Search, Sparkles, Filter, ChevronRight, Plus } from 'lucide-react';
import { CATEGORIES } from '../data/initialQuestions';
import { CategoryInfo, Question, ScreenType } from '../types/quiz';
import { CategoryIcon } from '../components/CategoryIcon';
import { playTapSound } from '../utils/soundEffects';

interface CategoriesScreenProps {
  questions: Question[];
  onSelectCategory: (category: CategoryInfo) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({
  questions,
  onSelectCategory,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'custom' | 'api'>('all');

  // Compute question counts for each category
  const getCategoryQuestionCounts = (catId: string) => {
    const catQuestions = questions.filter((q) => q.categoryId === catId);
    const customCount = catQuestions.filter((q) => q.isCustom).length;
    return {
      total: catQuestions.length,
      custom: customCount,
    };
  };

  const filteredCategories = CATEGORIES.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchTerm.toLowerCase());

    const counts = getCategoryQuestionCounts(cat.id);

    if (!matchesSearch) return false;
    if (selectedFilter === 'custom') return counts.custom > 0;
    if (selectedFilter === 'api') return !!cat.openTdbId;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col gap-5 pb-8">
      {/* Top Banner */}
      <div className="p-5 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
          Explore Quiz Categories
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Select a category to customize timer, question counts, or test your custom authored questions.
        </p>
      </div>

      {/* Search Bar & Filter Tabs */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories (e.g. Science, Programming)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl overflow-x-auto">
          <button
            onClick={() => {
              playTapSound();
              setSelectedFilter('all');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Categories ({CATEGORIES.length})
          </button>
          <button
            onClick={() => {
              playTapSound();
              setSelectedFilter('custom');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedFilter === 'custom'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            With Custom Questions
          </button>
          <button
            onClick={() => {
              playTapSound();
              setSelectedFilter('api');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedFilter === 'api'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Live Trivia API Ready
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-3">
        {filteredCategories.length === 0 ? (
          <div className="py-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6">
            <Filter className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No categories match your criteria
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Try adjusting your search query or reset filter.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const counts = getCategoryQuestionCounts(cat.id);
            return (
              <div
                key={cat.id}
                onClick={() => {
                  playTapSound();
                  onSelectCategory(cat);
                }}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-4 group cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-xs"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon name={cat.iconName} className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
                      {cat.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {counts.total} Questions
                      </span>
                      {counts.custom > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-pink-600 dark:text-pink-400 font-medium">
                            {counts.custom} custom
                          </span>
                        </>
                      )}
                      {cat.openTdbId && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-sky-600 dark:text-sky-400">
                            Live API
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                    Take Quiz
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action / Prompt to Add Custom Question */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
            Want to add questions to any category?
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Create custom MCQs with options and explanations.
          </span>
        </div>
        <button
          onClick={() => {
            playTapSound();
            onNavigate('add_question');
          }}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm transition-all cursor-pointer min-h-[40px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </div>
    </div>
  );
};
