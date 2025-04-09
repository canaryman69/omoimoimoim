import { useState, useEffect } from "react";
import { KeyboardControls } from "@react-three/drei";
import GameWorld from "@/components/game/GameWorld";
import { Controls } from "@/lib/constants";
import "@fontsource/inter";
import "./index.css";

// Main App component
function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  // Show the game once everything is loaded
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Define key mappings for character control
  const keyMap = [
    { name: Controls.up, keys: ['ArrowUp', 'KeyW'] },
    { name: Controls.down, keys: ['ArrowDown', 'KeyS'] },
    { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
    { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
    { name: Controls.interact, keys: ['KeyE', 'Space'] },
    { name: Controls.use, keys: ['KeyU'] },
    { name: Controls.backpack, keys: ['KeyB'] },
    // Inventory slot keys
    { name: Controls.slot1, keys: ['Digit1'] },
    { name: Controls.slot2, keys: ['Digit2'] },
    { name: Controls.slot3, keys: ['Digit3'] },
    { name: Controls.slot4, keys: ['Digit4'] },
    { name: Controls.slot5, keys: ['Digit5'] },
    { name: Controls.slot6, keys: ['Digit6'] },
    { name: Controls.slot7, keys: ['Digit7'] },
    { name: Controls.slot8, keys: ['Digit8'] },
    { name: Controls.slot9, keys: ['Digit9'] },
    { name: Controls.slot10, keys: ['Digit0'] },
  ];

  if (!isLoaded) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="game-container">
      <KeyboardControls map={keyMap}>
        <GameWorld />
      </KeyboardControls>
    </div>
  );
}

export default App;
