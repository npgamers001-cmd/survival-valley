import React, { useRef, useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import CraftingMenu from './components/CraftingMenu';
import Joystick from './components/Joystick';
import { GameState, EntityType, GamePhase, Recipe, WeatherType } from './types';
import { initGame, updateGame } from './services/engine';
import { COSTS, ENTITY_STATS, UPGRADE_COSTS } from './constants';
import { audioService } from './services/audioService';

const GAME_TICK_RATE = 16; 

export default function App() {
  const gameState = useRef<GameState>(initGame());
  
  const [uiState, setUiState] = useState({
    wood: 0, stone: 0, gold: 0, food: 0, day: 1, phase: GamePhase.DAY, hp: 100, gameOver: false, weather: WeatherType.CLEAR, world: 1
  });

  const [selectedBuild, setSelectedBuild] = useState<EntityType | null>(null);
  const [showCrafting, setShowCrafting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  const joystickVector = useRef({ x: 0, y: 0 });
  const keyboardVector = useRef({ x: 0, y: 0 });
  const isAttacking = useRef(false);
  const prevWeather = useRef<WeatherType>(WeatherType.CLEAR);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    const loop = () => {
      let inputX = joystickVector.current.x;
      let inputY = joystickVector.current.y;
      if (keyboardVector.current.x !== 0 || keyboardVector.current.y !== 0) {
          inputX = keyboardVector.current.x; inputY = keyboardVector.current.y;
      }
      
      const input = gameStarted ? { x: inputX, y: inputY } : { x: 0, y: 0 };
      const attack = gameStarted ? isAttacking.current : false;
      gameState.current = updateGame(gameState.current, input, attack);
      
      if ((input.x !== 0 || input.y !== 0) && !gameState.current.gameOver) audioService.playStep();

      isAttacking.current = false;

      // Audio Weather
      const currentWeather = gameState.current.weather;
      if (currentWeather !== prevWeather.current) {
         if (prevWeather.current === WeatherType.RAIN) audioService.stopRain();
         if ([WeatherType.FOG, WeatherType.STORM, WeatherType.SNOW].includes(prevWeather.current)) audioService.stopWind();
         if (prevWeather.current === WeatherType.STORM) audioService.stopRain();

         if (currentWeather === WeatherType.RAIN) audioService.startRain();
         if ([WeatherType.FOG, WeatherType.SNOW, WeatherType.STORM].includes(currentWeather)) audioService.startWind();
         if (currentWeather === WeatherType.STORM) audioService.startRain();
         
         prevWeather.current = currentWeather;
      }
      if (currentWeather === WeatherType.STORM && Math.random() < 0.005) audioService.playThunder();

      // UI Sync
      if (gameState.current.player.inventory.wood !== uiState.wood ||
          gameState.current.player.inventory.food !== uiState.food ||
          gameState.current.player.gold !== uiState.gold ||
          gameState.current.timeOfDay % 30 === 0 || 
          gameState.current.gameOver ||
          gameState.current.world !== uiState.world
         ) {
        setUiState({
          wood: gameState.current.player.inventory.wood,
          stone: gameState.current.player.inventory.stone,
          gold: gameState.current.player.gold,
          food: gameState.current.player.inventory.food,
          day: gameState.current.dayCount,
          phase: gameState.current.phase,
          hp: gameState.current.player.hp,
          gameOver: gameState.current.gameOver,
          weather: gameState.current.weather,
          world: gameState.current.world
        });
      }

      if (gameState.current.gameOver) {
          saveScore(gameState.current.dayCount);
      }
    };

    intervalId = setInterval(loop, GAME_TICK_RATE);
    return () => clearInterval(intervalId);
  }, [uiState, gameStarted]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!gameStarted || gameState.current.gameOver) return;
      switch (e.key.toLowerCase()) {
        case 'w': keyboardVector.current.y = -1; break;
        case 's': keyboardVector.current.y = 1; break;
        case 'a': keyboardVector.current.x = -1; break;
        case 'd': keyboardVector.current.x = 1; break;
        case ' ': isAttacking.current = true; break; 
      }
    };
    const up = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w': if (keyboardVector.current.y < 0) keyboardVector.current.y = 0; break;
        case 's': if (keyboardVector.current.y > 0) keyboardVector.current.y = 0; break;
        case 'a': if (keyboardVector.current.x < 0) keyboardVector.current.x = 0; break;
        case 'd': if (keyboardVector.current.x > 0) keyboardVector.current.x = 0; break;
      }
    };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [gameStarted]);

  const saveScore = (day: number) => {
      const best = parseInt(localStorage.getItem('sv_highscore') || '0');
      if (day > best) localStorage.setItem('sv_highscore', day.toString());
  };

  const handleStartGame = () => {
      audioService.enable();
      setGameStarted(true);
  };

  const handleRestart = () => {
    gameState.current = initGame();
    setUiState({ wood: 0, stone: 0, gold: 0, food: 0, day: 1, phase: GamePhase.DAY, hp: 100, gameOver: false, weather: WeatherType.CLEAR, world: 1 });
    setSelectedBuild(null);
    audioService.stopRain(); audioService.stopWind(); prevWeather.current = WeatherType.CLEAR;
  };

  const handleTap = (pos: {x: number, y: number}) => {
    if (!gameStarted || gameState.current.gameOver) return;
    const base = gameState.current.entities.find(e => e.type === EntityType.BASE);
    if (base && Math.sqrt(Math.pow(pos.x - base.pos.x, 2) + Math.pow(pos.y - base.pos.y, 2)) < 60) {
        setShowCrafting(true); return;
    }
    if (selectedBuild) {
        const cost = COSTS[selectedBuild as keyof typeof COSTS];
        if (cost && gameState.current.player.inventory.wood >= cost.wood && gameState.current.player.inventory.stone >= cost.stone && gameState.current.player.gold >= cost.gold) {
            const stats = ENTITY_STATS[selectedBuild] as any;
            gameState.current.entities.push({
                id: Math.random().toString(36),
                type: selectedBuild,
                pos: pos,
                ...stats,
                hp: stats.hp,
                maxHp: stats.hp,
                speed: 0,
                damage: stats.damage || 0,
                facing: 1,
                animState: 'IDLE',
                animFrame: 0,
            });
            gameState.current.player.inventory.wood -= cost.wood;
            gameState.current.player.inventory.stone -= cost.stone;
            gameState.current.player.gold -= cost.gold;
            audioService.playBuild();
            setSelectedBuild(null);
        }
    } else {
        isAttacking.current = true;
    }
  };

  const handleCraft = (recipe: Recipe) => {
      const { player } = gameState.current;
      if (recipe.cost.wood) player.inventory.wood -= recipe.cost.wood;
      if (recipe.cost.stone) player.inventory.stone -= recipe.cost.stone;
      if (recipe.cost.food) player.inventory.food -= recipe.cost.food;
      if (recipe.cost.gold) player.gold -= recipe.cost.gold;
      if (recipe.type === 'BUILD' && recipe.entityType) { setSelectedBuild(recipe.entityType); setShowCrafting(false); }
      else if (recipe.effect) { recipe.effect(gameState.current); audioService.playBuild(); }
  };

  const handleToggleSettings = () => setShowSettings(!showSettings);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900 select-none">
      <GameCanvas gameState={gameState} onMove={(v) => joystickVector.current = v} onTap={handleTap} />
      
      {!gameStarted && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-between py-12 px-6 bg-black/30 backdrop-blur-sm">
            <div className="absolute top-6 left-6 flex flex-col items-center" onClick={() => setShowSettings(true)}>
                 <div className="w-16 h-16 bg-[#5d4037] rounded-xl border-4 border-[#3e2723] flex items-center justify-center shadow-2xl hover:scale-105 transition-transform cursor-pointer">
                    <span className="text-4xl filter drop-shadow-md grayscale opacity-80">⚙️</span>
                 </div>
                 <span className="text-[#fcd34d] font-black text-sm mt-1 drop-shadow-sm">SETTINGS</span>
            </div>
            <div className="mt-8 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
                <h1 className="text-6xl md:text-8xl font-black text-[#fcd34d] tracking-tighter drop-shadow-[4px_4px_0_#3e2723]" style={{ WebkitTextStroke: '2px #3e2723' }}>SURVIVAL</h1>
                <h1 className="text-6xl md:text-8xl font-black text-[#fbbf24] tracking-tighter drop-shadow-[4px_4px_0_#3e2723] -mt-4" style={{ WebkitTextStroke: '2px #3e2723' }}>VALLEY</h1>
            </div>
            <div className="flex-1"></div>
            <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl justify-center items-center mb-8">
                <MenuButton label="PLAY" onClick={handleStartGame} primary />
                <MenuButton label="LEADERBOARD" onClick={() => setShowLeaderboard(true)} />
            </div>
        </div>
      )}

      {gameStarted && (
        <>
            <UIOverlay 
                wood={uiState.wood} stone={uiState.stone} gold={uiState.gold} food={uiState.food}
                day={uiState.day} isNight={uiState.phase === GamePhase.NIGHT} hp={uiState.hp}
                gameOver={uiState.gameOver} selectedBuild={selectedBuild}
                onSelectBuild={setSelectedBuild} onBuyBot={() => { /* ... */ }} onUpgradeBase={() => { /* ... */ }}
                onAttack={() => { isAttacking.current = true; audioService.playShoot(); }} 
                onOpenCrafting={() => setShowCrafting(true)} onRestart={handleRestart}
                gameState={gameState} onToggleWeather={() => { gameState.current.weather = WeatherType.RAIN; }}
                onOpenSettings={() => setShowSettings(true)}
                world={uiState.world}
            />
            <div className="absolute bottom-10 left-10 z-40 pointer-events-auto opacity-80 hover:opacity-100 transition-opacity">
                <Joystick onMove={(v) => joystickVector.current = v} />
            </div>
        </>
      )}
      
      {showCrafting && <CraftingMenu gameState={gameState.current} onClose={() => setShowCrafting(false)} onCraft={handleCraft} />}
      
      {showSettings && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
              <div className="bg-[#5d4037] border-4 border-[#3e2723] rounded-xl p-8 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                  <h2 className="text-3xl font-black text-[#fcd34d] text-center mb-6">SETTINGS</h2>
                  <div className="space-y-4">
                      <Toggle label="Master Sound" onChange={(v) => audioService.setMasterMute(!v)} defaultValue={!audioService.masterMute} />
                      <Toggle label="Sound Effects" onChange={(v) => audioService.setSfxMute(!v)} defaultValue={!audioService.sfxMute} />
                      <Toggle label="Music / Ambience" onChange={(v) => audioService.setMusicMute(!v)} defaultValue={!audioService.musicMute} />
                  </div>
                  <button onClick={() => setShowSettings(false)} className="w-full mt-8 py-3 bg-[#78350f] text-[#fcd34d] font-bold rounded-lg border-b-4 border-[#451a03] active:border-b-0 active:translate-y-1">CLOSE</button>
              </div>
          </div>
      )}

      {showLeaderboard && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowLeaderboard(false)}>
              <div className="bg-[#5d4037] border-4 border-[#3e2723] rounded-xl p-8 w-full max-w-sm text-center" onClick={e => e.stopPropagation()}>
                  <h2 className="text-3xl font-black text-[#fcd34d] mb-2">LEADERBOARD</h2>
                  <div className="h-1 bg-[#3e2723] w-full mb-6 opacity-30"></div>
                  <p className="text-[#d7ccc8] mb-2 font-bold">Your Best Run</p>
                  <p className="text-6xl font-black text-white drop-shadow-md">{localStorage.getItem('sv_highscore') || '0'} <span className="text-2xl text-[#fcd34d]">Days</span></p>
                  <button onClick={() => setShowLeaderboard(false)} className="w-full mt-8 py-3 bg-[#78350f] text-[#fcd34d] font-bold rounded-lg border-b-4 border-[#451a03] active:border-b-0 active:translate-y-1">CLOSE</button>
              </div>
          </div>
      )}
    </div>
  );
}

