export interface EliteMember {
  id: number;
  name: string;
  title: string;
  specialty: string;
  level: number;
  roster: { pokemonId: number; level: number }[];
  dialogue: string;
}

const ELITE_NAMES = [
  'Lorelei', 'Bruno', 'Agatha', 'Lance', 
  'Sidney', 'Phoebe', 'Glacia', 'Drake', 
  'Aaron', 'Bertha', 'Flint', 'Lucian',
  'Marshal', 'Chantal', 'Grimsley', 'Caitlin'
];

const ELITE_TITLES = [
  'Frost Empress', 'Fist of Iron', 'Necromancer of Old', 'Dragon Vanguard',
  'Lord of Deception', 'Spirit Summoner', 'Glacial Bastion', 'Wyvern Overlord',
  'Swarm Tactician', 'Mountain Crag', 'Infernal Spark', 'Mentalist Sage',
  'Champion Combatant', 'Ghostwriter of Souls', 'Night Gambler', 'Dream Weaver'
];

const ELITE_SPECIALTIES = [
  'Ice', 'Fighting', 'Ghost', 'Dragon',
  'Dark', 'Ghost', 'Ice', 'Dragon',
  'Bug', 'Ground', 'Fire', 'Psychic',
  'Fighting', 'Ghost', 'Dark', 'Psychic'
];

const ELITE_DIALOGUES = [
  "You've frozen your way up here, but are you ready to face absolute zero?",
  "My muscles are hardened from years of intense training. Let's see your spirit!",
  "The spirits whispered of your arrival. They say your journey ends here.",
  "Dragons are creatures of myth and raw energy. Tremble before their might!",
  "A battle isn't just about strength; it's about trickery. Let's make a bet!",
  "My bond with spirits allows us to see right through your tactics.",
  "Cold protects, cold endures. Your burning passion will freeze solid here.",
  "You have courage, kid. But courage alone cannot tame my dragons!",
  "Bug Pokémon are often underestimated, but their synchronization is unbeatable!",
  "Like the earth below us, my team is solid, unshakable, and heavy.",
  "Let's turn up the heat! Show me a fire that never goes out!",
  "Your mind is an open book. I've already calculated every move you'll make.",
  "Only absolute devotion to the fight leads to true champion strength.",
  "Each battle is a story. Let's write the tragic final chapter of yours.",
  "Life is a game of cards, and I hold all the aces. Deal the deck!",
  "I was sleeping, but your challenge woke me. Let's make this quick."
];

export function generateElite16(): EliteMember[] {
  const elite: EliteMember[] = [];
  
  for (let i = 0; i < 16; i++) {
    const id = i + 1;
    const level = 92 + i; // Elite 1 starts at 92, Elite 16 (Champion equivalent) is level 107!
    
    // Choose 6 powerful high-tier Pokemon
    const roster: { pokemonId: number; level: number }[] = [];
    
    for (let t = 0; t < 6; t++) {
      // Deterministically select high-tier Pokemon (generally IDs 350-650)
      const pokeId = 350 + ((i * 17 + t * 41) % 290);
      roster.push({
        pokemonId: pokeId,
        level: level + (t === 5 ? 2 : 0) // Signature pokemon is 2 levels higher
      });
    }

    elite.push({
      id,
      name: ELITE_NAMES[i],
      title: ELITE_TITLES[i],
      specialty: ELITE_SPECIALTIES[i],
      level,
      roster,
      dialogue: ELITE_DIALOGUES[i]
    });
  }

  return elite;
}

export const ELITE_16 = generateElite16();
