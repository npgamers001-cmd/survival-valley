import { EntityType, GameState, Recipe } from "./types";

export const WORLD_WIDTH = 2000;
export const WORLD_HEIGHT = 2000;

// World 1 Times
export const W1_DAY_LENGTH = 24000; 
export const W1_NIGHT_THRESHOLD = 16000; // ~4.4 mins day

// World 2 Times (Faster Day: 2 mins = 7200 frames)
export const W2_DAY_LENGTH = 14000;
export const W2_NIGHT_THRESHOLD = 7200; // 2 mins day

export const COSTS = {
  [EntityType.WALL]: { wood: 10, stone: 0, gold: 0 },
  [EntityType.TURRET]: { wood: 50, stone: 20, gold: 0 },
  [EntityType.BOT]: { wood: 0, stone: 0, gold: 100 },
  [EntityType.SPIKE]: { wood: 25, stone: 5, gold: 0 },
  [EntityType.GOLD_MINE]: { wood: 150, stone: 50, gold: 0 },
  [EntityType.TORCH]: { wood: 15, stone: 0, gold: 0 },
  // World 2
  [EntityType.FORCEFIELD]: { wood: 0, stone: 50, gold: 200 },
  [EntityType.PLASMA_TURRET]: { wood: 50, stone: 50, gold: 300 },
};

export const UPGRADE_COSTS = {
  BASE_LV2: { wood: 200, stone: 100, gold: 150 }
};

export const COLORS = {
  GRASS: '#4ade80', // green-400
  GRASS_DARK: '#22c55e', // green-500
  DIRT: '#854d0e',
  NIGHT_OVERLAY: 'rgba(10, 10, 50, 0.4)',
  UI_BG: 'rgba(0, 0, 0, 0.7)',
};

export const ANIMAL_STATS = {
  DEER: { hp: 30, speed: 3.5, size: 20, food: 20, color: '#854d0e' },
  RABBIT: { hp: 10, speed: 4.5, size: 12, food: 5, color: '#d6d3d1' },
  WOLF: { hp: 40, speed: 4.0, size: 18, food: 15, color: '#525252' },
  BEAR: { hp: 120, speed: 3.0, size: 28, food: 50, color: '#3f2c22' },
  FOX: { hp: 25, speed: 4.2, size: 16, food: 10, color: '#ea580c' },
};

export const ENTITY_STATS = {
  [EntityType.PLAYER]: { speed: 4, hp: 100, size: 16, color: '#3b82f6' },
  [EntityType.ZOMBIE]: { speed: 2.5, hp: 30, size: 16, color: '#ef4444', damage: 5 },
  [EntityType.BOSS]: { speed: 2.0, hp: 300, size: 32, color: '#7f1d1d', damage: 20 },
  [EntityType.BOT]: { speed: 3, hp: 50, size: 12, color: '#06b6d4', damage: 2 },
  [EntityType.TREE]: { hp: 50, size: 24, color: '#166534', resource: 10 },
  [EntityType.ROCK]: { hp: 80, size: 20, color: '#57534e', resource: 10 },
  [EntityType.WALL]: { hp: 200, size: 32, color: '#78350f' },
  [EntityType.TURRET]: { hp: 100, size: 32, color: '#525252', range: 250, fireRate: 30, damage: 15 },
  [EntityType.BASE]: { hp: 1000, size: 48, color: '#eab308' },
  [EntityType.PROJECTILE]: { speed: 10, size: 4, color: '#ffff00' },
  [EntityType.ANIMAL]: { speed: 3, hp: 20, size: 16, color: '#d97706' },
  [EntityType.SPIKE]: { hp: 50, size: 24, color: '#525252', damage: 10 },
  [EntityType.GOLD_MINE]: { hp: 300, size: 40, color: '#ca8a04' },
  [EntityType.TORCH]: { hp: 10, size: 16, color: '#facc15' },
  // World 2
  [EntityType.FORCEFIELD]: { hp: 1000, size: 32, color: '#3b82f6' },
  [EntityType.PLASMA_TURRET]: { hp: 300, size: 32, color: '#0ea5e9', range: 350, fireRate: 15, damage: 30 },
};

