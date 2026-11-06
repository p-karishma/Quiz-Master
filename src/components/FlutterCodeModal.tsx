import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Layers } from 'lucide-react';
import { FLUTTER_PROJECT_FILES, FlutterFile } from '../data/flutterCode';

interface FlutterCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlutterCodeModal: React.FC<FlutterCodeModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<FlutterFile>(FLUTTER_PROJECT_FILES[1]); // default main.dart
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-4xl h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Flutter 3.35+ & Dart Project Code
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Flutter Application Development Programme Specifications · Provider State Management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File Explorer Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3 overflow-y-auto max-h-48 md:max-h-full">
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 px-3 py-1 mb-1 uppercase tracking-wider">
              Project Structure
            </div>
            <div className="space-y-1">
              {FLUTTER_PROJECT_FILES.map((file) => {
                const isSelected = selectedFile.filename === file.filename;
                return (
                  <button
                    key={file.filename}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2.5 transition-colors cursor-pointer min-h-[40px] ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{file.filename}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col bg-slate-900 text-slate-100 overflow-hidden">
            {/* File info bar */}
            <div className="flex items-center justify-between px-5 py-3 bg-slate-950/80 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-400">{selectedFile.filename}</span>
                <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">{selectedFile.description}</p>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer min-h-[36px]"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy File</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed text-slate-300">
              <pre className="whitespace-pre">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
