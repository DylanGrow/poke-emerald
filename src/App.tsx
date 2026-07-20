import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { getPokemonById } from './db/pokemon';
import { PokemonSprite } from './components/PokemonSprite';
import { BattleScreen } from './components/BattleScreen';
import { MapScreen } from './components/MapScreen';
import { Pokedex } from './components/Pokedex';
import { SaveManager } from './components/SaveManager';
import { PartyManager } from './components/PartyManager';
import { PCBox } from './components/PCBox';
import { TrainerCard } from './components/TrainerCard';
import { BrandLogo } from './components/BrandLogo';
import { VirtualController } from './components/VirtualController';
import { useGamepad } from './hooks/useGamepad';
import { Volume2, VolumeX, Shield, Trophy, Sword } from 'lucide-react';
import { sound } from './utils/sound';

const Dashboard: React.FC = () => {
  const {
    team,
    money,
    badgesDefeated,
    eliteDefeatedCount,
    battle,
    mute,
    toggleMute,
    pendingMoveLearn,
    learnPendingMove,
    selectStarter
  } = useGame();

  const [activeTab, setActiveTab] = useState<'map' | 'party' | 'pc' | 'pokedex' | 'card' | 'save'>('map');

  // Start procedural BGM on first user interaction if not muted
  useEffect(() => {
    if (mute) {
      sound.stopBGM();
      return;
    }
    
    // Play immediately if AudioContext is already unlocked by previous interactions
    sound.playBGM();

    const startAudio = () => {
      sound.playBGM();
      window.removeEventListener('click', startAudio);
      window.removeEventListener('keydown', startAudio);
      window.removeEventListener('touchstart', startAudio);
    };
    window.addEventListener('click', startAudio);
    window.addEventListener('keydown', startAudio);
    window.addEventListener('touchstart', startAudio);

    return () => {
      window.removeEventListener('click', startAudio);
      window.removeEventListener('keydown', startAudio);
      window.removeEventListener('touchstart', startAudio);
    };
  }, [mute]);

  const getHpColor = (current: number, max: number) => {
    const pct = (current / max) * 100;
    if (pct > 50) return 'bg-emerald-500';
    if (pct > 20) return 'bg-yellow-500';
    if (pct > 20) return 'bg-rose-500 animate-pulse';
    return 'bg-rose-500 animate-pulse';
  };

  if (team.length === 0) {
    return <StarterSelectScreen selectStarter={selectStarter} />;
  }

  return (
    <div className="min-h-screen bg-[#03060f] text-gray-100 flex flex-col pb-12 font-sans selection:bg-emerald-500/20">
      
      {/* 1. Main Navigation Header HUD */}
      <header className="sticky top-0 z-50 bg-[#060913]/90 border-b border-emerald-500/10 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Title branding */}
        <div className="flex items-center gap-3">
          <BrandLogo height={32} />
          <div>
            <h1 className="text-md font-black tracking-widest text-emerald-400 uppercase flex items-center gap-1.5">
              <span>Pokémon Emerald</span>
              <span className="text-[10px] font-mono border border-emerald-500/30 px-1.5 py-0.5 rounded text-emerald-500/80 bg-emerald-950/20">CYBER ED.</span>
            </h1>
            <span className="text-[9px] font-mono text-gray-500">OFFLINE-FIRST PROGRESSIVE WEB APP</span>
          </div>
        </div>

        {/* Global Stats panel */}
        <div className="flex items-center gap-5 font-mono text-xs">
          <div className="flex items-center gap-1.5 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-800" title="Gold Money">
            <span className="text-amber-400 font-bold">$</span>
            <span className="text-gray-300 font-bold">{money}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-800" title="Gym Badges Defeated">
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-gray-300 font-bold">{badgesDefeated.length} <span className="text-[10px] text-gray-500">/ 30</span></span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-800" title="Elite 16 Defeated">
            <Shield className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-gray-300 font-bold">{eliteDefeatedCount} <span className="text-[10px] text-gray-500">/ 16</span></span>
          </div>

          {/* Sound toggle */}
          <button 
            onClick={toggleMute}
            className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-gray-400 hover:text-emerald-400 active:scale-95 transition-all"
            title={mute ? "Unmute Audio" : "Mute Audio"}
          >
            {mute ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Main layout body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-6 relative">
        
        {/* Active Battle Screen overlay takes priority */}
        {battle ? (
          <div className="flex-1 flex items-center justify-center py-6 animate-fade-in">
            <BattleScreen />
          </div>
        ) : (
          <>
            {/* 2. Active Party/Team Grid HUD */}
            <section className="bg-[#080d1a]/60 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3 shadow-md">
              <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase flex items-center gap-1">
                <Sword className="w-3.5 h-3.5" />
                ACTIVE POKÉMON TEAM ({team.length} / 6)
              </span>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {team.map((poke) => {
                  const dbInfo = getPokemonById(poke.pokemonId);
                  const isFainted = poke.currentHp <= 0;
                  const hpPct = (poke.currentHp / poke.maxHp) * 100;
                  
                  return (
                    <div 
                      key={poke.id} 
                      className={`p-3 rounded-xl border flex flex-col items-center justify-between text-center relative group transition-all duration-300 hover:scale-[1.03] ${
                        isFainted 
                          ? 'border-rose-900/30 bg-rose-950/5 opacity-60' 
                          : 'border-slate-850 bg-slate-900/20 hover:border-emerald-500/30 hover:bg-slate-900/40'
                      }`}
                    >
                      <span className="absolute top-1.5 right-1.5 text-[8.5px] font-mono text-gray-500">Lv.{poke.level}</span>
                      
                      <div className={isFainted ? 'filter grayscale brightness-75' : ''}>
                        <PokemonSprite
                          pokemonId={poke.pokemonId}
                          color={dbInfo.color}
                          secondaryColor={dbInfo.secondaryColor}
                          shapeSeed={dbInfo.shapeSeed}
                          bodyType={dbInfo.bodyType}
                          size={50}
                          shiny={poke.shiny}
                        />
                      </div>
                      
                      <div className="w-full mt-2 flex flex-col gap-1.5">
                        <span className={`font-bold text-xs truncate max-w-full flex items-center justify-center gap-0.5 ${isFainted ? 'text-rose-400' : 'text-gray-250'}`}>
                          {poke.nickname}
                          {poke.shiny && <span className="text-yellow-400 text-[10px]" title="Shiny">✨</span>}
                        </span>
                        {/* HP Bar */}
                        <div className="w-full h-1.5 bg-gray-950 rounded-full overflow-hidden border border-gray-900/80">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${getHpColor(poke.currentHp, poke.maxHp)}`}
                            style={{ width: `${hpPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[8px] font-mono text-gray-500 px-0.5">
                          <span>HP</span>
                          <span>{poke.currentHp}/{poke.maxHp}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 3. Panel Navigation Tabs */}
            <div className="flex justify-center border-b border-gray-850">
              <div className="flex gap-2 p-1 bg-slate-900/30 border border-slate-850 rounded-xl mb-[-1px] flex-wrap justify-center">
                <button
                  onClick={() => { sound.playSelect(); setActiveTab('map'); }}
                  className={`px-4 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-all ${
                    activeTab === 'map' 
                      ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-400' 
                      : 'hover:bg-slate-900 text-gray-400'
                  }`}
                >
                  Regional Map
                </button>
                <button
                  onClick={() => { sound.playSelect(); setActiveTab('party'); }}
                  className={`px-4 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-all ${
                    activeTab === 'party' 
                      ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-400' 
                      : 'hover:bg-slate-900 text-gray-400'
                  }`}
                >
                  Party Manager
                </button>
                <button
                  onClick={() => { sound.playSelect(); setActiveTab('pc'); }}
                  className={`px-4 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-all ${
                    activeTab === 'pc' 
                      ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-400' 
                      : 'hover:bg-slate-900 text-gray-400'
                  }`}
                >
                  PC Storage
                </button>
                <button
                  onClick={() => { sound.playSelect(); setActiveTab('pokedex'); }}
                  className={`px-4 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-all ${
                    activeTab === 'pokedex' 
                      ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-400' 
                      : 'hover:bg-slate-900 text-gray-400'
                  }`}
                >
                  Pokédex
                </button>
                <button
                  onClick={() => { sound.playSelect(); setActiveTab('card'); }}
                  className={`px-4 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-all ${
                    activeTab === 'card' 
                      ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-400' 
                      : 'hover:bg-slate-900 text-gray-400'
                  }`}
                >
                  Trainer Card
                </button>
                <button
                  onClick={() => { sound.playSelect(); setActiveTab('save'); }}
                  className={`px-4 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-all ${
                    activeTab === 'save' 
                      ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-400' 
                      : 'hover:bg-slate-900 text-gray-400'
                  }`}
                >
                  Security Vault
                </button>
              </div>
            </div>

            {/* 4. Active Tab Component */}
            <div className="flex-1 flex flex-col gap-6 animate-fade-in">
              {activeTab === 'map' && <MapScreen />}
              {activeTab === 'party' && <PartyManager />}
              {activeTab === 'pc' && <PCBox />}
              {activeTab === 'pokedex' && <Pokedex />}
              {activeTab === 'card' && <TrainerCard />}
              {activeTab === 'save' && <SaveManager />}
            </div>
          </>
        )}
      </main>

      {/* 5. Move Tutor / Forget Move Modal Overlay */}
      {pendingMoveLearn && (() => {
        const learnPoke = team.find(p => p.id === pendingMoveLearn.pokemonId);
        if (!learnPoke) return null;

        const getTypeStyle = (type: string) => {
          const colors: Record<string, string> = {
            Fire: 'bg-orange-500 text-white',
            Water: 'bg-blue-500 text-white',
            Grass: 'bg-green-500 text-white',
            Electric: 'bg-yellow-500 text-black font-semibold',
            Ice: 'bg-cyan-400 text-black font-semibold',
            Fighting: 'bg-red-700 text-white',
            Poison: 'bg-purple-600 text-white',
            Ground: 'bg-amber-600 text-white',
            Flying: 'bg-indigo-400 text-white',
            Psychic: 'bg-pink-500 text-white',
            Bug: 'bg-lime-600 text-white',
            Rock: 'bg-yellow-700 text-white',
            Ghost: 'bg-violet-800 text-white',
            Dragon: 'bg-indigo-700 text-white',
            Steel: 'bg-slate-400 text-black font-semibold',
            Dark: 'bg-stone-800 text-white',
            Fairy: 'bg-rose-400 text-white',
            Normal: 'bg-gray-400 text-black font-semibold'
          };
          return colors[type] || 'bg-gray-500 text-white';
        };

        return (
          <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-gray-900 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl relative flex flex-col gap-5 scanlines">
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

              <div className="text-center flex flex-col gap-1.5">
                <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-extrabold">Level Up: Move Learner</span>
                <h2 className="text-lg font-black text-white">
                  {learnPoke.nickname} wants to learn <span className="text-emerald-400">{pendingMoveLearn.move.name}</span>!
                </h2>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  However, it already knows 4 moves. Select a move to forget and replace, or skip learning this move.
                </p>
              </div>

              {/* Grid of current moves */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                {learnPoke.moves.map((move, index) => (
                  <button
                    key={index}
                    onClick={() => learnPendingMove(index)}
                    className="p-4 rounded-xl border border-slate-850 bg-slate-950/40 hover:border-rose-500/40 hover:bg-rose-950/10 text-left flex flex-col justify-between items-start gap-1 group active:scale-95 transition-all animate-fade-in"
                  >
                    <span className="font-bold text-xs text-gray-200 group-hover:text-rose-400 transition-colors">{move.name}</span>
                    <span className={`text-[8px] px-1.5 py-[0.5px] rounded uppercase font-semibold ${getTypeStyle(move.type)}`}>
                      {move.type}
                    </span>
                    <div className="flex justify-between w-full text-[9px] font-mono text-gray-500 mt-1">
                      <span>PWR: {move.power}</span>
                      <span>PP: {move.pp}</span>
                    </div>
                    <span className="text-[8px] font-mono text-rose-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity mt-1">FORGET MOVE</span>
                  </button>
                ))}
              </div>

              {/* Visual arrow divider */}
              <div className="flex items-center justify-center gap-2 text-slate-500 my-1 font-mono text-xs">
                <span>NEW MOVE:</span>
                <span className="font-bold text-emerald-400">{pendingMoveLearn.move.name}</span>
                <span className={`text-[8.5px] px-2 py-[1px] rounded uppercase font-bold ${getTypeStyle(pendingMoveLearn.move.type)}`}>
                  {pendingMoveLearn.move.type}
                </span>
                <span className="text-[10px]">PWR: {pendingMoveLearn.move.power}</span>
              </div>

              {/* Skip button */}
              <button
                onClick={() => learnPendingMove(null)}
                className="w-full py-3 bg-slate-800 border border-slate-700 hover:bg-slate-750 text-gray-300 font-bold text-xs tracking-wider rounded-xl transition-all active:scale-95"
              >
                DON'T LEARN {pendingMoveLearn.move.name.toUpperCase()}
              </button>
            </div>
          </div>
        );
      })()}

      {/* 6. Virtual Mobile Controller Pad */}
      <VirtualController />
    </div>
  );
};

interface StarterSelectProps {
  selectStarter: (id: number) => void;
}

const StarterSelectScreen: React.FC<StarterSelectProps> = ({ selectStarter }) => {
  const [focusedIndex, setFocusedIndex] = useState(0); // 0: Treecko, 1: Torchic, 2: Mudkip

  const starters = [
    {
      id: 252,
      name: 'Sylvagecko',
      type: 'Grass',
      color: '#58c870',
      secColor: '#207038',
      desc: 'Cool and collected. Its speed and grass-type blades slice through adversaries.',
      seed: 252 * 34567,
      bodyType: 1,
      stats: { hp: 40, atk: 45, def: 35, speed: 70 }
    },
    {
      id: 255,
      name: 'Blazechic',
      type: 'Fire',
      color: '#f85830',
      secColor: '#ffcc00',
      desc: 'Brave and energetic. Shoots flames and scales up to fire blasts upon leveling.',
      seed: 255 * 34567,
      bodyType: 2,
      stats: { hp: 45, atk: 60, def: 40, speed: 45 }
    },
    {
      id: 258,
      name: 'Marshmud',
      type: 'Water',
      color: '#4888f0',
      secColor: '#f87020',
      desc: 'Sturdy and resilient. High defensive metrics and hydro-pulse typing counters.',
      seed: 258 * 34567,
      bodyType: 5,
      stats: { hp: 50, atk: 70, def: 50, speed: 40 }
    }
  ];

  const handleSelect = () => {
    selectStarter(starters[focusedIndex].id);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setFocusedIndex(i => (i - 1 + 3) % 3);
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setFocusedIndex(i => (i + 1) % 3);
      } else if (e.key === 'Enter' || e.key === ' ') {
        handleSelect();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex]);

  useGamepad({
    onLeft: () => setFocusedIndex(i => (i - 1 + 3) % 3),
    onRight: () => setFocusedIndex(i => (i + 1) % 3),
    onA: handleSelect
  });

  return (
    <div className="min-h-screen bg-[#03060f] text-gray-100 flex flex-col items-center justify-center p-6 scanlines relative overflow-hidden select-none">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none animate-pulse" />

      <div className="text-center flex flex-col items-center gap-3 mb-8 z-10 max-w-lg">
        <BrandLogo height={42} />
        <span className="text-xs font-mono tracking-widest text-emerald-400 font-extrabold uppercase">Archipelago League Entry</span>
        <h1 className="text-3xl font-black text-white tracking-wider">CHOOSE YOUR STARTER</h1>
        <p className="text-xs text-gray-400">
          Welcome to your custom Pokémon Emerald adventure! Move left/right to browse the starters, and press A / Enter or virtual pad to select.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl z-10">
        {starters.map((starter, index) => {
          const isSelected = focusedIndex === index;
          return (
            <button
              key={starter.id}
              onClick={() => setFocusedIndex(index)}
              className={`p-6 rounded-2xl border text-center flex flex-col items-center justify-between gap-4 transition-all duration-300 relative group active:scale-95 cursor-pointer ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.2)] ring-2 ring-emerald-500/30'
                  : 'border-slate-850 bg-slate-900/30 hover:border-slate-700'
              }`}
            >
              <span className="absolute top-3 right-4 text-[9px] font-mono text-gray-500">Lv.5</span>
              
              <PokemonSprite
                pokemonId={starter.id}
                color={starter.color}
                secondaryColor={starter.secColor}
                shapeSeed={starter.seed}
                bodyType={starter.bodyType}
                size={120}
              />

              <div className="flex flex-col gap-1 w-full">
                <span className="font-extrabold text-lg text-white group-hover:text-emerald-400 transition-colors">
                  {starter.name}
                </span>
                <span className="text-[10px] uppercase font-mono font-bold text-gray-500">{starter.type} Type</span>
                <p className="text-xs text-gray-400 line-clamp-2 mt-1.5 px-2">{starter.desc}</p>
              </div>

              <div className="w-full flex flex-col gap-1.5 border-t border-slate-850/60 pt-3 text-[10px] font-mono text-gray-500">
                <div className="flex justify-between"><span>HP: {starter.stats.hp}</span><span>ATK: {starter.stats.atk}</span></div>
                <div className="flex justify-between"><span>DEF: {starter.stats.def}</span><span>SPD: {starter.stats.speed}</span></div>
              </div>

              {isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect();
                  }}
                  className="w-full py-2.5 bg-emerald-600 border border-emerald-500 hover:bg-emerald-500 text-white font-extrabold text-xs tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer mt-1"
                >
                  CHOOSE {starter.name.toUpperCase()}
                </button>
              )}
            </button>
          );
        })}
      </div>
      
      <VirtualController />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <GameProvider>
      <Dashboard />
    </GameProvider>
  );
};
export default App;
