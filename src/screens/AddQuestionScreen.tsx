import React, { useState } from 'react';
import {
  PlusCircle,
  Check,
  AlertCircle,
  Trash2,
  HelpCircle,
  Layers,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { CATEGORIES } from '../data/initialQuestions';
import { Question } from '../types/quiz';
import { playTapSound, playCorrectSound } from '../utils/soundEffects';

interface AddQuestionScreenProps {
  customQuestions: Question[];
  onSaveQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
}

export const AddQuestionScreen: React.FC<AddQuestionScreenProps> = ({
  customQuestions,
  onSaveQuestion,
  onDeleteQuestion,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');

  // Form Fields
  const [categoryId, setCategoryId] = useState<string>(CATEGORIES[0].id);
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(0);
  const [explanation, setExplanation] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successToast, setSuccessToast] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!questionText.trim()) {
      newErrors.question = 'Question text cannot be empty.';
    } else if (questionText.trim().length < 8) {
      newErrors.question = 'Question must be at least 8 characters long.';
    }

    if (!optionA.trim()) newErrors.optionA = 'Option A is required.';
    if (!optionB.trim()) newErrors.optionB = 'Option B is required.';
    if (!optionC.trim()) newErrors.optionC = 'Option C is required.';
    if (!optionD.trim()) newErrors.optionD = 'Option D is required.';

    // Check for distinct options
    const optionsArray = [optionA.trim().toLowerCase(), optionB.trim().toLowerCase(), optionC.trim().toLowerCase(), optionD.trim().toLowerCase()];
    const uniqueOptions = new Set(optionsArray.filter(Boolean));
    if (uniqueOptions.size < 4 && !newErrors.optionA && !newErrors.optionB && !newErrors.optionC && !newErrors.optionD) {
      newErrors.duplicate = 'All four options must be unique and distinct.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playTapSound();

    if (!validateForm()) return;

    const selectedCat = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];

    const newQuestion: Question = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      categoryId: selectedCat.id,
      categoryName: selectedCat.name,
      question: questionText.trim(),
      options: [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()],
      correctAnswerIndex,
      explanation: explanation.trim() || `The correct answer is "${[optionA, optionB, optionC, optionD][correctAnswerIndex].trim()}".`,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    onSaveQuestion(newQuestion);
    playCorrectSound();

    // Reset Form
    setQuestionText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setExplanation('');
    setCorrectAnswerIndex(0);
    setErrors({});
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  // Pre-fill a sample question for rapid testing
  const handleLoadSample = (sampleType: 'flutter' | 'science' | 'gk') => {
    playTapSound();
    if (sampleType === 'flutter') {
      setCategoryId('programming');
      setQuestionText('What widget in Flutter is used to display an image from an asset bundle?');
      setOptionA('Image.asset');
      setOptionB('Image.network');
      setOptionC('AssetWidget');
      setOptionD('BundleViewer');
      setCorrectAnswerIndex(0);
      setExplanation('Image.asset is the built-in constructor to render local images bundled in pubspec.yaml assets.');
    } else if (sampleType === 'science') {
      setCategoryId('science');
      setQuestionText('What is the powerhouse organelle of eukaryotic plant and animal cells?');
      setOptionA('Nucleolus');
      setOptionB('Mitochondria');
      setOptionC('Golgi apparatus');
      setOptionD('Lysosome');
      setCorrectAnswerIndex(1);
      setExplanation('Mitochondria generate ATP through oxidative phosphorylation.');
    } else {
      setCategoryId('general_knowledge');
      setQuestionText('Which country gifted the iconic Statue of Liberty to the United States in 1886?');
      setOptionA('United Kingdom');
      setOptionB('Germany');
      setOptionC('France');
      setOptionD('Spain');
      setCorrectAnswerIndex(2);
      setExplanation('The Statue of Liberty was a gift from the people of France to celebrate friendship.');
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-5 pb-8">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl">
        <button
          onClick={() => {
            playTapSound();
            setActiveTab('create');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'create'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Question</span>
        </button>

        <button
          onClick={() => {
            playTapSound();
            setActiveTab('manage');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'manage'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>My Custom Questions ({customQuestions.length})</span>
        </button>
      </div>

      {/* Success Banner */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Question successfully saved to device storage and added to quiz bank!</span>
        </div>
      )}

      {activeTab === 'create' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Sample Autofil */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Fill template sample:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleLoadSample('flutter')}
                className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-[11px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Flutter
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('science')}
                className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-[11px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Science
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('gk')}
                className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-[11px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                General
              </button>
            </div>
          </div>

          {/* Select Category */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 block">
              1. Select Quiz Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Question Text */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>2. Enter Question *</span>
              <span className="text-[11px] text-slate-400 font-normal">Min. 8 characters</span>
            </label>
            <textarea
              rows={3}
              value={questionText}
              onChange={(e) => {
                setQuestionText(e.target.value);
                if (errors.question) setErrors({ ...errors, question: '' });
              }}
              placeholder="e.g. What is the output of 2 + 2 in Python?"
              className={`w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none ${
                errors.question ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
              }`}
            />
            {errors.question && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.question}
              </p>
            )}
          </div>

          {/* Options A, B, C, D */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                3. Enter 4 Options & Select Correct Answer *
              </label>
              <span className="text-[11px] text-slate-400">Click radio button for correct</span>
            </div>

            {errors.duplicate && (
              <p className="text-xs text-rose-500 flex items-center gap-1 p-2 bg-rose-50 dark:bg-rose-950/40 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.duplicate}
              </p>
            )}

            {[
              { letter: 'A', value: optionA, setter: setOptionA, error: errors.optionA, idx: 0 },
              { letter: 'B', value: optionB, setter: setOptionB, error: errors.optionB, idx: 1 },
              { letter: 'C', value: optionC, setter: setOptionC, error: errors.optionC, idx: 2 },
              { letter: 'D', value: optionD, setter: setOptionD, error: errors.optionD, idx: 3 },
            ].map(({ letter, value, setter, error, idx }) => {
              const isChecked = correctAnswerIndex === idx;
              return (
                <div key={letter} className="relative">
                  <div className={`p-2 rounded-2xl bg-white dark:bg-slate-900 border flex items-center gap-3 transition-colors ${
                    isChecked
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20'
                      : error
                      ? 'border-rose-500'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}>
                    {/* Radio selector for correct answer */}
                    <button
                      type="button"
                      onClick={() => {
                        playTapSound();
                        setCorrectAnswerIndex(idx);
                      }}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                      title={`Mark Option ${letter} as Correct Answer`}
                    >
                      {isChecked ? <Check className="w-4 h-4" /> : letter}
                    </button>

                    <input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        setter(e.target.value);
                        if (errors.duplicate) setErrors({ ...errors, duplicate: '' });
                      }}
                      placeholder={`Enter Option ${letter}`}
                      className="flex-1 bg-transparent border-0 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden py-1"
                    />

                    {isChecked && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 pr-2 whitespace-nowrap">
                        Correct Answer
                      </span>
                    )}
                  </div>
                  {error && (
                    <p className="text-xs text-rose-500 mt-1 pl-2 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Optional Explanation */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 block">
              4. Explanation / Note (Optional)
            </label>
            <input
              type="text"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Provide why this answer is correct..."
              className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-3 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer min-h-[48px]"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Save Question to Device</span>
          </button>
        </form>
      ) : (
        /* Manage Custom Questions Tab */
        <div className="space-y-3">
          {customQuestions.length === 0 ? (
            <div className="py-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6">
              <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No custom questions created yet
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-4 max-w-xs mx-auto">
                Use the "Create New Question" form to add your own questions. They will persist on your device and can be included in any quiz!
              </p>
              <button
                onClick={() => {
                  playTapSound();
                  setActiveTab('create');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
              >
                Create First Question
              </button>
            </div>
          ) : (
            customQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                      {q.categoryName}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {idx + 1}. {q.question}
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      playTapSound();
                      onDeleteQuestion(q.id);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                    title="Delete custom question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Options list */}
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {q.options.map((opt, optIdx) => {
                    const isCorrect = optIdx === q.correctAnswerIndex;
                    return (
                      <div
                        key={optIdx}
                        className={`p-2 rounded-xl border truncate ${
                          isCorrect
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-200 font-semibold'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="font-bold mr-1">{['A', 'B', 'C', 'D'][optIdx]}:</span>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <p className="text-[11px] text-slate-500 italic pt-1">
                    💡 {q.explanation}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
