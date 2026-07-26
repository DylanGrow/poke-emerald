import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { PokemonSprite } from './PokemonSprite';
import { getPokemonById } from '../db/pokemon';
import { sound } from '../utils/sound';
import { Sparkles } from 'lucide-react';

export const HatchOverlay: React.FC = () => {
  const { hatching, finishHatching } = useGame();
  
  const [stage, setStage] = useState<'oh' | 'shake' | 'burst' | 'baby'>('oh');
  const [isShaking, setIsShaking] = useState(false);
  const [nickname, setNickname] = useState('');

  if (!hatching) return null;

  const babyInfo = getPokemonById(hatching.pokemonId);

  // Auto-progress shake stage
  useEffect(() => {
    if (stage === 'shake') {
      let count = 0;
      const interval = setInterval(() => {
        setIsShaking(true);
        sound.playCatchShake();
        
        setTimeout(() => {
          setIsShaking(false);
          count++;
          if (count >= 3) {
            clearInterval(interval);
            setTimeout(() => {
              setStage('burst');
              sound.playEvolutionComplete();
              setTimeout(() => {
                setStage('baby');
                setNickname(babyInfo.name);
              }, 1000);
            }, 400);
          }
        }, 300);
      }, 900);

      return () => clearInterval(interval);
    }
  }, [stage]);

  const handleTextClick = () => {
    if (stage === 'oh') {
      sound.playSelect();
      setStage('shake');
    }
  };

  const handleFinish = () => {
    sound.playSelect();
    finishHatching(nickname);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-slate-950/95 flex flex-col items-center justify-center p-4 select-none scanlines">
      {/* Visual background bursts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full filter blur-3xl" />
        {stage === 'burst' && (
          <div className="absolute inset-0 bg-white animate-flash z-50" />
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes egg-shake {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-8deg) translateX(-2px); }
          40% { transform: rotate(8deg) translateX(2px); }
          60% { transform: rotate(-5deg) translateX(-1px); }
          80% { transform: rotate(5deg) translateX(1px); }
        }
        .egg-shake-anim {
          animation: egg-shake 0.25s ease-in-out;
        }
        @keyframes light-burst {
          0% { opacity: 0; transform: scale(0.2) rotate(0deg); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: scale(2.5) rotate(180deg); }
        }
        .burst-anim {
          animation: light-burst 1s ease-out forwards;
        }
        @keyframes flash {
          0% { opacity: 0; }
          20% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-flash {
          animation: flash 0.8s ease-out forwards;
        }
      `}} />

      <div className="w-full max-w-md flex flex-col items-center justify-center text-center gap-8 relative z-10">
        
        {/* Animated Sprite Center */}
        <div className="w-48 h-48 flex items-center justify-center relative">
          
          {/* Light burst behind baby */}
          {stage === 'baby' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-40 h-40 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full filter blur-xl animate-pulse" />
              <div className="absolute w-full h-full border border-dashed border-emerald-500/20 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
            </div>
          )}

          {stage === 'burst' && (
            <div className="absolute w-32 h-32 rounded-full bg-white filter blur-md burst-anim flex items-center justify-center" />
          )}

          <div className={isShaking ? 'egg-shake-anim' : ''}>
            {stage !== 'baby' ? (
              <PokemonSprite
                pokemonId={1}
                color="#a7f3d0"
                secondaryColor="#059669"
                shapeSeed={42}
                bodyType={0}
                size={110}
                isEgg={true}
              />
            ) : (
              <div className="scale-125">
                <PokemonSprite
                  pokemonId={hatching.pokemonId}
                  color={babyInfo.color}
                  secondaryColor={babyInfo.secondaryColor}
                  shapeSeed={babyInfo.shapeSeed}
                  bodyType={babyInfo.bodyType}
                  size={90}
                />
              </div>
            )}
          </div>
        </div>

        {/* Dialogue Card */}
        <div 
          onClick={handleTextClick}
          className={`w-full bg-[#080d1a]/90 border border-slate-850 p-6 rounded-2xl flex flex-col items-center gap-4 shadow-xl select-none ${
            stage === 'oh' ? 'cursor-pointer hover:border-emerald-500/30' : ''
          }`}
        >
          {stage === 'oh' && (
            <div className="flex flex-col gap-2 animate-pulse">
              <h2 className="text-xl font-black text-amber-400 tracking-wider">Oh?</h2>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Click to inspect the Egg</span>
            </div>
          )}

          {stage === 'shake' && (
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-bold text-gray-300 font-mono tracking-widest uppercase">The Egg is shaking...</h2>
              <span className="text-[9px] font-mono text-gray-600 uppercase">Wait for it...</span>
            </div>
          )}

          {stage === 'burst' && (
            <h2 className="text-md font-black text-white animate-pulse uppercase tracking-wider">Hatching...</h2>
          )}

          {stage === 'baby' && (
            <div className="flex flex-col gap-4 w-full animate-fade-in">
              <div className="flex flex-col gap-1 items-center">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <h2 className="text-lg font-black text-emerald-400 uppercase tracking-wider">
                    {babyInfo.name} Hatched!
                  </h2>
                </div>
                <p className="text-[11px] font-mono text-gray-400 mt-1">
                  A healthy Level 5 baby hatched from the Egg!
                </p>
              </div>

              {/* Nickname input */}
              <div className="flex flex-col gap-1.5 w-full items-start">
                <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Set Nickname</label>
                <input
                  type="text"
                  maxLength={12}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-center font-bold tracking-widest text-emerald-400 focus:outline-none focus:border-emerald-500/50 uppercase"
                />
              </div>

              <button
                onClick={handleFinish}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-emerald-500/10 active:scale-95 cursor-pointer"
              >
                Welcome to the Team
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
