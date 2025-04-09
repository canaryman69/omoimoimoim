import { useState, useRef, useEffect } from 'react';
import { useInventory, InventoryItem } from '@/lib/stores/useInventory';

const InventoryWindow = () => {
  const [position, setPosition] = useState({ x: 200, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggedItem, setDraggedItem] = useState<{
    index: number; 
    item: InventoryItem; 
    source: 'backpack' | 'quickslot';
    x: number;
    y: number;
  } | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  
  // Get inventory state
  const backpackItems = useInventory(state => state.backpackItems);
  const quickSlots = useInventory(state => state.quickSlots);
  const selectedQuickSlot = useInventory(state => state.selectedQuickSlot);
  const isBackpackOpen = useInventory(state => state.isBackpackOpen);
  
  // Get inventory actions
  const toggleBackpack = useInventory(state => state.toggleBackpack);
  const selectQuickSlot = useInventory(state => state.selectQuickSlot);
  const moveItemToQuickSlot = useInventory(state => state.moveItemToQuickSlot);
  const moveItemToBackpack = useInventory(state => state.moveItemToBackpack);
  const moveQuickSlotToQuickSlot = useInventory(state => state.moveQuickSlotToQuickSlot);
  const moveBackpackToBackpack = useInventory(state => state.moveBackpackToBackpack);
  
  // Handle window dragging
  const handleWindowMouseDown = (e: React.MouseEvent) => {
    const headerElem = e.target as HTMLElement;
    if (headerElem.closest('.inventory-window-header')) {
      setIsDragging(true);
      const rect = windowRef.current!.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      e.preventDefault();
    }
  };
  
  // Handle mouse move for window dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);
  
  // Escape key to close window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isBackpackOpen) {
        toggleBackpack();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isBackpackOpen, toggleBackpack]);
  
  // Handle item dragging
  const handleItemMouseDown = (e: React.MouseEvent, index: number, item: InventoryItem, source: 'backpack' | 'quickslot') => {
    if (isDragging) return; // Don't start dragging items if we're moving the window
    
    // Set dragged item with initial position
    setDraggedItem({
      index,
      item,
      source,
      x: e.clientX,
      y: e.clientY
    });
    
    const handleItemMouseMove = (e: MouseEvent) => {
      // Update the position of the dragged item
      setDraggedItem(prev => {
        if (!prev) return null;
        return {
          ...prev,
          x: e.clientX,
          y: e.clientY
        };
      });
      
      // Add visual feedback for drop targets
      if (draggedItem) {
        // Remove any existing drop-target classes
        document.querySelectorAll('.drop-target').forEach(el => {
          el.classList.remove('drop-target');
        });
        
        // Find what's under the cursor
        const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
        if (elemBelow) {
          const quickSlotTarget = elemBelow.closest('.quick-slot');
          const backpackTarget = elemBelow.closest('.inventory-grid-item');
          
          // Apply drop-target class based on the current drag operation
          if (draggedItem.source === 'backpack' && quickSlotTarget) {
            // Allow dropping into any quick slot (including empty ones)
            quickSlotTarget.classList.add('drop-target');
            console.log('Highlighting quick slot at index:', quickSlotTarget.getAttribute('data-index'));
          } else if (draggedItem.source === 'backpack' && backpackTarget && 
                     backpackTarget.getAttribute('data-index') !== String(draggedItem.index)) {
            backpackTarget.classList.add('drop-target');
          } else if (draggedItem.source === 'quickslot' && backpackTarget) {
            backpackTarget.classList.add('drop-target');
          } else if (draggedItem.source === 'quickslot' && quickSlotTarget &&
                    quickSlotTarget.getAttribute('data-index') !== String(draggedItem.index)) {
            quickSlotTarget.classList.add('drop-target');
          }
        }
      }
    };
    
    const handleItemMouseUp = (e: MouseEvent) => {
      if (!draggedItem) return;
      
      // Find what's under the cursor
      const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
      if (elemBelow) {
        // Find closest target container
        const quickSlotTarget = elemBelow.closest('.quick-slot');
        const backpackTarget = elemBelow.closest('.inventory-grid-item');
        
        if (draggedItem.source === 'backpack' && quickSlotTarget) {
          // Move from backpack to quickslot
          const quickSlotIndex = parseInt(quickSlotTarget.getAttribute('data-index') || '-1');
          
          if (quickSlotIndex !== -1) {
            console.log(`Moving from backpack ${draggedItem.index} to quickslot ${quickSlotIndex}`);
            moveItemToQuickSlot(draggedItem.index, quickSlotIndex);
          }
        } else if (draggedItem.source === 'backpack' && backpackTarget) {
          // Move between backpack slots
          // Find the target backpack index
          const allBackpackItems = document.querySelectorAll('.inventory-grid-item');
          const targetIndex = Array.from(allBackpackItems).indexOf(backpackTarget as Element);
          
          if (targetIndex !== -1 && targetIndex !== draggedItem.index) {
            console.log(`Moving from backpack ${draggedItem.index} to backpack ${targetIndex}`);
            moveBackpackToBackpack(draggedItem.index, targetIndex);
          }
        } else if (draggedItem.source === 'quickslot' && backpackTarget) {
          // Move from quickslot to backpack
          console.log(`Moving from quickslot ${draggedItem.index} to backpack`);
          moveItemToBackpack(draggedItem.index);
        } else if (draggedItem.source === 'quickslot' && quickSlotTarget) {
          // Moving between quickslots
          const toQuickSlotIndex = parseInt(quickSlotTarget.getAttribute('data-index') || '-1');
          
          if (toQuickSlotIndex !== -1 && toQuickSlotIndex !== draggedItem.index) {
            console.log(`Moving from quickslot ${draggedItem.index} to quickslot ${toQuickSlotIndex}`);
            moveQuickSlotToQuickSlot(draggedItem.index, toQuickSlotIndex);
          }
        }
      }
      
      // Clean up drop target classes
      document.querySelectorAll('.drop-target').forEach(el => {
        el.classList.remove('drop-target');
      });
      
      // Clean up dragged item
      setDraggedItem(null);
    };
    
    // Add global event listeners for tracking drag
    document.addEventListener('mousemove', handleItemMouseMove);
    document.addEventListener('mouseup', handleItemMouseUp);
    
    // Prevent default to avoid text selection
    e.preventDefault();
    
    // Clean up event listeners when dragging is done
    const cleanup = () => {
      // Remove all event listeners
      document.removeEventListener('mousemove', handleItemMouseMove);
      document.removeEventListener('mouseup', handleItemMouseUp);
      document.removeEventListener('keydown', handleEscapeKey);
      
      // Clean up visual effects
      document.querySelectorAll('.drop-target').forEach(el => {
        el.classList.remove('drop-target');
      });
    };
    
    // Also cancel drag on Escape key
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Clean up drop target classes
        document.querySelectorAll('.drop-target').forEach(el => {
          el.classList.remove('drop-target');
        });
        setDraggedItem(null);
        cleanup();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('mouseup', cleanup, { once: true });
  };
  
  if (!isBackpackOpen) return null;
  
  return (
    <>
      <div
        ref={windowRef}
        className="inventory-window"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        onMouseDown={handleWindowMouseDown}
      >
        <div className="inventory-window-header">
          <h3>Backpack</h3>
          <button className="close-button" onClick={toggleBackpack}>×</button>
        </div>
        
        <div className="inventory-window-content">
          <div className="inventory-grid">
            {backpackItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="inventory-grid-item"
                onMouseDown={(e) => handleItemMouseDown(e, index, item, 'backpack')}
                data-index={index}
                data-item-id={item.id}
              >
                <div className="item-icon">{item.icon}</div>
                <div className="item-count">{item.count}</div>
                <div className="item-name">{item.name}</div>
                {item.description && (
                  <div className="item-tooltip">
                    <div className="tooltip-name">{item.name}</div>
                    <div className="tooltip-desc">{item.description}</div>
                    {item.usable && <div className="tooltip-usability">Can be used</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="inventory-window-footer">
          <h4>Quick Slots</h4>
          <div className="quick-slots-container">
            {quickSlots.map((item, index) => (
              <div
                key={`quickslot-${item.id}-${index}`}
                className={`quick-slot ${index === selectedQuickSlot ? 'selected' : ''}`}
                data-index={index}
                data-item-id={item.id}
                onMouseDown={(e) => handleItemMouseDown(e, index, item, 'quickslot')}
              >
                <div className="item-icon">{item.icon}</div>
                <div className="item-count">{item.count}</div>
                {item.description && (
                  <div className="item-tooltip">
                    <div className="tooltip-name">{item.name}</div>
                    <div className="tooltip-desc">{item.description}</div>
                    {item.usable && <div className="tooltip-usability">Can be used</div>}
                  </div>
                )}
              </div>
            ))}
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 10 - quickSlots.length) }).map((_, index) => (
              <div
                key={`empty-slot-${index}`}
                className="quick-slot empty"
                data-index={quickSlots.length + index}
                data-empty="true"
                onMouseDown={(e) => {
                  // Don't create a drag operation, but flag this as a drop target
                  e.currentTarget.classList.add('drop-target');
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Drag preview */}
      {draggedItem && (
        <div 
          className="item-drag-preview"
          style={{
            position: 'fixed',
            left: draggedItem.x - 30,
            top: draggedItem.y - 30,
            pointerEvents: 'none',
            zIndex: 2000
          }}
        >
          <div className="item-icon">{draggedItem.item.icon}</div>
        </div>
      )}
    </>
  );
};

export default InventoryWindow;