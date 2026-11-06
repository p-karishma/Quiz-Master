import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Smartphone, Monitor } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  isFrameMode: boolean;
  onToggleFrameMode: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isFrameMode,
  onToggleFrameMode,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours % 12 || 12}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!isFrameMode) {
    // Fullscreen responsive layout
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col">
          {children}
        </main>
      </div>
    );
  }

  // Simulated Android Smartphone Frame (Pixel 8 / Material 3)
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-6 transition-colors">
      {/* Device Mode Switcher Floating Badge */}
      <div className="mb-3 hidden sm:flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm text-xs text-slate-600 dark:text-slate-300">
        <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
        <span className="font-medium">Android Preview (Pixel 8 / Material 3)</span>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <button
          onClick={onToggleFrameMode}
          className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
        >
          <Monitor className="w-3 h-3" />
          Switch to Fullscreen
        </button>
      </div>

      {/* Phone Body */}
      <div className="relative w-full max-w-[420px] h-[860px] max-h-[95vh] bg-slate-900 rounded-[48px] p-3 shadow-2xl ring-1 ring-slate-800/80 shadow-slate-900/40 flex flex-col">
        {/* Outer Phone Bezel Buttons */}
        <div className="absolute -left-[5px] top-28 w-[5px] h-12 bg-slate-700 rounded-l-md" />
        <div className="absolute -left-[5px] top-44 w-[5px] h-12 bg-slate-700 rounded-l-md" />
        <div className="absolute -right-[5px] top-32 w-[5px] h-16 bg-slate-700 rounded-r-md" />

        {/* Screen Bezel & Display */}
        <div className="relative flex-1 w-full h-full bg-slate-50 dark:bg-slate-950 rounded-[40px] overflow-hidden flex flex-col border border-slate-800/40 select-none">
          {/* Android Status Bar */}
          <div className="h-10 px-6 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0 select-none z-30 bg-transparent">
            {/* Clock */}
            <span>{currentTime}</span>

            {/* Camera Punch Hole */}
            <div className="w-4 h-4 bg-black rounded-full ring-2 ring-slate-800/30 shrink-0" />

            {/* Android Icons */}
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              {/* Cellular signal */}
              <div className="flex items-end gap-[1.5px] h-3">
                <span className="w-0.5 h-1 bg-current rounded-xs" />
                <span className="w-0.5 h-1.5 bg-current rounded-xs" />
                <span className="w-0.5 h-2 bg-current rounded-xs" />
                <span className="w-0.5 h-2.5 bg-current rounded-xs" />
              </div>
              <Wifi className="w-3.5 h-3.5" />
              <BatteryMedium className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Android App Screen Viewport */}
          <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col relative">
            {children}
          </div>

          {/* Android Gesture Bar */}
          <div className="h-5 flex items-center justify-center shrink-0 z-30 bg-transparent">
            <div className="w-32 h-1 bg-slate-400 dark:bg-slate-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
