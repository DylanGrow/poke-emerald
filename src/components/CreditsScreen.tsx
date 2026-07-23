import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { PokemonSprite } from './PokemonSprite';
import { BrandLogo } from './BrandLogo';
import { getPokemonById } from '../db/pokemon';
import { sound } from '../utils/sound';
import { Star, Sparkles, Heart, Trophy, Shield, Zap, Music, Code, Database, Gamepad2, Palette, ChevronUp } from 'lucide-react';

// Credits data structure
interface CreditSection {
  heading: string;
  icon?: React.ReactNode;
  entries: { role: string; name: string }[];
}

const CREDIT_SECTIONS: CreditSection[] = [
  {
    heading: 'GAME DIRECTION',
    icon: <Star className="w-4 h-4" />,
    entries: [
      { role: 'Game Director', name: 'Dylan Grow' },
      { role: 'Creative Director', name: 'Dylan Grow' },
      { role: 'Executive Producer', name: 'Dylan Grow' },
    ]
  },
  {
    heading: 'PROGRAMMING',
    icon: <Code className="w-4 h-4" />,
    entries: [
      { role: 'Lead Engineer', name: 'Gemini AI' },
      { role: 'Battle System Engine', name: 'Gemini AI' },
      { role: 'State Management Architecture', name: 'React Context API' },
      { role: 'Audio Synthesis Engine', name: 'Web Audio API' },
      { role: 'Build Pipeline', name: 'Vite + TypeScript' },
    ]
  },
  {
    heading: 'GAME DESIGN',
    icon: <Gamepad2 className="w-4 h-4" />,
    entries: [
      { role: 'Battle Mechanics Design', name: 'Dylan Grow & Gemini AI' },
      { role: 'Type Effectiveness System', name: '18-Type Matrix' },
      { role: 'Damage Formula', name: 'Gen III Standard Formula' },
      { role: 'Experience Curve', name: 'Cubic Growth Model' },
      { role: 'Catch Rate Algorithm', name: 'HP-Ratio Weighted RNG' },
      { role: 'AI Move Selection', name: 'Score-Based Type Advantage' },
      { role: 'Evolution System', name: 'Level Threshold Triggers' },
    ]
  },
  {
    heading: 'ART & VISUAL DESIGN',
    icon: <Palette className="w-4 h-4" />,
    entries: [
      { role: 'Procedural Sprite Generator', name: 'PokemonSprite.tsx' },
      { role: 'UI / UX Design', name: 'Tailwind CSS v4' },
      { role: 'Battle Particle Effects', name: 'CSS Keyframe Animations' },
      { role: 'Evolution Animation', name: 'EvolutionOverlay.tsx' },
      { role: 'Battle Entrance Transitions', name: 'GBA-Style Sweep Bars' },
      { role: 'Scanline Filter', name: 'CSS Pseudo-Element Overlay' },
      { role: 'Brand Logo Design', name: 'Dylan Grow' },
      { role: 'Icon Library', name: 'Lucide React' },
    ]
  },
  {
    heading: 'SOUND & MUSIC',
    icon: <Music className="w-4 h-4" />,
    entries: [
      { role: 'Chiptune BGM Composer', name: 'Procedural Square + Triangle Waves' },
      { role: 'Sound Effects Engine', name: 'RetroSynth Class' },
      { role: 'Battle Encounter SFX', name: 'Frequency Sweep Oscillator' },
      { role: 'Level Up Fanfare', name: 'Rising Tone Sequence' },
      { role: 'Evolution Fanfare', name: 'Ascending Arpeggio Chords' },
      { role: 'Catch Success Jingle', name: 'Pentatonic Resolution' },
    ]
  },
  {
    heading: 'DATABASE & CONTENT',
    icon: <Database className="w-4 h-4" />,
    entries: [
      { role: 'Pokédex Generator', name: '650 Procedural Species' },
      { role: 'Move Database', name: '120+ Unique Moves Across 18 Types' },
      { role: 'Gym Leader Roster', name: '30 Gym Leaders' },
      { role: 'Elite 16 Council', name: '16 Champion-Tier Trainers' },
      { role: 'Route Trainer NPCs', name: '20+ Trainer Classes' },
      { role: 'Item Catalog', name: 'Balls, Potions, Revives & Cures' },
    ]
  },
  {
    heading: 'GYM LEADERS',
    icon: <Trophy className="w-4 h-4" />,
    entries: [
      { role: 'Stone Badge', name: 'Roxanne — Rock' },
      { role: 'Knuckle Badge', name: 'Brawly — Fighting' },
      { role: 'Dynamo Badge', name: 'Wattson — Electric' },
      { role: 'Heat Badge', name: 'Flannery — Fire' },
      { role: 'Balance Badge', name: 'Norman — Water' },
      { role: 'Feather Badge', name: 'Winona — Grass' },
      { role: 'Mind Badge', name: 'Tate & Liza — Poison' },
      { role: 'Rain Badge', name: 'Wallace — Ground' },
      { role: 'Tectonic Badge', name: 'Clay — Flying' },
      { role: 'Spore Badge', name: 'Erika — Psychic' },
      { role: 'Toxic Badge', name: 'Koga — Bug' },
      { role: 'Zephyr Badge', name: 'Falkner — Ghost' },
      { role: 'Shadow Badge', name: 'Morty — Dragon' },
      { role: 'Iron Badge', name: 'Byron — Steel' },
      { role: 'Dread Badge', name: 'Sidney — Dark' },
      { role: 'Glacier Badge', name: 'Pryce — Ice' },
      { role: 'Pixie Badge', name: 'Valerie — Fairy' },
      { role: 'Helix Badge', name: 'Brock — Normal' },
      { role: 'Magma Badge', name: 'Misty — Rock' },
      { role: 'Volcano Badge', name: 'Blaine — Fighting' },
      { role: 'Storm Badge', name: 'Lt. Surge — Electric' },
      { role: 'Giga Badge', name: 'Sabrina — Fire' },
      { role: 'Venom Badge', name: 'Janine — Water' },
      { role: 'Quake Badge', name: 'Giovanni — Grass' },
      { role: 'Stratosphere Badge', name: 'Skyla — Poison' },
      { role: 'Cosmic Badge', name: 'Olympia — Ground' },
      { role: 'Hive Badge', name: 'Bugsy — Flying' },
      { role: 'Phantom Badge', name: 'Fantina — Psychic' },
      { role: 'Titan Badge', name: 'Jasmin — Bug' },
      { role: 'Draco Badge', name: 'Clair — Ghost' },
    ]
  },
  {
    heading: 'ELITE 16 COUNCIL',
    icon: <Shield className="w-4 h-4" />,
    entries: [
      { role: 'Frost Empress', name: 'Lorelei — Ice' },
      { role: 'Fist of Iron', name: 'Bruno — Fighting' },
      { role: 'Necromancer of Old', name: 'Agatha — Ghost' },
      { role: 'Dragon Vanguard', name: 'Lance — Dragon' },
      { role: 'Lord of Deception', name: 'Sidney — Dark' },
      { role: 'Spirit Summoner', name: 'Phoebe — Ghost' },
      { role: 'Glacial Bastion', name: 'Glacia — Ice' },
      { role: 'Wyvern Overlord', name: 'Drake — Dragon' },
      { role: 'Swarm Tactician', name: 'Aaron — Bug' },
      { role: 'Mountain Crag', name: 'Bertha — Ground' },
      { role: 'Infernal Spark', name: 'Flint — Fire' },
      { role: 'Mentalist Sage', name: 'Lucian — Psychic' },
      { role: 'Champion Combatant', name: 'Marshal — Fighting' },
      { role: 'Ghostwriter of Souls', name: 'Chantal — Ghost' },
      { role: 'Night Gambler', name: 'Grimsley — Dark' },
      { role: 'Dream Weaver', name: 'Caitlin — Psychic' },
    ]
  },
  {
    heading: 'GAME SYSTEMS',
    icon: <Zap className="w-4 h-4" />,
    entries: [
      { role: 'Turn-Based Battle Engine', name: 'Speed Priority Queue' },
      { role: 'Dialog Paging System', name: 'Typewriter Advancer' },
      { role: 'Party Management', name: 'Swap & Reorder Interface' },
      { role: 'PC Storage System', name: 'Box Deposit & Withdraw' },
      { role: 'Move PP System', name: 'Per-Move Power Point Tracking' },
      { role: 'Status Conditions', name: 'PAR / BRN / PSN / SLP' },
      { role: 'Accuracy & Evasion', name: 'Per-Move Roll Checks' },
      { role: 'Critical Hit Engine', name: '6.25% Base Rate (1/16)' },
      { role: 'STAB Bonus', name: '1.5× Same-Type Attack Bonus' },
      { role: 'Shiny Pokémon System', name: '1/150 Encounter Rate' },
      { role: 'Exp. Share', name: 'Party-Wide XP Distribution' },
      { role: 'HM Surf & Fly', name: 'Badge-Gated Exploration' },
      { role: 'Whiteout Recovery', name: '15% Money Penalty' },
      { role: 'Encrypted Save System', name: 'SHA-256 Integrity Checks' },
      { role: 'Nickname System', name: 'Post-Capture Prompt' },
    ]
  },
  {
    heading: 'WORLD DESIGN',
    entries: [
      { role: 'Isle 1 — Emerald Archipelago', name: '8 Gyms · Routes 1–5' },
      { role: 'Isle 2 — Ruby Shoreline', name: '8 Gyms · Routes 6–12' },
      { role: 'Isle 3 — Sapphire Trench', name: '8 Gyms · Routes 13–18' },
      { role: 'Isle 4 — Origin Crater', name: '6 Gyms · Elite 16 Chamber' },
    ]
  },
  {
    heading: 'TECHNOLOGY STACK',
    entries: [
      { role: 'Runtime', name: 'React 19' },
      { role: 'Language', name: 'TypeScript 6' },
      { role: 'Bundler', name: 'Vite 8' },
      { role: 'Styling', name: 'Tailwind CSS 4' },
      { role: 'Icons', name: 'Lucide React' },
      { role: 'CI / CD', name: 'GitHub Actions → GitHub Pages' },
      { role: 'Audio', name: 'Web Audio API (Procedural)' },
      { role: 'Storage', name: 'LocalStorage + SHA-256' },
      { role: 'Platform', name: 'Progressive Web App (Offline-First)' },
    ]
  },
  {
    heading: 'SPECIAL THANKS',
    icon: <Heart className="w-4 h-4" />,
    entries: [
      { role: 'Original Inspiration', name: 'Pokémon Emerald — Game Freak, 2004' },
      { role: 'Series Creator', name: 'Satoshi Tajiri' },
      { role: 'Character Design Legacy', name: 'Ken Sugimori' },
      { role: 'Pokémon Company', name: 'Nintendo / Creatures Inc. / Game Freak' },
      { role: 'Hoenn Region Lore', name: 'Pokémon Ruby, Sapphire & Emerald' },
      { role: 'Gen III Battle Formula', name: 'Bulbapedia Community' },
      { role: 'AI Pair Programmer', name: 'Google Gemini — Antigravity' },
      { role: 'Playtester-in-Chief', name: 'Dylan Grow' },
    ]
  },
];

