import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { getPokemonById } from '../db/pokemon';
import { PokemonSprite } from './PokemonSprite';

const TYPE_BADGE_COLORS: Record<string, string> = {
  Normal: 'bg-gray-400 text-black',
  Fire: 'bg-orange-500 text-white',
  Water: 'bg-blue-500 text-white',
  Grass: 'bg-green-500 text-white',
  Electric: 'bg-yellow-500 text-black',
  Ice: 'bg-cyan-400 text-black',
  Fighting: 'bg-red-700 text-white',
  Poison: 'bg-purple-600 text-white',
  Ground: 'bg-amber-600 text-white',
  Flying: 'bg-indigo-400 text-white',
  Psychic: 'bg-pink-500 text-white',
  Bug: 'bg-lime-600 text-white',
  Rock: 'bg-yellow-700 text-white',
  Ghost: 'bg-violet-800 text-white',
  Dragon: 'bg-indigo-700 text-white',
  Steel: 'bg-slate-400 text-black',
  Dark: 'bg-stone-800 text-white',
  Fairy: 'bg-rose-400 text-white',
};

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  SLP: { label: 'SLP', color: 'bg-slate-500 text-white' },
  PAR: { label: 'PAR', color: 'bg-yellow-600 text-black' },
  PSN: { label: 'PSN', color: 'bg-purple-500 text-white' },
  BRN: { label: 'BRN', color: 'bg-orange-600 text-white' },
};

export const PartyManager: React.FC = () => {
  const { team, reorderTeam } = useGame();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const getHpColor = (current: number, max: number) => {
    const pct = (current / max) * 100;
    if (pct > 50) return 'bg-emerald-500';
    if (pct > 20) return 'bg-yellow-500';
    return 'bg-rose-500 animate-pulse';
  };

  const handleClick = (index: number) => {
    if (selectedIndex === null) {
      setSelectedIndex(index);
    } else if (selectedIndex === index) {
      setSelectedIndex(null);
    } else {
      reorderTeam(selectedIndex, index);
      setSelectedIndex(null);
    }
  };

  return (
    <section className="bg-[#080d1a]/60 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3 shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
          PARTY MANAGER — {team.length} / 6
        </span>
        <span className="text-[9px] font-mono text-gray-600">
          Tap two Pokémon to swap positions. #1 enters battle first.
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {team.map((poke, index) => {
          const dbInfo = getPokemonById(poke.pokemonId);
          const isFainted = poke.currentHp <= 0;
          const hpPct = (poke.currentHp / poke.maxHp) * 100;
          const isSelected = selectedIndex === index;

          return (
            <button
              key={poke.id}
              onClick={() => handleClick(index)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl border transition-all duration-200 text-left relative group active:scale-[0.99] cursor-pointer ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30'
                  : isFainted
                    ? 'border-rose-900/30 bg-rose-950/5 opacity-60'
                    : 'border-slate-850 bg-slate-900/20 hover:border-emerald-500/20 hover:bg-slate-900/40'
              }`}
            >
              {/* Position Number */}
              <span className="text-[10px] font-mono text-gray-600 w-4 shrink-0 text-center">
                {index + 1}
              </span>

              {/* Sprite */}
              <div className={`shrink-0 ${isFainted ? 'filter grayscale brightness-75' : ''}`}>
                <PokemonSprite
                  pokemonId={poke.pokemonId}
                  color={dbInfo.color}
                  secondaryColor={dbInfo.secondaryColor}
                  shapeSeed={dbInfo.shapeSeed}
                  bodyType={dbInfo.bodyType}
                  size={64}
                  shiny={poke.shiny}
                />
              </div>

              {/* Info Column */}
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                {/* Name & Level row */}
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm truncate flex items-center gap-1 ${isFainted ? 'text-rose-400' : 'text-gray-200'}`}>
                    {poke.nickname}
                    {poke.shiny && <span className="text-yellow-400 text-xs" title="Shiny">✨</span>}
                  </span>
                  <span className="text-[9px] font-mono text-gray-500 shrink-0">
                    Lv.{poke.level}
                  </span>
                </div>

                {/* HP Bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono text-gray-500 w-5 shrink-0">HP</span>
                  <div className="flex-1 h-2 bg-gray-950 rounded-full overflow-hidden border border-gray-900/80">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getHpColor(poke.currentHp, poke.maxHp)}`}
                      style={{ width: `${hpPct}%` }}
                    />
                  </div>
                  <span className="text-[8px] font-mono text-gray-500 w-14 shrink-0 text-right">
                    {poke.currentHp}/{poke.maxHp}
                  </span>
                </div>

                {/* Types & Status row */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {dbInfo.types.map((type) => (
                    <span
                      key={type}
                      className={`text-[7px] px-1.5 py-[1px] rounded uppercase font-bold ${TYPE_BADGE_COLORS[type] || 'bg-gray-500 text-white'}`}
                    >
                      {type}
                    </span>
                  ))}

                  {poke.status && STATUS_BADGE[poke.status] && (
                    <span className={`text-[7px] px-1.5 py-[1px] rounded uppercase font-bold ${STATUS_BADGE[poke.status].color}`}>
                      {STATUS_BADGE[poke.status].label}
                    </span>
                  )}
                </div>
              </div>

              {/* Swap Indicator */}
              {isSelected && (
                <span className="absolute top-2 right-3 text-[9px] font-mono font-extrabold tracking-widest text-emerald-400 uppercase animate-pulse">
                  SWAP
                </span>
              )}

              {/* Lead badge */}
              {index === 0 && (
                <span className="absolute bottom-2 right-3 text-[7px] font-mono text-emerald-500/60 uppercase">
                  Lead
                </span>
              )}
            </button>
          );
        })}
      </div>

      {team.length === 0 && (
        <div className="text-center text-gray-500 text-xs font-mono py-8">
          No Pokémon in party.
        </div>
      )}
    </section>
  );
};

export default PartyManager;
