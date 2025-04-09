import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useKeyboardControls } from '@react-three/drei';
import { Controls, ANIMATION_FRAME_RATE } from '@/lib/constants';
import { usePlayer } from '@/lib/stores/usePlayer';
import { useMap } from '@/lib/stores/useMap';
import { useInventory } from '@/lib/stores/useInventory';
import Character from './Character';
import GameMap from './GameMap';
import GameUI from '@/components/ui/GameUI';

const GameWorld = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const [gameTick, setGameTick] = useState(0);
  const requestRef = useRef<number>();
  
  // Get player controls and state
  const upPressed = useKeyboardControls<Controls>(state => state.up);
  const downPressed = useKeyboardControls<Controls>(state => state.down);
  const leftPressed = useKeyboardControls<Controls>(state => state.left);
  const rightPressed = useKeyboardControls<Controls>(state => state.right);
  const usePressed = useKeyboardControls<Controls>(state => state.use);
  const backpackPressed = useKeyboardControls<Controls>(state => state.backpack);
  
  // Individual selectors for player state to avoid unnecessary re-renders
  const playerPosition = usePlayer(state => state.position);
  const playerDirection = usePlayer(state => state.direction);
  const playerAnimationState = usePlayer(state => state.animationState);
  const playerAnimationFrame = usePlayer(state => state.animationFrame);
  
  // Player actions
  const moveUp = usePlayer(state => state.moveUp);
  const moveDown = usePlayer(state => state.moveDown);
  const moveLeft = usePlayer(state => state.moveLeft);
  const moveRight = usePlayer(state => state.moveRight);
  const stopMoving = usePlayer(state => state.stopMoving);
  const updatePlayer = usePlayer(state => state.update);
  const nextFrame = usePlayer(state => state.nextFrame);
  
  // Map store (individual selectors)
  const mapTiles = useMap(state => state.tiles);
  const collisionMap = useMap(state => state.collisionMap);
  const generateMap = useMap(state => state.generateMap);
  
  // Inventory actions
  const useSelectedItem = useInventory(state => state.useSelectedItem);
  const toggleBackpack = useInventory(state => state.toggleBackpack);
  
  // Generate map on component mount
  useEffect(() => {
    generateMap();
  }, [generateMap]);
  
  // Input handling effect with memoized functions
  useEffect(() => {
    // Handle movement input
    if (upPressed) {
      moveUp();
    } else if (downPressed) {
      moveDown();
    } else if (leftPressed) {
      moveLeft();
    } else if (rightPressed) {
      moveRight();
    } else {
      stopMoving();
    }
  }, [upPressed, downPressed, leftPressed, rightPressed, moveUp, moveDown, moveLeft, moveRight, stopMoving]);
  
  // Handle use item input
  useEffect(() => {
    if (usePressed) {
      useSelectedItem();
    }
  }, [usePressed, useSelectedItem]);
  
  // Handle backpack toggle
  useEffect(() => {
    if (backpackPressed) {
      toggleBackpack();
    }
  }, [backpackPressed, toggleBackpack]);
  
  // Game loop with memoized functions
  const gameLoop = useCallback((time: number) => {
    if (lastUpdateTimeRef.current === 0) {
      lastUpdateTimeRef.current = time;
      lastFrameTimeRef.current = time;
    }
    
    // Limit delta time to prevent large jumps
    const deltaTime = Math.min((time - lastUpdateTimeRef.current) / 1000, 0.1);
    const frameDeltaTime = (time - lastFrameTimeRef.current);

    // Fixed timestep for consistent physics
    const fixedTimeStep = 1 / 60; // 60 updates per second
    let timeLeft = deltaTime;

    // Update with fixed timestep
    while (timeLeft >= fixedTimeStep) {
      updatePlayer(fixedTimeStep, collisionMap);
      timeLeft -= fixedTimeStep;
    }
    
    // Handle animation timing with interpolation
    if (frameDeltaTime > 1000 / ANIMATION_FRAME_RATE) {
      nextFrame();
      lastFrameTimeRef.current = time;
    }
    
    // Update last update time
    lastUpdateTimeRef.current = time;
    
    // Trigger re-render
    setGameTick(prev => prev + 1);
    
    // Request next frame
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [updatePlayer, collisionMap, nextFrame]);
  
  // Set up game loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameLoop]);
  
  // Get canvas context and render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Always center camera on player
    const cameraX = playerPosition.x;
    const cameraY = playerPosition.y;
    
    // Render map and character
    GameMap({ 
      ctx, 
      cameraX, 
      cameraY, 
      tiles: mapTiles 
    });
    
    Character({ 
      ctx, 
      cameraX, 
      cameraY, 
      position: playerPosition,
      direction: playerDirection,
      animationState: playerAnimationState,
      animationFrame: playerAnimationFrame
    });
    
  }, [gameTick, playerPosition, playerDirection, playerAnimationState, playerAnimationFrame, mapTiles]);
  
  return (
    <div className="game-world">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="game-canvas"
      />
      <GameUI />
    </div>
  );
};

export default GameWorld;