const MenuButton = ({ label, onClick, primary }: { label: string, onClick: () => void, primary?: boolean }) => (
    <button 
        onClick={onClick}
        className={`relative w-64 py-4 rounded-xl border-b-8 font-black text-2xl tracking-wide shadow-2xl transition-all active:border-b-0 active:translate-y-2 ${primary ? 'bg-[#d97706] border-[#92400e] text-[#fffbeb] hover:bg-[#b45309]' : 'bg-[#5d4037] border-[#3e2723] text-[#d7ccc8] hover:bg-[#4e342e]'}`}
    >
        {label}
        <div className="absolute top-0 left-0 w-full h-2 bg-white/20 rounded-t-lg"></div>
    </button>
);

const Toggle = ({ label, onChange, defaultValue }: { label: string, onChange: (val: boolean) => void, defaultValue: boolean }) => {
    const [isOn, setIsOn] = useState(defaultValue);
    return (
        <div className="flex justify-between items-center bg-[#3e2723] p-3 rounded-lg">
            <span className="text-[#fcd34d] font-bold">{label}</span>
            <button 
                onClick={() => { setIsOn(!isOn); onChange(!isOn); }}
                className={`w-12 h-6 rounded-full relative transition-colors ${isOn ? 'bg-[#22c55e]' : 'bg-gray-600'}`}
            >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isOn ? 'left-7' : 'left-1'}`}></div>
            </button>
        </div>
    );
};