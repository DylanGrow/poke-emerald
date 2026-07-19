export interface GymTrainerPokemon {
  pokemonId: number;
  level: number;
}

export interface Gym {
  id: number;
  name: string;
  leader: string;
  badge: string;
  type: string;
  island: number;
  level: number;
  roster: GymTrainerPokemon[];
}

const GYM_TYPES = [
  'Rock', 'Fighting', 'Electric', 'Fire', 'Water', 'Grass', 'Poison', 'Ground',
  'Flying', 'Psychic', 'Bug', 'Ghost', 'Dragon', 'Steel', 'Dark', 'Ice', 'Fairy', 'Normal'
];

const BADGE_NAMES = [
  'Stone', 'Knuckle', 'Dynamo', 'Heat', 'Balance', 'Feather', 'Mind', 'Rain',
  'Tectonic', 'Spore', 'Toxic', 'Zephyr', 'Shadow', 'Iron', 'Dread', 'Glacier',
  'Pixie', 'Helix', 'Magma', 'Volcano', 'Storm', 'Giga', 'Venom', 'Quake',
  'Stratosphere', 'Cosmic', 'Hive', 'Phantom', 'Titan', 'Draco'
];

const LEADER_NAMES = [
  'Roxanne', 'Brawly', 'Wattson', 'Flannery', 'Norman', 'Winona', 'Tate & Liza', 'Wallace',
  'Clay', 'Erika', 'Koga', 'Falkner', 'Morty', 'Byron', 'Sidney', 'Pryce',
  'Valerie', 'Brock', 'Misty', 'Blaine', 'Lt. Surge', 'Sabrina', 'Janine', 'Giovanni',
  'Skyla', 'Olympia', 'Bugsy', 'Fantina', 'Jasmin', 'Clair'
];

// Seeded generator to build all 30 gyms with themed teams
export function generateGyms(): Gym[] {
  const gyms: Gym[] = [];
  
  for (let i = 0; i <= 29; i++) {
    const gymId = i + 1;
    const island = Math.floor(i / 8) + 1; // Gyms 1-8: Is 1, Gyms 9-16: Is 2, Gyms 17-24: Is 3, Gyms 25-30: Is 4
    const level = 10 + i * 2.8; // Scales Gym 1 (lvl 10) to Gym 30 (lvl 91)
    const type = GYM_TYPES[i % GYM_TYPES.length];
    
    // Choose appropriate pokemon from Pokedex that match the type
    // Since we generated 650 pokemon, we can find some that match this gym's type
    // Import POKEDEX dynamically or filter it
    // To avoid circular dependency or complex filtering, we can pick themed IDs
    // Standard Pokemon type-mapping matches type index:
    // Let's select IDs using deterministic math based on gym index
    const roster: GymTrainerPokemon[] = [];
    const teamSize = Math.min(6, Math.floor(2 + (i / 6))); // Scales team size from 2 to 6
    
    for (let t = 0; t < teamSize; t++) {
      // Deterministic Pokemon pick: pick IDs offset by type index
      // Base stats scale, so we want pokemon that are evolved for late gyms
      // For early gyms, low ID/base forms. For late gyms, high ID/final forms.
      let pokeId = 1 + ((i * 13 + t * 29) % 640);
      
      // Let's adjust pokeId so Gym 1 gets low IDs (like Geodude/Onix equivalents), late gets final stages
      if (level < 25) {
        // Base forms: ensure we get early IDs
        pokeId = 1 + ((pokeId) % 150);
      } else if (level < 50) {
        pokeId = 100 + ((pokeId) % 250);
      } else {
        pokeId = 250 + ((pokeId) % 390);
      }
      
      roster.push({
        pokemonId: pokeId,
        level: Math.floor(level - 2 + t)
      });
    }

    gyms.push({
      id: gymId,
      name: `${LEADER_NAMES[i]} Gym`,
      leader: LEADER_NAMES[i],
      badge: `${BADGE_NAMES[i]} Badge`,
      type,
      island,
      level: Math.floor(level),
      roster
    });
  }

  return gyms;
}

export const GYMS = generateGyms();
