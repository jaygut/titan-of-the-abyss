export interface Vector2 {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  position: Vector2;
  velocity: Vector2;
  radius: number;
  color: string;
  angle?: number; // For orientation
}

export enum PreyType {
  LANTERNFISH = 'LANTERNFISH',
  AMMONITE = 'AMMONITE',
  SQUID = 'SQUID',
  ANGLERFISH = 'ANGLERFISH',
  GULPER_EEL = 'GULPER_EEL'
}

export interface PreyEntity extends Entity {
  type: PreyType;
  tailPhase?: number; // For animation
}

export interface Particle extends Entity {
  life: number;
  maxLife: number;
  size: number;
}

export interface Jellyfish extends Entity {
  tentacleOffset: number;
  pulsePhase: number;
}

export interface Seaweed {
  x: number;
  height: number;
  segments: number;
  color: string;
  phaseOffset: number;
}

export interface GameState {
  score: number;
  isPlaying: boolean;
  bioluminescence: boolean;
  debugMode: boolean;
}

export enum SoundType {
  ROAR = 'ROAR',
  SONAR = 'SONAR',
  EAT = 'EAT',
  AMBIENCE = 'AMBIENCE'
}