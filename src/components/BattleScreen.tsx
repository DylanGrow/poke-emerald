import React, { useState, useEffect } from 'react';
import { useGame, ITEMS } from '../context/GameContext';
import { PokemonSprite } from './PokemonSprite';
import { getPokemonById } from '../db/pokemon';
import { useGamepad } from '../hooks/useGamepad';
import { Heart, Backpack, RefreshCw, LogOut } from 'lucide-react';
import { sound } from '../utils/sound';

const TYPE_EFFECTIVENESS: Record<string, Record<string, number>> = {
  Fire: { Grass: 2, Water: 0.5, Fire: 0.5, Rock: 0.5, Dragon: 0.5, Steel: 2, Ice: 2 },
  Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Grass: { Water: 2, Fire: 0.5, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Dragon: 0.5, Steel: 0.5 },
  Electric: { Water: 2, Grass: 0.5, Electric: 0.5, Flying: 2, Ground: 0, Dragon: 0.5 },
  Ice: { Grass: 2, Fire: 0.5, Water: 0.5, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Steel: 2, Dark: 2, Fairy: 0.5 },
  Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground: { Fire: 2, Grass: 0.5, Electric: 2, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying: { Grass: 2, Electric: 0.5, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Steel: 0.5, Dark: 0 },
  Bug: { Grass: 2, Fire: 0.5, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Steel: 0.5, Dark: 2, Fairy: 0.5 },
  Rock: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Steel: { Ice: 2, Rock: 2, Fairy: 2, Fire: 0.5, Water: 0.5, Electric: 0.5, Steel: 0.5 },
  Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Fairy: { Fighting: 2, Poison: 0.5, Dragon: 2, Steel: 0.5, Dark: 2, Fire: 0.5 }
};

export const BattleScreen: React.FC = () => {
  const {
    battle,
    team,
    bag,
    executeTurn,
    switchPokemon,
    useItemInBattle,
    runFromBattle
  } = useGame();

  const getMoveEffectiveness = (moveType: string, oppTypes: string[]): number => {
    let multiplier = 1.0;
    oppTypes.forEach(t => {
      if (TYPE_EFFECTIVENESS[moveType] && TYPE_EFFECTIVENESS[moveType][t] !== undefined) {
        multiplier *= TYPE_EFFECTIVENESS[moveType][t];
      }
    });
    return multiplier;
  };

  const [activeTab, setActiveTab] = useState<'main' | 'moves' | 'pokemon' | 'bag'>('main');
  
  // Selection highlights for keyboard/controller navigations
  const [focusedAction, setFocusedAction] = useState<number>(0); // 0: FIGHT, 1: POKEMON, 2: BAG, 3: RUN
  const [focusedMove, setFocusedMove] = useState<number>(0);
  const [focusedPoke, setFocusedPoke] = useState<number>(0);
  const [focusedBag, setFocusedBag] = useState<number>(0);

  // Dialog advancer state hooks
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [lastLogLength, setLastLogLength] = useState(0);
  const [introStage, setIntroStage] = useState<'sweep' | 'throw' | 'ready'>('sweep');

  // Trigger battle transition sequence on mount
  useEffect(() => {
    sound.playEncounter();
    
    // Staged timers to trigger visual sweep -> throw -> fight
    const sweepTimer = setTimeout(() => {
      setIntroStage('throw');
    }, 600);

    const readyTimer = setTimeout(() => {
      setIntroStage('ready');
    }, 1800);

    return () => {
      clearTimeout(sweepTimer);
      clearTimeout(readyTimer);
    };
  }, []);

  // Retro combat anim state flags
  const [playerAttackClass, setPlayerAttackClass] = useState('');
  const [oppAttackClass, setOppAttackClass] = useState('');
  const [playerHitClass, setPlayerHitClass] = useState('');
  const [oppHitClass, setOppHitClass] = useState('');
  const [redFlashClass, setRedFlashClass] = useState('');

  // Track historical hp to compute damage flashes/shakes
  const [prevPlayerHp, setPrevPlayerHp] = useState<number | null>(null);
  const [prevOppHp, setPrevOppHp] = useState<number | null>(null);

  // Sync log length changes and advance indices automatically
  useEffect(() => {
    if (battle) {
      if (battle.logs.length > lastLogLength) {
        if (lastLogLength > 0 && currentLogIndex === lastLogLength - 1) {
          setCurrentLogIndex(lastLogLength);
        }
        setLastLogLength(battle.logs.length);
      }
    } else {
      setLastLogLength(0);
      setCurrentLogIndex(0);
    }
  }, [battle?.logs.length, lastLogLength, currentLogIndex]);

  if (!battle) return null;

  const advanceLog = () => {
    if (currentLogIndex < battle.logs.length - 1) {
      sound.playSelect();
      setCurrentLogIndex(prev => prev + 1);
    }
  };

  const playerActive = team[battle.playerActiveIndex];
  const oppActive = battle.opponentTeam[battle.opponentActiveIndex];

  // Reset historical hp counters when active battling indexes shift (switches/faints)
  useEffect(() => {
    if (playerActive) {
      setPrevPlayerHp(playerActive.currentHp);
    }
  }, [battle.playerActiveIndex]);

  useEffect(() => {
    if (oppActive) {
      setPrevOppHp(oppActive.currentHp);
    }
  }, [battle.opponentActiveIndex]);

  // Handle battle damage animations
  useEffect(() => {
    if (prevPlayerHp === null || prevOppHp === null) {
      if (playerActive) setPrevPlayerHp(playerActive.currentHp);
      if (oppActive) setPrevOppHp(oppActive.currentHp);
      return;
    }

    const currPlayerHp = playerActive?.currentHp ?? 0;
    const currOppHp = oppActive?.currentHp ?? 0;

    if (currPlayerHp < prevPlayerHp) {
      setPlayerHitClass('animate-shake');
      setOppAttackClass('animate-slide-down-left');
      setRedFlashClass('animate-flash-red');
      
      const timer = setTimeout(() => {
        setPlayerHitClass('');
        setOppAttackClass('');
        setRedFlashClass('');
      }, 350);
      setPrevPlayerHp(currPlayerHp);
      return () => clearTimeout(timer);
    }

    if (currOppHp < prevOppHp) {
      setOppHitClass('animate-shake');
      setPlayerAttackClass('animate-slide-up-right');
      
      const timer = setTimeout(() => {
        setOppHitClass('');
        setPlayerAttackClass('');
      }, 350);
      setPrevOppHp(currOppHp);
      return () => clearTimeout(timer);
    }

    setPrevPlayerHp(currPlayerHp);
    setPrevOppHp(currOppHp);
  }, [playerActive?.currentHp, oppActive?.currentHp, battle]);

  const playerHpPct = Math.max(0, (playerActive.currentHp / playerActive.maxHp) * 100);
  const oppHpPct = Math.max(0, (oppActive.currentHp / oppActive.maxHp) * 100);

  const getHpColor = (pct: number) => {
    if (pct > 50) return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
    if (pct > 20) return 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]';
    return 'bg-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.5)] animate-pulse';
  };

  const getStatusBadge = (status?: string | null) => {
    if (!status) return null;
    const styles: Record<string, string> = {
      SLP: 'bg-indigo-600/40 text-indigo-300 border-indigo-500/30',
      PAR: 'bg-amber-500/40 text-amber-300 border-amber-500/30',
      PSN: 'bg-purple-600/40 text-purple-300 border-purple-500/30',
      BRN: 'bg-rose-600/40 text-rose-300 border-rose-500/30'
    };
    return (
      <span className={`px-1.5 py-[0.5px] rounded text-[8px] font-mono font-bold tracking-widest border uppercase ${styles[status] || 'bg-slate-800 text-slate-300'}`}>
        {status}
      </span>
    );
  };

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

  // Keyboard navigation & Gamepad action triggers
  const triggerA = () => {
    if (introStage !== 'ready') return;
    if (currentLogIndex < battle.logs.length - 1) {
      advanceLog();
      return;
    }
    if (activeTab === 'main') {
      if (focusedAction === 0) setActiveTab('moves');
      else if (focusedAction === 1) setActiveTab('pokemon');
      else if (focusedAction === 2) setActiveTab('bag');
      else if (focusedAction === 3) runFromBattle();
    } else if (activeTab === 'moves') {
      executeTurn(focusedMove);
      setActiveTab('main');
    } else if (activeTab === 'pokemon') {
      const isCurrent = focusedPoke === battle.playerActiveIndex;
      const isFainted = team[focusedPoke]?.currentHp <= 0;
      if (!isCurrent && !isFainted && focusedPoke < team.length) {
        switchPokemon(focusedPoke);
        setActiveTab('main');
      }
    } else if (activeTab === 'bag') {
      const itemKeys = Object.keys(ITEMS);
      const targetName = itemKeys[focusedBag];
      const count = bag[targetName] || 0;
      if (count > 0) {
        useItemInBattle(targetName);
        setActiveTab('main');
      }
    }
  };

  const triggerB = () => {
    if (activeTab !== 'main') {
      setActiveTab('main');
    }
  };

  const navLeft = () => {
    if (activeTab === 'main') {
      setFocusedAction(f => (f - 1 + 4) % 4);
    } else if (activeTab === 'moves') {
      setFocusedMove(f => (f - 1 + playerActive.moves.length) % playerActive.moves.length);
    } else if (activeTab === 'pokemon') {
      setFocusedPoke(f => (f - 1 + team.length) % team.length);
    } else if (activeTab === 'bag') {
      const itemKeys = Object.keys(ITEMS);
      setFocusedBag(f => (f - 1 + itemKeys.length) % itemKeys.length);
    }
  };

  const navRight = () => {
    if (activeTab === 'main') {
      setFocusedAction(f => (f + 1) % 4);
    } else if (activeTab === 'moves') {
      setFocusedMove(f => (f + 1) % playerActive.moves.length);
    } else if (activeTab === 'pokemon') {
      setFocusedPoke(f => (f + 1) % team.length);
    } else if (activeTab === 'bag') {
      const itemKeys = Object.keys(ITEMS);
      setFocusedBag(f => (f + 1) % itemKeys.length);
    }
  };

  // Keyboard hooks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (introStage !== 'ready') {
        e.preventDefault();
        return;
      }
      if (currentLogIndex < battle.logs.length - 1) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'z' || e.key === 'x') {
          advanceLog();
          e.preventDefault();
        }
        return;
      }

      // Direct move select hotkeys: 1, 2, 3, 4
      if (e.key === '1' && playerActive.moves[0]) {
        executeTurn(0);
        setActiveTab('main');
        return;
      }
      if (e.key === '2' && playerActive.moves[1]) {
        executeTurn(1);
        setActiveTab('main');
        return;
      }
      if (e.key === '3' && playerActive.moves[2]) {
        executeTurn(2);
        setActiveTab('main');
        return;
      }
      if (e.key === '4' && playerActive.moves[3]) {
        executeTurn(3);
        setActiveTab('main');
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          // Up mapping
          if (activeTab === 'moves') {
            setFocusedMove(f => (f - 2 + playerActive.moves.length) % playerActive.moves.length);
          } else if (activeTab === 'pokemon') {
            setFocusedPoke(f => (f - 3 + team.length) % team.length);
          } else if (activeTab === 'bag') {
            setFocusedBag(f => (f - 2 + Object.keys(ITEMS).length) % Object.keys(ITEMS).length);
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          // Down mapping
          if (activeTab === 'moves') {
            setFocusedMove(f => (f + 2) % playerActive.moves.length);
          } else if (activeTab === 'pokemon') {
            setFocusedPoke(f => (f + 3) % team.length);
          } else if (activeTab === 'bag') {
            setFocusedBag(f => (f + 2) % Object.keys(ITEMS).length);
          }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          navLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          navRight();
          break;
        case 'Enter':
        case ' ':
        case 'e':
        case 'E':
          triggerA();
          break;
        case 'Escape':
        case 'q':
        case 'Q':
        case 'Backspace':
          triggerB();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, focusedAction, focusedMove, focusedPoke, focusedBag, battle, playerActive, team, currentLogIndex, introStage]);

  // Controller support
  useGamepad({
    onUp: () => {
      if (activeTab === 'moves') setFocusedMove(f => (f - 2 + playerActive.moves.length) % playerActive.moves.length);
      else if (activeTab === 'pokemon') setFocusedPoke(f => (f - 3 + team.length) % team.length);
      else if (activeTab === 'bag') setFocusedBag(f => (f - 2 + Object.keys(ITEMS).length) % Object.keys(ITEMS).length);
    },
    onDown: () => {
      if (activeTab === 'moves') setFocusedMove(f => (f + 2) % playerActive.moves.length);
      else if (activeTab === 'pokemon') setFocusedPoke(f => (f + 3) % team.length);
      else if (activeTab === 'bag') setFocusedBag(f => (f + 2) % Object.keys(ITEMS).length);
    },
    onLeft: navLeft,
    onRight: navRight,
    onA: triggerA,
    onB: triggerB
  });

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-950/80 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl scanlines relative overflow-hidden flex flex-col gap-6">
      
      {/* Outer Glow Details */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none" />

      {/* Battle Arena */}
      <div className="relative w-full h-80 bg-gradient-to-b from-slate-900/60 to-slate-950/90 rounded-xl border border-gray-800 p-4 flex flex-col justify-between overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
        
        {/* GBA Animation Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes slide-out-bar {
            0% { transform: scaleX(1); }
            100% { transform: scaleX(0); }
          }
          @keyframes slide-in-arena-right {
            0% { transform: translateX(120%); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }
          @keyframes fade-out-trainer {
            0% { transform: translateX(0); opacity: 1; }
            80% { transform: translateX(-20px); opacity: 1; }
            100% { transform: translateX(-80px); opacity: 0; }
          }
          @keyframes throw-ball {
            0% { transform: translate(-30px, 20px) scale(0.6) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { transform: translate(50px, -35px) scale(1.1) rotate(270deg); opacity: 1; }
            100% { transform: translate(95px, 25px) scale(0.6) rotate(360deg); opacity: 0; }
          }
          @keyframes ball-burst {
            0% { transform: scale(0); opacity: 0; }
            10% { opacity: 1; }
            50% { transform: scale(2.2); opacity: 0.8; filter: brightness(2.5); }
            100% { transform: scale(3.2); opacity: 0; }
          }
          @keyframes release-pokemon {
            0% { transform: scale(0); opacity: 0; filter: brightness(2.5); }
            40% { transform: scale(1.2); opacity: 1; filter: brightness(2); }
            100% { transform: scale(1); opacity: 1; filter: brightness(1); }
          }
        `}} />

        {/* Sweep intro cover overlay */}
        {introStage === 'sweep' && (
          <div className="absolute inset-0 bg-slate-950 z-[40] grid grid-rows-6 gap-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className="h-full bg-slate-950 origin-left"
                style={{ 
                  animation: 'slide-out-bar 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
                  animationDelay: `${i * 45}ms`
                }}
              />
            ))}
          </div>
        )}

        {/* Cinematic Trainer Throw Overlay */}
        {introStage === 'throw' ? (
          <div className="absolute inset-0 bg-[#060913] flex flex-col justify-between p-4 z-10">
            {/* Opponent side */}
            <div className="flex justify-end items-start mt-4 pr-12">
              <div 
                className="flex flex-col items-center gap-2"
                style={{ animation: 'slide-in-arena-right 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' }}
              >
                <PokemonSprite 
                  pokemonId={oppActive.pokemonId} 
                  color={oppActive.color} 
                  secondaryColor={oppActive.secondaryColor} 
                  shapeSeed={oppActive.shapeSeed} 
                  bodyType={oppActive.bodyType} 
                  size={110}
                  shiny={oppActive.shiny}
                />
                <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded shadow-md animate-pulse">
                  Wild {oppActive.name.toUpperCase()} appeared!
                </span>
              </div>
            </div>

            {/* Player side */}
            <div className="flex justify-start items-end mb-4 pl-12 relative h-36">
              {/* Trainer Silhouette */}
              <div 
                className="flex flex-col items-center relative z-10"
                style={{ animation: 'fade-out-trainer 0.7s 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' }}
              >
                <svg viewBox="0 0 100 100" className="w-24 h-24 fill-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                  <rect x="40" y="10" width="20" height="20" rx="4" />
                  <rect x="42" y="15" width="16" height="5" fill="#03060f" />
                  <rect x="35" y="32" width="30" height="35" rx="6" />
                  <rect x="30" y="38" width="8" height="20" rx="3" />
                  <rect x="62" y="38" width="8" height="20" rx="3" />
                  <path d="M 60 18 L 72 18 L 70 22 L 60 22 Z" fill="#34d399" />
                </svg>
                <span className="text-[9px] font-mono font-black text-emerald-400 uppercase tracking-widest bg-slate-900/90 border border-emerald-500/20 px-2.5 py-0.5 rounded shadow-md">
                  Go! {playerActive.nickname.toUpperCase()}!
                </span>
              </div>

              {/* Poké Ball projectile */}
              <div 
                className="absolute left-20 bottom-12 z-25"
                style={{ animation: 'throw-ball 0.6s 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards', opacity: 0 }}
              >
                <div className="w-5 h-5 rounded-full border border-slate-950 bg-red-500 relative overflow-hidden animate-spin">
                  <div className="absolute bottom-0 left-0 right-0 h-2.5 bg-white" />
                  <div className="absolute top-[9px] left-0 right-0 h-[1.5px] bg-slate-950" />
                  <div className="absolute top-[6.5px] left-[6.5px] w-1.5 h-1.5 rounded-full bg-white border border-slate-950" />
                </div>
              </div>

              {/* Release Flash effect */}
              <div 
                className="absolute left-48 bottom-12 w-8 h-8 rounded-full bg-emerald-300 pointer-events-none z-30"
                style={{ 
                  animation: 'ball-burst 0.4s 1.1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
                  opacity: 0,
                  transform: 'scale(0)' 
                }}
              />

              {/* Released Pokemon */}
              <div 
                className="absolute left-44 bottom-2 z-20"
                style={{ 
                  animation: 'release-pokemon 0.6s 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                  opacity: 0,
                  transform: 'scale(0)'
                }}
              >
                <PokemonSprite 
                  pokemonId={playerActive.pokemonId} 
                  color={getPokemonById(playerActive.pokemonId).color} 
                  secondaryColor={getPokemonById(playerActive.pokemonId).secondaryColor} 
                  shapeSeed={getPokemonById(playerActive.pokemonId).shapeSeed} 
                  bodyType={getPokemonById(playerActive.pokemonId).bodyType} 
                  size={110}
                  shiny={playerActive.shiny}
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {redFlashClass && (
              <div className={`absolute inset-0 bg-red-600/30 z-30 pointer-events-none transition-opacity ${redFlashClass}`} />
            )}

            {/* Top: Opponent */}
            <div className="flex justify-between items-start z-10">
              <div className="bg-gray-900/90 border border-gray-850 p-3 rounded-lg w-72 backdrop-blur-md shadow-lg flex flex-col gap-1.5 transform hover:scale-[1.02] transition-transform duration-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-bold tracking-wide flex items-center gap-1">
                      {oppActive.name}
                      {oppActive.shiny && <span className="text-yellow-400 animate-pulse text-[11px]" title="Shiny">✨</span>}
                    </span>
                    {getStatusBadge(oppActive.status)}
                  </div>
                  <span className="text-xs font-mono text-emerald-400">Lv.{oppActive.level}</span>
                </div>
                <div className="w-full h-3 bg-gray-950 rounded-full overflow-hidden border border-gray-800 p-[1.5px]">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${getHpColor(oppHpPct)}`} 
                    style={{ width: `${oppHpPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-gray-400">
                  <div className="flex gap-1">
                    {oppActive.types.map(t => (
                      <span key={t} className="px-1.5 py-[1px] rounded text-[8px] bg-slate-800 text-slate-300 border border-slate-700">{t}</span>
                    ))}
                  </div>
                  <span>{oppActive.currentHp} / {oppActive.maxHp} HP</span>
                </div>
              </div>

              <div className={`mr-8 flex items-center justify-center h-28 w-28 relative transition-transform duration-300 ${oppAttackClass} ${oppHitClass}`}>
                {oppHitClass && (
                  <div className="absolute inset-0 bg-rose-650/30 rounded-full filter blur-md animate-pulse z-0 pointer-events-none" />
                )}
                <PokemonSprite 
                  pokemonId={oppActive.pokemonId} 
                  color={oppActive.color} 
                  secondaryColor={oppActive.secondaryColor} 
                  shapeSeed={oppActive.shapeSeed} 
                  bodyType={oppActive.bodyType} 
                  size={110}
                  animating={battle.isCatching}
                  shiny={oppActive.shiny}
                />
              </div>
            </div>

            {/* Bottom: Player */}
            <div className="flex justify-between items-end z-10">
              <div className={`ml-8 flex items-center justify-center h-28 w-28 relative transition-transform duration-300 ${playerAttackClass} ${playerHitClass}`}>
                {playerHitClass && (
                  <div className="absolute inset-0 bg-rose-650/30 rounded-full filter blur-md animate-pulse z-0 pointer-events-none" />
                )}
                <PokemonSprite 
                  pokemonId={playerActive.pokemonId} 
                  color={getPokemonById(playerActive.pokemonId).color} 
                  secondaryColor={getPokemonById(playerActive.pokemonId).secondaryColor} 
                  shapeSeed={getPokemonById(playerActive.pokemonId).shapeSeed} 
                  bodyType={getPokemonById(playerActive.pokemonId).bodyType} 
                  size={110}
                  shiny={playerActive.shiny}
                />
              </div>

              <div className="bg-gray-900/90 border border-emerald-500/20 p-3 rounded-lg w-72 backdrop-blur-md shadow-lg flex flex-col gap-1.5 transform hover:scale-[1.02] transition-transform duration-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-bold tracking-wide text-emerald-400 flex items-center gap-1">
                      {playerActive.nickname}
                      {playerActive.shiny && <span className="text-yellow-400 animate-pulse text-[11px]" title="Shiny">✨</span>}
                    </span>
                    {getStatusBadge(playerActive.status)}
                  </div>
                  <span className="text-xs font-mono text-gray-400">Lv.{playerActive.level}</span>
                </div>
                <div className="w-full h-3 bg-gray-950 rounded-full overflow-hidden border border-gray-800 p-[1.5px]">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${getHpColor(playerHpPct)}`} 
                    style={{ width: `${playerHpPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-gray-400">
                  <span>HP: {playerActive.currentHp} / {playerActive.maxHp}</span>
                  <span>XP: {playerActive.xp} / {playerActive.xpToNext}</span>
                </div>
                <div className="w-full h-[3px] bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${Math.min(100, (playerActive.xp / playerActive.xpToNext) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {battle.isCatching && (
          <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[2px] flex items-center justify-center z-30 animate-pulse">
            <div className="text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
              <span className="font-mono text-sm tracking-widest text-emerald-400 animate-bounce">THROWING BALL...</span>
            </div>
          </div>
        )}
      </div>

      {/* Battle Log Message Center */}
      <div 
        onClick={advanceLog}
        className={`w-full h-24 bg-gray-900 border-2 rounded-xl p-4 font-mono text-sm text-gray-200 relative shadow-md flex items-center justify-between cursor-pointer select-none transition-all duration-300 ${
          currentLogIndex < battle.logs.length - 1
            ? 'border-emerald-500 bg-[#070d1a] shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:border-emerald-400' 
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex gap-3 items-center pr-8">
          <span className="text-emerald-400 font-extrabold text-md animate-pulse">&gt;</span>
          <span className="leading-relaxed font-bold tracking-wide">
            {battle.logs[currentLogIndex] || ''}
          </span>
        </div>
        
        {currentLogIndex < battle.logs.length - 1 && (
          <div className="absolute bottom-2.5 right-3.5 flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider select-none animate-pulse">
            <span>NEXT</span>
            <span className="animate-bounce text-sm">▼</span>
          </div>
        )}
      </div>

      {/* Action / Controls Panel */}
      {currentLogIndex < battle.logs.length - 1 ? (
        <div 
          onClick={advanceLog}
          className="w-full py-6 bg-slate-900/30 border border-slate-850 rounded-2xl flex items-center justify-center font-mono text-[10px] text-emerald-400/70 font-extrabold uppercase tracking-widest cursor-pointer hover:bg-slate-900/50 transition-all select-none animate-pulse"
        >
          <span>Click log box or press SPACE / ENTER to continue...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Tab Selection */}
        {activeTab === 'main' && (
          <>
            <button 
              onClick={() => setActiveTab('moves')} 
              disabled={playerActive.currentHp <= 0}
              className={`py-4 rounded-xl font-bold bg-emerald-600/25 border hover:bg-emerald-600/40 text-emerald-300 shadow-lg hover:shadow-emerald-500/10 active:scale-95 transition-all flex flex-col items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none ${
                focusedAction === 0 ? 'border-emerald-400 ring-2 ring-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-emerald-500/50'
              }`}
            >
              <Heart className="w-5 h-5 text-emerald-400" />
              <span>FIGHT (1-4)</span>
            </button>
            <button 
              onClick={() => setActiveTab('pokemon')}
              className={`py-4 rounded-xl font-bold bg-blue-600/25 border hover:bg-blue-600/40 text-blue-300 shadow-lg hover:shadow-blue-500/10 active:scale-95 transition-all flex flex-col items-center gap-1.5 ${
                focusedAction === 1 ? 'border-blue-400 ring-2 ring-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-blue-500/50'
              }`}
            >
              <RefreshCw className="w-5 h-5 text-blue-400" />
              <span>POKÉMON</span>
            </button>
            <button 
              onClick={() => setActiveTab('bag')}
              className={`py-4 rounded-xl font-bold bg-amber-600/25 border hover:bg-amber-600/40 text-amber-300 shadow-lg hover:shadow-amber-500/10 active:scale-95 transition-all flex flex-col items-center gap-1.5 ${
                focusedAction === 2 ? 'border-amber-400 ring-2 ring-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-amber-500/50'
              }`}
            >
              <Backpack className="w-5 h-5 text-amber-400" />
              <span>BAG</span>
            </button>
            <button 
              onClick={runFromBattle}
              className={`py-4 rounded-xl font-bold bg-rose-600/25 border hover:bg-rose-600/40 text-rose-300 shadow-lg hover:shadow-rose-500/10 active:scale-95 transition-all flex flex-col items-center gap-1.5 ${
                focusedAction === 3 ? 'border-rose-400 ring-2 ring-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'border-rose-500/50'
              }`}
            >
              <LogOut className="w-5 h-5 text-rose-400" />
              <span>RUN</span>
            </button>
          </>
        )}

        {/* Moves Selection */}
        {activeTab === 'moves' && (
          <div className="col-span-4 flex flex-col gap-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-mono tracking-widest text-gray-400">SELECT MOVES (1-4 OR ARROWS)</span>
              <button 
                onClick={() => setActiveTab('main')} 
                className="text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 font-bold"
              >
                BACK
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {playerActive.moves.map((move, index) => {
                const eff = getMoveEffectiveness(move.type, oppActive.types);
                const currentPp = move.currentPp !== undefined ? move.currentPp : move.pp;
                const isOutOfPp = currentPp <= 0;
                
                return (
                  <button
                    key={index}
                    disabled={isOutOfPp}
                    onClick={() => {
                      executeTurn(index);
                      setActiveTab('main');
                    }}
                    className={`py-3 px-2 rounded-xl border shadow-md active:scale-95 transition-all flex flex-col items-center justify-center gap-1 text-center ${
                      isOutOfPp
                        ? 'border-rose-950/20 bg-slate-950/15 opacity-40 cursor-not-allowed shadow-none'
                        : focusedMove === index 
                        ? 'border-emerald-400 bg-slate-900 ring-2 ring-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                        : 'border-slate-850 hover:border-emerald-500/40 hover:bg-slate-900/60'
                    }`}
                  >
                    <span className="font-bold text-sm tracking-wide">{move.name}</span>
                    <span className={`text-[9px] px-2 py-[2px] rounded uppercase font-semibold ${getTypeStyle(move.type)}`}>
                      {move.type}
                    </span>
                    
                    {/* QoL Type Advantage Indicator */}
                    {isOutOfPp ? (
                      <span className="text-[8px] font-mono font-black text-rose-500 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/20 uppercase tracking-widest animate-pulse">OUT OF PP</span>
                    ) : eff > 1 ? (
                      <span className="text-[8px] font-mono font-black text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">x{eff} EFFECTIVE</span>
                    ) : eff < 1 && eff > 0 ? (
                      <span className="text-[8px] font-mono font-bold text-rose-450 bg-rose-950/20 px-1.5 py-0.5 rounded border border-rose-500/20 uppercase tracking-widest">x{eff} WEAK</span>
                    ) : eff === 0 ? (
                      <span className="text-[8px] font-mono font-bold text-slate-500 bg-slate-950/20 px-1.5 py-0.5 rounded border border-slate-850 uppercase tracking-widest">NO EFFECT</span>
                    ) : (
                      <span className="text-[8px] font-mono text-slate-500 font-medium">x{eff} NORMAL</span>
                    )}

                    <div className="flex items-center gap-2 mt-0.5 text-[8.5px] font-mono">
                      <span className="text-slate-500">PWR: {move.power}</span>
                      <span className={currentPp <= 3 ? 'text-rose-400 font-bold' : currentPp <= 6 ? 'text-yellow-400' : 'text-slate-400'}>
                        PP: {currentPp}/{move.pp}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Pokemon Switch Selection */}
        {activeTab === 'pokemon' && (
          <div className="col-span-4 flex flex-col gap-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-mono tracking-widest text-gray-400">CHOOSE POKÉMON TO SWITCH</span>
              <button 
                onClick={() => setActiveTab('main')} 
                className="text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 font-bold"
              >
                BACK
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {team.map((poke, index) => {
                const dbInfo = getPokemonById(poke.pokemonId);
                const isCurrent = index === battle.playerActiveIndex;
                const isFainted = poke.currentHp <= 0;
                
                return (
                  <button
                    key={poke.id}
                    disabled={isCurrent || isFainted}
                    onClick={() => {
                      switchPokemon(index);
                      setActiveTab('main');
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-between text-center relative group active:scale-95 transition-all ${
                      focusedPoke === index
                        ? 'border-blue-400 bg-slate-900 ring-2 ring-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                        : isCurrent 
                        ? 'border-emerald-500/40 bg-emerald-950/10 cursor-default font-medium' 
                        : isFainted 
                        ? 'border-rose-900/30 bg-rose-950/5 opacity-55 cursor-not-allowed'
                        : 'border-slate-850 hover:border-blue-500/40 hover:bg-slate-900/60'
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute top-1 right-1 text-[8px] font-mono font-bold text-emerald-400 border border-emerald-500/30 px-1 rounded uppercase bg-emerald-950">ACTIVE</span>
                    )}
                    {isFainted && (
                      <span className="absolute top-1 right-1 text-[8px] font-mono font-bold text-rose-400 border border-rose-500/30 px-1 rounded uppercase bg-rose-950">FAINT</span>
                    )}
                    <PokemonSprite 
                      pokemonId={poke.pokemonId}
                      color={dbInfo.color}
                      secondaryColor={dbInfo.secondaryColor}
                      shapeSeed={dbInfo.shapeSeed}
                      bodyType={dbInfo.bodyType}
                      size={48}
                    />
                    <div className="mt-1 flex flex-col gap-0.5">
                      <span className="font-bold text-xs truncate max-w-[80px]">{poke.nickname}</span>
                      <span className="text-[9px] font-mono text-gray-500">Lv.{poke.level}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Inventory Item Selection */}
        {activeTab === 'bag' && (
          <div className="col-span-4 flex flex-col gap-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-mono tracking-widest text-gray-400">USE BATTLE INVENTORY</span>
              <button 
                onClick={() => setActiveTab('main')} 
                className="text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 font-bold"
              >
                BACK
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(ITEMS).map(([name, itemData], index) => {
                const count = bag[name] || 0;
                
                return (
                  <button
                    key={name}
                    disabled={count <= 0}
                    onClick={() => {
                      useItemInBattle(name);
                      setActiveTab('main');
                    }}
                    className={`p-3 rounded-xl border flex justify-between items-center text-left active:scale-95 transition-all ${
                      focusedBag === index
                        ? 'border-amber-400 bg-slate-900 ring-2 ring-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : count <= 0 
                        ? 'border-slate-900 bg-slate-950/20 opacity-40 cursor-not-allowed'
                        : 'border-slate-850 hover:border-amber-500/40 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 max-w-[80%]">
                      <span className="font-bold text-xs">{name}</span>
                      <span className="text-[9px] text-gray-500 line-clamp-1">{itemData.description}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-mono font-bold text-amber-400">x{count}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
};
export default BattleScreen;
