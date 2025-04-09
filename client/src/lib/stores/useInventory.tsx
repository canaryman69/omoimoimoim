import { create } from 'zustand';
import { usePlayer } from './usePlayer';
import { useMap } from './useMap';
import { TILE_SIZE, TileType } from '../constants';

export interface InventoryItem {
  id: string;
  name: string;
  icon: string; // Path to the icon image or emoji
  count: number;
  description?: string;
  usable?: boolean;
}

interface InventoryState {
  // Quick access slots (toolbar)
  quickSlots: InventoryItem[];
  selectedQuickSlot: number;
  
  // Main inventory items
  backpackItems: InventoryItem[];
  isBackpackOpen: boolean;
  
  // Actions
  addItem: (item: InventoryItem) => void;
  removeItem: (id: string, count?: number) => void;
  selectQuickSlot: (index: number) => void;
  useSelectedItem: () => void;
  getSelectedItem: () => InventoryItem | null;
  moveItemToQuickSlot: (backpackIndex: number, quickSlotIndex: number) => void;
  moveItemToBackpack: (quickSlotIndex: number) => void;
  moveQuickSlotToQuickSlot: (fromIndex: number, toIndex: number) => void;
  moveBackpackToBackpack: (fromIndex: number, toIndex: number) => void; // New function
  toggleBackpack: () => void;
}

