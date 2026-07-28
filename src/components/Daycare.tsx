import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { PokemonSprite } from './PokemonSprite';
import { getPokemonById } from '../db/pokemon';
import { Heart, Plus, ArrowLeftRight, Check, Trash2 } from 'lucide-react';
import { sound } from '../utils/sound';

export const Daycare: React.FC = () => {
  const {
    team,
    pcBox,
    daycare,
    depositDaycare,
    withdrawDaycare,
    collectEgg
  } = useGame();

  const [selectSlot, setSelectSlot] = useState<'A' | 'B' | null>(null);
  const [parentAId, setParentAId] = useState<string | null>(null);
  const [parentBId, setParentBId] = useState<string | null>(null);

  // Combine team and PC box for select candidates
  const candidates = [...team, ...pcBox].filter(p => !p.isEgg);

  const handleSelectParent = (id: string) => {
    if (selectSlot === 'A') {
      if (id === parentBId) setParentBId(null);
      setParentAId(id);
    } else if (selectSlot === 'B') {
      if (id === parentAId) setParentAId(null);
      setParentBId(id);
    }
    setSelectSlot(null);
    sound.playSelect();
  };

  const handleStartBreeding = () => {
    if (parentAId && parentBId) {
      depositDaycare(parentAId, parentBId);
      setParentAId(null);
      setParentBId(null);
    }
  };

  const getPokeByIdOrState = (id: string | null) => {
    if (!id) return null;
    return candidates.find(p => p.id === id) || null;
  };

  const selectedA = getPokeByIdOrState(parentAId);
  const selectedB = getPokeByIdOrState(parentBId);

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-950/80 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col gap-6 scanlines">
      {/* Glow effects */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-rose-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Title */}
      <div className="border-b border-gray-850 pb-4">
        <h2 className="text-xl font-black text-emerald-400 flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500 animate-pulse" />
          <span>Pokémon Daycare & Breeding Center</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1 font-mono">
          Deposit two parent Pokémon to discover eggs. Walk on the regional map to incubate eggs.
        </p>
      </div>

      {/* Daycare Slots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Slot A */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">PARENT A</span>
          {daycare.parentA ? (
            <div className="w-full p-4 rounded-xl border border-slate-850 bg-slate-900/20 flex flex-col items-center text-center relative group">
              <PokemonSprite
                pokemonId={daycare.parentA.pokemonId}
                color={getPokemonById(daycare.parentA.pokemonId).color}
                secondaryColor={getPokemonById(daycare.parentA.pokemonId).secondaryColor}
                shapeSeed={getPokemonById(daycare.parentA.pokemonId).shapeSeed}
                bodyType={getPokemonById(daycare.parentA.pokemonId).bodyType}
                size={80}
              />
              <span className="font-bold text-xs mt-2">{daycare.parentA.nickname}</span>
              <span className="text-[9px] font-mono text-gray-500">Lv.{daycare.parentA.level}</span>
              <button
                onClick={() => withdrawDaycare('parentA')}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/65 border border-slate-800 text-rose-400 hover:bg-rose-950/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                title="Withdraw Parent"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : selectedA ? (
            <div className="w-full p-4 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-950/5 flex flex-col items-center text-center relative">
              <PokemonSprite
                pokemonId={selectedA.pokemonId}
                color={getPokemonById(selectedA.pokemonId).color}
                secondaryColor={getPokemonById(selectedA.pokemonId).secondaryColor}
                shapeSeed={selectedA.pokemonId * 1234}
                bodyType={getPokemonById(selectedA.pokemonId).bodyType}
                size={80}
              />
              <span className="font-bold text-xs mt-2">{selectedA.nickname}</span>
              <button
                onClick={() => setParentAId(null)}
                className="absolute top-2 right-2 text-xs text-rose-400 font-mono cursor-pointer"
              >
                Clear
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSelectSlot('A')}
              className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-slate-800 hover:border-emerald-500/40 hover:bg-emerald-950/5 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-emerald-400 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs font-mono font-bold">Select Parent A</span>
            </button>
          )}
        </div>

        {/* Breeding Status Center */}
        <div className="flex flex-col items-center justify-center text-center p-4 bg-slate-900/10 rounded-xl border border-slate-900 gap-4 min-h-[160px]">
          {daycare.parentA && daycare.parentB ? (
            <div className="flex flex-col items-center gap-3 w-full">
              {daycare.eggReady ? (
                <div className="flex flex-col items-center gap-2 animate-bounce">
                  <div className="w-16 h-16 relative flex items-center justify-center">
                    <PokemonSprite
                      pokemonId={1}
                      color="#34d399"
                      secondaryColor="#059669"
                      shapeSeed={42}
                      bodyType={0}
                      size={60}
                      isEgg={true}
                    />
                  </div>
                  <span className="text-xs text-yellow-400 font-bold uppercase tracking-wider animate-pulse">
                    Egg Ready!
                  </span>
                  <button
                    onClick={collectEgg}
                    disabled={team.length >= 6}
                    className={`mt-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer ${
                      team.length >= 6
                        ? 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed shadow-none'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/10 border border-emerald-400'
                    }`}
                  >
                    {team.length >= 6 ? 'Party Full' : 'Claim Egg'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Heart className="w-8 h-8 text-rose-500 animate-pulse" />
                  <span className="text-xs font-bold text-gray-300">
                    Incubating parent genes...
                  </span>
                  <div className="w-full max-w-[160px] h-1.5 bg-gray-950 rounded-full overflow-hidden border border-gray-900/80 mt-1">
                    <div
                      className="h-full bg-rose-500 transition-all duration-300"
                      style={{ width: `${(daycare.steps / 25) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-gray-500">
                    {25 - daycare.steps} map steps left for Egg
                  </span>
                  {(() => {
                    if (!daycare.parentA || !daycare.parentB) return null;
                    const aData = getPokemonById(daycare.parentA.pokemonId);
                    const bData = getPokemonById(daycare.parentB.pokemonId);
                    const shared = aData.types.filter(t => bData.types.includes(t));
                    if (shared.length > 0) {
                      return <span className="text-[9px] font-mono text-emerald-400 mt-1.5">They get along incredibly well! (Fast breeding 🥚)</span>;
                    }
                    if (aData.color === bData.color) {
                      return <span className="text-[9px] font-mono text-teal-400 mt-1.5">They seem to share a warm bond. (Medium breeding 🥚)</span>;
                    }
                    return <span className="text-[9px] font-mono text-yellow-500/80 mt-1.5">They don't like each other much... (Slow breeding 🥚)</span>;
                  })()}
                </div>
              )}
            </div>
          ) : selectedA && selectedB ? (
            <button
              onClick={handleStartBreeding}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white border border-rose-400 rounded-xl font-bold text-xs tracking-wider uppercase transition-all active:scale-95 shadow-lg shadow-rose-950/20 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Leave in Daycare</span>
            </button>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <ArrowLeftRight className="w-6 h-6 text-slate-750" />
              <span className="text-xs font-mono text-slate-500">
                Deposit two compatible parents to begin breeding.
              </span>
            </div>
          )}
        </div>

        {/* Slot B */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">PARENT B</span>
          {daycare.parentB ? (
            <div className="w-full p-4 rounded-xl border border-slate-850 bg-slate-900/20 flex flex-col items-center text-center relative group">
              <PokemonSprite
                pokemonId={daycare.parentB.pokemonId}
                color={getPokemonById(daycare.parentB.pokemonId).color}
                secondaryColor={getPokemonById(daycare.parentB.pokemonId).secondaryColor}
                shapeSeed={getPokemonById(daycare.parentB.pokemonId).shapeSeed}
                bodyType={getPokemonById(daycare.parentB.pokemonId).bodyType}
                size={80}
              />
              <span className="font-bold text-xs mt-2">{daycare.parentB.nickname}</span>
              <span className="text-[9px] font-mono text-gray-500">Lv.{daycare.parentB.level}</span>
              <button
                onClick={() => withdrawDaycare('parentB')}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/65 border border-slate-800 text-rose-400 hover:bg-rose-950/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                title="Withdraw Parent"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : selectedB ? (
            <div className="w-full p-4 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-950/5 flex flex-col items-center text-center relative">
              <PokemonSprite
                pokemonId={selectedB.pokemonId}
                color={getPokemonById(selectedB.pokemonId).color}
                secondaryColor={getPokemonById(selectedB.pokemonId).secondaryColor}
                shapeSeed={selectedB.pokemonId * 1234}
                bodyType={getPokemonById(selectedB.pokemonId).bodyType}
                size={80}
              />
              <span className="font-bold text-xs mt-2">{selectedB.nickname}</span>
              <button
                onClick={() => setParentBId(null)}
                className="absolute top-2 right-2 text-xs text-rose-400 font-mono cursor-pointer"
              >
                Clear
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSelectSlot('B')}
              className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-slate-800 hover:border-emerald-500/40 hover:bg-emerald-950/5 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-emerald-400 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs font-mono font-bold">Select Parent B</span>
            </button>
          )}
        </div>
      </div>

      {/* Select Parent Modal */}
      {selectSlot !== null && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-gray-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative flex flex-col gap-4 max-h-[80vh]">
            <div>
              <h3 className="text-sm font-bold tracking-wider text-gray-200 uppercase">
                Select Parent {selectSlot}
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">
                Choose a non-egg Pokémon from your party or storage boxes.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-2.5 p-1 scrollbar-hide">
              {candidates.map(poke => {
                const isAlreadySelected = poke.id === parentAId || poke.id === parentBId;
                const db = getPokemonById(poke.pokemonId);
                return (
                  <button
                    key={poke.id}
                    disabled={isAlreadySelected}
                    onClick={() => handleSelectParent(poke.id)}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                      isAlreadySelected
                        ? 'border-slate-850 bg-slate-950 opacity-40 cursor-not-allowed'
                        : 'border-slate-800 bg-slate-950/40 hover:border-emerald-500/30 hover:bg-slate-900/20'
                    }`}
                  >
                    <PokemonSprite
                      pokemonId={poke.pokemonId}
                      color={db.color}
                      secondaryColor={db.secondaryColor}
                      shapeSeed={db.shapeSeed}
                      bodyType={db.bodyType}
                      size={48}
                    />
                    <span className="font-bold text-[10px] truncate w-full">{poke.nickname}</span>
                    <span className="text-[8px] font-mono text-gray-500">Lv.{poke.level}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setSelectSlot(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-gray-300 font-bold text-xs tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
