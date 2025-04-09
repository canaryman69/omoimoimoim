// Game controls enum
export enum Controls {
  up = 'up',
  down = 'down',
  left = 'left',
  right = 'right',
  interact = 'interact',
  use = 'use',
  backpack = 'backpack',
  slot1 = 'slot1',
  slot2 = 'slot2',
  slot3 = 'slot3',
  slot4 = 'slot4',
  slot5 = 'slot5',
  slot6 = 'slot6',
  slot7 = 'slot7',
  slot8 = 'slot8',
  slot9 = 'slot9',
  slot10 = 'slot10'
}

// Tile size in pixels
export const TILE_SIZE = 48;

// Character movement speed in pixels per frame
export const PLAYER_SPEED = 100.0;

// Character animation frame rate
export const ANIMATION_FRAME_RATE = 8;

// Map dimensions in tiles
export const MAP_WIDTH = 20;
export const MAP_HEIGHT = 20;

// Layer types for proper rendering order
export enum Layer {
  GROUND = 0,
  GROUND_DECORATION = 1,
  OBSTACLE_BOTTOM = 2,
  CHARACTER = 3,
  OBSTACLE_TOP = 4
}

// Tile types for the map
export enum TileType {
  GRASS = 'grass',
  PATH = 'path',
  WATER = 'water',
  TREE_BOTTOM = 'tree_bottom',
  TREE_TOP = 'tree_top',
  ROCK = 'rock',
  FENCE = 'fence',
  CROPS = 'crops',
  HOUSE = 'house',
  EMPTY = 'empty',
  // Farming-related tiles
  DIRT = 'dirt',           // Tilled soil (from using hoe)
  DIRT_WATERED = 'dirt_watered', // Watered tilled soil
  SEED = 'seed',           // Seed planted in soil
  PLANT_GROWING = 'plant_growing', // Growing plant
  PLANT_GROWN = 'plant_grown'     // Fully grown plant
}

// Direction enum for character movement and animation
export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
  IDLE = 'idle'
}

// Character animation states
export enum AnimationState {
  IDLE = 'idle',
  WALKING = 'walking'
}
