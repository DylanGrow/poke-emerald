import React, { useState, useEffect } from 'react';
import { PokemonSprite } from './PokemonSprite';
import { getPokemonById } from '../db/pokemon';
import { sound } from '../utils/sound';
import { Sparkles } from 'lucide-react';

interface EvolutionOverlayProps {
  nickname: string;
  fromName: string;
  toName: string;
  fromId: number;
  toId: number;
  onClose: () => void;
}

export const EvolutionOverlay: React.FC<EvolutionOverlayProps> = ({
  nickname,
  fromName,
  toName,
  fromId,
  toId,
  onClose
}) => {
  const [phase, setPhase] = useState<'evolving' | 'complete'>('evolving');
  const [pulseToggle, setPulseToggle] = useState(false);
  const fromData = getPokemonById(fromId);
  const toData = getPokemonById(toId);

  // Sound triggering and animation timing
  useEffect(() => {
    sound.playEvolution();
    sound.stopBGM(); // Stop battle/route music during evolution

    // Evolve flashing interval
    const pulseInterval = setInterval(() => {
      setPulseToggle(p => !p);
    }, 150);

    // Evolution finishes after 3.6 seconds (20 synth tones duration)
    const timer = setTimeout(() => {
      clearInterval(pulseInterval);
      setPhase('complete');
      sound.playEvolutionComplete();
    }, 3600);

    return () => {
      clearInterval(pulseInterval);
      clearTimeout(timer);
    };
  }, []);

  const handleFinish = () => {
    sound.playSelect();
    sound.playBGM(); // Restore route music
    onClose();
  };

  // Keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && phase === 'complete') {
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  return (
    <div className="fixed inset-0 z-[100] bg-gray-950 flex flex-col items-center justify-center p-6 select-none scanlines relative overflow-hidden">
      
      {/* Retro background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_0.6px,transparent_0.6px)] [background-size:20px_20px] opacity-[0.02]" />
      
      {phase === 'evolving' ? (
        <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />
      ) : (
        <div className="absolute inset-0 bg-amber-500/5 animate-pulse pointer-events-none" />
      )}

      {/* Main Evolve Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 z-10">
        
        {/* Animated Sprite Frame */}
        <div className="w-64 h-64 bg-slate-900/30 border border-slate-800 rounded-3xl flex items-center justify-center shadow-2xl relative">
          
          {phase === 'evolving' ? (
            // Evolving: Alternating opacity and scales to simulate flickering
            <div className="relative w-full h-full flex items-center justify-center">
              <div 
                className="absolute transition-all duration-100 flex items-center justify-center"
                style={{ 
                  opacity: pulseToggle ? 0.9 : 0.1,
                  transform: pulseToggle ? 'scale(1.15)' : 'scale(0.85)',
                  filter: pulseToggle ? 'brightness(1)' : 'brightness(1.8) contrast(1.5)'
                }}
              >
                <PokemonSprite 
                  pokemonId={fromId}
                  color={fromData.color}
                  secondaryColor={fromData.secondaryColor}
                  shapeSeed={fromData.shapeSeed}
                  bodyType={fromData.bodyType}
                  size={160}
                />
              </div>

              <div 
                className="absolute transition-all duration-100 flex items-center justify-center"
                style={{ 
                  opacity: pulseToggle ? 0.1 : 0.9,
                  transform: pulseToggle ? 'scale(0.85)' : 'scale(1.15)',
                  filter: pulseToggle ? 'brightness(1.8) contrast(1.5)' : 'brightness(1)'
                }}
              >
                <PokemonSprite 
                  pokemonId={toId}
                  color={toData.color}
                  secondaryColor={toData.secondaryColor}
                  shapeSeed={toData.shapeSeed}
                  bodyType={toData.bodyType}
                  size={160}
                />
              </div>
            </div>
          ) : (
            // Complete: Show evolved sprite with custom particles
            <div className="relative w-full h-full flex items-center justify-center animate-bounce">
              <div className="absolute w-32 h-32 bg-amber-500/10 rounded-full filter blur-xl animate-ping" />
              <PokemonSprite 
                pokemonId={toId}
                color={toData.color}
                secondaryColor={toData.secondaryColor}
                shapeSeed={toData.shapeSeed}
                bodyType={toData.bodyType}
                size={180}
              />
              
              {/* Sparkles */}
              <Sparkles className="absolute -top-4 -left-4 w-8 h-8 text-yellow-400 animate-spin" />
              <Sparkles className="absolute -bottom-4 -right-4 w-8 h-8 text-amber-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Dialog / Chat Box */}
        <div className="w-full max-w-xl bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col gap-4">
          <div className="text-center font-mono">
            {phase === 'evolving' ? (
              <p className="text-emerald-400 font-extrabold text-sm tracking-wide animate-pulse uppercase">
                What? {nickname === fromName ? fromName.toUpperCase() : `${nickname.toUpperCase()} (${fromName.toUpperCase()})`} is evolving!
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-yellow-400 font-black text-md tracking-wider uppercase">
                  Congratulations!
                </p>
                <p className="text-gray-200 text-xs font-bold leading-relaxed">
                  Your {nickname} evolved into <span className="text-yellow-300 font-extrabold">{toName}</span>!
                </p>
              </div>
            )}
          </div>

          {phase === 'complete' && (
            <button
              onClick={handleFinish}
              className="mt-2 w-full py-3 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white font-extrabold text-xs tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer uppercase"
            >
              Press Space / Enter to continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