export const CRAFTING_RECIPES: Recipe[] = [
  {
    id: 'heal_potion',
    name: 'Small Potion',
    type: 'ITEM',
    description: 'Heals 30 HP',
    cost: { food: 20 },
    effect: (state: GameState) => {
      state.player.hp = Math.min(state.player.hp + 30, state.player.maxHp);
    }
  },
  {
    id: 'weapon_t1',
    name: 'Iron Mace',
    type: 'UPGRADE',
    description: '+10 Damage',
    reqTier: 0,
    cost: { wood: 50, stone: 50 },
    effect: (state: GameState) => {
      state.player.damage += 10;
      state.player.weaponTier = 1;
    }
  },
  {
    id: 'weapon_t2',
    name: 'Golden Hammer',
    type: 'UPGRADE',
    description: '+20 Damage',
    reqTier: 1,
    cost: { wood: 100, stone: 100, gold: 50 },
    effect: (state: GameState) => {
      state.player.damage += 20;
      state.player.weaponTier = 2;
    }
  },
  {
    id: 'weapon_t3',
    name: 'Diamond Sword',
    type: 'UPGRADE',
    description: '+30 Damage',
    reqTier: 2,
    cost: { wood: 100, stone: 100, gold: 250 },
    effect: (state: GameState) => {
      state.player.damage += 30;
      state.player.weaponTier = 3;
    }
  },
  {
    id: 'weapon_t4',
    name: 'Plasma Rifle',
    type: 'UPGRADE',
    description: 'World 2 Weapon (+50 Dmg)',
    reqTier: 3,
    reqWorld: 2,
    cost: { wood: 200, stone: 200, gold: 500 },
    effect: (state: GameState) => {
      state.player.damage += 50;
      state.player.weaponTier = 4;
    }
  },
  {
    id: 'tool_pickaxe',
    name: 'Pickaxe Upgrade',
    type: 'UPGRADE',
    description: '+20% Mining Speed',
    cost: { wood: 100, stone: 50 },
    effect: (state: GameState) => {
      state.player.miningMultiplier = (state.player.miningMultiplier || 1) + 0.2;
    }
  },
  {
    id: 'armor_t1',
    name: 'Leather Armor',
    type: 'UPGRADE',
    description: '+50 Max HP',
    cost: { food: 50, wood: 20 },
    effect: (state: GameState) => {
      state.player.maxHp += 50;
      state.player.hp += 50;
    }
  },
  {
    id: 'spike_trap',
    name: 'Spike Trap',
    type: 'BUILD',
    description: 'Hurts enemies stepping on it',
    cost: COSTS[EntityType.SPIKE],
    entityType: EntityType.SPIKE
  },
  {
    id: 'torch',
    name: 'Torch',
    type: 'BUILD',
    description: 'Provides light at night',
    cost: COSTS[EntityType.TORCH],
    entityType: EntityType.TORCH
  },
  {
    id: 'gold_mine',
    name: 'Gold Mine',
    type: 'BUILD',
    description: 'Generates Gold over time',
    cost: COSTS[EntityType.GOLD_MINE],
    entityType: EntityType.GOLD_MINE
  },
  {
    id: 'forcefield',
    name: 'Forcefield',
    type: 'BUILD',
    description: 'World 2: Strong Energy Wall',
    reqWorld: 2,
    cost: COSTS[EntityType.FORCEFIELD],
    entityType: EntityType.FORCEFIELD
  },
  {
    id: 'plasma_turret',
    name: 'Plasma Turret',
    type: 'BUILD',
    description: 'World 2: High Dmg Turret',
    reqWorld: 2,
    cost: COSTS[EntityType.PLASMA_TURRET],
    entityType: EntityType.PLASMA_TURRET
  }
];