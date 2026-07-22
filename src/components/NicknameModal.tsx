import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Sparkles } from 'lucide-react';

interface NicknameModalProps {
  id: string;
  defaultName: string;
  onClose: () => void;
}

export const NicknameModal: React.FC<NicknameModalProps> = ({
  id,
  defaultName,
  onClose
}) => {
  const { renamePokemon } = useGame();
  const [nickname, setNickname] = useState(defaultName.toUpperCase());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = nickname.trim() || defaultName;
    renamePokemon(id, finalName);
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      
      {/* Outer container */}
      <form 
        onSubmit={handleSave}
        className="w-full max-w-md bg-gray-900 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl relative flex flex-col gap-6 scanlines overflow-hidden select-none"
      >
        {/* Background ambient light */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />
        
        {/* Header Title */}
        <div className="flex flex-col gap-1.5 text-center">
          <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-extrabold uppercase flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" />
            Pokémon Capture Success
          </span>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">
            Nickname Caught Pokémon
          </h2>
        </div>

        {/* Descriptor */}
        <div className="text-center">
          <p className="text-xs text-gray-400 leading-relaxed font-mono">
            Would you like to give a custom nickname to your newly caught{' '}
            <span className="text-emerald-400 font-bold">{defaultName.toUpperCase()}</span>?
          </p>
        </div>

        {/* Input area */}
        <div className="flex flex-col gap-1">
          <input
            ref={inputRef}
            type="text"
            maxLength={12}
            value={nickname}
            onChange={(e) => setNickname(e.target.value.toUpperCase())}
            placeholder={defaultName.toUpperCase()}
            className="w-full py-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-xl font-mono font-black text-emerald-300 uppercase tracking-widest outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
          />
          <span className="text-[8px] font-mono text-gray-500 text-center uppercase tracking-wide mt-1">
            Max 12 Characters — Uppercase Auto-format
          </span>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <button
            type="button"
            onClick={handleSkip}
            className="py-3 bg-slate-800 border border-slate-700 hover:bg-slate-750 text-gray-300 font-bold text-xs tracking-wider rounded-xl transition-all active:scale-95 uppercase cursor-pointer"
          >
            Skip / Keep Name
          </button>
          <button
            type="submit"
            className="py-3 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white font-extrabold text-xs tracking-wider rounded-xl transition-all shadow-md active:scale-95 uppercase cursor-pointer"
          >
            Save Nickname
          </button>
        </div>
      </form>
    </div>
  );
};
