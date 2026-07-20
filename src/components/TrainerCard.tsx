import React from 'react';
import { useGame } from '../context/GameContext';
import { GYMS } from '../db/gyms';
import { ROUTE_TRAINERS } from '../db/trainers';
import { Trophy, Award, DollarSign, Sparkles, UserCheck } from 'lucide-react';

export const TrainerCard: React.FC = () => {
  const {
    badgesDefeated,
    beatenTrainers,
    pokedexCaught,
    money
  } = useGame();

  const totalBadgesEarned = badgesDefeated.length;

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-950/90 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col gap-6 select-none">
      
      {/* Background ambient light */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Header Badge Title */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-850 pb-4 gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-wider uppercase">TRAINER PASSPORT & CARD</h2>
            <span className="text-xs font-mono text-emerald-400 font-extrabold uppercase tracking-widest">
              OFFICIAL ARCHIPELAGO LEAGUE CREDENTIAL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono">
          <span className="text-gray-400">STATUS:</span>
          <span className="font-extrabold text-emerald-400 tracking-wider">
            {totalBadgesEarned >= 30 ? '👑 LEAGUE CHAMPION' : totalBadgesEarned >= 8 ? '🎖️ ARCHIPELAGO CONTENDER' : '🌱 NOVICE TRAINER'}
          </span>
        </div>
      </div>

      {/* Main Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 z-10">
        <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl flex flex-col gap-1">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-yellow-400" /> BADGES EARNED
          </span>
          <span className="text-2xl font-black text-yellow-400 font-mono">
            {totalBadgesEarned} <span className="text-xs text-gray-500">/ 30</span>
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl flex flex-col gap-1">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> POKÉDEX CAUGHT
          </span>
          <span className="text-2xl font-black text-emerald-400 font-mono">
            {pokedexCaught.length} <span className="text-xs text-gray-500">/ 650</span>
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl flex flex-col gap-1">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" /> TRAINERS BEATEN
          </span>
          <span className="text-2xl font-black text-amber-400 font-mono">
            {beatenTrainers.length} <span className="text-xs text-gray-500">/ {ROUTE_TRAINERS.length}</span>
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl flex flex-col gap-1">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-300" /> WALLET CASH
          </span>
          <span className="text-2xl font-black text-emerald-300 font-mono">
            ${money.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 30-Badge Interactive Showcase Grid */}
      <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-xl flex flex-col gap-3 z-10">
        <div className="flex justify-between items-center border-b border-slate-850 pb-2">
          <span className="text-xs font-mono font-bold text-gray-300 tracking-wider uppercase">
            30 LEAGUE GYM BADGES SHOWCASE
          </span>
          <span className="text-[10px] font-mono text-gray-500">
            DEFEAT GYM LEADERS TO ILLUMINATE BADGES
          </span>
        </div>

        <div className="grid grid-cols-5 md:grid-cols-10 gap-2.5 pt-2">
          {GYMS.map((gym) => {
            const isEarned = badgesDefeated.includes(gym.id);
            return (
              <div
                key={gym.id}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-300 relative group ${
                  isEarned
                    ? 'bg-amber-950/20 border-yellow-500/50 shadow-[0_0_12px_rgba(234,179,8,0.2)] text-yellow-300'
                    : 'bg-slate-950/40 border-slate-850 text-slate-700 opacity-40'
                }`}
                title={`Gym ${gym.id}: ${gym.badge} Badge (${gym.leader} - ${gym.type})`}
              >
                <span className="text-lg">
                  {isEarned ? '🥇' : '🔒'}
                </span>
                <span className="text-[8px] font-mono font-bold truncate max-w-full">
                  #{gym.id}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* HMs & Exploration Credentials Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 z-10">
        <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌊</span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-200">HM03 SURF PERMIT</span>
              <span className="text-[10px] font-mono text-gray-500">Unlocks coastal and deep water navigation</span>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold ${
            badgesDefeated.includes(5) ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300' : 'bg-slate-900 text-slate-600'
          }`}>
            {badgesDefeated.includes(5) ? 'UNLOCKED' : 'LOCKED'}
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✈️</span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-200">HM02 FLY PERMIT</span>
              <span className="text-[10px] font-mono text-gray-500">Unlocks instant fast travel between towns</span>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold ${
            badgesDefeated.includes(6) ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300' : 'bg-slate-900 text-slate-600'
          }`}>
            {badgesDefeated.includes(6) ? 'UNLOCKED' : 'LOCKED'}
          </span>
        </div>
      </div>
    </div>
  );
};
