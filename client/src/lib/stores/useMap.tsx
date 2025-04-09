import { create } from "zustand";
import { MAP_WIDTH, MAP_HEIGHT, TileType } from "@/lib/constants";

interface MapState {
  tiles: TileType[][];
  collisionMap: boolean[][];
  
  // Actions
  generateMap: () => void;
  getTileAt: (x: number, y: number) => TileType;
  setTileAt: (x: number, y: number, tileType: TileType) => void;
  hasCollisionAt: (x: number, y: number) => boolean;
  updateCollisionMap: () => void;
}

// Helper function to determine if a tile has collision
const isTileCollidable = (tileType: TileType): boolean => {
  // Collision tiles - player can't walk through these
  const collisionTiles = [
    TileType.WATER,
    TileType.TREE_BOTTOM,
    TileType.TREE_TOP,
    TileType.ROCK,
    TileType.FENCE,
    TileType.HOUSE
  ];
  
  // Farming tiles have no collision - player can walk on them
  const farmingTiles = [
    TileType.DIRT,
    TileType.DIRT_WATERED,
    TileType.SEED,
    TileType.PLANT_GROWING,
    TileType.PLANT_GROWN
  ];
  
  return collisionTiles.includes(tileType);
};

export const useMap = create<MapState>((set, get) => ({
  tiles: Array(MAP_HEIGHT).fill(0).map(() => Array(MAP_WIDTH).fill(TileType.GRASS)),
  collisionMap: Array(MAP_HEIGHT).fill(0).map(() => Array(MAP_WIDTH).fill(false)),
  
  generateMap: () => {
    // Create a predefined map layout for simplicity
    // In a real game, you'd want to load maps from files or generate them procedurally
    const newTiles: TileType[][] = Array(MAP_HEIGHT)
      .fill(0)
      .map(() => Array(MAP_WIDTH).fill(TileType.GRASS));
    
    // Add a path through the center
    for (let x = 3; x < MAP_WIDTH - 3; x++) {
      newTiles[10][x] = TileType.PATH;
    }
    
    for (let y = 3; y < MAP_HEIGHT - 3; y++) {
      newTiles[y][10] = TileType.PATH;
    }
    
    // Add water
    for (let x = 2; x < 8; x++) {
      for (let y = 2; y < 5; y++) {
        newTiles[y][x] = TileType.WATER;
      }
    }
    
    // Add trees (with bottom and top parts)
    const treePositions = [
      { x: 15, y: 3 },
      { x: 17, y: 5 },
      { x: 16, y: 8 },
      { x: 3, y: 15 },
      { x: 7, y: 17 }
    ];
    
    treePositions.forEach(pos => {
      newTiles[pos.y][pos.x] = TileType.TREE_BOTTOM;
      newTiles[pos.y - 1][pos.x] = TileType.TREE_TOP;
    });
    
    // Add rocks
    const rockPositions = [
      { x: 5, y: 7 },
      { x: 8, y: 15 },
      { x: 14, y: 12 },
      { x: 18, y: 18 }
    ];
    
    rockPositions.forEach(pos => {
      newTiles[pos.y][pos.x] = TileType.ROCK;
    });
    
    // Add fences
    for (let x = 2; x < 6; x++) {
      newTiles[12][x] = TileType.FENCE;
    }
    
    for (let y = 12; y < 16; y++) {
      newTiles[y][6] = TileType.FENCE;
    }
    
    for (let x = 6; x > 1; x--) {
      newTiles[16][x] = TileType.FENCE;
    }
    
    for (let y = 16; y > 12; y--) {
      newTiles[y][2] = TileType.FENCE;
    }
    
    // Add crops
    for (let y = 13; y < 16; y++) {
      for (let x = 3; x < 6; x++) {
        newTiles[y][x] = TileType.CROPS;
      }
    }
    
    // Add a house
    newTiles[2][15] = TileType.HOUSE;
    
    // Generate collision map based on tile types
    const newCollisionMap = newTiles.map(row => 
      row.map(tile => isTileCollidable(tile))
    );
    
    set({ tiles: newTiles, collisionMap: newCollisionMap });
  },
  
  getTileAt: (x, y) => {
    const { tiles } = get();
    // Return empty for out of bounds
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) {
      return TileType.EMPTY;
    }
    return tiles[y][x];
  },
  
  setTileAt: (x, y, tileType) => {
    // Check bounds
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) {
      return; // Out of bounds - do nothing
    }
    
    // Update tile
    const newTiles = [...get().tiles];
    newTiles[y] = [...newTiles[y]]; // Create a new row
    newTiles[y][x] = tileType;
    
    // Update collision map for this tile
    const newCollisionMap = [...get().collisionMap];
    newCollisionMap[y] = [...newCollisionMap[y]]; // Create a new row
    newCollisionMap[y][x] = isTileCollidable(tileType);
    
    set({ tiles: newTiles, collisionMap: newCollisionMap });
  },
  
  updateCollisionMap: () => {
    const { tiles } = get();
    const newCollisionMap = tiles.map(row => 
      row.map(tile => isTileCollidable(tile))
    );
    set({ collisionMap: newCollisionMap });
  },
  
  hasCollisionAt: (x, y) => {
    const { collisionMap } = get();
    // Consider out of bounds as collision
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) {
      return true;
    }
    return collisionMap[y][x];
  }
}));
