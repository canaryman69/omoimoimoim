import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, TileType, Layer } from '@/lib/constants';
import Tile from './Tile';

interface GameMapProps {
  ctx: CanvasRenderingContext2D;
  cameraX: number;
  cameraY: number;
  tiles: TileType[][];
}

// Render map with proper layers
const GameMap = ({ ctx, cameraX, cameraY, tiles }: GameMapProps) => {
  // Calculate visible tile range
  const startX = Math.max(0, Math.floor((cameraX - ctx.canvas.width / 2) / TILE_SIZE) - 1);
  const endX = Math.min(MAP_WIDTH - 1, Math.ceil((cameraX + ctx.canvas.width / 2) / TILE_SIZE) + 1);
  const startY = Math.max(0, Math.floor((cameraY - ctx.canvas.height / 2) / TILE_SIZE) - 1);
  const endY = Math.min(MAP_HEIGHT - 1, Math.ceil((cameraY + ctx.canvas.height / 2) / TILE_SIZE) + 1);

  // Offset for camera position with subpixel precision
  const offsetX = Math.round((ctx.canvas.width / 2 - cameraX) * 100) / 100;
  const offsetY = Math.round((ctx.canvas.height / 2 - cameraY) * 100) / 100;

  // Render ground layer first
  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      const tileType = tiles[y]?.[x] || TileType.EMPTY;

      // Render ground layer tiles
      if ([
        TileType.GRASS, 
        TileType.PATH, 
        TileType.WATER,
        TileType.DIRT,
        TileType.DIRT_WATERED,
        TileType.SEED,
        TileType.PLANT_GROWING,
        TileType.PLANT_GROWN
      ].includes(tileType)) {
        Tile({
          ctx,
          x: x * TILE_SIZE + offsetX,
          y: y * TILE_SIZE + offsetY,
          type: tileType,
          layer: Layer.GROUND
        });
      }
    }
  }

  // Render ground decoration layer
  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      const tileType = tiles[y]?.[x] || TileType.EMPTY;

      // Render decoration layer tiles
      if ([TileType.CROPS].includes(tileType)) {
        Tile({
          ctx,
          x: x * TILE_SIZE + offsetX,
          y: y * TILE_SIZE + offsetY,
          type: tileType,
          layer: Layer.GROUND_DECORATION
        });
      }
    }
  }

  // Render obstacle bottom layer (things the player can walk behind)
  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      const tileType = tiles[y]?.[x] || TileType.EMPTY;

      // Render bottom parts of tall objects
      if ([TileType.TREE_BOTTOM, TileType.FENCE, TileType.HOUSE].includes(tileType)) {
        Tile({
          ctx,
          x: x * TILE_SIZE + offsetX,
          y: y * TILE_SIZE + offsetY,
          type: tileType,
          layer: Layer.OBSTACLE_BOTTOM
        });
      }
    }
  }

  // Character layer is rendered separately

  // Render obstacle top layer (things that should be drawn over the player)
  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      const tileType = tiles[y]?.[x] || TileType.EMPTY;

      // Render top parts of tall objects
      if ([TileType.TREE_TOP, TileType.ROCK].includes(tileType)) {
        Tile({
          ctx,
          x: x * TILE_SIZE + offsetX,
          y: y * TILE_SIZE + offsetY,
          type: tileType,
          layer: Layer.OBSTACLE_TOP
        });
      }
    }
  }

  // Draw grid lines
  ctx.strokeStyle = '#2d8e44';
  ctx.lineWidth = 1;

  // Vertical lines
  for (let x = startX; x <= endX + 1; x++) {
    ctx.beginPath();
    ctx.moveTo(x * TILE_SIZE + offsetX, startY * TILE_SIZE + offsetY);
    ctx.lineTo(x * TILE_SIZE + offsetX, (endY + 1) * TILE_SIZE + offsetY);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = startY; y <= endY + 1; y++) {
    ctx.beginPath();
    ctx.moveTo(startX * TILE_SIZE + offsetX, y * TILE_SIZE + offsetY);
    ctx.lineTo((endX + 1) * TILE_SIZE + offsetX, y * TILE_SIZE + offsetY);
    ctx.stroke();
  }

  return null;
};

export default GameMap;