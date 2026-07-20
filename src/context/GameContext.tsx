import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPokemonById } from '../db/pokemon';
import type { PokemonData, Move } from '../db/pokemon';
import { GYMS } from '../db/gyms';
import { ELITE_16 } from '../db/elite16';
import { ROUTE_TRAINERS } from '../db/trainers';
import { sound } from '../utils/sound';

export interface PlayerPokemon {
  id: string;
  pokemonId: number;
  nickname: string;
  level: number;
  xp: number;
  xpToNext: number;
  currentHp: number;
  maxHp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
  moves: Move[];
  status?: 'SLP' | 'PAR' | 'PSN' | 'BRN' | null;
  shiny?: boolean;
}

export interface BattleOpponent {
  name: string;
  pokemonId: number;
  level: number;
  currentHp: number;
  maxHp: number;
  types: string[];
  moves: Move[];
  color: string;
  secondaryColor: string;
  shapeSeed: number;
  bodyType: number;
  status?: 'SLP' | 'PAR' | 'PSN' | 'BRN' | null;
  shiny?: boolean;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

export interface BattleState {
  type: 'wild' | 'trainer' | 'gym' | 'elite';
  trainerId?: string;
  gymId?: number;
  eliteId?: number;
  opponentTeam: BattleOpponent[];
  opponentActiveIndex: number;
  playerActiveIndex: number;
  logs: string[];
  isCatching: boolean;
  catchSuccess?: boolean;
}

export interface BagItem {
  name: string;
  count: number;
  description: string;
  cost: number;
  type: 'ball' | 'heal' | 'revive' | 'cure';
  value: number; // heals hp, multiplier, etc.
}

interface GameContextType {
  team: PlayerPokemon[];
  pcBox: PlayerPokemon[];
  pokedexCaught: number[];
  badgesDefeated: number[];
  beatenTrainers: string[];
  eliteDefeatedCount: number;
  money: number;
  bag: Record<string, number>;
  activeIsland: number;
  currentLocation: string;
  battle: BattleState | null;
  mute: boolean;
  saveLoading: boolean;
  saveVerified: boolean | null;
  startWildBattle: (island: number, terrain?: string) => void;
  startTrainerBattle: (trainerId: string) => void;
  startGymBattle: (gymId: number) => void;
  startEliteBattle: () => void;
  executeTurn: (playerMoveIndex: number) => void;
  switchPokemon: (index: number) => void;
  useItemInBattle: (itemName: string) => void;
  runFromBattle: () => void;
  healTeam: () => void;
  purchaseItem: (itemName: string, count: number) => void;
  exportEncryptedSave: (passcode: string) => Promise<string>;
  importEncryptedSave: (saveStr: string, passcode: string) => Promise<boolean>;
  toggleMute: () => void;
  travelToIsland: (islandNum: number) => void;
  setLocation: (loc: string) => void;
  pendingMoveLearn: { pokemonId: string; move: Move } | null;
  learnPendingMove: (forgetMoveIndex: number | null) => void;
  selectStarter: (pokemonId: number) => void;
  reorderTeam: (indexA: number, indexB: number) => void;
  swapPokemonWithPc: (pcIndex: number, teamIndex: number) => void;
  depositToPc: (teamIndex: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

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

export const ITEMS: Record<string, Omit<BagItem, 'count'>> = {
  'Poke Ball': { name: 'Poke Ball', description: 'Standard ball to catch wild Pokemon.', cost: 200, type: 'ball', value: 1.0 },
  'Great Ball': { name: 'Great Ball', description: 'Higher catch rate than Poke Ball.', cost: 600, type: 'ball', value: 1.5 },
  'Ultra Ball': { name: 'Ultra Ball', description: 'Excellent catch rate.', cost: 1200, type: 'ball', value: 2.0 },
  'Master Ball': { name: 'Master Ball', description: 'Guarantees catching any wild Pokemon.', cost: 50000, type: 'ball', value: 1000 },
  'Potion': { name: 'Potion', description: 'Restores 20 HP.', cost: 300, type: 'heal', value: 20 },
  'Super Potion': { name: 'Super Potion', description: 'Restores 50 HP.', cost: 700, type: 'heal', value: 50 },
  'Hyper Potion': { name: 'Hyper Potion', description: 'Restores 120 HP.', cost: 1200, type: 'heal', value: 120 },
  'Revive': { name: 'Revive', description: 'Revives a fainted Pokemon with 50% HP.', cost: 1500, type: 'revive', value: 0.5 },
  'Max Revive': { name: 'Max Revive', description: 'Revives a fainted Pokemon with 100% HP.', cost: 4000, type: 'revive', value: 1.0 },
  'Full Heal': { name: 'Full Heal', description: 'Cures all status conditions (Sleep, Burn, Poison, Paralysis).', cost: 600, type: 'cure', value: 1.0 }
};

// Calculate stats based on level
function calculateStats(base: PokemonData['baseStats'], level: number): Omit<PlayerPokemon, 'id' | 'pokemonId' | 'nickname' | 'level' | 'xp' | 'xpToNext' | 'currentHp' | 'moves'> {
  return {
    maxHp: Math.floor((2 * base.hp) * level / 100) + level + 10,
    attack: Math.floor((2 * base.attack) * level / 100) + 5,
    defense: Math.floor((2 * base.defense) * level / 100) + 5,
    spAttack: Math.floor((2 * base.spAttack) * level / 100) + 5,
    spDefense: Math.floor((2 * base.spDefense) * level / 100) + 5,
    speed: Math.floor((2 * base.speed) * level / 100) + 5,
  };
}

export function createPlayerPokemon(pokemonId: number, level: number, forcedShiny?: boolean): PlayerPokemon {
  const data = getPokemonById(pokemonId);
  const stats = calculateStats(data.baseStats, level);
  const xp = Math.floor(Math.pow(level, 3) * 0.8);
  const xpToNext = Math.floor(Math.pow(level + 1, 3) * 0.8);
  
  // Assign available moves up to this level (max 4 moves, default to latest unlocked)
  const availableMoves = data.moves.filter(m => m.level <= level);
  const moves = availableMoves.slice(-4).map(m => ({ ...m, currentPp: m.currentPp !== undefined ? m.currentPp : m.pp }));
  
  const isShiny = forcedShiny !== undefined ? forcedShiny : Math.random() < 0.0067; // 1 in 150 shiny rate (0.67%)
  
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    pokemonId,
    nickname: data.name,
    level,
    xp,
    xpToNext,
    currentHp: stats.maxHp,
    ...stats,
    moves,
    shiny: isShiny
  };
}

// Convert a DB PokemonData to BattleOpponent
function toBattleOpponent(data: PokemonData, level: number, forcedShiny?: boolean): BattleOpponent {
  const stats = calculateStats(data.baseStats, level);
  const availableMoves = data.moves.filter(m => m.level <= level);
  const moves = availableMoves.slice(-4).map(m => ({ ...m, currentPp: m.pp }));
  const isShiny = forcedShiny !== undefined ? forcedShiny : Math.random() < 0.0067; // 1 in 150 shiny rate (0.67%)

  return {
    name: data.name,
    pokemonId: data.id,
    level,
    currentHp: stats.maxHp,
    types: data.types,
    moves: moves.length > 0 ? moves : [{ name: 'Tackle', type: 'Normal', power: 40, pp: 35, accuracy: 100, level: 1, currentPp: 35 }],
    color: data.color,
    secondaryColor: data.secondaryColor,
    shapeSeed: data.shapeSeed,
    bodyType: data.bodyType,
    shiny: isShiny,
    ...stats
  };
}

// AI Score-based opponent move selection
function selectOpponentMove(opponent: BattleOpponent, player: PlayerPokemon, isWild: boolean): Move {
  if (opponent.moves.length <= 1) {
    return opponent.moves[0];
  }
  
  if (isWild) {
    return opponent.moves[Math.floor(Math.random() * opponent.moves.length)];
  }
  
  const scores = opponent.moves.map(m => {
    let score = m.power || 20;
    const pTypes = getPokemonById(player.pokemonId).types;
    let mult = 1.0;
    pTypes.forEach(t => {
      if (TYPE_EFFECTIVENESS[m.type] && TYPE_EFFECTIVENESS[m.type][t] !== undefined) {
        mult *= TYPE_EFFECTIVENESS[m.type][t];
      }
    });
    
    if (mult > 1) score *= 2.5;       // Heavily favor super-effective
    else if (mult === 0) score = 0;   // Avoid immunities
    else if (mult < 1) score *= 0.4;  // Avoid resistant targets
    
    return score + Math.random() * 12; // Noise to prevent total predictability
  });
  
  const bestIndex = scores.indexOf(Math.max(...scores));
  return opponent.moves[bestIndex];
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [team, setTeam] = useState<PlayerPokemon[]>([]);
  const [pcBox, setPcBox] = useState<PlayerPokemon[]>([]);
  const [pokedexCaught, setPokedexCaught] = useState<number[]>([]);
  const [badgesDefeated, setBadgesDefeated] = useState<number[]>([]);
  const [beatenTrainers, setBeatenTrainers] = useState<string[]>([]);
  const [eliteDefeatedCount, setEliteDefeatedCount] = useState<number>(0);
  const [money, setMoney] = useState<number>(3000);
  const [bag, setBag] = useState<Record<string, number>>({
    'Poke Ball': 15,
    'Great Ball': 5,
    'Ultra Ball': 1,
    'Master Ball': 0,
    'Potion': 8,
    'Super Potion': 2,
    'Hyper Potion': 0,
    'Revive': 2
  });
  const [activeIsland, setActiveIsland] = useState<number>(1);
  const [currentLocation, setCurrentLocation] = useState<string>('Littleroot Town');
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [mute, setMute] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [saveVerified, setSaveVerified] = useState<boolean | null>(null);
  const [pendingMoveLearn, setPendingMoveLearn] = useState<{ pokemonId: string; move: Move } | null>(null);

  // Initialize game state (starters)
  useEffect(() => {
    const saved = localStorage.getItem('poke_emerald_save');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const loadedTeam = (data.team || []).map((p: any) => ({
          ...p,
          moves: p.moves.map((m: any) => ({ ...m, currentPp: m.currentPp !== undefined ? m.currentPp : m.pp }))
        }));
        const loadedPc = (data.pcBox || []).map((p: any) => ({
          ...p,
          moves: p.moves.map((m: any) => ({ ...m, currentPp: m.currentPp !== undefined ? m.currentPp : m.pp }))
        }));
        setTeam(loadedTeam);
        setPcBox(loadedPc);
        setPokedexCaught(data.pokedexCaught || []);
        setBadgesDefeated(data.badgesDefeated || []);
        setBeatenTrainers(data.beatenTrainers || []);
        setEliteDefeatedCount(data.eliteDefeatedCount || 0);
        setMoney(data.money !== undefined ? data.money : 3000);
        setBag(data.bag || {});
        setActiveIsland(data.activeIsland || 1);
        setCurrentLocation(data.currentLocation || 'Littleroot Town');
        setMute(data.mute || false);
      } catch (e) {
        console.error("Failed to parse local save, generating starter");
        generateNewGame();
      }
    } else {
      setTeam([]); // empty team triggers starter select UI
      setPcBox([]);
    }
  }, []);

  const generateNewGame = () => {
    setTeam([]);
    setPcBox([]);
    setPokedexCaught([]);
    setBadgesDefeated([]);
    setBeatenTrainers([]);
    setEliteDefeatedCount(0);
    setMoney(3000);
    setBag({
      'Poke Ball': 15,
      'Great Ball': 5,
      'Ultra Ball': 1,
      'Master Ball': 0,
      'Potion': 8,
      'Super Potion': 2,
      'Hyper Potion': 0,
      'Revive': 2,
      'Max Revive': 0,
      'Full Heal': 2
    });
    setActiveIsland(1);
    setCurrentLocation('Littleroot Town');
  };

  const selectStarter = (pokemonId: number) => {
    const starter = createPlayerPokemon(pokemonId, 5);
    setTeam([starter]);
    setPcBox([]);
    setPokedexCaught([pokemonId]);
    sound.playLevelUp();
  };

  // Auto-save on game state changes
  useEffect(() => {
    if (team.length > 0) {
      const state = { team, pcBox, pokedexCaught, badgesDefeated, beatenTrainers, eliteDefeatedCount, money, bag, activeIsland, currentLocation, mute };
      localStorage.setItem('poke_emerald_save', JSON.stringify(state));
    }
  }, [team, pcBox, pokedexCaught, badgesDefeated, beatenTrainers, eliteDefeatedCount, money, bag, activeIsland, currentLocation, mute]);

  // Sync mute state with sound engine
  useEffect(() => {
    sound.setMuteState(mute);
    if (mute) {
      sound.stopBGM();
    }
  }, [mute]);

  const toggleMute = () => {
    const res = sound.toggleMute();
    setMute(res);
    if (res) {
      sound.stopBGM();
    } else {
      sound.playBGM();
    }
  };

  const travelToIsland = (islandNum: number) => {
    sound.playSelect();
    setActiveIsland(islandNum);
    const islandTowns = ['', 'Littleroot Town', 'Slateport City', 'Lilycove City', 'Sootopolis City'];
    setCurrentLocation(islandTowns[islandNum] || 'Littleroot Town');
  };

  const setLocation = (loc: string) => {
    sound.playSelect();
    setCurrentLocation(loc);
  };

  // Battles setup
  const startWildBattle = (island: number, terrain?: string) => {
    sound.playEncounter();
    // Wild levels scale per island: Is1 (3-12), Is2 (12-25), Is3 (25-45), Is4 (45-75)
    let minLvl = 2;
    let maxLvl = 5;
    if (island === 1) {
      if (terrain === 'cave' || terrain === 'shore') {
        minLvl = 4;
        maxLvl = 8;
      }
    } else if (island === 2) {
      minLvl = 10;
      maxLvl = 18;
    } else if (island === 3) {
      minLvl = 20;
      maxLvl = 33;
    } else if (island === 4) {
      minLvl = 35;
      maxLvl = 58;
    }

    const lvl = Math.floor(minLvl + Math.random() * (maxLvl - minLvl));
    
    // Terrain-aware type filtering for immersive encounters
    const terrainTypes: Record<string, string[]> = {
      grass: ['Grass', 'Bug', 'Normal', 'Poison', 'Fairy'],
      shore: ['Water', 'Ice', 'Flying', 'Dragon'],
      cave: ['Rock', 'Ground', 'Steel', 'Dark', 'Ghost', 'Fighting'],
    };
    const preferredTypes = terrain && terrainTypes[terrain] ? terrainTypes[terrain] : null;
    
    // Island-based ID ranges for regional variety
    const idRanges: [number, number][] = [
      [1, 160],   // Island 1: early dex
      [130, 320], // Island 2: mid dex
      [280, 500], // Island 3: late dex
      [400, 650], // Island 4: endgame dex
    ];
    const [idMin, idMax] = idRanges[island - 1] || [1, 650];
    
    // Try to find a type-matched Pokémon within the island range (up to 20 attempts)
    let wildData = getPokemonById(idMin + Math.floor(Math.random() * (idMax - idMin)));
    if (preferredTypes) {
      for (let attempt = 0; attempt < 20; attempt++) {
        const candidateId = idMin + Math.floor(Math.random() * (idMax - idMin));
        const candidate = getPokemonById(candidateId);
        if (candidate.types.some(t => preferredTypes.includes(t))) {
          wildData = candidate;
          break;
        }
      }
    }

    const opponent = toBattleOpponent(wildData, lvl);

    setBattle({
      type: 'wild',
      opponentTeam: [opponent],
      opponentActiveIndex: 0,
      playerActiveIndex: getFirstHealthyPokemonIndex(),
      logs: [`A wild ${opponent.name} (Lv. ${opponent.level}) appeared!`],
      isCatching: false
    });
  };

  const startTrainerBattle = (trainerId: string) => {
    sound.playEncounter();
    const trainer = ROUTE_TRAINERS.find(t => t.id === trainerId);
    if (!trainer) return;

    const oppTeam = trainer.roster.map(gp => {
      const data = getPokemonById(gp.pokemonId);
      return toBattleOpponent(data, gp.level);
    });

    setBattle({
      type: 'trainer',
      trainerId,
      opponentTeam: oppTeam,
      opponentActiveIndex: 0,
      playerActiveIndex: getFirstHealthyPokemonIndex(),
      logs: [
        `${trainer.title} ${trainer.name} wants to battle!`,
        `"${trainer.dialogueBefore}"`,
        `${trainer.title} ${trainer.name} sent out ${oppTeam[0].name}!`
      ],
      isCatching: false
    });
  };

  const startGymBattle = (gymId: number) => {
    sound.playEncounter();
    const gym = GYMS.find(g => g.id === gymId);
    if (!gym) return;

    const oppTeam = gym.roster.map(gp => {
      const data = getPokemonById(gp.pokemonId);
      return toBattleOpponent(data, gp.level);
    });

    setBattle({
      type: 'gym',
      gymId,
      opponentTeam: oppTeam,
      opponentActiveIndex: 0,
      playerActiveIndex: getFirstHealthyPokemonIndex(),
      logs: [`Gym Leader ${gym.leader} challenges you to a battle!`, `${gym.leader} sent out ${oppTeam[0].name}!`],
      isCatching: false
    });
  };

  const startEliteBattle = () => {
    sound.playEncounter();
    // Fight the next elite member in sequence
    const nextEliteIndex = eliteDefeatedCount;
    if (nextEliteIndex >= 16) return;
    
    const member = ELITE_16[nextEliteIndex];
    const oppTeam = member.roster.map(gp => {
      const data = getPokemonById(gp.pokemonId);
      return toBattleOpponent(data, gp.level);
    });

    setBattle({
      type: 'elite',
      eliteId: member.id,
      opponentTeam: oppTeam,
      opponentActiveIndex: 0,
      playerActiveIndex: getFirstHealthyPokemonIndex(),
      logs: [
        `Elite 16 member ${member.name} (${member.title}) challenges you!`,
        `"${member.dialogue}"`,
        `${member.name} sent out ${oppTeam[0].name}!`
      ],
      isCatching: false
    });
  };

  const getFirstHealthyPokemonIndex = (): number => {
    for (let i = 0; i < team.length; i++) {
      if (team[i].currentHp > 0) return i;
    }
    return 0;
  };

  const switchPokemon = (index: number) => {
    sound.playSelect();
    if (index < 0 || index >= team.length || team[index].currentHp <= 0) return;

    if (battle) {
      setBattle(prev => {
        if (!prev) return null;
        const newLogs = [...prev.logs, `You sent out ${team[index].nickname}! (Level ${team[index].level})`];
        
        // Immediate opponent attack counters if switching mid-combat
        const updatedBattle = {
          ...prev,
          playerActiveIndex: index,
          logs: newLogs
        };
        
        // Let's schedule the opponent counter-attack
        setTimeout(() => executeOpponentAttack(updatedBattle), 400);

        return updatedBattle;
      });
    }
  };

  const rollStatusChance = (moveType: string): 'SLP' | 'PAR' | 'PSN' | 'BRN' | null => {
    const roll = Math.random();
    if (moveType === 'Electric' && roll < 0.12) return 'PAR';
    if (moveType === 'Fire' && roll < 0.12) return 'BRN';
    if (moveType === 'Poison' && roll < 0.15) return 'PSN';
    if ((moveType === 'Grass' || moveType === 'Ghost') && roll < 0.12) return 'SLP';
    return null;
  };

  const executeOpponentAttack = (currentBattle: BattleState) => {
    setBattle(prev => {
      if (!prev || !currentBattle) return null;
      
      const pActive = team[prev.playerActiveIndex];
      const oActive = prev.opponentTeam[prev.opponentActiveIndex];
      
      if (pActive.currentHp <= 0 || oActive.currentHp <= 0) return prev;
      
      const logs = [...prev.logs];
      let oStatus = oActive.status || null;
      let pStatus = pActive.status || null;
      let plHp = pActive.currentHp;
      let oppHp = oActive.currentHp;
      
      // Status check
      if (oStatus === 'SLP') {
        if (Math.random() < 0.33) {
          oStatus = null;
          logs.push(`${oActive.name} woke up!`);
        } else {
          logs.push(`${oActive.name} is fast asleep!`);
          return {
            ...prev,
            opponentTeam: prev.opponentTeam.map((op, idx) => 
              idx === prev.opponentActiveIndex ? { ...op, currentHp: oppHp, status: oStatus } : op
            ),
            logs
          };
        }
      } else if (oStatus === 'PAR') {
        if (Math.random() < 0.25) {
          logs.push(`${oActive.name} is fully paralyzed! It can't move!`);
          return {
            ...prev,
            logs
          };
        }
      }
      
      const oMove = selectOpponentMove(oActive, pActive, prev.type === 'wild');
      
      // Burn half physical attack check
      const isPhysical = ['Normal', 'Fighting', 'Flying', 'Poison', 'Ground', 'Rock', 'Bug', 'Ghost', 'Steel'].includes(oMove.type);
      let oDmg = calculateOpponentDamage(oActive, pActive, oMove);
      if (isPhysical && oStatus === 'BRN') {
        oDmg.damage = Math.max(1, Math.floor(oDmg.damage * 0.5));
      }
      
      plHp = Math.max(0, plHp - oDmg.damage);
      logs.push(`${oActive.name} used ${oMove.name}! Deals ${oDmg.damage} damage.${oDmg.log}`);
      sound.playHit();
      
      // Apply status effect to player
      if (plHp > 0 && pStatus === null) {
        const newStatus = rollStatusChance(oMove.type);
        if (newStatus) {
          pStatus = newStatus;
          const statusNames: Record<string, string> = { PAR: 'paralyzed', BRN: 'burned', PSN: 'poisoned', SLP: 'put to sleep' };
          logs.push(`${pActive.nickname} was ${statusNames[newStatus]}!`);
        }
      }
      
      // Apply end-of-turn status damage ticks for opponent
      if (oppHp > 0 && (oStatus === 'PSN' || oStatus === 'BRN')) {
        const tickDmg = Math.max(1, Math.floor(oActive.maxHp / 16));
        oppHp = Math.max(0, oppHp - tickDmg);
        logs.push(`${oActive.name} takes ${tickDmg} damage from its ${oStatus === 'PSN' ? 'poison' : 'burn'}!`);
      }
      
      const updatedTeam = [...team];
      updatedTeam[prev.playerActiveIndex] = {
        ...pActive,
        currentHp: plHp,
        status: pStatus
      };
      setTeam(updatedTeam);
      
      if (plHp <= 0) {
        logs.push(`${pActive.nickname} fainted!`);
        const isWiped = updatedTeam.every(p => p.currentHp <= 0);
        if (isWiped) {
          logs.push("All your Pokémon fainted!");
          logs.push("You whited out! Scurried back to a safe town square...");
          const lostMoney = Math.floor(money * 0.15);
          sound.playDefeated();
          
          setTimeout(() => {
            setTeam(prev => prev.map(p => ({ ...p, currentHp: p.maxHp, status: null })));
            setMoney(m => Math.max(0, m - lostMoney));
            const islandTowns = ['', 'Littleroot Town', 'Slateport City', 'Lilycove City', 'Sootopolis City'];
            setCurrentLocation(islandTowns[activeIsland] || 'Littleroot Town');
            setBattle(null);
          }, 1800);
        }
      }
      
      const tempBattle = {
        ...prev,
        opponentTeam: prev.opponentTeam.map((op, idx) => 
          idx === prev.opponentActiveIndex 
            ? { ...op, currentHp: oppHp, status: oStatus } 
            : op
        ),
        logs
      };

      if (oppHp <= 0) {
        setTimeout(() => handleOpponentFaint(tempBattle), 500);
      }

      return tempBattle;
    });
  };

  const executeTurn = (playerMoveIndex: number) => {
    if (!battle) return;
    
    const pActive = team[battle.playerActiveIndex];
    const oActive = battle.opponentTeam[battle.opponentActiveIndex];
    
    if (pActive.currentHp <= 0 || oActive.currentHp <= 0) return;
    
    const pMove = pActive.moves[playerMoveIndex];
    
    const pSpeed = pActive.speed * (pActive.status === 'PAR' ? 0.5 : 1.0);
    const oSpeed = oActive.speed * (oActive.status === 'PAR' ? 0.5 : 1.0);
    const playerFirst = pSpeed >= oSpeed;
    
    setBattle(prev => {
      if (!prev) return null;
      
      const logs = [...prev.logs];
      let oppHp = oActive.currentHp;
      let plHp = pActive.currentHp;
      let pStatus = pActive.status || null;
      let oStatus = oActive.status || null;
      
      const performPlayerAttack = () => {
        if (pStatus === 'SLP') {
          if (Math.random() < 0.33) {
            pStatus = null;
            logs.push(`${pActive.nickname} woke up!`);
          } else {
            logs.push(`${pActive.nickname} is fast asleep!`);
            return;
          }
        } else if (pStatus === 'PAR') {
          if (Math.random() < 0.25) {
            logs.push(`${pActive.nickname} is fully paralyzed! It can't move!`);
            return;
          }
        }
        
        // Accuracy Roll Check
        const accuracyRoll = Math.random() * 100;
        if (accuracyRoll > pMove.accuracy) {
          logs.push(`${pActive.nickname} used ${pMove.name}! But the attack missed!`);
          return;
        }
        
        const isPhysical = ['Normal', 'Fighting', 'Flying', 'Poison', 'Ground', 'Rock', 'Bug', 'Ghost', 'Steel'].includes(pMove.type);
        let pDmg = calculateDamage(pActive, oActive, pMove);
        if (isPhysical && pStatus === 'BRN') {
          pDmg.damage = Math.max(1, Math.floor(pDmg.damage * 0.5));
        }
        
        oppHp = Math.max(0, oppHp - pDmg.damage);
        logs.push(`${pActive.nickname} used ${pMove.name}! Deals ${pDmg.damage} damage.${pDmg.log}`);
        sound.playHit();
        
        // Inflict status effect to opponent
        if (oppHp > 0 && oStatus === null) {
          const newStatus = rollStatusChance(pMove.type);
          if (newStatus) {
            oStatus = newStatus;
            const statusNames: Record<string, string> = { PAR: 'paralyzed', BRN: 'burned', PSN: 'poisoned', SLP: 'put to sleep' };
            logs.push(`${oActive.name} was ${statusNames[newStatus]}!`);
          }
        }
      };
      
      const performOpponentAttack = () => {
        if (oppHp <= 0) return;
        
        if (oStatus === 'SLP') {
          if (Math.random() < 0.33) {
            oStatus = null;
            logs.push(`${oActive.name} woke up!`);
          } else {
            logs.push(`${oActive.name} is fast asleep!`);
            return;
          }
        } else if (oStatus === 'PAR') {
          if (Math.random() < 0.25) {
            logs.push(`${oActive.name} is fully paralyzed! It can't move!`);
            return;
          }
        }
        
        const oMove = selectOpponentMove(oActive, pActive, prev.type === 'wild');

        // Accuracy Roll Check
        const accuracyRoll = Math.random() * 100;
        if (accuracyRoll > oMove.accuracy) {
          logs.push(`${oActive.name} used ${oMove.name}! But the attack missed!`);
          return;
        }

        const isPhysical = ['Normal', 'Fighting', 'Flying', 'Poison', 'Ground', 'Rock', 'Bug', 'Ghost', 'Steel'].includes(oMove.type);
        let oDmg = calculateOpponentDamage(oActive, pActive, oMove);
        if (isPhysical && oStatus === 'BRN') {
          oDmg.damage = Math.max(1, Math.floor(oDmg.damage * 0.5));
        }
        
        plHp = Math.max(0, plHp - oDmg.damage);
        logs.push(`${oActive.name} used ${oMove.name}! Deals ${oDmg.damage} damage.${oDmg.log}`);
        sound.playHit();
        
        // Inflict status effect to player
        if (plHp > 0 && pStatus === null) {
          const newStatus = rollStatusChance(oMove.type);
          if (newStatus) {
            pStatus = newStatus;
            const statusNames: Record<string, string> = { PAR: 'paralyzed', BRN: 'burned', PSN: 'poisoned', SLP: 'put to sleep' };
            logs.push(`${pActive.nickname} was ${statusNames[newStatus]}!`);
          }
        }
      };

      if (playerFirst) {
        performPlayerAttack();
        if (oppHp > 0) {
          performOpponentAttack();
        } else {
          logs.push(`${oActive.name} fainted!`);
        }
      } else {
        performOpponentAttack();
        if (plHp > 0) {
          performPlayerAttack();
        } else {
          logs.push(`${pActive.nickname} fainted!`);
        }
      }
      
      // End-of-turn damage ticks (Poison & Burn)
      if (oppHp > 0 && (oStatus === 'PSN' || oStatus === 'BRN')) {
        const tickDmg = Math.max(1, Math.floor(oActive.maxHp / 16));
        oppHp = Math.max(0, oppHp - tickDmg);
        logs.push(`${oActive.name} takes ${tickDmg} damage from its ${oStatus === 'PSN' ? 'poison' : 'burn'}!`);
        if (oppHp <= 0) {
          logs.push(`${oActive.name} fainted!`);
        }
      }
      
      if (plHp > 0 && (pStatus === 'PSN' || pStatus === 'BRN')) {
        const tickDmg = Math.max(1, Math.floor(pActive.maxHp / 16));
        plHp = Math.max(0, plHp - tickDmg);
        logs.push(`${pActive.nickname} takes ${tickDmg} damage from its ${pStatus === 'PSN' ? 'poison' : 'burn'}!`);
        if (plHp <= 0) {
          logs.push(`${pActive.nickname} fainted!`);
        }
      }

      // Save state adjustments
      const updatedTeam = [...team];
      const updatedMoves = pActive.moves.map((m, idx) => 
        idx === playerMoveIndex 
          ? { ...m, currentPp: Math.max(0, (m.currentPp !== undefined ? m.currentPp - 1 : m.pp - 1)) } 
          : m
      );
      updatedTeam[prev.playerActiveIndex] = {
        ...pActive,
        currentHp: plHp,
        status: pStatus,
        moves: updatedMoves
      };
      setTeam(updatedTeam);

      const isWiped = updatedTeam.every(p => p.currentHp <= 0);
      if (isWiped) {
        logs.push("All your Pokémon fainted!");
        logs.push("You whited out! Scurried back to a safe town square...");
        const lostMoney = Math.floor(money * 0.15);
        sound.playDefeated();
        
        setTimeout(() => {
          setTeam(prev => prev.map(p => ({ ...p, currentHp: p.maxHp, status: null })));
          setMoney(m => Math.max(0, m - lostMoney));
          const islandTowns = ['', 'Littleroot Town', 'Slateport City', 'Lilycove City', 'Sootopolis City'];
          setCurrentLocation(islandTowns[activeIsland] || 'Littleroot Town');
          setBattle(null);
        }, 1800);
      }

      const nextOpponentTeam = prev.opponentTeam.map((op, idx) => 
        idx === prev.opponentActiveIndex 
          ? { ...op, currentHp: oppHp, status: oStatus } 
          : op
      );

      const tempBattle = {
        ...prev,
        opponentTeam: nextOpponentTeam,
        logs
      };

      if (oppHp <= 0) {
        setTimeout(() => handleOpponentFaint(tempBattle), 500);
      }

      return tempBattle;
    });
  };

  const calculateDamage = (attacker: PlayerPokemon, defender: BattleOpponent, move: Move) => {
    const isPhysical = ['Normal', 'Fighting', 'Flying', 'Poison', 'Ground', 'Rock', 'Bug', 'Ghost', 'Steel'].includes(move.type);
    const A = isPhysical ? attacker.attack : attacker.spAttack;
    const D = isPhysical ? defender.defense : defender.spDefense;
    
    let modifier = 1.0;
    let log = '';
    
    let typeEff = 1.0;
    defender.types.forEach(t => {
      if (TYPE_EFFECTIVENESS[move.type] && TYPE_EFFECTIVENESS[move.type][t] !== undefined) {
        typeEff *= TYPE_EFFECTIVENESS[move.type][t];
      }
    });

    if (typeEff > 1) {
      modifier *= 2;
      log = " It's super effective!";
    } else if (typeEff < 1 && typeEff > 0) {
      modifier *= 0.5;
      log = " It's not very effective...";
    } else if (typeEff === 0) {
      modifier = 0;
      log = " It has no effect.";
    }

    const pTypes = getPokemonById(attacker.pokemonId).types;
    if (pTypes.includes(move.type)) {
      modifier *= 1.5;
    }

    const baseDamage = (((2 * attacker.level / 5 + 2) * move.power * (A / D)) / 50 + 2) * modifier;
    const isCrit = Math.random() < 0.0625; // 6.25% crit chance (1/16)
    const critMultiplier = isCrit ? 1.5 : 1.0;
    if (isCrit) log += " A critical hit!";
    const damage = Math.max(1, Math.floor(baseDamage * critMultiplier * (0.85 + Math.random() * 0.15)));
    
    return { damage, log };
  };

  const calculateOpponentDamage = (attacker: BattleOpponent, defender: PlayerPokemon, move: Move) => {
    const isPhysical = ['Normal', 'Fighting', 'Flying', 'Poison', 'Ground', 'Rock', 'Bug', 'Ghost', 'Steel'].includes(move.type);
    const A = isPhysical ? attacker.attack : attacker.spAttack;
    const D = isPhysical ? defender.defense : defender.spDefense;
    
    let modifier = 1.0;
    let log = '';

    const defTypes = getPokemonById(defender.pokemonId).types;
    let typeEff = 1.0;
    defTypes.forEach(t => {
      if (TYPE_EFFECTIVENESS[move.type] && TYPE_EFFECTIVENESS[move.type][t] !== undefined) {
        typeEff *= TYPE_EFFECTIVENESS[move.type][t];
      }
    });

    if (typeEff > 1) {
      modifier *= 2;
      log = " It's super effective!";
    } else if (typeEff < 1 && typeEff > 0) {
      modifier *= 0.5;
      log = " It's not very effective...";
    } else if (typeEff === 0) {
      modifier = 0;
      log = " It has no effect.";
    }

    if (attacker.types.includes(move.type)) {
      modifier *= 1.5;
    }

    const baseDamage = (((2 * attacker.level / 5 + 2) * move.power * (A / D)) / 50 + 2) * modifier;
    const isCrit = Math.random() < 0.0625; // 6.25% crit chance (1/16)
    const critMultiplier = isCrit ? 1.5 : 1.0;
    if (isCrit) log += " A critical hit!";
    const damage = Math.max(1, Math.floor(baseDamage * critMultiplier * (0.85 + Math.random() * 0.15)));
    
    return { damage, log };
  };

  const handleOpponentFaint = (currentBattle: BattleState) => {
    const nextOpponentIndex = currentBattle.opponentActiveIndex + 1;
    
    if (nextOpponentIndex < currentBattle.opponentTeam.length) {
      // Gym or Elite leader sends out next Pokemon
      setBattle(prev => {
        if (!prev) return null;
        return {
          ...prev,
          opponentActiveIndex: nextOpponentIndex,
          logs: [...prev.logs, `Opponent sent out ${prev.opponentTeam[nextOpponentIndex].name}!`]
        };
      });
    } else {
      // Victory!
      sound.playVictory();
      
      // Calculate reward XP and Money
      let prizeMoney = 200;
      let xpEarned = 100;
      if (currentBattle.type === 'wild') {
        const oLvl = currentBattle.opponentTeam[0].level;
        xpEarned = Math.floor(oLvl * 28);
        prizeMoney = Math.floor(oLvl * 15);
      } else if (currentBattle.type === 'trainer') {
        const trainer = ROUTE_TRAINERS.find(t => t.id === currentBattle.trainerId);
        if (trainer) {
          prizeMoney = trainer.rewardMoney;
          xpEarned = trainer.roster[0].level * 45;
          if (currentBattle.trainerId && !beatenTrainers.includes(currentBattle.trainerId)) {
            setBeatenTrainers(prev => [...prev, currentBattle.trainerId!]);
          }
        }
      } else if (currentBattle.type === 'gym') {
        const gym = GYMS.find(g => g.id === currentBattle.gymId);
        if (gym) {
          prizeMoney = gym.level * 180;
          xpEarned = gym.level * 60;
        }
      } else if (currentBattle.type === 'elite') {
        const elite = ELITE_16.find(e => e.id === currentBattle.eliteId);
        if (elite) {
          prizeMoney = elite.level * 250;
          xpEarned = elite.level * 80;
        }
      }

      setMoney(m => m + prizeMoney);

      // Award XP to all healthy team members (100% to active, 45% Exp. Share to others)
      const updatedTeam = team.map((poke, index) => {
        if (poke.currentHp <= 0) return poke; // Fainted Pokemon do not gain XP

        const isActive = index === currentBattle.playerActiveIndex;
        const xpShare = isActive ? xpEarned : Math.floor(xpEarned * 0.45);
        
        let level = poke.level;
        let xp = poke.xp + xpShare;
        let xpToNext = poke.xpToNext;
        let leveledUp = false;
        
        while (xp >= xpToNext && level < 100) {
          level++;
          xpToNext = Math.floor(Math.pow(level + 1, 3) * 0.8);
          leveledUp = true;
        }
        
        const baseStats = getPokemonById(poke.pokemonId).baseStats;
        const stats = calculateStats(baseStats, level);
        
        let currentMoves = [...poke.moves];
        if (leveledUp) {
          if (isActive) sound.playLevelUp();
          const data = getPokemonById(poke.pokemonId);
          // Check for unlocked moves up to the new level
          const newMoves = data.moves.filter(m => m.level <= level && m.level > poke.level);
          newMoves.forEach(unlockedMove => {
            if (!currentMoves.some(cm => cm.name === unlockedMove.name)) {
              if (currentMoves.length < 4) {
                currentMoves.push(unlockedMove);
              } else if (isActive) {
                // Queue a pending move learn modal only for the active battling Pokemon
                setPendingMoveLearn({
                  pokemonId: poke.id,
                  move: unlockedMove
                });
              }
            }
          });
        }
        
        // Handle evolutions
        let finalPokemonId = poke.pokemonId;
        let finalNickname = poke.nickname;
        const pokeData = getPokemonById(poke.pokemonId);
        if (pokeData.evolutionId && pokeData.evolutionLevel && level >= pokeData.evolutionLevel) {
          finalPokemonId = pokeData.evolutionId;
          const evolvedData = getPokemonById(finalPokemonId);
          if (poke.nickname === pokeData.name) {
            finalNickname = evolvedData.name;
          }
        }
        
        return {
          ...poke,
          pokemonId: finalPokemonId,
          nickname: finalNickname,
          level,
          xp,
          xpToNext,
          maxHp: stats.maxHp,
          currentHp: leveledUp ? stats.maxHp : Math.min(stats.maxHp, poke.currentHp),
          attack: stats.attack,
          defense: stats.defense,
          spAttack: stats.spAttack,
          spDefense: stats.spDefense,
          speed: stats.speed,
          moves: currentMoves
        };
      });
      setTeam(updatedTeam);

      // Record Badge or Elite win
      if (currentBattle.type === 'gym' && currentBattle.gymId) {
        setBadgesDefeated(prev => {
          if (prev.includes(currentBattle.gymId!)) return prev;
          return [...prev, currentBattle.gymId!];
        });
      } else if (currentBattle.type === 'elite' && currentBattle.eliteId) {
        setEliteDefeatedCount(c => c + 1);
      }

      // Finish battle
      setBattle(null);
    }
  };

  const useItemInBattle = (itemName: string) => {
    if (!battle) return;

    const bagCount = bag[itemName] || 0;
    if (bagCount <= 0) return;

    const item = ITEMS[itemName];
    if (!item) return;

    sound.playSelect();

    // Consume item
    setBag(prev => ({ ...prev, [itemName]: prev[itemName] - 1 }));

    if (item.type === 'ball') {
      if (battle.type !== 'wild') {
        setBattle(prev => prev ? { ...prev, logs: [...prev.logs, "You cannot catch another trainer's Pokémon!"] } : null);
        return;
      }

      const oActive = battle.opponentTeam[0];
      
      // Trigger catching state
      setBattle(prev => prev ? { ...prev, isCatching: true } : null);

      // Play shake sounds in UI loop (controlled by UI component but let's calculate rate here)
      const hpRatio = oActive.currentHp / oActive.maxHp;
      let catchRate = (0.15 + (1 - hpRatio) * 0.75) * item.value;
      if (oActive.status === 'SLP') {
        catchRate *= 2.0;
      } else if (oActive.status && oActive.status !== null) {
        catchRate *= 1.5;
      }
      const success = item.name === 'Master Ball' || Math.random() < catchRate;

      setTimeout(() => {
        if (success) {
          sound.playCatchSuccess();
          
          // Add to team if space, else PC/storage (simplified: auto-add to team if <6)
          const newCaught = createPlayerPokemon(oActive.pokemonId, oActive.level, oActive.shiny);
          
          if (team.length < 6) {
            setTeam(prev => [...prev, newCaught]);
          } else {
            setPcBox(prev => [...prev, newCaught]);
          }

          // Record Pokedex
          setPokedexCaught(prev => prev.includes(oActive.pokemonId) ? prev : [...prev, oActive.pokemonId]);

          setBattle(prev => prev ? {
            ...prev,
            logs: [...prev.logs, `Gotcha! ${oActive.name} was caught!`],
            catchSuccess: true
          } : null);

          // Close battle screen after 1.5s
          setTimeout(() => setBattle(null), 1500);
        } else {
          sound.playCatchShake();
          setBattle(prev => {
            if (!prev) return null;
            const updatedBattle = {
              ...prev,
              isCatching: false,
              logs: [...prev.logs, `Oh no! The Pokémon broke free!`]
            };
            
            // Opponent immediate attack turn
            setTimeout(() => executeOpponentAttack(updatedBattle), 400);
            
            return updatedBattle;
          });
        }
      }, 1500);
    } else if (item.type === 'heal') {
      const activePoke = team[battle.playerActiveIndex];
      const updatedTeam = [...team];
      
      updatedTeam[battle.playerActiveIndex] = {
        ...activePoke,
        currentHp: Math.min(activePoke.maxHp, activePoke.currentHp + item.value)
      };
      
      setTeam(updatedTeam);
      
      setBattle(prev => {
        if (!prev) return null;
        const updatedBattle = {
          ...prev,
          logs: [...prev.logs, `You used ${item.name} on ${activePoke.nickname}. Restored HP.`]
        };
        setTimeout(() => executeOpponentAttack(updatedBattle), 400);
        return updatedBattle;
      });
    } else if (item.type === 'revive') {
      // Find first fainted Pokemon to revive
      const faintedIndex = team.findIndex(p => p.currentHp <= 0);
      if (faintedIndex === -1) {
        setBattle(prev => prev ? { ...prev, logs: [...prev.logs, "No fainted Pokémon in team."] } : null);
        return;
      }

      const activePoke = team[faintedIndex];
      const updatedTeam = [...team];
      updatedTeam[faintedIndex] = {
        ...activePoke,
        currentHp: Math.floor(activePoke.maxHp * item.value),
        status: null
      };
      setTeam(updatedTeam);

      setBattle(prev => {
        if (!prev) return null;
        const updatedBattle = {
          ...prev,
          logs: [...prev.logs, `You used ${item.name} on ${activePoke.nickname}.`]
        };
        setTimeout(() => executeOpponentAttack(updatedBattle), 400);
        return updatedBattle;
      });
    } else if (item.type === 'cure') {
      const activePoke = team[battle.playerActiveIndex];
      const updatedTeam = [...team];
      
      updatedTeam[battle.playerActiveIndex] = {
        ...activePoke,
        status: null
      };
      
      setTeam(updatedTeam);
      
      setBattle(prev => {
        if (!prev) return null;
        const updatedBattle = {
          ...prev,
          logs: [...prev.logs, `You used ${item.name} on ${activePoke.nickname}. Cured all status conditions.`]
        };
        setTimeout(() => executeOpponentAttack(updatedBattle), 400);
        return updatedBattle;
      });
    }
  };

  const runFromBattle = () => {
    sound.playSelect();
    if (battle?.type !== 'wild') {
      setBattle(prev => prev ? { ...prev, logs: [...prev.logs, "Can't run from trainer battles!"] } : null);
      return;
    }
    
    // Speed check
    const pActive = team[battle.playerActiveIndex];
    const oActive = battle.opponentTeam[0];
    
    if (pActive.speed >= oActive.level * 1.2 || Math.random() < 0.6) {
      setBattle(null);
    } else {
      setBattle(prev => {
        if (!prev) return null;
        const updatedBattle = {
          ...prev,
          logs: [...prev.logs, "Can't escape!"]
        };
        setTimeout(() => executeOpponentAttack(updatedBattle), 400);
        return updatedBattle;
      });
    }
  };

  const reorderTeam = (indexA: number, indexB: number) => {
    if (indexA < 0 || indexA >= team.length || indexB < 0 || indexB >= team.length || indexA === indexB) return;
    sound.playSelect();
    setTeam(prev => {
      const updated = [...prev];
      [updated[indexA], updated[indexB]] = [updated[indexB], updated[indexA]];
      return updated;
    });
  };

  const swapPokemonWithPc = (pcIndex: number, teamIndex: number) => {
    if (pcIndex < 0 || pcIndex >= pcBox.length) return;
    if (teamIndex < 0 || teamIndex >= 6) return;
    sound.playSelect();

    setTeam(prevTeam => {
      const newTeam = [...prevTeam];
      setPcBox(prevPc => {
        const newPc = [...prevPc];
        if (teamIndex < newTeam.length) {
          const temp = newTeam[teamIndex];
          newTeam[teamIndex] = newPc[pcIndex];
          newPc[pcIndex] = temp;
        } else if (newTeam.length < 6) {
          newTeam.push(newPc[pcIndex]);
          newPc.splice(pcIndex, 1);
        }
        return newPc;
      });
      return newTeam;
    });
  };

  const depositToPc = (teamIndex: number) => {
    if (team.length <= 1) return; // Must keep at least 1 active Pokemon
    if (teamIndex < 0 || teamIndex >= team.length) return;
    sound.playSelect();

    const target = team[teamIndex];
    setTeam(prev => prev.filter((_, idx) => idx !== teamIndex));
    setPcBox(prev => [...prev, target]);
  };

  const healTeam = () => {
    sound.playSelect();
    setTeam(prev => prev.map(p => ({
      ...p,
      currentHp: p.maxHp,
      status: null,
      moves: p.moves.map(m => ({ ...m, currentPp: m.pp }))
    })));
  };

  const purchaseItem = (itemName: string, count: number) => {
    const cost = ITEMS[itemName].cost * count;
    if (money >= cost) {
      setMoney(m => m - cost);
      setBag(prev => ({
        ...prev,
        [itemName]: (prev[itemName] || 0) + count
      }));
      sound.playSelect();
    }
  };

  // Anti-Cheat cryptographic save helper
  const exportEncryptedSave = async (passcode: string): Promise<string> => {
    const state = { team, pcBox, pokedexCaught, badgesDefeated, eliteDefeatedCount, money, bag, activeIsland, currentLocation, mute };
    const jsonStr = JSON.stringify(state);
    
    // Hash using SHA-256 for integrity checks
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonStr + passcode + 'pokemon_emerald_secret_key');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Combine payload and signature in Base64 wrapper
    const saveObj = {
      payload: jsonStr,
      signature
    };
    
    return btoa(JSON.stringify(saveObj));
  };

  const importEncryptedSave = async (saveStr: string, passcode: string): Promise<boolean> => {
    setSaveLoading(true);
    setSaveVerified(null);
    try {
      const saveObj = JSON.parse(atob(saveStr));
      const payload = saveObj.payload;
      const signature = saveObj.signature;
      
      const encoder = new TextEncoder();
      const data = encoder.encode(payload + passcode + 'pokemon_emerald_secret_key');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const calculatedSig = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      if (calculatedSig === signature) {
        const decodedState = JSON.parse(payload);
        
        const loadedTeam = (decodedState.team || []).map((p: any) => ({
          ...p,
          moves: p.moves.map((m: any) => ({ ...m, currentPp: m.currentPp !== undefined ? m.currentPp : m.pp }))
        }));
        const loadedPc = (decodedState.pcBox || []).map((p: any) => ({
          ...p,
          moves: p.moves.map((m: any) => ({ ...m, currentPp: m.currentPp !== undefined ? m.currentPp : m.pp }))
        }));

        setTeam(loadedTeam);
        setPcBox(loadedPc);
        setPokedexCaught(decodedState.pokedexCaught || []);
        setBadgesDefeated(decodedState.badgesDefeated || []);
        setBeatenTrainers(decodedState.beatenTrainers || []);
        setEliteDefeatedCount(decodedState.eliteDefeatedCount || 0);
        setMoney(decodedState.money || 0);
        setBag(decodedState.bag || {});
        setActiveIsland(decodedState.activeIsland || 1);
        setCurrentLocation(decodedState.currentLocation || 'Littleroot Town');
        setMute(decodedState.mute || false);
        
        setSaveVerified(true);
        setSaveLoading(false);
        return true;
      } else {
        setSaveVerified(false);
        setSaveLoading(false);
        return false; // Signature mismatch / Cheat check failed
      }
    } catch (e) {
      setSaveVerified(false);
      setSaveLoading(false);
      return false;
    }
  };

  const learnPendingMove = (forgetMoveIndex: number | null) => {
    if (!pendingMoveLearn) return;
    sound.playSelect();

    if (forgetMoveIndex !== null) {
      setTeam(prev => prev.map(p => {
        if (p.id === pendingMoveLearn.pokemonId) {
          const updatedMoves = [...p.moves];
          updatedMoves[forgetMoveIndex] = pendingMoveLearn.move;
          return { ...p, moves: updatedMoves };
        }
        return p;
      }));
    }

    setPendingMoveLearn(null);
  };

  return (
    <GameContext.Provider value={{
      team, pcBox, pokedexCaught, badgesDefeated, beatenTrainers, eliteDefeatedCount, money, bag, activeIsland, currentLocation, battle, mute, saveLoading, saveVerified, pendingMoveLearn,
      startWildBattle, startTrainerBattle, startGymBattle, startEliteBattle, executeTurn, switchPokemon, useItemInBattle, runFromBattle, healTeam, purchaseItem, exportEncryptedSave, importEncryptedSave, toggleMute, travelToIsland, setLocation, learnPendingMove, selectStarter, reorderTeam, swapPokemonWithPc, depositToPc
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};
