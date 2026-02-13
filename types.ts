export enum EntityType {
  PLAYER = 'PLAYER',
  ZOMBIE = 'ZOMBIE',
  BOT = 'BOT',
  TREE = 'TREE',
  ROCK = 'ROCK',
  WALL = 'WALL',
  TURRET = 'TURRET',
  BASE = 'BASE',
  PROJECTILE = 'PROJECTILE',
  ANIMAL = 'ANIMAL',
  SPIKE = 'SPIKE',
  GOLD_MINE = 'GOLD_MINE',
  BOSS = 'BOSS',
  TORCH = 'TORCH',
  // World 2 Items
  FORCEFIELD = 'FORCEFIELD',
  PLASMA_TURRET = 'PLASMA_TURRET'
}

export enum GamePhase {
  DAY = 'DAY',
  NIGHT = 'NIGHT'
}

export enum WeatherType {
  CLEAR = 'CLEAR',
  RAIN = 'RAIN',
  FOG = 'FOG',
  STORM = 'STORM',
  SNOW = 'SNOW'
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Lightning {
  id: string;
  x: number;
  y: number;
  targetY: number;
  life: number;
}

export interface Entity {
  id: string;
  type: EntityType;
  subtype?: 'DEER' | 'RABBIT' | 'WOLF' | 'BEAR' | 'FOX';
  pos: Vector2;
  size: number;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  targetId?: string | null;
  cooldown?: number;
  color: string;
  resourceValue?: number; // For trees/rocks
  // Animation props
  facing: number; // 1 (right) or -1 (left)
  animState: 'IDLE' | 'WALK' | 'ATTACK' | 'FLEE';
  animFrame: number;
  attackTimer?: number; // For visual attack animation
  fleeTimer?: number; // For animals running away
  level?: number; // For upgrades
  productionTimer?: number; // For production buildings
}

export interface PlayerState extends Entity {
  inventory: {
    wood: number;
    stone: number;
    food: number;
  };
  gold: number;
  weaponTier: number; // 0, 1, 2, 3, 4 (Plasma)
  miningMultiplier: number;
}

export interface River {
  points: Vector2[];
  width: number;
}

export interface RespawnTask {
  type: EntityType;
  timer: number;
}

export interface GameState {
  player: PlayerState;
  entities: Entity[];
  projectiles: Entity[];
  particles: Particle[];
  rivers: River[];
  lightnings: Lightning[];
  phase: GamePhase;
  dayCount: number;
  timeOfDay: number; // 0 to DAY_LENGTH
  gameOver: boolean;
  viewportOffset: Vector2;
  weather: WeatherType;
  weatherTimer: number;
  respawnQueue: RespawnTask[];
  world: number; // 1 or 2
}

export interface Particle {
  id: string;
  pos: Vector2;
  velocity: Vector2;
  life: number;
  color: string;
  size: number;
}

export interface Recipe {
  id: string;
  name: string;
  type: 'UPGRADE' | 'ITEM' | 'BUILD';
  description: string;
  cost: {
    wood?: number;
    stone?: number;
    gold?: number;
    food?: number;
  };
  effect?: (state: GameState) => void;
  entityType?: EntityType; // If it builds something
  reqTier?: number; // For sequential upgrades
  reqWorld?: number; // Only available in this world
}

export const TILE_SIZE = 32;