import type { GymTrainerPokemon } from './gyms';

export interface RouteTrainer {
  id: string;
  name: string;
  title: string; // e.g. "Youngster", "Lass", "Hiker", "Fisherman", "Bug Catcher"
  dialogueBefore: string;
  dialogueAfter: string;
  island: number;
  row: number;
  col: number;
  roster: GymTrainerPokemon[];
  rewardMoney: number;
  avatarSeed: number;
}

export const ROUTE_TRAINERS: RouteTrainer[] = [
  // Island 1 Trainers
  {
    id: 'is1_t1',
    name: 'Joey',
    title: 'Youngster',
    dialogueBefore: 'My Pokémon are in the top percentage of all Pokémon! Let’s battle!',
    dialogueAfter: 'Aww man, my percentage wasn’t high enough...',
    island: 1,
    row: 1,
    col: 2,
    roster: [{ pokemonId: 25, level: 4 }, { pokemonId: 19, level: 5 }],
    rewardMoney: 180,
    avatarSeed: 101
  },
  {
    id: 'is1_t2',
    name: 'Rick',
    title: 'Bug Catcher',
    dialogueBefore: 'I love bug Pokémon! Have you seen any rare ones around here?',
    dialogueAfter: 'My bugs got squished! I need to train more.',
    island: 1,
    row: 1,
    col: 4,
    roster: [{ pokemonId: 10, level: 5 }, { pokemonId: 13, level: 6 }],
    rewardMoney: 120,
    avatarSeed: 102
  },
  {
    id: 'is1_t3',
    name: 'Elliot',
    title: 'Fisherman',
    dialogueBefore: 'I’ve been fishing here all day! Reel in a battle with me!',
    dialogueAfter: 'Hook, line, and sinker... You got me!',
    island: 1,
    row: 3,
    col: 2,
    roster: [{ pokemonId: 129, level: 6 }, { pokemonId: 7, level: 7 }],
    rewardMoney: 280,
    avatarSeed: 103
  },
  {
    id: 'is1_t4',
    name: 'Clark',
    title: 'Hiker',
    dialogueBefore: 'Watch your step in these dark caves! My rock Pokémon are solid!',
    dialogueAfter: 'Tumbled down the mountain... Great fight!',
    island: 1,
    row: 1,
    col: 0,
    roster: [{ pokemonId: 74, level: 7 }, { pokemonId: 95, level: 8 }],
    rewardMoney: 350,
    avatarSeed: 104
  },
  {
    id: 'is1_t5',
    name: 'Carrie',
    title: 'Lass',
    dialogueBefore: 'Don’t underestimate me just because I’m cute!',
    dialogueAfter: 'You’re really strong! I need to rethink my strategy.',
    island: 1,
    row: 3,
    col: 4,
    roster: [{ pokemonId: 35, level: 8 }, { pokemonId: 39, level: 8 }],
    rewardMoney: 240,
    avatarSeed: 105
  },

  // Island 2 Trainers
  {
    id: 'is2_t1',
    name: 'Ethan',
    title: 'Camper',
    dialogueBefore: 'Setting up camp near the volcano! Want to test your heat resistance?',
    dialogueAfter: 'Whew! That battle was hotter than my campfire!',
    island: 2,
    row: 1,
    col: 1,
    roster: [{ pokemonId: 4, level: 14 }, { pokemonId: 58, level: 15 }],
    rewardMoney: 450,
    avatarSeed: 201
  },
  {
    id: 'is2_t2',
    name: 'Diana',
    title: 'Picnicker',
    dialogueBefore: 'Fresh air and sweet grass Pokémon make the best day!',
    dialogueAfter: 'My picnic got interrupted, but good battle!',
    island: 2,
    row: 2,
    col: 3,
    roster: [{ pokemonId: 43, level: 15 }, { pokemonId: 69, level: 16 }],
    rewardMoney: 480,
    avatarSeed: 202
  },
  {
    id: 'is2_t3',
    name: 'Bruno',
    title: 'Blackbelt',
    dialogueBefore: 'My fists are forged from iron determination! Haaaaah!',
    dialogueAfter: 'Your spirit outshines my martial technique!',
    island: 2,
    row: 3,
    col: 1,
    roster: [{ pokemonId: 66, level: 17 }, { pokemonId: 106, level: 18 }],
    rewardMoney: 600,
    avatarSeed: 203
  },

  // Island 3 Trainers
  {
    id: 'is3_t1',
    name: 'Sarah',
    title: 'Triathlete',
    dialogueBefore: 'Speed is everything! Can your Pokémon keep up with my sprint?',
    dialogueAfter: 'Outpaced and outplayed! Fantastic run!',
    island: 3,
    row: 1,
    col: 3,
    roster: [{ pokemonId: 81, level: 26 }, { pokemonId: 125, level: 28 }],
    rewardMoney: 850,
    avatarSeed: 301
  },
  {
    id: 'is3_t2',
    name: 'Kaito',
    title: 'Psychic',
    dialogueBefore: 'I foresaw your arrival in a vision... Prepare your mind!',
    dialogueAfter: 'Fascinating... My premonitions missed your true power.',
    island: 3,
    row: 3,
    col: 3,
    roster: [{ pokemonId: 64, level: 29 }, { pokemonId: 122, level: 31 }],
    rewardMoney: 960,
    avatarSeed: 302
  },

  // Island 4 Trainers
  {
    id: 'is4_t1',
    name: 'Drake',
    title: 'Dragon Tamer',
    dialogueBefore: 'Only the worthy can withstand the fury of dragon-kin!',
    dialogueAfter: 'Unbelievable strength! You possess the heart of a Master!',
    island: 4,
    row: 1,
    col: 1,
    roster: [{ pokemonId: 147, level: 48 }, { pokemonId: 148, level: 52 }],
    rewardMoney: 1500,
    avatarSeed: 401
  }
];
