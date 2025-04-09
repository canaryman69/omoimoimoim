import { TileType, Layer, TILE_SIZE } from '@/lib/constants';

interface TileProps {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  type: TileType;
  layer: Layer;
}

// Directly draw tiles based on type without caching
const Tile = ({ ctx, x, y, type, layer }: TileProps) => {
  switch (type) {
    case TileType.GRASS:
      ctx.fillStyle = '#7ec850';
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      break;
      
    case TileType.PATH:
      ctx.fillStyle = '#d8b078';
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      break;
      
    case TileType.WATER:
      ctx.fillStyle = '#5084e8';
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      break;
      
    case TileType.TREE_BOTTOM:
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      break;
      
    case TileType.TREE_TOP:
      ctx.fillStyle = '#2d8e44';
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      break;
      
    case TileType.ROCK:
      ctx.fillStyle = '#888888';
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      break;
      
    case TileType.FENCE:
      ctx.fillStyle = '#a86032';
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      break;
      
    case TileType.CROPS:
      ctx.fillStyle = '#86b83c';
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      break;
      
    case TileType.HOUSE:
      ctx.fillStyle = '#b05050';
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      break;
      
    case TileType.EMPTY:
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      break;
      
    // Farming tiles - these need special rendering
    case TileType.DIRT:
      // Dirt - light brown with texture
      ctx.fillStyle = '#c9a87c'; // Lighter brown for tilled soil
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      
      // Add texture line pattern for tilled soil
      ctx.strokeStyle = '#b08c5e';
      ctx.lineWidth = 1;
      
      // Horizontal furrows
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.moveTo(x, y + i * 7 + 3);
        ctx.lineTo(x + TILE_SIZE, y + i * 7 + 3);
        ctx.stroke();
      }
      
      // Add some small dirt particles
      ctx.fillStyle = '#a58059';
      for (let i = 0; i < 12; i++) {
        const particleX = x + Math.floor(Math.random() * 40) + 4;
        const particleY = y + Math.floor(Math.random() * 40) + 4;
        const size = 1 + Math.floor(Math.random() * 2);
        ctx.fillRect(particleX, particleY, size, size);
      }
      break;
      
    case TileType.DIRT_WATERED:
      // Watered dirt - darker brown with obvious water puddles
      ctx.fillStyle = '#7a5d3a'; // Darker brown for watered soil
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      
      // Add horizontal furrows like in tilled soil
      ctx.strokeStyle = '#5f462c';
      ctx.lineWidth = 1;
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.moveTo(x, y + i * 7 + 3);
        ctx.lineTo(x + TILE_SIZE, y + i * 7 + 3);
        ctx.stroke();
      }
      
      // Add more obvious water puddles/sheen
      ctx.fillStyle = '#4a7dd3'; // Bright blue for water
      ctx.globalAlpha = 0.5; // Semi-transparent
      for (let i = 0; i < 15; i++) {
        const puddleX = x + Math.floor(Math.random() * 40) + 4;
        const puddleY = y + Math.floor(Math.random() * 40) + 4;
        const size = 2 + Math.floor(Math.random() * 3);
        ctx.beginPath();
        ctx.arc(puddleX, puddleY, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0; // Reset alpha
      break;
      
    case TileType.SEED:
      // Seed - dark watered soil with very clear seeds
      ctx.fillStyle = '#7a5d3a'; // Same as watered soil
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      
      // Add furrows like watered soil
      ctx.strokeStyle = '#5f462c';
      ctx.lineWidth = 1;
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.moveTo(x, y + i * 7 + 3);
        ctx.lineTo(x + TILE_SIZE, y + i * 7 + 3);
        ctx.stroke();
      }
      
      // Add small water patches
      ctx.fillStyle = '#4a7dd3'; // Blue for water
      ctx.globalAlpha = 0.3; // Lighter transparency than watered soil
      for (let i = 0; i < 8; i++) {
        const waterX = x + Math.floor(Math.random() * 40) + 4;
        const waterY = y + Math.floor(Math.random() * 40) + 4;
        const size = 1 + Math.floor(Math.random() * 2);
        ctx.beginPath();
        ctx.arc(waterX, waterY, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
      
      // Add very clear seed marks in a grid pattern
      // First, small soil mounds
      ctx.fillStyle = '#8b6d48'; // Light brown mounds
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          ctx.beginPath();
          ctx.arc(x + 12 + i * 12, y + 12 + j * 12, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Then add clearly visible seeds on top
      ctx.fillStyle = '#f8f0d4'; // Bright off-white for seeds
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          // Draw seed shapes - small ovals
          ctx.beginPath();
          ctx.ellipse(
            x + 12 + i * 12, 
            y + 12 + j * 12, 
            2, 3, // width, height
            Math.PI / 4, // rotation
            0, Math.PI * 2
          );
          ctx.fill();
          
          // Add a seed highlight
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x + 11 + i * 12, y + 11 + j * 12, 0.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f8f0d4'; // Reset to seed color
        }
      }
      break;
      
    case TileType.PLANT_GROWING:
      // Growing plant - dark soil with clearly visible sprouts
      ctx.fillStyle = '#6a4e2c'; // Dark soil
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      
      // Add soil texture lines
      ctx.strokeStyle = '#5f462c';
      ctx.lineWidth = 1;
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.moveTo(x, y + i * 7 + 3);
        ctx.lineTo(x + TILE_SIZE, y + i * 7 + 3);
        ctx.stroke();
      }
      
      // Add sprouts at each position (not just alternating)
      ctx.fillStyle = '#8fd458'; // Brighter vibrant green
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          // Stem - slightly thicker than before
          ctx.fillRect(x + 11 + i * 12, y + 10 + j * 12, 3, 9);
          
          // Leaves - more distinct shape
          ctx.save();
          ctx.translate(x + 12 + i * 12, y + 14 + j * 12);
          
          // First leaf pair (lower)
          ctx.rotate(Math.PI / 5); // Angle
          ctx.fillRect(-5, -1, 10, 2); // Longer leaf
          ctx.rotate(Math.PI * 0.6); // Different angle
          ctx.fillRect(-5, -1, 10, 2);
          
          // Second smaller leaf pair (upper)
          ctx.rotate(Math.PI / 4);
          ctx.fillRect(-3, -4, 6, 1.5);
          ctx.rotate(Math.PI / 2);
          ctx.fillRect(-3, -4, 6, 1.5);
          
          ctx.restore();
        }
      }
      break;
      
    case TileType.PLANT_GROWN:
      // Grown plant - fuller plants with flowers/fruits
      ctx.fillStyle = '#6a4e2c'; // Dark soil
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      
      // Add soil texture lines
      ctx.strokeStyle = '#5f462c';
      ctx.lineWidth = 1;
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.moveTo(x, y + i * 7 + 3);
        ctx.lineTo(x + TILE_SIZE, y + i * 7 + 3);
        ctx.stroke();
      }
      
      // Plants at all positions in grid
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          // Thicker stem
          ctx.fillStyle = '#2d8e44'; // Darker green
          ctx.fillRect(x + 11 + i * 12, y + 6 + j * 12, 3, 18);
          
          // More complex leaf structure
          ctx.fillStyle = '#7ec850'; // Bright green
          ctx.save();
          ctx.translate(x + 12 + i * 12, y + 14 + j * 12);
          
          // Bottom leaves
          ctx.rotate(Math.PI / 6);
          ctx.fillRect(-7, 0, 14, 2);
          ctx.rotate(Math.PI * 2/3);
          ctx.fillRect(-7, 0, 14, 2);
          ctx.rotate(Math.PI * 2/3);
          ctx.fillRect(-7, 0, 14, 2);
          
          // Middle leaves (slightly smaller)
          ctx.rotate(Math.PI / 9);
          ctx.fillRect(-6, -6, 12, 2);
          ctx.rotate(Math.PI * 2/3);
          ctx.fillRect(-6, -6, 12, 2);
          ctx.rotate(Math.PI * 2/3);
          ctx.fillRect(-6, -6, 12, 2);
          
          // Reset position for fruit/flower
          ctx.restore();
          
          // Draw distinctive produce item on the plant
          if ((i + j) % 3 === 0) {
            // Red tomato/strawberry
            ctx.fillStyle = '#e04c3e';
            ctx.beginPath();
            ctx.arc(x + 12 + i * 12, y + 6 + j * 12, 4, 0, Math.PI * 2);
            ctx.fill();
            // Highlight
            ctx.fillStyle = '#f07060';
            ctx.beginPath();
            ctx.arc(x + 11 + i * 12, y + 5 + j * 12, 1.5, 0, Math.PI * 2);
            ctx.fill();
          } else if ((i + j) % 3 === 1) {
            // Yellow corn/grain
            ctx.fillStyle = '#f9e076';
            ctx.beginPath();
            ctx.ellipse(
              x + 12 + i * 12, 
              y + 6 + j * 12, 
              3, 5, // width, height
              0, // rotation
              0, Math.PI * 2
            );
            ctx.fill();
            // Detail
            ctx.strokeStyle = '#e0c860';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x + 12 + i * 12, y + 2 + j * 12);
            ctx.lineTo(x + 12 + i * 12, y + 10 + j * 12);
            ctx.stroke();
          } else {
            // Orange carrot/pumpkin
            ctx.fillStyle = '#fa9e4b';
            ctx.beginPath();
            ctx.arc(x + 12 + i * 12, y + 6 + j * 12, 4, 0, Math.PI * 2);
            ctx.fill();
            // Detail
            ctx.strokeStyle = '#d87c35';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(x + 10 + i * 12, y + 6 + j * 12);
            ctx.lineTo(x + 14 + i * 12, y + 6 + j * 12);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + 12 + i * 12, y + 4 + j * 12);
            ctx.lineTo(x + 12 + i * 12, y + 8 + j * 12);
            ctx.stroke();
          }
        }
      }
      break;
    
    default:
      // Default rendering (should not happen, but just in case)
      ctx.fillStyle = '#ff00ff'; // Bright pink to indicate an issue
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      break;
  }
  
  return null;
};

export default Tile;