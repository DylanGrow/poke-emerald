export interface Move {
  name: string;
  type: string;
  power: number;
  accuracy: number;
  pp: number;
  level: number;
}

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

export interface PokemonData {
  id: number;
  name: string;
  types: string[];
  baseStats: BaseStats;
  moves: Move[];
  evolutionId: number | null;
  evolutionLevel: number | null;
  color: string;
  secondaryColor: string;
  shapeSeed: number;
  bodyType: number; // 0: blob, 1: beast, 2: bird, 3: humanoid, 4: bug, 5: fish, 6: plant, 7: shadow/mech
}

const TYPES = [
  'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 
  'Rock', 'Ghost', 'Dragon', 'Steel', 'Dark', 'Fairy'
];

const TYPE_COLORS: Record<string, string> = {
  Normal: '#a8a878', Fire: '#f08030', Water: '#6890f0', Grass: '#78c850',
  Electric: '#f8d030', Ice: '#98d8d8', Fighting: '#c03028', Poison: '#a040a0',
  Ground: '#e0c068', Flying: '#a890f0', Psychic: '#f85888', Bug: '#a8b820',
  Rock: '#b8a038', Ghost: '#705898', Dragon: '#7038f8', Steel: '#b8b8d0',
  Dark: '#705848', Fairy: '#ee99ac'
};

const MOVE_NAMES_BY_TYPE: Record<string, string[]> = {
  Normal: ['Tackle', 'Scratch', 'Quick Attack', 'Body Slam', 'Hyper Beam', 'Swift', 'Double Edge', 'Growl'],
  Fire: ['Ember', 'Flame Wheel', 'Flamethrower', 'Fire Blast', 'Heat Wave', 'Overheat', 'Fire Spin'],
  Water: ['Water Gun', 'Bubble', 'Water Pulse', 'Surf', 'Hydro Pump', 'Waterfall', 'Aqua Jet'],
  Grass: ['Vine Whip', 'Mega Drain', 'Razor Leaf', 'Giga Drain', 'Solar Beam', 'Leaf Blade', 'Synthesis'],
  Electric: ['Thunder Shock', 'Spark', 'Thunderbolt', 'Thunder', 'Volt Tackle', 'Charge Beam', 'Thunder Wave'],
  Ice: ['Powder Snow', 'Ice Shard', 'Ice Beam', 'Blizzard', 'Icicle Crash', 'Frost Breath'],
  Fighting: ['Karate Chop', 'Low Kick', 'Mach Punch', 'Brick Break', 'Close Combat', 'Focus Blast'],
  Poison: ['Poison Sting', 'Acid', 'Sludge Bomb', 'Poison Jab', 'Gunk Shot', 'Toxic Spikes'],
  Ground: ['Mud Slap', 'Sand Attack', 'Bulldoze', 'Earthquake', 'Earth Power', 'Fissure'],
  Flying: ['Gust', 'Wing Attack', 'Aerial Ace', 'Fly', 'Hurricane', 'Brave Bird', 'Air Slash'],
  Psychic: ['Confusion', 'Psybeam', 'Psychic', 'Psycho Cut', 'Extrasensory', 'Future Sight'],
  Bug: ['Struggle Bug', 'Bug Bite', 'Silver Wind', 'X-Scissor', 'Bug Buzz', 'Megahorn'],
  Rock: ['Rock Throw', 'Rock Tomb', 'Rock Slide', 'Stone Edge', 'Power Gem', 'Head Smash'],
  Ghost: ['Lick', 'Shadow Sneak', 'Shadow Punch', 'Shadow Ball', 'Hex', 'Phantom Force'],
  Dragon: ['Dragon Breath', 'Dragon Claw', 'Dragon Pulse', 'Outrage', 'Draco Meteor', 'Twister'],
  Steel: ['Metal Claw', 'Iron Head', 'Flash Cannon', 'Meteor Mash', 'Steel Wing', 'Heavy Slam'],
  Dark: ['Bite', 'Faint Attack', 'Crunch', 'Dark Pulse', 'Foul Play', 'Night Slash'],
  Fairy: ['Fairy Wind', 'Disarming Voice', 'Draining Kiss', 'Play Rough', 'Moonblast', 'Dazzling Gleam']
};

