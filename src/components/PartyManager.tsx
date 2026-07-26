import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { getPokemonById } from '../db/pokemon';
import { PokemonSprite } from './PokemonSprite';
import { Swords, Wand2, ArrowLeftRight } from 'lucide-react';
import { sound } from '../utils/sound';

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
  const { team, reorderTeam, bag, useItemOutsideBattle } = useGame();
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [swapIndex, setSwapIndex] = useState<number | null>(null);
  const [showItemMenu, setShowItemMenu] = useState(false);

  const getHpColor = (current: number, max: number) => {
    const pct = (current / max) * 100;
    if (pct > 50) return 'bg-emerald-500';
    if (pct > 20) return 'bg-yellow-500';
    return 'bg-rose-500 animate-pulse';
  };

  const handleSlotClick = (index: number) => {
    if (swapIndex !== null) {
      if (swapIndex !== index) {
        reorderTeam(swapIndex, index);
      }
      setSwapIndex(null);
    } else {
      sound.playSelect();
      setActiveSlot(index);
      setShowItemMenu(false);
    }
  };

  const handleUseItem = (itemName: string) => {
    if (activeSlot !== null) {
      useItemOutsideBattle(itemName, activeSlot);
      sound.playSelect();
    }
  };

  // Get active items in bag that can be used outside battle
  const usableItems = Object.entries(bag)
    .filter(([name, count]) => count > 0 && ['Potion', 'Super Potion', 'Hyper Potion', 'Revive', 'Max Revive', 'Full Heal', 'Rare Candy'].includes(name))
    .map(([name, count]) => ({ name, count }));

  const activePoke = activeSlot !== null ? team[activeSlot] : null;
  const activeDbInfo = activePoke ? getPokemonById(activePoke.pokemonId) : null;

  return (
    <section className="bg-[#080d1a]/60 border border-slate-850 p-4 rounded-2xl flex flex-col gap-4 shadow-md">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div>
          <span className="text-xs font-black tracking-widest text-emerald-400 uppercase flex items-center gap-1.5">
            <Swords className="w-4 h-4 text-emerald-400" />
            Party Management
          </span>
          <p className="text-[10px] font-mono text-gray-500 mt-0.5">
            Manage your team order, inspect stats, or feed Rare Candies.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Party list */}
        <div className="md:col-span-2 flex flex-col gap-2.5">
          {team.map((poke, index) => {
            const dbInfo = getPokemonById(poke.pokemonId);
            const isFainted = poke.currentHp <= 0;
            const hpPct = (poke.currentHp / poke.maxHp) * 100;
            const isSelected = activeSlot === index;
            const isSwapping = swapIndex === index;

            return (
              <button
                key={poke.id}
                onClick={() => handleSlotClick(index)}
                className={`w-full flex items-center gap-4 p-3 rounded-xl border transition-all duration-200 text-left relative group active:scale-[0.99] cursor-pointer ${
                  isSwapping
                    ? 'border-yellow-500 bg-yellow-950/15 shadow-[0_0_15px_rgba(234,179,8,0.1)] ring-1 ring-yellow-500/30'
                    : isSelected
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
                    size={60}
                    shiny={poke.shiny}
                    isEgg={poke.isEgg}
                  />
                </div>

                {/* Info Column */}
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-xs truncate flex items-center gap-1 ${isFainted ? 'text-rose-400' : 'text-gray-200'}`}>
                      {poke.nickname}
                      {poke.shiny && <span className="text-yellow-400 text-xs" title="Shiny">✨</span>}
                    </span>
                    {!poke.isEgg && (
                      <span className="text-[9px] font-mono text-gray-500 shrink-0">
                        Lv.{poke.level}
                      </span>
                    )}
                  </div>

                  {poke.isEgg ? (
                    <div className="flex items-center gap-1.5 text-[8.5px] font-mono text-gray-500">
                      <span className="text-emerald-500 font-bold uppercase tracking-wider">Incubating</span>
                      <span>•</span>
                      <span>{poke.hatchSteps} steps remaining</span>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}

                  {/* Types & Status row */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {!poke.isEgg && dbInfo.types.map((type) => (
                      <span
                        key={type}
                        className={`text-[7px] px-1.5 py-[1px] rounded uppercase font-bold ${TYPE_BADGE_COLORS[type] || 'bg-gray-500 text-white'}`}
                      >
                        {type}
                      </span>
                    ))}

                    {!poke.isEgg && poke.status && STATUS_BADGE[poke.status] && (
                      <span className={`text-[7px] px-1.5 py-[1px] rounded uppercase font-bold ${STATUS_BADGE[poke.status].color}`}>
                        {STATUS_BADGE[poke.status].label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Indicators */}
                {isSwapping && (
                  <span className="absolute top-2 right-3 text-[9px] font-mono font-extrabold tracking-widest text-yellow-400 uppercase animate-pulse">
                    Swapping
                  </span>
                )}
                {index === 0 && (
                  <span className="absolute bottom-2 right-3 text-[7.5px] font-mono text-emerald-500/60 uppercase font-black">
                    Lead
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right 1 Col: Detail Panel / Action Menu */}
        <div className="flex flex-col bg-slate-950/40 border border-slate-900 p-4 rounded-xl gap-4 min-h-[300px]">
          {activePoke && activeDbInfo ? (
            <div className="flex flex-col gap-4 animate-fade-in w-full">
              <div className="flex items-center gap-3 border-b border-slate-900 pb-3">
                <PokemonSprite
                  pokemonId={activePoke.pokemonId}
                  color={activeDbInfo.color}
                  secondaryColor={activeDbInfo.secondaryColor}
                  shapeSeed={activeDbInfo.shapeSeed}
                  bodyType={activeDbInfo.bodyType}
                  size={52}
                  shiny={activePoke.shiny}
                  isEgg={activePoke.isEgg}
                />
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-gray-200">{activePoke.nickname}</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {activePoke.isEgg ? 'Egg Class' : `Level ${activePoke.level} ${activeDbInfo.name}`}
                  </span>
                </div>
              </div>

              {!activePoke.isEgg ? (
                <>
                  {/* Detailed Stats */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">Base Statistics</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-400">
                      <div className="flex justify-between border-b border-slate-900/50 pb-1">
                        <span>HP:</span>
                        <span className="font-bold text-gray-200">{activePoke.currentHp} / {activePoke.maxHp}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900/50 pb-1">
                        <span>Attack:</span>
                        <span className="font-bold text-gray-200">{activePoke.attack}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900/50 pb-1">
                        <span>Defense:</span>
                        <span className="font-bold text-gray-200">{activePoke.defense}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900/50 pb-1">
                        <span>Sp. Atk:</span>
                        <span className="font-bold text-gray-200">{activePoke.spAttack}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900/50 pb-1">
                        <span>Sp. Def:</span>
                        <span className="font-bold text-gray-200">{activePoke.spDefense}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900/50 pb-1">
                        <span>Speed:</span>
                        <span className="font-bold text-gray-200">{activePoke.speed}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-900">
                    <button
                      onClick={() => {
                        sound.playSelect();
                        setSwapIndex(activeSlot);
                        setActiveSlot(null);
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-gray-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      Swap Position
                    </button>

                    <button
                      onClick={() => {
                        sound.playSelect();
                        setShowItemMenu(!showItemMenu);
                      }}
                      className="w-full py-2 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
                      Apply Item
                    </button>
                  </div>

                  {/* Apply item sub-list */}
                  {showItemMenu && (
                    <div className="flex flex-col gap-2 mt-2 max-h-[160px] overflow-y-auto scrollbar-hide">
                      <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">Available Inventory</span>
                      {usableItems.length > 0 ? (
                        usableItems.map(item => (
                          <button
                            key={item.name}
                            onClick={() => handleUseItem(item.name)}
                            className="flex justify-between items-center p-2 rounded-lg bg-slate-950 border border-slate-900 hover:border-emerald-500/20 text-left text-xs transition-all cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-300">{item.name}</span>
                              <span className="text-[8px] text-gray-500 font-mono">Count: {item.count}</span>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-mono uppercase font-bold">Use</span>
                          </button>
                        ))
                      ) : (
                        <span className="text-[9px] font-mono text-gray-650 text-center py-2">
                          No usable items in bag.
                        </span>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-slate-500 font-mono text-xs py-12">
                  Eggs cannot carry items or swap positions. Walk more steps to hatch!
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-600 p-6 gap-2">
              <Swords className="w-8 h-8 text-slate-750" />
              <span className="text-xs font-mono">
                Select a Pokémon from your team to manage their position or feed Rare Candies.
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PartyManager;