export const useInventory = create<InventoryState>((set, get) => ({
  // Quick slots for the vertical toolbar
  quickSlots: [
    { id: 'axe', name: 'Axe', icon: '🪓', count: 1, description: 'For chopping trees', usable: true },
    { id: 'seeds', name: 'Seeds', icon: '🌱', count: 5, description: 'Plant in soil', usable: true },
    { id: 'watering_can', name: 'Watering Can', icon: '💧', count: 1, description: 'Water crops', usable: true }
  ],
  selectedQuickSlot: 0,
  
  // Main backpack inventory
  backpackItems: [
    { id: 'pickaxe', name: 'Pickaxe', icon: '⛏️', count: 1, description: 'Mine rocks and minerals', usable: true },
    { id: 'fishing_rod', name: 'Fishing Rod', icon: '🎣', count: 1, description: 'Catch fish in water', usable: true },
    { id: 'hoe', name: 'Hoe', icon: '🔨', count: 1, description: 'Till soil for planting', usable: true },
    { id: 'apple', name: 'Apple', icon: '🍎', count: 3, description: 'Restores energy', usable: true },
    { id: 'wood', name: 'Wood', icon: '🪵', count: 12, description: 'Building material', usable: false },
    { id: 'stone', name: 'Stone', icon: '🪨', count: 8, description: 'Building material', usable: false },
    { id: 'corn', name: 'Corn', icon: '🌽', count: 4, description: 'Food crop', usable: true },
    { id: 'carrot', name: 'Carrot', icon: '🥕', count: 6, description: 'Food crop', usable: true }
  ],
  isBackpackOpen: false,
  
  addItem: (item) => set((state) => {
    // First try to add to existing stack in quick slots
    const quickSlotIndex = state.quickSlots.findIndex((i) => i.id === item.id);
    if (quickSlotIndex >= 0) {
      const updatedQuickSlots = [...state.quickSlots];
      updatedQuickSlots[quickSlotIndex] = {
        ...updatedQuickSlots[quickSlotIndex],
        count: updatedQuickSlots[quickSlotIndex].count + item.count
      };
      return { quickSlots: updatedQuickSlots };
    }
    
    // Then check backpack for existing stack
    const backpackIndex = state.backpackItems.findIndex((i) => i.id === item.id);
    if (backpackIndex >= 0) {
      const updatedBackpack = [...state.backpackItems];
      updatedBackpack[backpackIndex] = {
        ...updatedBackpack[backpackIndex],
        count: updatedBackpack[backpackIndex].count + item.count
      };
      return { backpackItems: updatedBackpack };
    }
    
    // Check if there's space in the quick slots (for convenience)
    if (state.quickSlots.length < 10) {
      return { quickSlots: [...state.quickSlots, item] };
    }
    
    // No existing stack found and no space in quickslots, add to backpack
    return { backpackItems: [...state.backpackItems, item] };
  }),
  
  removeItem: (id, count = 1) => set((state) => {
    // First check quick slots
    const quickSlotIndex = state.quickSlots.findIndex((i) => i.id === id);
    if (quickSlotIndex >= 0) {
      const updatedQuickSlots = [...state.quickSlots];
      const currentCount = updatedQuickSlots[quickSlotIndex].count;
      
      if (currentCount <= count) {
        // Remove completely
        updatedQuickSlots.splice(quickSlotIndex, 1);
        // Adjust selected index if needed
        const newSelectedQuickSlot = state.selectedQuickSlot >= updatedQuickSlots.length
          ? Math.max(0, updatedQuickSlots.length - 1)
          : state.selectedQuickSlot;
        return { 
          quickSlots: updatedQuickSlots,
          selectedQuickSlot: newSelectedQuickSlot
        };
      } else {
        // Reduce count
        updatedQuickSlots[quickSlotIndex] = {
          ...updatedQuickSlots[quickSlotIndex],
          count: currentCount - count
        };
        return { quickSlots: updatedQuickSlots };
      }
    }
    
    // Then check backpack
    const backpackIndex = state.backpackItems.findIndex((i) => i.id === id);
    if (backpackIndex >= 0) {
      const updatedBackpack = [...state.backpackItems];
      const currentCount = updatedBackpack[backpackIndex].count;
      
      if (currentCount <= count) {
        // Remove completely
        updatedBackpack.splice(backpackIndex, 1);
      } else {
        // Reduce count
        updatedBackpack[backpackIndex] = {
          ...updatedBackpack[backpackIndex],
          count: currentCount - count
        };
      }
      return { backpackItems: updatedBackpack };
    }
    
    return state; // No changes if item not found
  }),
  
  selectQuickSlot: (index) => set((state) => {
    // Allow selecting slots that don't have items yet (up to 10)
    if (index >= 0 && index < 10) {
      return { selectedQuickSlot: index };
    }
    return state; // No changes if invalid index
  }),
  
  useSelectedItem: () => {
    const { quickSlots, selectedQuickSlot } = get();
    
    if (selectedQuickSlot >= 0 && selectedQuickSlot < quickSlots.length) {
      const selectedItem = quickSlots[selectedQuickSlot];
      
      if (selectedItem.usable) {
        console.log(`Using item: ${selectedItem.name}`);

        // Get player position from player store
        const playerPosition = usePlayer.getState().position;
        const tileX = Math.floor(playerPosition.x / TILE_SIZE);
        const tileY = Math.floor(playerPosition.y / TILE_SIZE);
        
        // Get map from map store for tile interaction
        const mapStore = useMap.getState();
        const currentTileType = mapStore.getTileAt(tileX, tileY);

        // Handle different items
        switch (selectedItem.id) {
          case 'hoe':
            // Convert grass to dirt
            if (currentTileType === TileType.GRASS) {
              // Update the map at the player's position
              mapStore.setTileAt(tileX, tileY, TileType.DIRT);
              console.log('Tilled soil with hoe!');
            }
            break;
            
          case 'watering_can':
            // Watering soil with water
            if (currentTileType === TileType.DIRT) {
              mapStore.setTileAt(tileX, tileY, TileType.DIRT_WATERED);
              console.log('Watered the soil!');
            }
            break;
            
          case 'seeds':
            // Planting seeds in watered soil
            if (currentTileType === TileType.DIRT_WATERED) {
              mapStore.setTileAt(tileX, tileY, TileType.SEED);
              console.log('Planted seeds!');
              
              // Seeds are consumable - reduce count
              get().removeItem(selectedItem.id, 1);
              
              // Start growing process (will become plant after some time)
              setTimeout(() => {
                // Check if the tile is still a seed
                const currentType = mapStore.getTileAt(tileX, tileY);
                if (currentType === TileType.SEED) {
                  // Grow to intermediate stage
                  mapStore.setTileAt(tileX, tileY, TileType.PLANT_GROWING);
                  
                  // Final growth stage after another delay
                  setTimeout(() => {
                    const growingType = mapStore.getTileAt(tileX, tileY);
                    if (growingType === TileType.PLANT_GROWING) {
                      mapStore.setTileAt(tileX, tileY, TileType.PLANT_GROWN);
                    }
                  }, 10000); // 10 seconds to fully grown
                }
              }, 5000); // 5 seconds to start growing
            }
            break;

          case 'apple':
          case 'corn':
          case 'carrot':
            // Consume food items
            console.log(`Ate ${selectedItem.name}`);
            get().removeItem(selectedItem.id, 1);
            break;
            
          default:
            // Other usable items
            console.log(`Used ${selectedItem.name}`);
            break;
        }
      }
    }
  },
  
  getSelectedItem: () => {
    const { quickSlots, selectedQuickSlot } = get();
    
    if (selectedQuickSlot >= 0 && selectedQuickSlot < quickSlots.length) {
      return quickSlots[selectedQuickSlot];
    }
    
    return null;
  },
  
  moveItemToQuickSlot: (backpackIndex: number, quickSlotIndex: number) => set((state) => {
    // Make sure indices are valid
    if (backpackIndex < 0 || backpackIndex >= state.backpackItems.length) return state;
    if (quickSlotIndex < 0 || quickSlotIndex >= 10) return state; // Limit to 10 slots
    
    const itemToMove = state.backpackItems[backpackIndex];
    let updatedBackpack = [...state.backpackItems];
    let updatedQuickSlots = [...state.quickSlots];
    
    // If the quick slot already has an item, swap them
    if (quickSlotIndex < state.quickSlots.length) {
      const itemInQuickSlot = state.quickSlots[quickSlotIndex];
      // If items are the same, stack them
      if (itemInQuickSlot && itemInQuickSlot.id === itemToMove.id) {
        updatedQuickSlots[quickSlotIndex] = {
          ...itemInQuickSlot,
          count: itemInQuickSlot.count + itemToMove.count
        };
        updatedBackpack.splice(backpackIndex, 1);
      } else {
        // Swap items
        updatedQuickSlots[quickSlotIndex] = itemToMove;
        updatedBackpack[backpackIndex] = itemInQuickSlot;
      }
    } else {
      // We need to handle the case where we're moving an item to a slot that doesn't exist yet
      // Fill any gaps between the current length and the target index with empty slots
      // We'll use a placeholder object instead of null to avoid issues
      // Note: These slots will be displayed as empty but the array needs actual elements
      while (updatedQuickSlots.length < quickSlotIndex) {
        // Create a special placeholder for empty slots
        updatedQuickSlots.push({
          id: `empty_${updatedQuickSlots.length}`,
          name: 'Empty',
          icon: '',
          count: 0
        });
      }
      
      // Now add the item to the specific index
      updatedQuickSlots[quickSlotIndex] = itemToMove;
      updatedBackpack.splice(backpackIndex, 1);
    }
    
    return {
      quickSlots: updatedQuickSlots,
      backpackItems: updatedBackpack
    };
  }),
  
  moveItemToBackpack: (quickSlotIndex: number) => set((state) => {
    if (quickSlotIndex < 0 || quickSlotIndex >= state.quickSlots.length) return state;
    
    const itemToMove = state.quickSlots[quickSlotIndex];
    const updatedQuickSlots = [...state.quickSlots];
    
    // Remove from quick slots
    updatedQuickSlots.splice(quickSlotIndex, 1);
    
    // Check if the item exists in backpack to stack
    const backpackIndex = state.backpackItems.findIndex(item => item.id === itemToMove.id);
    let updatedBackpack = [...state.backpackItems];
    
    if (backpackIndex >= 0) {
      // Stack with existing item
      updatedBackpack[backpackIndex] = {
        ...updatedBackpack[backpackIndex],
        count: updatedBackpack[backpackIndex].count + itemToMove.count
      };
    } else {
      // Add as new item
      updatedBackpack.push(itemToMove);
    }
    
    // Adjust selected index if needed
    const newSelectedQuickSlot = state.selectedQuickSlot >= updatedQuickSlots.length
      ? Math.max(0, updatedQuickSlots.length - 1)
      : state.selectedQuickSlot;
    
    return {
      quickSlots: updatedQuickSlots,
      backpackItems: updatedBackpack,
      selectedQuickSlot: newSelectedQuickSlot
    };
  }),
  
  moveQuickSlotToQuickSlot: (fromIndex: number, toIndex: number) => set((state) => {
    // Make sure indices are valid
    if (fromIndex < 0 || fromIndex >= state.quickSlots.length) return state;
    if (toIndex < 0 || toIndex >= 10) return state; // Limit to 10 slots
    if (fromIndex === toIndex) return state; // No change needed
    
    const updatedQuickSlots = [...state.quickSlots];
    const fromItem = updatedQuickSlots[fromIndex];
    
    // Handle moving to a slot that doesn't exist yet
    if (toIndex >= updatedQuickSlots.length) {
      // Fill any gaps with proper empty slot placeholders
      while (updatedQuickSlots.length < toIndex) {
        updatedQuickSlots.push({
          id: `empty_${updatedQuickSlots.length}`,
          name: 'Empty',
          icon: '',
          count: 0
        });
      }
      
      // Move the item to the target slot
      updatedQuickSlots[toIndex] = fromItem;
      updatedQuickSlots.splice(fromIndex, 1);
      
      // Adjust selected index if needed
      const newSelectedQuickSlot = state.selectedQuickSlot === fromIndex
        ? toIndex // Move selection to where we moved item
        : state.selectedQuickSlot > fromIndex
          ? state.selectedQuickSlot - 1 // Adjust downward for removed slot
          : state.selectedQuickSlot; // No change needed
          
      return {
        quickSlots: updatedQuickSlots,
        selectedQuickSlot: newSelectedQuickSlot
      };
    }
    
    // Otherwise handle existing slots
    const toItem = updatedQuickSlots[toIndex];
    
    // Check if we're stacking identical items
    if (toItem && fromItem.id === toItem.id) {
      // Combine the items in the target slot
      updatedQuickSlots[toIndex] = {
        ...toItem,
        count: toItem.count + fromItem.count
      };
      // Remove the source item
      updatedQuickSlots.splice(fromIndex, 1);
      
      // Adjust selected index if needed
      const newSelectedQuickSlot = state.selectedQuickSlot === fromIndex
        ? toIndex // Move selection to where we stacked
        : state.selectedQuickSlot > fromIndex
          ? state.selectedQuickSlot - 1 // Adjust downward for removed slot
          : state.selectedQuickSlot; // No change needed
      
      return {
        quickSlots: updatedQuickSlots,
        selectedQuickSlot: newSelectedQuickSlot
      };
    } else {
      // Swap the items
      updatedQuickSlots[fromIndex] = toItem;
      updatedQuickSlots[toIndex] = fromItem;
      
      // Adjust selected index if selection was one of the moved items
      const newSelectedQuickSlot = state.selectedQuickSlot === fromIndex
        ? toIndex // Selection follows the moved item
        : state.selectedQuickSlot === toIndex
          ? fromIndex // Selection follows the swapped item
          : state.selectedQuickSlot; // No change needed
      
      return {
        quickSlots: updatedQuickSlots,
        selectedQuickSlot: newSelectedQuickSlot
      };
    }
  }),
  
  moveBackpackToBackpack: (fromIndex: number, toIndex: number) => set((state) => {
    // Make sure indices are valid
    if (fromIndex < 0 || fromIndex >= state.backpackItems.length) return state;
    if (toIndex < 0 || toIndex >= state.backpackItems.length) return state;
    if (fromIndex === toIndex) return state; // No change needed
    
    const updatedBackpack = [...state.backpackItems];
    const fromItem = updatedBackpack[fromIndex];
    const toItem = updatedBackpack[toIndex];
    
    // Check if we're stacking identical items
    if (toItem && fromItem.id === toItem.id) {
      // Combine the items in the target slot
      updatedBackpack[toIndex] = {
        ...toItem,
        count: toItem.count + fromItem.count
      };
      // Remove the source item
      updatedBackpack.splice(fromIndex, 1);
      
      return { backpackItems: updatedBackpack };
    } else {
      // Swap the items
      updatedBackpack[fromIndex] = toItem;
      updatedBackpack[toIndex] = fromItem;
      
      return { backpackItems: updatedBackpack };
    }
  }),
  
  toggleBackpack: () => set((state) => ({ isBackpackOpen: !state.isBackpackOpen }))
}));