// Type-specific custom naming components for a fully custom roster
const TYPE_PREFIXES: Record<string, string[]> = {
  Normal: ['Regu', 'Norm', 'Pata', 'Fur', 'Senti', 'Tame', 'Lign', 'Claw'],
  Fire: ['Pyro', 'Ignis', 'Volcan', 'Combust', 'Blaze', 'Cinder', 'Scorch', 'Flare'],
  Water: ['Aqua', 'Hydro', 'Tidal', 'Torrent', 'Wave', 'Deep', 'Naut', 'Marine'],
  Grass: ['Leaf', 'Flor', 'Sylva', 'Seed', 'Vine', 'Bloom', 'Sprout', 'Phyllo'],
  Electric: ['Volt', 'Bolt', 'Shock', 'Spark', 'Electro', 'Amp', 'Galvan', 'Ohm'],
  Ice: ['Cryo', 'Frost', 'Glacier', 'Rime', 'Chill', 'Polar', 'Freeze', 'Sleet'],
  Fighting: ['Combat', 'Mach', 'Punch', 'Brawl', 'Strike', 'Fist', 'Clash', 'Slug'],
  Poison: ['Toxic', 'Venom', 'Nox', 'Ven', 'Acid', 'Septic', 'Tox', 'Vile'],
  Ground: ['Terra', 'Geo', 'Mud', 'Clay', 'Dust', 'Sand', 'Silt', 'Burrow'],
  Flying: ['Aero', 'Wing', 'Gale', 'Sky', 'Soar', 'Feather', 'Plume', 'Vane'],
  Psychic: ['Psy', 'Mind', 'Tele', 'Aura', 'Astral', 'Zen', 'Cerebro', 'Telepath'],
  Bug: ['Arach', 'Chitin', 'Larva', 'Web', 'Sting', 'Scarab', 'Moth', 'Click'],
  Rock: ['Lith', 'Petro', 'Stone', 'Crag', 'Ore', 'Boulder', 'Pebble', 'Shale'],
  Ghost: ['Specter', 'Wraith', 'Phant', 'Shade', 'Spook', 'Crypt', 'Spir', 'Banshee'],
  Dragon: ['Draco', 'Wyvern', 'Drake', 'Scales', 'Rex', 'Ladon', 'Saur', 'Wyrm'],
  Steel: ['Ferro', 'Iron', 'Alloy', 'Metal', 'Steel', 'Rust', 'Chrome', 'Cobalt'],
  Dark: ['Umbra', 'Shadow', 'Nox', 'Grim', 'Obscur', 'Dread', 'Vague', 'Murk'],
  Fairy: ['Pix', 'Fae', 'Sprite', 'Charm', 'Glimmer', 'Sylph', 'Faerie', 'Sprite']
};

const TYPE_SUFFIXES: Record<string, string[]> = {
  Normal: ['rat', 'fur', 'coon', 'foot', 'tail', 'pelt', 'bark', 'squeak'],
  Fire: ['sear', 'lash', 'fang', 'wing', 'core', 'blast', 'burn', 'combust'],
  Water: ['fin', 'shell', 'gill', 'splash', 'foam', 'wave', 'stream', 'pond'],
  Grass: ['sprout', 'thorn', 'root', 'petal', 'bush', 'leaf', 'stem', 'bark'],
  Electric: ['zap', 'watt', 'charge', 'surge', 'jolt', 'pulse', 'spark', 'current'],
  Ice: ['fang', 'berg', 'shard', 'drift', 'cone', 'ice', 'frost', 'snow'],
  Fighting: ['fist', 'kick', 'slam', 'guard', 'belt', 'bash', 'brawl', 'strike'],
  Poison: ['fang', 'sting', 'ooze', 'spit', 'gland', 'tail', 'venom', 'noxious'],
  Ground: ['dig', 'burrow', 'mole', 'slide', 'quake', 'rock', 'dirt', 'dust'],
  Flying: ['wing', 'beak', 'claw', 'glide', 'soar', 'plume', 'flight', 'vane'],
  Psychic: ['focus', 'beam', 'brain', 'gaze', 'sense', 'wave', 'mind', 'tele'],
  Bug: ['bug', 'sect', 'wing', 'crawl', 'pincer', 'silk', 'antenna', 'fly'],
  Rock: ['rock', 'core', 'shield', 'spike', 'crush', 'rubble', 'stone', 'crag'],
  Ghost: ['soul', 'shade', 'haunt', 'gloom', 'spirit', 'mist', 'crypt', 'specter'],
  Dragon: ['claw', 'tail', 'fang', 'scale', 'wing', 'breath', 'drake', 'serpent'],
  Steel: ['gear', 'plating', 'blade', 'guard', 'bolt', 'anvil', 'metal', 'shield'],
  Dark: ['shade', 'fang', 'claw', 'snarl', 'void', 'gloom', 'shadow', 'night'],
  Fairy: ['dust', 'beam', 'glow', 'wing', 'wish', 'spark', 'pix', 'glimmer']
};

// Seeded random number generator
function createRandom(seed: number) {
  return function() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export function generatePokedex(): PokemonData[] {
  const pokedex: PokemonData[] = [];
  
  // Custom naming overrides for our landmark/legendary entries
  const landmarks: Partial<PokemonData>[] = [
    { id: 1, name: 'Florasaur', types: ['Grass', 'Poison'], bodyType: 6, color: '#4fc1a6', secondaryColor: '#a040a0' },
    { id: 2, name: 'Floravine', types: ['Grass', 'Poison'], bodyType: 6, color: '#4fc1a6', secondaryColor: '#a040a0' },
    { id: 3, name: 'Florabloom', types: ['Grass', 'Poison'], bodyType: 6, color: '#3fa38b', secondaryColor: '#a040a0' },
    { id: 4, name: 'Pyromander', types: ['Fire'], bodyType: 1, color: '#f08030', secondaryColor: '#ffcc33' },
    { id: 5, name: 'Pyrogon', types: ['Fire'], bodyType: 1, color: '#e06000', secondaryColor: '#ffcc33' },
    { id: 6, name: 'Pyrowing', types: ['Fire', 'Flying'], bodyType: 2, color: '#f08030', secondaryColor: '#a890f0' },
    { id: 7, name: 'Aquaturt', types: ['Water'], bodyType: 5, color: '#6890f0', secondaryColor: '#a8a878' },
    { id: 8, name: 'Aquashell', types: ['Water'], bodyType: 5, color: '#5880e0', secondaryColor: '#a8a878' },
    { id: 9, name: 'Aquacannon', types: ['Water'], bodyType: 5, color: '#4870d0', secondaryColor: '#b8b8d0' },
    { id: 25, name: 'Voltmouse', types: ['Electric'], bodyType: 3, color: '#f8d030', secondaryColor: '#a87800' },
    { id: 26, name: 'Voltsurge', types: ['Electric'], bodyType: 3, color: '#d8a010', secondaryColor: '#a87800' },
    { id: 133, name: 'Evolight', types: ['Normal'], bodyType: 1, color: '#c49e7a', secondaryColor: '#f0e0d0' },
    { id: 252, name: 'Sylvagecko', types: ['Grass'], bodyType: 1, color: '#58c870', secondaryColor: '#207038' },
    { id: 255, name: 'Blazechic', types: ['Fire'], bodyType: 2, color: '#f85830', secondaryColor: '#ffcc00' },
    { id: 258, name: 'Marshmud', types: ['Water'], bodyType: 5, color: '#4888f0', secondaryColor: '#f87020' },
    { id: 382, name: 'Tidalord', types: ['Water'], bodyType: 5, color: '#2058b8', secondaryColor: '#e03030' },
    { id: 383, name: 'Terradragon', types: ['Ground'], bodyType: 1, color: '#e03030', secondaryColor: '#e0c068' },
    { id: 384, name: 'Aeroserpent', types: ['Dragon', 'Flying'], bodyType: 7, color: '#30a068', secondaryColor: '#f8d030' },
  ];

  const landmarkMap = new Map<number, Partial<PokemonData>>();
  landmarks.forEach(l => landmarkMap.set(l.id!, l));

  for (let i = 1; i <= 650; i++) {
    const seed = i * 34567;
    const rand = createRandom(seed);
    const landmark = landmarkMap.get(i);

    // 1. Determine Type
    let types: string[];
    if (landmark && landmark.types) {
      types = landmark.types;
    } else {
      const type1 = TYPES[Math.floor(rand() * TYPES.length)];
      let type2: string | null = null;
      if (rand() < 0.4) {
        type2 = TYPES[Math.floor(rand() * TYPES.length)];
        while (type2 === type1) {
          type2 = TYPES[Math.floor(rand() * TYPES.length)];
        }
      }
      types = type2 ? [type1, type2] : [type1];
    }

    // 2. Generate custom, type-themed name
    let name = '';
    if (landmark && landmark.name) {
      name = landmark.name;
    } else {
      const primaryType = types[0];
      const secondaryType = types[1] || primaryType;
      
      const prefixes = TYPE_PREFIXES[primaryType] || TYPE_PREFIXES['Normal'];
      const suffixes = TYPE_SUFFIXES[secondaryType] || TYPE_SUFFIXES['Normal'];
      
      const pre = prefixes[Math.floor(rand() * prefixes.length)];
      const suf = suffixes[Math.floor(rand() * suffixes.length)];
      
      // Capitalize suffix to make it look clean, or combine directly
      name = pre + suf.toLowerCase();
    }

    // 3. Stats Generation based on evolution stage (every 3 is an evolution line)
    let stage = (i - 1) % 3; // 0: base, 1: mid, 2: final
    if (i === 252 || i === 255 || i === 258) stage = 0;
    else if (i === 253 || i === 256 || i === 259) stage = 1;
    else if (i === 254 || i === 257 || i === 260) stage = 2;
    const statMultiplier = stage === 0 ? 0.85 : stage === 1 ? 1.05 : 1.3;
    
    const hp = Math.floor((45 + rand() * 80) * statMultiplier);
    const attack = Math.floor((45 + rand() * 85) * statMultiplier);
    const defense = Math.floor((40 + rand() * 80) * statMultiplier);
    const spAttack = Math.floor((45 + rand() * 85) * statMultiplier);
    const spDefense = Math.floor((40 + rand() * 80) * statMultiplier);
    const speed = Math.floor((40 + rand() * 90) * statMultiplier);

    // 4. Evolution path
    let evolutionId: number | null = null;
    let evolutionLevel: number | null = null;
    if (stage < 2 && i < 649) {
      evolutionId = i + 1;
      evolutionLevel = stage === 0 ? 16 + Math.floor(rand() * 4) : 32 + Math.floor(rand() * 6);
    }

    // 5. Generate moves based on typing
    const moves: Move[] = [];
    moves.push({ name: rand() > 0.5 ? 'Tackle' : 'Scratch', type: 'Normal', power: 40, accuracy: 100, pp: 35, level: 1 });
    
    types.forEach(t => {
      const list = MOVE_NAMES_BY_TYPE[t] || MOVE_NAMES_BY_TYPE['Normal'];
      
      // Early move
      moves.push({
        name: list[0],
        type: t,
        power: 40,
        accuracy: 100,
        pp: 25,
        level: 5 + Math.floor(rand() * 5)
      });
      
      // Mid move
      if (list.length > 2) {
        moves.push({
          name: list[Math.floor(rand() * 2) + 1],
          type: t,
          power: 65,
          accuracy: 95,
          pp: 15,
          level: 18 + Math.floor(rand() * 6)
        });
      }
      
      // Late move
      if (list.length > 4) {
        moves.push({
          name: list[Math.floor(rand() * 3) + 3],
          type: t,
          power: 90,
          accuracy: 85,
          pp: 10,
          level: 35 + Math.floor(rand() * 10)
        });
      }
    });

    moves.sort((a, b) => a.level - b.level);

    const primaryColor = landmark && landmark.color ? landmark.color : TYPE_COLORS[types[0]];
    const secondaryColor = landmark && landmark.secondaryColor ? landmark.secondaryColor : 
                         (types[1] ? TYPE_COLORS[types[1]] : '#ffffff');

    const bodyType = landmark && landmark.bodyType !== undefined ? landmark.bodyType : Math.floor(rand() * 8);

    pokedex.push({
      id: i,
      name,
      types,
      baseStats: { hp, attack, defense, spAttack, spDefense, speed },
      moves,
      evolutionId,
      evolutionLevel,
      color: primaryColor,
      secondaryColor,
      shapeSeed: seed,
      bodyType
    });
  }

  return pokedex;
}

export const POKEDEX = generatePokedex();

export function getPokemonById(id: number): PokemonData {
  return POKEDEX[id - 1] || POKEDEX[0];
}
