import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { PLAYER_SPEED, Direction, AnimationState, TILE_SIZE } from "@/lib/constants";

interface Position {
  x: number;
  y: number;
}

interface PlayerState {
  position: Position;
  direction: Direction;
  animationState: AnimationState;
  animationFrame: number;
  isMoving: boolean;

  // Actions
  moveUp: () => void;
  moveDown: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  stopMoving: () => void;
  setPosition: (position: Position) => void;
  update: (dt: number, collisionMap: boolean[][]) => void;
  nextFrame: () => void;
}

export const usePlayer = create<PlayerState>()(
  subscribeWithSelector((set, get) => ({
    position: { x: 5 * TILE_SIZE, y: 5 * TILE_SIZE },
    direction: Direction.DOWN,
    animationState: AnimationState.IDLE,
    animationFrame: 0,
    isMoving: false,

    moveUp: () => {
      set({ direction: Direction.UP, animationState: AnimationState.WALKING, isMoving: true });
    },

    moveDown: () => {
      set({ direction: Direction.DOWN, animationState: AnimationState.WALKING, isMoving: true });
    },

    moveLeft: () => {
      set({ direction: Direction.LEFT, animationState: AnimationState.WALKING, isMoving: true });
    },

    moveRight: () => {
      set({ direction: Direction.RIGHT, animationState: AnimationState.WALKING, isMoving: true });
    },

    stopMoving: () => {
      set({ animationState: AnimationState.IDLE, isMoving: false });
    },

    setPosition: (position) => {
      set({ position });
    },

    nextFrame: () => {
      set((state) => ({ 
        animationFrame: (state.animationFrame + 1) % 4 
      }));
    },

    update: (dt, collisionMap) => {
      const { position, direction, isMoving } = get();

      if (!isMoving) return;

      let newX = position.x;
      let newY = position.y;

      // Calculate new position based on direction
      switch (direction) {
        case Direction.UP:
          newY -= PLAYER_SPEED * dt;
          break;
        case Direction.DOWN:
          newY += PLAYER_SPEED * dt;
          break;
        case Direction.LEFT:
          newX -= PLAYER_SPEED * dt * 2; // Double speed for x-axis (200)
          break;
        case Direction.RIGHT:
          newX += PLAYER_SPEED * dt * 2; // Double speed for x-axis (200)
          break;
      }

      // Check if the new position is within map bounds and not colliding
      const tileX = Math.floor(newX / TILE_SIZE);
      const tileY = Math.floor(newY / TILE_SIZE);

      // Check for collisions with object hitboxes
      const hitboxSize = TILE_SIZE * 0.6; // Smaller hitbox than the visual character
      const hitboxOffsetX = (TILE_SIZE - hitboxSize) / 2;
      const hitboxOffsetY = TILE_SIZE * 0.3; // Offset to place hitbox at character's feet

      const leftTile = Math.floor((newX + hitboxOffsetX) / TILE_SIZE);
      const rightTile = Math.floor((newX + hitboxOffsetX + hitboxSize) / TILE_SIZE);
      const topTile = Math.floor((newY + hitboxOffsetY) / TILE_SIZE);
      const bottomTile = Math.floor((newY + hitboxOffsetY + hitboxSize) / TILE_SIZE);

      // Check if any corner of the hitbox is in a collision tile
      const hasCollision = 
        (collisionMap[topTile]?.[leftTile] ?? true) || 
        (collisionMap[topTile]?.[rightTile] ?? true) || 
        (collisionMap[bottomTile]?.[leftTile] ?? true) || 
        (collisionMap[bottomTile]?.[rightTile] ?? true);

      if (!hasCollision) {
        set({ position: { x: newX, y: newY } });
      }
    }
  }))
);