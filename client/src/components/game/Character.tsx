import { TILE_SIZE, Direction, AnimationState } from '@/lib/constants';

interface Position {
  x: number;
  y: number;
}

interface CharacterProps {
  ctx: CanvasRenderingContext2D;
  cameraX: number;
  cameraY: number;
  position: Position;
  direction: Direction;
  animationState: AnimationState;
  animationFrame: number;
}

// Map of sprite frames for character animations
const characterSprites: Record<Direction, Record<AnimationState, number[][]>> = {
  [Direction.UP]: {
    [AnimationState.IDLE]: [[0, 3]],
    [AnimationState.WALKING]: [[0, 3], [1, 3], [2, 3], [3, 3]]
  },
  [Direction.DOWN]: {
    [AnimationState.IDLE]: [[0, 0]],
    [AnimationState.WALKING]: [[0, 0], [1, 0], [2, 0], [3, 0]]
  },
  [Direction.LEFT]: {
    [AnimationState.IDLE]: [[0, 1]],
    [AnimationState.WALKING]: [[0, 1], [1, 1], [2, 1], [3, 1]]
  },
  [Direction.RIGHT]: {
    [AnimationState.IDLE]: [[0, 2]],
    [AnimationState.WALKING]: [[0, 2], [1, 2], [2, 2], [3, 2]]
  },
  [Direction.IDLE]: {
    [AnimationState.IDLE]: [[0, 0]],
    [AnimationState.WALKING]: [[0, 0]]
  }
};

// Create and cache character sprite sheet
let characterImage: HTMLImageElement | null = null;

const loadCharacterImage = (): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = './src/assets/character_animations.svg';
    img.onload = () => {
      characterImage = img;
      resolve(img);
    };
    img.onerror = () => {
      // Fallback - create a simple colored box character if image fails to load
      const canvas = document.createElement('canvas');
      canvas.width = 192; // 4 frames x 48px
      canvas.height = 192; // 4 directions x 48px
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Fill with different colors for different directions
        ctx.fillStyle = '#cc6644'; // Body color
        for (let y = 0; y < 4; y++) {
          for (let x = 0; x < 4; x++) {
            ctx.fillRect(x * 48, y * 48, 48, 48);
            
            // Draw a face to indicate direction
            ctx.fillStyle = '#222222';
            
            // Different face for each direction
            if (y === 0) { // Down - two eyes and smile
              ctx.fillRect(x * 48 + 12, y * 48 + 12, 8, 8);
              ctx.fillRect(x * 48 + 28, y * 48 + 12, 8, 8);
              ctx.fillRect(x * 48 + 18, y * 48 + 28, 12, 4);
            } else if (y === 1) { // Left - eyes to the left
              ctx.fillRect(x * 48 + 8, y * 48 + 16, 8, 8);
              ctx.fillRect(x * 48 + 8, y * 48 + 30, 12, 4);
            } else if (y === 2) { // Right - eyes to the right
              ctx.fillRect(x * 48 + 32, y * 48 + 16, 8, 8);
              ctx.fillRect(x * 48 + 28, y * 48 + 30, 12, 4);
            } else if (y === 3) { // Up - back of head, no face
              ctx.fillRect(x * 48 + 16, y * 48 + 32, 16, 8);
            }
            
            ctx.fillStyle = '#cc6644'; // Reset fill color for next frame
          }
        }
      }
      
      const dataUrl = canvas.toDataURL();
      const fallbackImg = new Image();
      fallbackImg.src = dataUrl;
      fallbackImg.onload = () => {
        characterImage = fallbackImg;
        resolve(fallbackImg);
      };
    };
  });
};

// Character rendering component
const Character = ({ ctx, cameraX, cameraY, position, direction, animationState, animationFrame }: CharacterProps) => {
  // Load character image if needed
  if (!characterImage) {
    loadCharacterImage().catch(console.error);
    return null;
  }
  
  // Calculate screen position (center of screen, offset by camera position)
  const screenX = ctx.canvas.width / 2 - cameraX + position.x;
  const screenY = ctx.canvas.height / 2 - cameraY + position.y;
  
  // Get current animation frame coordinates from sprite map
  const spriteFrames = characterSprites[direction][animationState];
  const frameCoords = spriteFrames[animationFrame % spriteFrames.length];
  
  // Draw character sprite
  const spriteSize = 48; // Size of each sprite frame
  ctx.drawImage(
    characterImage,
    frameCoords[0] * spriteSize,
    frameCoords[1] * spriteSize,
    spriteSize,
    spriteSize,
    screenX - TILE_SIZE / 2,
    screenY - TILE_SIZE,
    TILE_SIZE,
    TILE_SIZE
  );
  
  // Uncomment to debug hitbox
  // const hitboxSize = TILE_SIZE * 0.6;
  // const hitboxOffsetX = (TILE_SIZE - hitboxSize) / 2;
  // const hitboxOffsetY = TILE_SIZE * 0.3;
  // ctx.strokeStyle = 'red';
  // ctx.strokeRect(
  //   screenX - TILE_SIZE / 2 + hitboxOffsetX,
  //   screenY - TILE_SIZE + hitboxOffsetY,
  //   hitboxSize,
  //   hitboxSize
  // );
  
  return null;
};

export default Character;
