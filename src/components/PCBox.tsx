import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { getPokemonById } from '../db/pokemon';
import { PokemonSprite } from './PokemonSprite';
import { Inbox, ArrowLeftRight, Download, BarChart3 } from 'lucide-react';

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

export const PCBox: React.FC = () => {
  const { team, pcBox, swapPokemonWithPc, depositToPc } = useGame();
  const [selectedPcIndex, setSelectedPcIndex] = useState<number | null>(null);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState<number | null>(null);

  const selectedPcPoke = selectedPcIndex !== null ? pcBox[selectedPcIndex] : null;
  const pcPokeInfo = selectedPcPoke ? getPokemonById(selectedPcPoke.pokemonId) : null;

  const handlePcSelect = (idx: number) => {
    setSelectedPcIndex(idx === selectedPcIndex ? null : idx);
    setSelectedTeamIndex(null); // Clear team selection when changing PC selection
  };

  const handleWithdraw = () => {
    if (selectedPcIndex === null) return;
    if (team.length >= 6) return;
    // Withdraw to empty space at end of team
    swapPokemonWithPc(selectedPcIndex, team.length);
    setSelectedPcIndex(null);
  };

  const handleSwap = () => {
    if (selectedPcIndex === null || selectedTeamIndex === null) return;
    swapPokemonWithPc(selectedPcIndex, selectedTeamIndex);
    setSelectedPcIndex(null);
    setSelectedTeamIndex(null);
  };

  const handleDeposit = (idx: number) => {
    if (team.length <= 1) return; // Cannot deposit last Pokémon
    depositToPc(idx);
    if (selectedTeamIndex === idx) setSelectedTeamIndex(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-950/80 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col gap-6">
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Title */}
      <div className="flex flex-col border-b border-gray-850 pb-4 gap-1 z-10">
        <h2 className="text-xl font-black text-emerald-400 flex items-center gap-2">
          <Inbox className="w-5 h-5" />
          POKÉMON STORAGE SYSTEM (PC)
        </h2>
        <span className="text-xs font-mono text-gray-400">
          Deposit, withdraw, and swap elements between your Battle Team and Box Storage.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 z-10">
        {/* Left Side: PC Box Grid & Team Grid */}
        <div className="md:col-span-2 flex flex-col gap-5">
          {/* Active Battle Team list */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
              ACTIVE BATTLE TEAM ({team.length} / 6)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {team.map((poke, index) => {
                const info = getPokemonById(poke.pokemonId);
                const isSelected = selectedTeamIndex === index;
                const canDeposit = team.length > 1;

                return (
                  <div
                    key={poke.id}
                    className={`p-2.5 rounded-xl border flex flex-col gap-1.5 transition-all relative ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/20'
                        : 'border-slate-850 bg-slate-900/10 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-mono text-slate-500">#{index + 1}</span>
                      <span className="font-bold text-xs truncate text-gray-200 flex items-center gap-0.5">
                        {poke.nickname}
                        {poke.shiny && <span className="text-yellow-400 text-[10px]" title="Shiny">✨</span>}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <div className="shrink-0 scale-90">
                        <PokemonSprite
                          pokemonId={poke.pokemonId}
                          color={info.color}
                          secondaryColor={info.secondaryColor}
                          shapeSeed={info.shapeSeed}
                          bodyType={info.bodyType}
                          size={40}
                          shiny={poke.shiny}
                        />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[8px] font-mono text-gray-400">Lv.{poke.level}</span>
                        {selectedPcIndex !== null ? (
                          <button
                            onClick={() => setSelectedTeamIndex(index)}
                            className="px-2 py-0.5 rounded text-[8px] font-mono bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/40 text-emerald-300 transition-all"
                          >
                            SELECT
                          </button>
                        ) : (
                          <button
                            disabled={!canDeposit}
                            onClick={() => handleDeposit(index)}
                            title="Send to PC Box"
                            className="px-2 py-0.5 rounded text-[8px] font-mono bg-rose-600/15 border border-rose-500/30 hover:bg-rose-600/30 text-rose-300 disabled:opacity-30 disabled:pointer-events-none transition-all"
                          >
                            DEPOSIT
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Empty team slots if < 6 */}
              {Array.from({ length: 6 - team.length }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  className="p-2.5 rounded-xl border border-dashed border-slate-850/60 bg-slate-900/5 flex flex-col items-center justify-center min-h-[74px]"
                >
                  <span className="text-[9px] font-mono text-slate-600 uppercase">EMPTY SLOT</span>
                  {selectedPcIndex !== null && (
                    <button
                      onClick={handleWithdraw}
                      className="mt-1 px-2.5 py-0.5 rounded text-[8px] font-mono bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/40 text-emerald-300 transition-all flex items-center gap-1"
                    >
                      <Download className="w-2.5 h-2.5" /> WITHDRAW
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* PC Box Grid */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
              STORED IN PC BOX ({pcBox.length})
            </span>
            <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 min-h-[220px] max-h-[300px] overflow-y-auto">
              {pcBox.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16 gap-2 opacity-50">
                  <Inbox className="w-8 h-8 text-gray-500" />
                  <span className="text-xs font-mono text-gray-400">All Pokémon are currently in your Battle Team.</span>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                  {pcBox.map((poke, index) => {
                    const info = getPokemonById(poke.pokemonId);
                    const isSelected = selectedPcIndex === index;

                    return (
                      <button
                        key={poke.id}
                        onClick={() => handlePcSelect(index)}
                        className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_10px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30'
                            : 'border-slate-850 bg-slate-900/10 hover:border-slate-800 hover:bg-slate-900/20'
                        }`}
                      >
                        <div className="scale-75 shrink-0">
                          <PokemonSprite
                            pokemonId={poke.pokemonId}
                            color={info.color}
                            secondaryColor={info.secondaryColor}
                            shapeSeed={info.shapeSeed}
                            bodyType={info.bodyType}
                            size={40}
                            shiny={poke.shiny}
                          />
                        </div>
                        <span className="text-[9px] font-bold text-gray-300 truncate max-w-full leading-tight mt-1 flex items-center justify-center gap-0.5">
                          {poke.nickname}
                          {poke.shiny && <span className="text-yellow-400 text-[8px]" title="Shiny">✨</span>}
                        </span>
                        <span className="text-[8px] font-mono text-slate-500 mt-0.5">Lv.{poke.level}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Preview Detail Card */}
        <div className="flex flex-col">
          {selectedPcPoke && pcPokeInfo ? (
            <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4 flex flex-col gap-4 relative h-full">
              {/* Mini Glow Header */}
              <div className="flex flex-col items-center border-b border-gray-800/60 pb-3">
                <PokemonSprite
                  pokemonId={selectedPcPoke.pokemonId}
                  color={pcPokeInfo.color}
                  secondaryColor={pcPokeInfo.secondaryColor}
                  shapeSeed={pcPokeInfo.shapeSeed}
                  bodyType={pcPokeInfo.bodyType}
                  size={96}
                  shiny={selectedPcPoke.shiny}
                />
                <h3 className="font-extrabold text-sm text-gray-200 mt-2 flex items-center gap-1">
                  {selectedPcPoke.nickname}
                  {selectedPcPoke.shiny && <span className="text-yellow-400 text-xs" title="Shiny">✨</span>}
                </h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  {pcPokeInfo.types.map(t => (
                    <span
                      key={t}
                      className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase ${TYPE_BADGE_COLORS[t] || 'bg-gray-500'}`}
                    >
                      {t}
                    </span>
                  ))}
                  <span className="text-[8px] font-mono text-slate-500">Lv.{selectedPcPoke.level}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5" /> BASE COMBAT STATS
                </span>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="bg-slate-950/40 border border-slate-900 px-2 py-1 rounded flex justify-between">
                    <span className="text-gray-400">HP:</span>
                    <span className="font-bold text-emerald-400">{selectedPcPoke.maxHp}</span>
                  </div>
                  <div className="bg-slate-950/40 border border-slate-900 px-2 py-1 rounded flex justify-between">
                    <span className="text-gray-400">ATK:</span>
                    <span className="font-bold text-gray-200">{selectedPcPoke.attack}</span>
                  </div>
                  <div className="bg-slate-950/40 border border-slate-900 px-2 py-1 rounded flex justify-between">
                    <span className="text-gray-400">DEF:</span>
                    <span className="font-bold text-gray-200">{selectedPcPoke.defense}</span>
                  </div>
                  <div className="bg-slate-950/40 border border-slate-900 px-2 py-1 rounded flex justify-between">
                    <span className="text-gray-400">SPD:</span>
                    <span className="font-bold text-gray-200">{selectedPcPoke.speed}</span>
                  </div>
                </div>
              </div>

              {/* Moves List */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">ACTIVE MOVES</span>
                <div className="flex flex-col gap-1">
                  {selectedPcPoke.moves.map(m => (
                    <div
                      key={m.name}
                      className="bg-slate-950/30 border border-slate-900/60 p-1.5 rounded flex justify-between items-center text-[9px]"
                    >
                      <span className="font-bold text-gray-300">{m.name}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[7px] uppercase font-bold ${TYPE_BADGE_COLORS[m.type] || 'bg-gray-500'}`}
                      >
                        {m.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-auto pt-3 border-t border-gray-800/40 flex flex-col gap-2">
                {selectedTeamIndex !== null ? (
                  <button
                    onClick={handleSwap}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-md font-sans cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" /> SWAP WITH CHOSEN
                  </button>
                ) : team.length < 6 ? (
                  <button
                    onClick={handleWithdraw}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-md font-sans cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> WITHDRAW TO TEAM
                  </button>
                ) : (
                  <div className="text-center bg-slate-950/60 border border-slate-900/80 p-2 rounded-xl">
                    <p className="text-[9px] text-yellow-400/80 font-mono">Battle Team is currently full (6/6).</p>
                    <p className="text-[8px] text-gray-500 font-mono mt-0.5">Select a team slot on the left to swap.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/20 border border-slate-850/60 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center h-full gap-2 text-slate-500 opacity-60">
              <Inbox className="w-10 h-10" />
              <span className="text-xs font-mono">Select a stored Pokémon to view stats and manage deployment.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PCBox;