export const CreditsScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { team, pokedexCaught, badgesDefeated, eliteDefeatedCount, money } = useGame();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showComplete, setShowComplete] = useState(false);
  const animFrame = useRef<number>(0);

  // Play dedicated retro GBA credits music theme
  useEffect(() => {
    sound.playCreditsBGM();
    return () => {
      sound.playBGM();
    };
  }, []);

  // Auto-scroll at a slow cinematic speed
  useEffect(() => {
    if (!autoScroll) return;

    const scroll = () => {
      setScrollY(prev => {
        const next = prev + 0.6;
        return next;
      });
      animFrame.current = requestAnimationFrame(scroll);
    };
    animFrame.current = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animFrame.current);
  }, [autoScroll]);

  // Apply scroll position
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollY;

      // Check if we've reached the end
      const el = scrollRef.current;
      if (scrollY >= el.scrollHeight - el.clientHeight - 10 && scrollY > 100) {
        setAutoScroll(false);
        setShowComplete(true);
      }
    }
  }, [scrollY]);

  // Pause auto-scroll on user interaction, resume after delay
  const handleUserScroll = () => {
    if (autoScroll) {
      setAutoScroll(false);
      // Resume after 4 seconds of inactivity
      setTimeout(() => setAutoScroll(true), 4000);
    }
  };


  return (
    <div className="fixed inset-0 z-[200] bg-[#03060f] flex flex-col overflow-hidden select-none">
      
      {/* Animated starfield background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              left: `${(i * 37 + 13) % 100}%`,
              top: `${(i * 59 + 7) % 100}%`,
              opacity: 0.15 + (i % 5) * 0.08,
              animation: `twinkle ${2 + (i % 3)}s ease-in-out ${(i * 0.3) % 2}s infinite alternate`,
            }}
          />
        ))}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes twinkle {
            0% { opacity: 0.1; transform: scale(0.8); }
            100% { opacity: 0.5; transform: scale(1.3); }
          }
          @keyframes credits-glow {
            0%, 100% { text-shadow: 0 0 10px rgba(16, 185, 129, 0.3); }
            50% { text-shadow: 0 0 25px rgba(16, 185, 129, 0.6), 0 0 50px rgba(16, 185, 129, 0.2); }
          }
          @keyframes badge-shine {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          @keyframes fade-up-in {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}} />
      </div>

      {/* Top bar with close button */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-emerald-500/10 bg-[#060913]/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '3s' }} />
          <span className="text-[10px] font-mono tracking-[0.25em] text-emerald-400/80 uppercase font-bold">
            Staff Credits
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-mono text-gray-500 hover:text-emerald-400 px-3 py-1.5 border border-slate-800 rounded-lg hover:border-emerald-500/30 transition-all active:scale-95"
        >
          ✕ CLOSE
        </button>
      </div>

      {/* Scrolling credits container */}
      <div
        ref={scrollRef}
        onWheel={handleUserScroll}
        onTouchMove={handleUserScroll}
        className="flex-1 overflow-y-auto scrollbar-hide relative z-10"
        style={{ scrollBehavior: 'auto' }}
      >
        <div className="max-w-2xl mx-auto px-6 pt-24 pb-[100vh]">
          
          {/* Opening title card */}
          <div className="text-center mb-32 flex flex-col items-center gap-6">
            <BrandLogo height={52} />
            <div className="flex flex-col gap-2">
              <h1 
                className="text-3xl md:text-4xl font-black tracking-[0.2em] text-emerald-400 uppercase"
                style={{ animation: 'credits-glow 3s ease-in-out infinite' }}
              >
                Pokémon Emerald
              </h1>
              <div className="flex items-center justify-center gap-2">
                <div className="h-px flex-1 max-w-16 bg-gradient-to-r from-transparent to-emerald-500/40" />
                <span className="text-xs font-mono tracking-[0.3em] text-emerald-500/60 uppercase">Cyber Edition</span>
                <div className="h-px flex-1 max-w-16 bg-gradient-to-l from-transparent to-emerald-500/40" />
              </div>
            </div>
            <p className="text-[10px] font-mono text-gray-600 tracking-widest uppercase mt-4">
              A Fan-Made Tribute · Not Affiliated with Nintendo or Game Freak
            </p>
          </div>

          {/* Credit sections */}
          {CREDIT_SECTIONS.map((section, sIdx) => (
            <div key={sIdx} className="mb-20 flex flex-col items-center">
              
              {/* Section heading */}
              <div className="flex items-center gap-2.5 mb-6">
                {section.icon && (
                  <span className="text-emerald-400">{section.icon}</span>
                )}
                <h2 className="text-sm font-black tracking-[0.25em] text-emerald-400 uppercase">
                  {section.heading}
                </h2>
              </div>

              {/* Divider line */}
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent mb-6" />

              {/* Entries */}
              <div className="flex flex-col gap-2.5 items-center w-full max-w-md">
                {section.entries.map((entry, eIdx) => (
                  <div key={eIdx} className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">
                      {entry.role}
                    </span>
                    <span className="text-sm font-bold text-gray-200 tracking-wide">
                      {entry.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Player stats interlude */}
          <div className="mb-24 flex flex-col items-center gap-6 py-12 border-t border-b border-emerald-500/10">
            <h2 className="text-sm font-black tracking-[0.25em] text-amber-400 uppercase">
              Your Journey
            </h2>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
            
            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">Pokémon Caught</span>
                <span className="text-xl font-black text-amber-400 font-mono">{pokedexCaught.length}</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">Badges Earned</span>
                <span className="text-xl font-black text-amber-400 font-mono">{badgesDefeated.length}</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">Elite Defeated</span>
                <span className="text-xl font-black text-amber-400 font-mono">{eliteDefeatedCount}</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">Total Funds</span>
                <span className="text-xl font-black text-amber-400 font-mono">${money}</span>
              </div>
            </div>

            {/* Team showcase */}
            {team.length > 0 && (
              <div className="mt-6 flex flex-col items-center gap-3">
                <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">Hall of Fame Team</span>
                <div className="flex gap-4 flex-wrap justify-center">
                  {team.map(poke => {
                    const db = getPokemonById(poke.pokemonId);
                    return (
                      <div key={poke.id} className="flex flex-col items-center gap-1.5">
                        <PokemonSprite
                          pokemonId={poke.pokemonId}
                          color={db.color}
                          secondaryColor={db.secondaryColor}
                          shapeSeed={db.shapeSeed}
                          bodyType={db.bodyType}
                          size={56}
                          shiny={poke.shiny}
                        />
                        <span className="text-[9px] font-mono font-bold text-gray-300">{poke.nickname}</span>
                        <span className="text-[8px] font-mono text-gray-500">Lv.{poke.level}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Final thank you */}
          <div className="text-center flex flex-col items-center gap-6 mb-32 pt-12">
            <BrandLogo height={36} />
            <p className="text-lg font-black tracking-wider text-white uppercase">
              Thank You for Playing
            </p>
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 max-w-20 bg-gradient-to-r from-transparent to-emerald-500/30" />
              <Sparkles className="w-3.5 h-3.5 text-emerald-500/50" />
              <div className="h-px flex-1 max-w-20 bg-gradient-to-l from-transparent to-emerald-500/30" />
            </div>
            <p className="text-[10px] font-mono text-gray-600 max-w-xs leading-relaxed tracking-wider uppercase">
              Pokémon is © Nintendo, Creatures Inc., and Game Freak.
              This is a non-commercial fan project created for educational and entertainment purposes only.
            </p>
            <p className="text-[9px] font-mono text-gray-700 tracking-widest uppercase mt-4">
              © 2026 Dylan Grow · All Rights Reserved
            </p>
          </div>
        </div>
      </div>

      {/* Auto-scroll indicator */}
      {autoScroll && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-full px-4 py-1.5 backdrop-blur-sm">
          <ChevronUp className="w-3 h-3 text-emerald-400 animate-bounce" />
          <span className="text-[9px] font-mono text-gray-400 tracking-wider uppercase">Auto-Scrolling</span>
        </div>
      )}

      {/* Completion overlay */}
      {showComplete && (
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
          style={{ animation: 'fade-up-in 0.8s ease-out forwards' }}
        >
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 rounded-xl px-6 py-3 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Return to Game
          </button>
        </div>
      )}
    </div>
  );
};
