import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

export const VirtualController: React.FC = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showController, setShowController] = useState(false);

  useEffect(() => {
    const checkTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(checkTouch);
    setShowController(checkTouch); // Auto show on touch devices
  }, []);

  const pressKey = (key: string) => {
    // Dispatch standard keydown event to activate registered handlers in map and battle screens
    const event = new KeyboardEvent('keydown', { key });
    window.dispatchEvent(event);
  };

  if (!showController && !isTouchDevice) {
    // Small toggle pad button on desktop for user preview testing
    return (
      <button
        onClick={() => setShowController(true)}
        className="fixed bottom-4 right-4 z-40 bg-slate-900 border border-emerald-500/30 text-emerald-400 p-2.5 rounded-full text-xs font-mono font-bold shadow-md hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        VIRTUAL PAD
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-16 bg-slate-950/90 border border-emerald-500/25 p-4 rounded-3xl backdrop-blur-md shadow-2xl max-w-lg w-[90%] md:w-auto">
      
      {/* 1. D-Pad direction cross */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Center Hub anchor */}
        <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg z-10" />

        {/* Up arrow */}
        <button
          onTouchStart={() => pressKey('ArrowUp')}
          onClick={() => pressKey('ArrowUp')}
          className="absolute top-0 w-10 h-10 bg-slate-800 border-t border-x border-slate-700 rounded-t-xl flex items-center justify-center text-slate-300 hover:text-emerald-400 active:scale-90 transition-transform cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
        </button>

        {/* Down arrow */}
        <button
          onTouchStart={() => pressKey('ArrowDown')}
          onClick={() => pressKey('ArrowDown')}
          className="absolute bottom-0 w-10 h-10 bg-slate-800 border-b border-x border-slate-700 rounded-b-xl flex items-center justify-center text-slate-300 hover:text-emerald-400 active:scale-90 transition-transform cursor-pointer"
        >
          <ArrowDown className="w-4 h-4" />
        </button>

        {/* Left arrow */}
        <button
          onTouchStart={() => pressKey('ArrowLeft')}
          onClick={() => pressKey('ArrowLeft')}
          className="absolute left-0 w-10 h-10 bg-slate-800 border-l border-y border-slate-700 rounded-l-xl flex items-center justify-center text-slate-300 hover:text-emerald-400 active:scale-90 transition-transform cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Right arrow */}
        <button
          onTouchStart={() => pressKey('ArrowRight')}
          onClick={() => pressKey('ArrowRight')}
          className="absolute right-0 w-10 h-10 bg-slate-800 border-r border-y border-slate-700 rounded-r-xl flex items-center justify-center text-slate-300 hover:text-emerald-400 active:scale-90 transition-transform cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Hide toggle for desktop users testing UI */}
      {!isTouchDevice && (
        <button
          onClick={() => setShowController(false)}
          className="text-[9px] font-mono text-slate-500 hover:text-rose-400 uppercase tracking-widest absolute top-1.5 right-3 cursor-pointer"
        >
          [hide]
        </button>
      )}

      {/* 2. Action buttons (A and B) */}
      <div className="flex gap-4">
        {/* Button B (Back/Cancel) */}
        <div className="flex flex-col items-center gap-1">
          <button
            onTouchStart={() => pressKey('Escape')}
            onClick={() => pressKey('Escape')}
            className="w-12 h-12 rounded-full bg-rose-600/30 border border-rose-500/50 hover:bg-rose-600/40 text-rose-300 font-extrabold flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
          >
            B
          </button>
          <span className="text-[8px] font-mono text-slate-500 uppercase font-semibold">Back</span>
        </div>

        {/* Button A (Select/Accept) */}
        <div className="flex flex-col items-center gap-1">
          <button
            onTouchStart={() => pressKey('Enter')}
            onClick={() => pressKey('Enter')}
            className="w-12 h-12 rounded-full bg-emerald-600/30 border border-emerald-500/50 hover:bg-emerald-600/40 text-emerald-300 font-extrabold flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
          >
            A
          </button>
          <span className="text-[8px] font-mono text-slate-500 uppercase font-semibold">Select</span>
        </div>
      </div>
      
    </div>
  );
};
export default VirtualController;
