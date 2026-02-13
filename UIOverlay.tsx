import React from 'react';
import { EntityType, GameState } from '../types';
import { COSTS, UPGRADE_COSTS } from '../constants';

const WoodenResourceBadge = ({ icon, value }: { icon: string, value: number }) => (
    <div className="flex items-center justify-between w-28 h-10 bg-[#5d4037] rounded-lg border-2 border-[#3e2723] shadow-md px-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 pointer-events-none"></div>
        <span className="text-lg filter drop-shadow-sm">{icon}</span>
        <span className="font-mono font-bold text-[#ffedd5] text-sm drop-shadow-sm">{value}</span>
    </div>
);

interface UIOverlayProps {
  wood: number; stone: number; gold: number; food?: number; 
  day: number; isNight: boolean; hp: number; world: number;
  selectedBuild: EntityType | null;
  onSelectBuild: (type: EntityType | null) => void;
  onBuyBot: () => void; onUpgradeBase: () => void; onAttack: () => void; onOpenCrafting: () => void;
  gameOver: boolean; onRestart: () => void;
  gameState: React.MutableRefObject<GameState>;
  onToggleWeather: () => void;
  onOpenSettings: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({
  wood, stone, gold, food = 0, day, isNight, hp, world,
  selectedBuild, onSelectBuild, onBuyBot, onUpgradeBase, onAttack, onOpenCrafting, gameOver, onRestart,
  onOpenSettings, onToggleWeather
}) => {

  const canAfford = (type: EntityType) => {
    const cost = COSTS[type as keyof typeof COSTS];
    if (!cost) return false;
    return wood >= (cost.wood || 0) && stone >= (cost.stone || 0) && gold >= (cost.gold || 0);
  };

  const canAffordUpgrade = () => {
      const cost = UPGRADE_COSTS.BASE_LV2;
      return wood >= cost.wood && stone >= cost.stone && gold >= cost.gold;
  };

  if (gameOver) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 backdrop-blur-sm animate-in fade-in duration-500">
        <div className="text-center p-8 bg-[#5d4037] rounded-3xl border-4 border-[#3e2723] shadow-2xl transform scale-110 max-w-md w-full relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px'}}></div>
          <h1 className="text-6xl font-black text-[#ef4444] mb-2 drop-shadow-[2px_2px_0_#000] tracking-wider uppercase">DEFEATED</h1>
          <div className="h-1 bg-[#3e2723] w-full mb-6 opacity-30"></div>
          <p className="text-[#d7ccc8] mb-8 text-xl font-bold">You survived <span className="text-[#fcd34d] text-3xl mx-1">{day}</span> days.</p>
          <button onClick={onRestart} className="w-full py-4 bg-[#15803d] border-b-4 border-[#14532d] text-white font-black text-2xl rounded-xl hover:bg-[#16a34a] active:border-b-0 active:translate-y-1 transition-all shadow-lg">TRY AGAIN</button>
        </div>
      </div>
    );
  }

  const buildItems = [
    { type: EntityType.WALL, label: 'Wall', icon: '🧱' },
    { type: EntityType.SPIKE, label: 'Spike', icon: '🔪' },
    { type: EntityType.TURRET, label: 'Turret', icon: '🔫' },
    { type: EntityType.GOLD_MINE, label: 'Mine', icon: '🏭' },
    { type: EntityType.TORCH, label: 'Torch', icon: '🔥' },
  ];

  if (world === 2) {
      buildItems.push({ type: EntityType.FORCEFIELD, label: 'Field', icon: '🛡️' });
      buildItems.push({ type: EntityType.PLASMA_TURRET, label: 'Plasma', icon: '⚡' });
  }

  return (
    <div className="absolute inset-0 pointer-events-none font-sans select-none overflow-hidden">
      <div className="absolute top-4 left-4 pointer-events-auto flex flex-col gap-2">
          <button onClick={onOpenSettings} className="w-12 h-12 bg-[#5d4037] rounded-xl border-2 border-[#3e2723] flex items-center justify-center shadow-lg active:scale-95 transition-transform group">
             <span className="text-2xl filter drop-shadow-md grayscale opacity-80 group-hover:grayscale-0">⚙️</span>
          </button>
           <button onClick={onToggleWeather} className="w-12 h-12 bg-[#0ea5e9] rounded-xl border-2 border-[#0369a1] flex items-center justify-center shadow-lg active:scale-95 transition-transform">
             <span className="text-2xl filter drop-shadow-md">🌧️</span>
          </button>
      </div>

      <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-auto items-end">
          <WoodenResourceBadge icon="🪙" value={gold} />
          <WoodenResourceBadge icon="🌲" value={wood} />
          <WoodenResourceBadge icon="🪨" value={stone} />
          <WoodenResourceBadge icon="🍖" value={food} />
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
         <div className={`px-4 py-1 rounded-full border shadow-lg flex gap-2 ${world === 2 ? 'bg-purple-900/80 border-purple-500' : 'bg-black/50 border-white/10'}`}>
             <span className="text-white font-bold tracking-widest text-sm">DAY {day} {isNight ? '🌙' : '☀️'}</span>
             {world === 2 && <span className="text-purple-300 font-bold text-sm">WORLD 2</span>}
         </div>
         <div className="relative w-48 h-6 bg-black/60 rounded-full border-2 border-[#3e2723] overflow-hidden shadow-lg">
             <div className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300" style={{ width: `${Math.max(0, Math.min(100, hp))}%` }}></div>
             <div className="absolute inset-0 flex items-center justify-center"><span className="text-[10px] font-bold text-white drop-shadow-md">{Math.ceil(hp)} HP</span></div>
         </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto flex items-end gap-2 p-2 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-x-auto max-w-full">
          {buildItems.map((item) => {
              const active = selectedBuild === item.type;
              const affordable = canAfford(item.type);
              return (
                  <button key={item.type} onClick={() => onSelectBuild(active ? null : item.type)} className={`relative min-w-[4rem] h-16 rounded-xl border-b-4 flex flex-col items-center justify-center transition-all ${active ? 'bg-yellow-500 border-yellow-700 -translate-y-2' : affordable ? 'bg-[#5d4037] border-[#3e2723] hover:bg-[#6d4c41]' : 'bg-gray-700 border-gray-800 opacity-50'}`}>
                      <span className="text-2xl drop-shadow-md">{item.icon}</span>
                      <span className="text-[10px] font-bold text-[#ffedd5] mt-1">{item.label}</span>
                  </button>
              );
          })}
      </div>

      <div className="absolute bottom-8 right-8 pointer-events-auto flex flex-col items-end gap-4">
          <div className="flex gap-2">
            <button onClick={onBuyBot} className="w-14 h-14 bg-[#0ea5e9] border-b-4 border-[#0369a1] rounded-full flex items-center justify-center shadow-lg active:border-b-0 active:translate-y-1 transition-all"><span className="text-2xl">🤖</span></button>
            <button onClick={onUpgradeBase} className={`w-14 h-14 bg-[#8b5cf6] border-b-4 border-[#6d28d9] rounded-full flex items-center justify-center shadow-lg active:border-b-0 active:translate-y-1 transition-all ${!canAffordUpgrade() && 'opacity-50 grayscale'}`}><span className="text-2xl">🏰</span></button>
             <button onClick={onOpenCrafting} className="w-14 h-14 bg-[#eab308] border-b-4 border-[#ca8a04] rounded-full flex items-center justify-center shadow-lg active:border-b-0 active:translate-y-1 transition-all"><span className="text-2xl">🔨</span></button>
          </div>
          <button onPointerDown={onAttack} className="w-24 h-24 bg-red-600 border-b-8 border-red-800 rounded-full flex items-center justify-center shadow-2xl active:border-b-0 active:translate-y-2 transition-all group"><span className="text-5xl group-active:scale-90 transition-transform">⚔️</span></button>
      </div>
    </div>
  );
};

export default UIOverlay;