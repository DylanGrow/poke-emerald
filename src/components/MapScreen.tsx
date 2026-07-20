import React, { useState, useEffect } from 'react';
import { useGame, ITEMS } from '../context/GameContext';
import { GYMS } from '../db/gyms';
import { ROUTE_TRAINERS } from '../db/trainers';
import { useGamepad } from '../hooks/useGamepad';
import { sound } from '../utils/sound';
import { Shield, Sparkles, MapPin, ShoppingCart, Heart, Activity, Swords, Navigation } from 'lucide-react';

interface GridNode {
  row: number;
  col: number;
  type: 'town' | 'center' | 'mart' | 'grass' | 'shore' | 'cave' | 'gym' | 'elite' | 'path';
  name: string;
  gymId?: number;
}

export const MapScreen: React.FC = () => {
  const {
    activeIsland,
    currentLocation,
    badgesDefeated,
    beatenTrainers,
    eliteDefeatedCount,
    money,
    healTeam,
    purchaseItem,
    startWildBattle,
    startTrainerBattle,
    startGymBattle,
    startEliteBattle,
    travelToIsland,
    setLocation,
    battle
  } = useGame();

  const [playerPos, setPlayerPos] = useState<{ row: number; col: number }>({ row: 2, col: 2 });
  const [selectedNode, setSelectedNode] = useState<GridNode | null>(null);

  const getIslandGyms = (islandNum: number) => {
    return GYMS.filter(g => g.island === islandNum);
  };

  const currentGyms = getIslandGyms(activeIsland);
  const totalBadgesEarned = badgesDefeated.length;

  const islandNames = [
    '',
    'Emerald Archipelago (Isle 1)',
    'Ruby Shoreline (Isle 2)',
    'Sapphire Trench (Isle 3)',
    'Origin Crater (Isle 4)'
  ];

  // Helper to build 5x5 grid map dynamically for the active island
  const getGridMap = (islandNum: number): GridNode[][] => {
    const grid: GridNode[][] = [];
    const gyms = getIslandGyms(islandNum);

    for (let r = 0; r < 5; r++) {
      const rowNodes: GridNode[] = [];
      for (let c = 0; c < 5; c++) {
        let node: GridNode = {
          row: r,
          col: c,
          type: 'path',
          name: 'Sea Path'
        };

        if (r === 2 && c === 2) {
          node = { row: r, col: c, type: 'town', name: 'Main Plaza' };
        } else if (r === 2 && c === 1) {
          node = { row: r, col: c, type: 'center', name: 'Pokémon Center' };
        } else if (r === 2 && c === 3) {
          node = { row: r, col: c, type: 'mart', name: 'PokéMart' };
        } else if (r === 1 && c === 2) {
          node = { row: r, col: c, type: 'grass', name: 'Tall Grass' };
        } else if (r === 1 && c === 4) {
          node = { row: r, col: c, type: 'grass', name: 'Thick Foliage' };
        } else if (r === 3 && c === 2) {
          node = { row: r, col: c, type: 'shore', name: 'Sandy Shore' };
        } else if (r === 3 && c === 0) {
          node = { row: r, col: c, type: 'shore', name: 'Tidal Waves' };
        } else if (r === 1 && c === 0) {
          node = { row: r, col: c, type: 'cave', name: 'Dark Cave' };
        } else if (r === 3 && c === 4) {
          node = { row: r, col: c, type: 'cave', name: 'Rocky Cavern' };
        }

        const gymCoordinates = [
          { r: 0, c: 0, index: 0 },
          { r: 0, c: 4, index: 1 },
          { r: 2, c: 0, index: 2 },
          { r: 2, c: 4, index: 3 },
          { r: 4, c: 0, index: 4 },
          { r: 4, c: 4, index: 5 },
          { r: 0, c: 2, index: 6 },
          { r: 4, c: 2, index: 7 }
        ];

        const matchGym = gymCoordinates.find(coord => coord.r === r && coord.c === c);
        if (matchGym && matchGym.index < gyms.length) {
          const gym = gyms[matchGym.index];
          node = {
            row: r,
            col: c,
            type: 'gym',
            name: `${gym.leader}'s Gym`,
            gymId: gym.id
          };
        }

        if (islandNum === 4 && r === 4 && c === 2) {
          node = {
            row: r,
            col: c,
            type: 'elite',
            name: 'Elite 16 Gauntlet'
          };
        }

        rowNodes.push(node);
      }
      grid.push(rowNodes);
    }
    return grid;
  };

  const currentGrid = getGridMap(activeIsland);

  // Set default selection to main plaza on active island change
  useEffect(() => {
    setPlayerPos({ row: 2, col: 2 });
    const plazaNode = currentGrid[2][2];
    setSelectedNode(plazaNode);
    setLocation('Main Plaza');
  }, [activeIsland]);

  const handleCellClick = (node: GridNode) => {
    setSelectedNode(node);

    const isCurrentlyHere = playerPos.row === node.row && playerPos.col === node.col;
    const isAdjacent = Math.abs(playerPos.row - node.row) + Math.abs(playerPos.col - node.col) === 1;
    const hasSurf = badgesDefeated.includes(5);
    const hasFly = badgesDefeated.includes(6);

    // Adjacent Walk movement
    if (isAdjacent) {
      if (node.type === 'shore' && !hasSurf) {
        sound.playHit(); // Play bump sound
        return;
      }
      setPlayerPos({ row: node.row, col: node.col });
      setLocation(node.name);
      if (node.type === 'center') {
        healTeam();
      }
    }
    // Fly Teleport fast-travel to safe places (town, center, mart)
    else if (hasFly && ['town', 'center', 'mart'].includes(node.type) && !isCurrentlyHere) {
      sound.playEncounter(); // Retro whoosh teleport BGM siren sound
      setPlayerPos({ row: node.row, col: node.col });
      setLocation(node.name);
      if (node.type === 'center') {
        healTeam();
      }
    }
  };

  // Player Grid Movement Logic (Keyboard/Arrows)
  const movePlayer = (dr: number, dc: number) => {
    const nextRow = Math.max(0, Math.min(4, playerPos.row + dr));
    const nextCol = Math.max(0, Math.min(4, playerPos.col + dc));
    if (nextRow !== playerPos.row || nextCol !== playerPos.col) {
      const node = currentGrid[nextRow][nextCol];
      const hasSurf = badgesDefeated.includes(5);
      
      if (node.type === 'shore' && !hasSurf) {
        sound.playHit(); // Bump sound
        return;
      }
      
      setPlayerPos({ row: nextRow, col: nextCol });
      setSelectedNode(node);
      setLocation(node.name);
      if (node.type === 'center') {
        healTeam();
      }
    }
  };

  const triggerSelectedAction = () => {
    if (!selectedNode) return;
    if (['grass', 'shore', 'cave'].includes(selectedNode.type)) {
      startWildBattle(activeIsland);
    } else if (selectedNode.type === 'gym' && selectedNode.gymId) {
      const isBeaten = badgesDefeated.includes(selectedNode.gymId);
      const isLocked = selectedNode.gymId > 1 && !badgesDefeated.includes(selectedNode.gymId - 1);
      if (!isBeaten && !isLocked) {
        startGymBattle(selectedNode.gymId);
      }
    } else if (selectedNode.type === 'elite' && totalBadgesEarned >= 30) {
      startEliteBattle();
    }
  };

  // Keyboard support: arrow keys & WASD
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when battling or typing inside SaveManager passcode inputs
      if (battle || document.activeElement?.tagName === 'INPUT') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          movePlayer(-1, 0);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          movePlayer(1, 0);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movePlayer(0, -1);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movePlayer(0, 1);
          break;
        case 'Enter':
        case ' ':
        case 'e':
        case 'E':
          triggerSelectedAction();
          break;
        case 'Escape':
        case 'q':
        case 'Q':
          if (currentLocation === 'PokeMart') {
            setLocation('Main Plaza');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, selectedNode, activeIsland, battle, currentLocation]);

  // Controller support: gamepad D-pad & Analog stick
  useGamepad({
    onUp: () => movePlayer(-1, 0),
    onDown: () => movePlayer(1, 0),
    onLeft: () => movePlayer(0, -1),
    onRight: () => movePlayer(0, 1),
    onA: () => triggerSelectedAction(),
    onB: () => {
      if (currentLocation === 'PokeMart') {
        setLocation('Main Plaza');
      }
    }
  }, !battle);

  const getNodeColor = (type: GridNode['type'], isSelected: boolean, isPlayerHere: boolean) => {
    if (isPlayerHere) return 'border-emerald-400 bg-emerald-950/40 text-emerald-300 ring-2 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.4)]';
    if (isSelected) return 'border-blue-400 bg-blue-950/20 text-blue-300';
    
    switch (type) {
      case 'town': return 'border-slate-800 bg-slate-900/40 hover:border-slate-700';
      case 'center': return 'border-rose-950 bg-rose-950/10 hover:border-rose-500/30 text-rose-400';
      case 'mart': return 'border-blue-950 bg-blue-950/10 hover:border-blue-500/30 text-blue-400';
      case 'grass': return 'border-emerald-950 bg-emerald-950/10 hover:border-emerald-500/30 text-emerald-400';
      case 'shore': return 'border-cyan-950 bg-cyan-950/10 hover:border-cyan-500/30 text-cyan-400';
      case 'cave': return 'border-amber-950 bg-amber-950/10 hover:border-amber-500/30 text-amber-400';
      case 'gym': return 'border-yellow-950 bg-yellow-950/10 hover:border-yellow-500/30 text-yellow-400';
      case 'elite': return 'border-red-950 bg-red-950/10 hover:border-red-500/30 text-red-400 animate-pulse';
      case 'path': return 'border-slate-900 bg-slate-950/5 opacity-60 hover:opacity-100 hover:border-slate-850';
    }
  };

  const getNodeIcon = (type: GridNode['type']) => {
    switch (type) {
      case 'town': return <MapPin className="w-4 h-4" />;
      case 'center': return <Heart className="w-4 h-4" />;
      case 'mart': return <ShoppingCart className="w-4 h-4" />;
      case 'grass': return <Activity className="w-4 h-4" />;
      case 'shore': return <Sparkles className="w-4 h-4" />;
      case 'cave': return <Shield className="w-4 h-4" />;
      case 'gym': return <Shield className="w-4 h-4 text-yellow-400" />;
      case 'elite': return <Swords className="w-4 h-4 text-red-500" />;
      case 'path': return <Navigation className="w-3.5 h-3.5 rotate-45 opacity-30" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-950/80 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col gap-6">
      
      {/* Outer Glow Details */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-850 pb-4 gap-4 z-10">
        <div>
          <h2 className="text-xl font-black text-emerald-400 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            {islandNames[activeIsland]}
          </h2>
          <span className="text-xs font-mono text-gray-400">Current Node: {currentLocation}</span>
        </div>
        
        {/* Island Selector Tabs */}
        <div className="flex gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-gray-800">
          {[1, 2, 3, 4].map(num => {
            const isUnlocked = num === 1 || totalBadgesEarned >= (num - 1) * 8;
            return (
              <button
                key={num}
                disabled={!isUnlocked}
                onClick={() => travelToIsland(num)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeIsland === num 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : isUnlocked 
                    ? 'hover:bg-slate-800 text-gray-300' 
                    : 'text-gray-650 cursor-not-allowed opacity-30'
                }`}
              >
                Isle {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map Arena Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 z-10">
        
        {/* Left 2 Cols: Interactive 5x5 Map Grid */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="bg-slate-950/60 border border-slate-850 p-6 rounded-xl flex items-center justify-center shadow-inner relative">
            <div className="absolute inset-0 bg-[radial-gradient(#10b981_0.8px,transparent_0.8px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
            
            {/* 5x5 Map Grid */}
            <div className="grid grid-cols-5 gap-3.5 w-full max-w-[340px]">
              {currentGrid.map((rowArr, rIdx) => 
                rowArr.map((node, cIdx) => {
                  const isPlayerHere = playerPos.row === rIdx && playerPos.col === cIdx;
                  const isSelected = selectedNode?.row === rIdx && selectedNode?.col === cIdx;
                  
                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => handleCellClick(node)}
                      className={`aspect-square rounded-xl border flex flex-col items-center justify-center transition-all duration-300 active:scale-90 ${getNodeColor(node.type, isSelected, isPlayerHere)}`}
                      title={node.name}
                    >
                      {isPlayerHere ? (
                        <div className="relative w-6 h-6 flex items-center justify-center animate-bounce">
                          <svg viewBox="0 0 100 100" className="w-5.5 h-5.5 fill-emerald-400">
                            <circle cx="50" cy="50" r="45" stroke="#10b981" strokeWidth="10" fill="#060913" />
                            <path d="M 9.5 50 A 40.5 40.5 0 0 1 90.5 50 Z" fill="#10b981" />
                            <line x1="8" y1="50" x2="92" y2="50" stroke="#060913" strokeWidth="12" />
                            <circle cx="50" cy="50" r="16" stroke="#060913" strokeWidth="8" fill="#ffffff" />
                            <circle cx="50" cy="50" r="6" fill="#34d399" />
                          </svg>
                        </div>
                      ) : (
                        <div className="relative flex items-center justify-center">
                          {getNodeIcon(node.type)}
                          {(() => {
                            const tr = ROUTE_TRAINERS.find(t => t.island === activeIsland && t.row === rIdx && t.col === cIdx);
                            if (tr && !beatenTrainers.includes(tr.id)) {
                              return (
                                <span className="absolute -top-3.5 -right-3.5 text-[8px] bg-amber-950 border border-amber-500/80 text-amber-400 rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-md animate-pulse" title={`Trainer ${tr.title} ${tr.name}`}>
                                  ⚔️
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* HMs status indicator bar */}
          <div className="flex justify-between items-center bg-slate-950/40 border border-slate-850/80 px-4 py-2.5 rounded-xl">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">HMs UNLOCKED:</span>
            <div className="flex gap-2">
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-all ${
                badgesDefeated.includes(5) 
                  ? 'bg-blue-600/10 border border-blue-500/35 text-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.15)]' 
                  : 'bg-slate-900/50 border border-slate-850 text-slate-600'
              }`}>
                HM03 SURF {badgesDefeated.includes(5) ? '🌊' : '🔒 (Gym 5)'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-all ${
                badgesDefeated.includes(6) 
                  ? 'bg-indigo-600/10 border border-indigo-500/35 text-indigo-300 shadow-[0_0_8px_rgba(99,102,241,0.15)]' 
                  : 'bg-slate-900/50 border border-slate-850 text-slate-600'
              }`}>
                HM02 FLY {badgesDefeated.includes(6) ? '✈️' : '🔒 (Gym 6)'}
              </span>
            </div>
          </div>

          {/* Action trigger card based on selected node */}
          {selectedNode && (
            <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-emerald-400">
                  {getNodeIcon(selectedNode.type)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">{selectedNode.name}</span>
                  <span className="text-[10px] font-mono text-gray-500">
                    {selectedNode.type === 'center' && 'Healing facility. All team health restored.'}
                    {selectedNode.type === 'mart' && 'Local merchant. Purchase battle inventory items.'}
                    {selectedNode.type === 'grass' && 'Wild encounter. Explore the brush for wild Pokémon.'}
                    {selectedNode.type === 'shore' && 'Coastal waters. Catch aquatic elemental types.'}
                    {selectedNode.type === 'cave' && 'Dark depths. Encounter rock and steel type classes.'}
                    {selectedNode.type === 'gym' && 'League arena. Fight the leader to earn a badge.'}
                    {selectedNode.type === 'elite' && 'Boss domain. Fight the Elite 16 Gauntlet.'}
                    {selectedNode.type === 'town' && 'Central town square. Safe landing zone.'}
                    {selectedNode.type === 'path' && 'Transit corridor connecting local regions.'}
                  </span>

                  {/* HM utility descriptors */}
                  {selectedNode.type === 'shore' && (
                    <span className={`text-[8.5px] font-mono mt-1 ${badgesDefeated.includes(5) ? 'text-blue-400' : 'text-rose-400 font-extrabold animate-pulse'}`}>
                      {badgesDefeated.includes(5) ? '🌊 HM03 Surf Active — You can cross water.' : '🔒 HM03 Surf Locked — Defeat Norman Gym #5 to cross water.'}
                    </span>
                  )}
                  {['town', 'center', 'mart'].includes(selectedNode.type) && (
                    <span className={`text-[8.5px] font-mono mt-1 ${badgesDefeated.includes(6) ? 'text-indigo-400 font-semibold' : 'text-slate-550'}`}>
                      {badgesDefeated.includes(6) ? '✈️ HM02 Fly Active — Instant fast-travel allowed.' : '🔒 HM02 Fly Locked — Defeat Winona Gym #6 to enable instant travel.'}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 items-center">
                {(() => {
                  const trainer = ROUTE_TRAINERS.find(t => t.island === activeIsland && t.row === selectedNode.row && t.col === selectedNode.col);
                  if (!trainer) return null;
                  const isBeaten = beatenTrainers.includes(trainer.id);

                  return (
                    <div className="flex flex-col items-end gap-1">
                      {isBeaten ? (
                        <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1.5 rounded-xl flex items-center gap-1">
                          {trainer.title} {trainer.name} [BEATEN ✅]
                        </span>
                      ) : (
                        <button
                          onClick={() => startTrainerBattle(trainer.id)}
                          className="px-4 py-2 bg-amber-600/25 border border-amber-500/60 hover:bg-amber-600/40 text-amber-300 font-bold text-xs tracking-wider rounded-xl transition-all active:scale-95 shadow-md shadow-amber-950/20 flex items-center gap-1.5"
                        >
                          <Swords className="w-4 h-4 text-amber-400" />
                          <span>VS {trainer.title.toUpperCase()} {trainer.name.toUpperCase()}</span>
                        </button>
                      )}
                    </div>
                  );
                })()}

                {['grass', 'shore', 'cave'].includes(selectedNode.type) && (
                  <button
                    onClick={() => startWildBattle(activeIsland, selectedNode.type)}
                    className="px-4 py-2 bg-emerald-600/25 border border-emerald-500/50 hover:bg-emerald-600/40 text-emerald-300 font-bold text-xs tracking-wider rounded-xl transition-all active:scale-95 shadow-md shadow-emerald-950/20"
                  >
                    EXPLORE ZONE
                  </button>
                )}

                {selectedNode.type === 'center' && (
                  <div className="text-[10px] font-mono font-bold text-rose-400 bg-rose-950/20 border border-rose-500/30 px-3 py-2 rounded-xl animate-pulse">
                    TEAM RESTORED!
                  </div>
                )}

                {selectedNode.type === 'gym' && selectedNode.gymId && (
                  <button
                    disabled={badgesDefeated.includes(selectedNode.gymId) || (selectedNode.gymId > 1 && !badgesDefeated.includes(selectedNode.gymId - 1))}
                    onClick={() => startGymBattle(selectedNode.gymId!)}
                    className={`px-4 py-2 font-bold text-xs tracking-wider rounded-xl transition-all active:scale-95 shadow-md ${
                      badgesDefeated.includes(selectedNode.gymId)
                        ? 'bg-slate-800 border border-slate-700 text-slate-500 cursor-default shadow-none'
                        : (selectedNode.gymId > 1 && !badgesDefeated.includes(selectedNode.gymId - 1))
                        ? 'bg-slate-950/20 border border-slate-900 text-slate-700 cursor-not-allowed shadow-none'
                        : 'bg-yellow-600/25 border border-yellow-500/50 hover:bg-yellow-600/40 text-yellow-300'
                    }`}
                  >
                    {badgesDefeated.includes(selectedNode.gymId) ? 'DEFEATED' : 'CHALLENGE'}
                  </button>
                )}

                {selectedNode.type === 'elite' && (
                  <button
                    disabled={totalBadgesEarned < 30}
                    onClick={startEliteBattle}
                    className={`px-4 py-2 font-bold text-xs tracking-wider rounded-xl transition-all active:scale-95 shadow-md ${
                      totalBadgesEarned >= 30
                        ? 'bg-red-600/25 border border-red-500/50 hover:bg-red-600/40 text-red-300 animate-pulse'
                        : 'bg-slate-950/20 border border-slate-900 text-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {totalBadgesEarned >= 30 ? `FIGHT ELITE (${eliteDefeatedCount}/16)` : '30 BADGES REQ.'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Gym Leaders list or PokéMart shop panel */}
        <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl flex flex-col gap-4 max-h-[380px] overflow-y-auto">
          
          {selectedNode?.type === 'mart' ? (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <span className="text-xs font-mono font-bold text-blue-400 flex items-center gap-1">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  POKÉMART
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">${money}</span>
              </div>
              
              <div className="flex flex-col gap-2.5">
                {Object.entries(ITEMS).map(([name, item]) => {
                  const maxAffordable = Math.floor(money / item.cost);
                  return (
                    <div key={name} className="flex justify-between items-center bg-gray-900/60 border border-gray-850 p-2 rounded-lg">
                      <div className="flex flex-col gap-0.5 max-w-[65%]">
                        <span className="text-xs font-bold truncate">{name}</span>
                        <span className="text-[9px] text-gray-400 font-mono">${item.cost}</span>
                      </div>
                      <button
                        disabled={maxAffordable <= 0}
                        onClick={() => purchaseItem(name, 1)}
                        className="px-2 py-1 rounded bg-blue-600/25 border border-blue-500/50 hover:bg-blue-600/40 text-blue-300 font-bold text-[10px] disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-all"
                      >
                        BUY x1
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Gyms List
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  GYM LEADERS ({currentGyms.filter(g => badgesDefeated.includes(g.id)).length} / {currentGyms.length})
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {currentGyms.map(gym => {
                  const isBeaten = badgesDefeated.includes(gym.id);
                  const isLocked = gym.id > 1 && !badgesDefeated.includes(gym.id - 1);
                  
                  return (
                    <div
                      key={gym.id}
                      className={`p-2.5 rounded-lg border flex justify-between items-center text-left ${
                        isBeaten
                          ? 'border-emerald-500/20 bg-emerald-950/10 text-emerald-400/80'
                          : isLocked
                          ? 'border-slate-900 bg-slate-950/10 opacity-30'
                          : 'border-slate-800 bg-gray-900/40'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold">{gym.leader}</span>
                        <span className="text-[9px] font-mono text-gray-500">{gym.badge} ({gym.type})</span>
                      </div>
                      
                      {isBeaten ? (
                        <span className="text-[9px] font-mono font-bold uppercase text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/30">DEFEATED</span>
                      ) : isLocked ? (
                        <span className="text-[9px] font-mono text-slate-650">LOCKED</span>
                      ) : (
                        <span className="text-[9px] font-mono font-bold text-yellow-400 uppercase">ACTIVE</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default MapScreen;
