import { useState, useEffect, useCallback } from 'react';
import { useKeyboardControls } from '@react-three/drei';
import { Controls } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/lib/stores/usePlayer';
import { useInventory, InventoryItem } from '@/lib/stores/useInventory';
import InventoryWindow from './InventoryWindow';
import GameClock from './GameClock';

const GameUI = () => {
  const [showControls, setShowControls] = useState(false);
  const [showItemInfo, setShowItemInfo] = useState<InventoryItem | null>(null);
  const interactPressed = useKeyboardControls<Controls>(state => state.interact);
  
  // Track all slot key presses
  const slot1Pressed = useKeyboardControls<Controls>(state => state.slot1);
  const slot2Pressed = useKeyboardControls<Controls>(state => state.slot2);
  const slot3Pressed = useKeyboardControls<Controls>(state => state.slot3);
  const slot4Pressed = useKeyboardControls<Controls>(state => state.slot4);
  const slot5Pressed = useKeyboardControls<Controls>(state => state.slot5);
  const slot6Pressed = useKeyboardControls<Controls>(state => state.slot6);
  const slot7Pressed = useKeyboardControls<Controls>(state => state.slot7);
  const slot8Pressed = useKeyboardControls<Controls>(state => state.slot8);
  const slot9Pressed = useKeyboardControls<Controls>(state => state.slot9);
  const slot10Pressed = useKeyboardControls<Controls>(state => state.slot10);

  // Only subscribe to the position from the player store to avoid re-renders
  const playerPosition = usePlayer(state => state.position);

  // Get player movement functions
  const moveUp = usePlayer(state => state.moveUp);
  const moveDown = usePlayer(state => state.moveDown);
  const moveLeft = usePlayer(state => state.moveLeft);
  const moveRight = usePlayer(state => state.moveRight);

  // Get inventory state
  const quickSlots = useInventory(state => state.quickSlots);
  const selectedQuickSlot = useInventory(state => state.selectedQuickSlot);
  const isBackpackOpen = useInventory(state => state.isBackpackOpen);
  const selectQuickSlot = useInventory(state => state.selectQuickSlot);
  const useSelectedItem = useInventory(state => state.useSelectedItem);
  const toggleBackpack = useInventory(state => state.toggleBackpack);

  // Memoized button handlers
  const handleCloseControls = useCallback(() => setShowControls(false), []);
  
  const handleItemClick = useCallback((index: number) => {
    selectQuickSlot(index);
    if (quickSlots[index]) {
      setShowItemInfo(quickSlots[index]);
      // Auto-hide item info after 2 seconds
      setTimeout(() => setShowItemInfo(null), 2000);
    }
  }, [quickSlots, selectQuickSlot]);

  const handleUseItem = useCallback(() => {
    useSelectedItem();
    // Briefly show the item info when used
    if (quickSlots[selectedQuickSlot]) {
      setShowItemInfo(quickSlots[selectedQuickSlot]);
      setTimeout(() => setShowItemInfo(null), 2000);
    }
  }, [useSelectedItem, quickSlots, selectedQuickSlot]);

  const handleBackpackClick = useCallback(() => {
    toggleBackpack();
  }, [toggleBackpack]);

  // Toggle controls display when interact key is pressed
  useEffect(() => {
    if (interactPressed) {
      setShowControls(prev => !prev);
    }
  }, [interactPressed]);
  
  // Handle inventory slot selection with number keys
  useEffect(() => {
    if (slot1Pressed) selectQuickSlot(0);
    if (slot2Pressed) selectQuickSlot(1);
    if (slot3Pressed) selectQuickSlot(2);
    if (slot4Pressed) selectQuickSlot(3);
    if (slot5Pressed) selectQuickSlot(4);
    if (slot6Pressed) selectQuickSlot(5);
    if (slot7Pressed) selectQuickSlot(6);
    if (slot8Pressed) selectQuickSlot(7);
    if (slot9Pressed) selectQuickSlot(8);
    if (slot10Pressed) selectQuickSlot(9);
  }, [
    slot1Pressed, slot2Pressed, slot3Pressed, slot4Pressed, slot5Pressed,
    slot6Pressed, slot7Pressed, slot8Pressed, slot9Pressed, slot10Pressed,
    selectQuickSlot
  ]);

  return (
    <div className="game-ui">
      {/* Position indicator */}
      <div className="position-indicator">
        Position: X: {Math.floor(playerPosition.x)}, Y: {Math.floor(playerPosition.y)}
      </div>
      
      {/* Game clock in top-right corner */}
      <div className="clock-container">
        <GameClock />
      </div>

      {/* Inventory sidebar */}
      <div className="inventory-sidebar">
        {/* Filled quick slots */}
        {quickSlots.map((item, index) => (
          <div 
            key={`quick-${item.id}-${index}`}
            className={`inventory-item ${index === selectedQuickSlot ? 'selected' : ''}`}
            onClick={() => handleItemClick(index)}
          >
            <div className="inventory-icon">{item.icon}</div>
            <div className="inventory-count">{item.count}</div>
          </div>
        ))}
        
        {/* Empty slots */}
        {Array.from({ length: Math.max(0, 10 - quickSlots.length) }).map((_, index) => (
          <div 
            key={`empty-${index}`}
            className={`inventory-item empty ${(quickSlots.length + index) === selectedQuickSlot ? 'selected' : ''}`}
            onClick={() => handleItemClick(quickSlots.length + index)}
          >
            <div className="inventory-icon"></div>
          </div>
        ))}
        
        {/* Backpack button at the bottom of the inventory sidebar */}
        <div className="backpack-button" onClick={handleBackpackClick}>
          <div className="backpack-icon">🎒</div>
        </div>
      </div>

      {/* Inventory window (shows when backpack is open) */}
      <InventoryWindow />

      {/* Item info popup */}
      {showItemInfo && (
        <div className="item-info">
          <h4>{showItemInfo.name}</h4>
          <p>{showItemInfo.description}</p>
        </div>
      )}

      {/* Controls help */}
      {showControls && (
        <div className="controls-help">
          <h3>Controls</h3>
          <ul>
            <li>WASD / Arrow Keys: Move character</li>
            <li>E / Space: Toggle controls</li>
            <li>U: Use selected item</li>
            <li>B: Toggle backpack</li>
            <li>1-0: Select quickslot items (0 selects slot 10)</li>
          </ul>
          <Button 
            variant="outline" 
            onClick={handleCloseControls}
            className="close-btn"
          >
            Close
          </Button>
        </div>
      )}

      {/* Mobile controls for touch devices */}
      <div className="mobile-controls">
        <div className="top-controls">
          <Button 
            variant="ghost" 
            className="mobile-btn up-btn" 
            onMouseDown={() => moveUp()}
            onMouseUp={() => {usePlayer.getState().stopMoving()}}
            onMouseLeave={() => {usePlayer.getState().stopMoving()}}
            onTouchStart={() => moveUp()}
            onTouchEnd={() => {usePlayer.getState().stopMoving()}}
          >
            ↑
          </Button>
          <Button 
            variant="ghost" 
            className="mobile-btn use-btn" 
            onClick={handleUseItem}
          >
            Use
          </Button>
        </div>
        <div className="mobile-horizontal">
          <Button 
            variant="ghost" 
            className="mobile-btn left-btn" 
            onMouseDown={() => moveLeft()}
            onMouseUp={() => {usePlayer.getState().stopMoving()}}
            onMouseLeave={() => {usePlayer.getState().stopMoving()}}
            onTouchStart={() => moveLeft()}
            onTouchEnd={() => {usePlayer.getState().stopMoving()}}
          >
            ←
          </Button>
          <Button 
            variant="ghost" 
            className="mobile-btn down-btn" 
            onMouseDown={() => moveDown()}
            onMouseUp={() => {usePlayer.getState().stopMoving()}}
            onMouseLeave={() => {usePlayer.getState().stopMoving()}}
            onTouchStart={() => moveDown()}
            onTouchEnd={() => {usePlayer.getState().stopMoving()}}
          >
            ↓
          </Button>
          <Button 
            variant="ghost" 
            className="mobile-btn right-btn" 
            onMouseDown={() => moveRight()}
            onMouseUp={() => {usePlayer.getState().stopMoving()}}
            onMouseLeave={() => {usePlayer.getState().stopMoving()}}
            onTouchStart={() => moveRight()}
            onTouchEnd={() => {usePlayer.getState().stopMoving()}}
          >
            →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameUI;