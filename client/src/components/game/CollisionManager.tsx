import { useMap } from '@/lib/stores/useMap';
import { TILE_SIZE } from '@/lib/constants';

interface CollisionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const checkCollision = (box1: CollisionBox, box2: CollisionBox): boolean => {
  return (
    box1.x < box2.x + box2.width &&
    box1.x + box1.width > box2.x &&
    box1.y < box2.y + box2.height &&
    box1.y + box1.height > box2.y
  );
};

const checkTileCollision = (
  entity: CollisionBox,
  tileX: number,
  tileY: number,
  hasCollision: boolean
): boolean => {
  if (!hasCollision) return false;
  
  const tileBox = {
    x: tileX * TILE_SIZE,
    y: tileY * TILE_SIZE,
    width: TILE_SIZE,
    height: TILE_SIZE
  };
  
  return checkCollision(entity, tileBox);
};

interface CollisionManagerProps {
  entityBox: CollisionBox;
}

const CollisionManager = ({ entityBox }: CollisionManagerProps) => {
  const { hasCollisionAt } = useMap();
  
  // Check collision with map tiles
  const isColliding = (): boolean => {
    // Calculate which tiles to check for collision (the ones the entity box overlaps)
    const startTileX = Math.floor(entityBox.x / TILE_SIZE);
    const endTileX = Math.floor((entityBox.x + entityBox.width) / TILE_SIZE);
    const startTileY = Math.floor(entityBox.y / TILE_SIZE);
    const endTileY = Math.floor((entityBox.y + entityBox.height) / TILE_SIZE);
    
    // Check each tile
    for (let y = startTileY; y <= endTileY; y++) {
      for (let x = startTileX; x <= endTileX; x++) {
        if (checkTileCollision(entityBox, x, y, hasCollisionAt(x, y))) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  return { isColliding };
};

export default CollisionManager;
