import React, { useState } from 'react';
import { POKEDEX, type PokemonData } from '../db/pokemon';
import { useGame } from '../context/GameContext';
import { PokemonSprite } from './PokemonSprite';
import { Search, Filter, ShieldCheck } from 'lucide-react';

export const Pokedex: React.FC = () => {
  const { pokedexCaught } = useGame();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedPoke, setSelectedPoke] = useState<PokemonData | null>(POKEDEX[0]);

  const uniqueTypes = ['All', ...Array.from(new Set(POKEDEX.flatMap(p => p.types)))];

  const filteredPokedex = POKEDEX.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toString() === search;
    const matchesType = selectedType === 'All' || p.types.includes(selectedType);
    return matchesSearch && matchesType;
  });

  const getStatPercent = (val: number) => {
    // max stat is around 180 for standard base stats
    return Math.min(100, (val / 180) * 100);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-950/80 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col gap-6">
      
      {/* Search and Filters bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search Name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-gray-800 focus:border-emerald-500/40 focus:outline-none font-mono text-sm"
          />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <Filter className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-gray-800 focus:border-emerald-500/40 focus:outline-none font-mono text-sm appearance-none cursor-pointer"
          >
            {uniqueTypes.map(t => (
              <option key={t} value={t}>{t} Type</option>
            ))}
          </select>
        </div>

        {/* Caught Counter */}
        <div className="flex items-center justify-end px-2">
          <span className="text-xs font-mono text-gray-400">
            Caught: <strong className="text-emerald-400 font-bold">{pokedexCaught.length}</strong> / 650
          </span>
        </div>
      </div>

      {/* Database split Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Pokemon Grid list */}
        <div className="md:col-span-2 bg-slate-900/40 border border-slate-850 p-4 rounded-xl max-h-[460px] overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-3 shadow-inner">
          {filteredPokedex.map(poke => {
            const isCaught = pokedexCaught.includes(poke.id);
            const isSelected = selectedPoke?.id === poke.id;
            
            return (
              <button
                key={poke.id}
                onClick={() => setSelectedPoke(poke)}
                className={`p-2.5 rounded-lg border flex flex-col items-center justify-between text-center relative group active:scale-95 transition-all ${
                  isSelected 
                    ? 'border-emerald-500 bg-emerald-950/20' 
                    : 'border-slate-850 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                {/* Caught marker check */}
                {isCaught && (
                  <span className="absolute top-1 left-1" title="Caught">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 fill-emerald-950" />
                  </span>
                )}
                
                <span className="absolute top-1 right-1 text-[8px] font-mono text-gray-500">#{poke.id}</span>
                
                <PokemonSprite
                  pokemonId={poke.id}
                  color={poke.color}
                  secondaryColor={poke.secondaryColor}
                  shapeSeed={poke.shapeSeed}
                  bodyType={poke.bodyType}
                  size={54}
                />
                
                <span className="text-[10px] font-bold mt-1.5 truncate max-w-full group-hover:text-emerald-400 transition-colors">
                  {poke.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right 1 Col: Selected Pokemon Details Card */}
        <div className="bg-slate-900/50 border border-slate-850 p-5 rounded-xl flex flex-col items-center gap-4 text-center justify-start min-h-[460px]">
          {selectedPoke ? (
            <>
              <div className="relative">
                <span className="absolute -top-2 -left-2 text-[10px] font-mono text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-950">#{selectedPoke.id}</span>
                <PokemonSprite
                  pokemonId={selectedPoke.id}
                  color={selectedPoke.color}
                  secondaryColor={selectedPoke.secondaryColor}
                  shapeSeed={selectedPoke.shapeSeed}
                  bodyType={selectedPoke.bodyType}
                  size={110}
                />
              </div>

              <div>
                <h3 className="text-lg font-black tracking-wide text-emerald-400">{selectedPoke.name}</h3>
                <div className="flex gap-1.5 mt-1.5 justify-center">
                  {selectedPoke.types.map(t => (
                    <span 
                      key={t} 
                      className="text-[9px] font-mono px-2 py-[1px] rounded uppercase font-bold bg-slate-850 text-slate-300 border border-slate-800"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats list */}
              <div className="w-full flex flex-col gap-2 mt-2">
                <span className="text-[10px] font-mono text-gray-500 self-start tracking-wider">BASE STATS</span>
                
                {Object.entries(selectedPoke.baseStats).map(([key, val]) => (
                  <div key={key} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-mono text-gray-400">
                      <span className="uppercase">{key}</span>
                      <span>{val}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500" 
                        style={{ width: `${getStatPercent(val)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Evolution info */}
              {selectedPoke.evolutionId && selectedPoke.evolutionLevel && (
                <div className="mt-3 pt-3 border-t border-slate-850 w-full text-[10px] font-mono text-gray-500">
                  Evolves at level {selectedPoke.evolutionLevel}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-650 font-mono text-xs">
              Select a Pokemon to inspect stats.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Pokedex;
