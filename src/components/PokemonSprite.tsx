import React from 'react';

interface PokemonSpriteProps {
  pokemonId: number;
  color: string;
  secondaryColor: string;
  shapeSeed: number;
  bodyType: number;
  size?: number;
  animating?: boolean;
  shiny?: boolean;
}

export const PokemonSprite: React.FC<PokemonSpriteProps> = ({
  color,
  secondaryColor,
  shapeSeed,
  bodyType,
  size = 120,
  animating = false,
  shiny = false
}) => {
  // Deterministic random number generator based on shapeSeed
  const seedRand = (s: number) => {
    let curr = s;
    return () => {
      curr = (curr * 9301 + 49297) % 233280;
      return curr / 233280;
    };
  };

  const getRand = seedRand(shapeSeed);

  // Generate a 16x16 pixel grid (empty strings are transparent)
  const grid: string[][] = Array(16).fill(null).map(() => Array(16).fill(''));

  // Color Definitions
  const outlineColor = '#090d16';
  const eyeWhite = '#ffffff';
  const eyePupil = '#000000';
  const cheekColor = 'rgba(244, 63, 94, 0.7)';

  // Build symmetrical pixel bodies
  // Left half (cols 0-7) mirrors to right half (cols 8-15)
  const drawPixel = (r: number, c: number, colStr: string) => {
    if (r >= 0 && r < 16 && c >= 0 && c < 8) {
      // Deterministically substitute secondary color for texturing
      const finalColor = colStr === color && getRand() < 0.25 ? secondaryColor : colStr;
      grid[r][c] = finalColor;
      grid[r][15 - c] = finalColor; // Symmetrical mirror
    }
  };

  const drawPixelAsymmetric = (r: number, c: number, colStr: string) => {
    if (r >= 0 && r < 16 && c >= 0 && c < 16) {
      grid[r][c] = colStr;
    }
  };

  switch (bodyType) {
    case 0: // Blob/Cute (chubby body)
      for (let r = 5; r <= 13; r++) {
        const w = r === 5 || r === 13 ? 3 : r === 6 || r === 12 ? 5 : 6;
        for (let c = 8 - w; c < 8; c++) drawPixel(r, c, color);
      }
      // Ears/Nubs
      drawPixel(4, 3, color);
      drawPixel(4, 4, color);
      break;

    case 1: // Beast/Quadruped (elongated body, tail)
      for (let r = 6; r <= 12; r++) {
        const w = r === 6 || r === 12 ? 4 : 6;
        for (let c = 8 - w; c < 8; c++) drawPixel(r, c, color);
      }
      // Horn/Crown
      drawPixel(4, 6, secondaryColor);
      drawPixel(5, 6, color);
      // Legs
      drawPixel(13, 3, secondaryColor);
      drawPixel(13, 5, secondaryColor);
      break;

    case 2: // Bird/Avian (wings, tail feathers)
      for (let r = 5; r <= 12; r++) {
        const w = r === 5 || r === 12 ? 3 : r === 6 || r === 11 ? 4 : 5;
        for (let c = 8 - w; c < 8; c++) drawPixel(r, c, color);
      }
      // Wings
      drawPixel(7, 2, secondaryColor);
      drawPixel(8, 1, secondaryColor);
      drawPixel(9, 1, color);
      // Beak
      drawPixel(6, 7, '#ffaa00');
      break;

    case 3: // Humanoid/Fighter (shoulders, chest plates)
      for (let r = 5; r <= 12; r++) {
        const w = r === 5 || r === 12 ? 3 : 4;
        for (let c = 8 - w; c < 8; c++) drawPixel(r, c, color);
      }
      // Shoulders
      drawPixel(6, 3, secondaryColor);
      drawPixel(7, 2, color);
      // Feet
      drawPixel(13, 3, secondaryColor);
      break;

    case 4: // Insect/Bug (segmented body, antennas)
      for (let r = 5; r <= 13; r += 2) {
        for (let c = 5; c < 8; c++) drawPixel(r, c, color);
        if (r < 13) {
          for (let c = 6; c < 8; c++) drawPixel(r + 1, c, secondaryColor);
        }
      }
      // Antennas
      drawPixelAsymmetric(3, 4, secondaryColor);
      drawPixelAsymmetric(2, 3, secondaryColor);
      drawPixelAsymmetric(3, 11, secondaryColor);
      drawPixelAsymmetric(2, 12, secondaryColor);
      break;

    case 5: // Aquatic/Fish (torpedo body, fins)
      for (let r = 6; r <= 11; r++) {
        const w = r === 6 || r === 11 ? 4 : 6;
        for (let c = 8 - w; c < 8; c++) drawPixel(r, c, color);
      }
      // Fins
      drawPixel(8, 1, secondaryColor);
      drawPixel(9, 1, secondaryColor);
      // Dorsal Fin
      drawPixel(5, 5, secondaryColor);
      break;

    case 6: // Plant/Elemental (leaf head, root base)
      for (let r = 6; r <= 13; r++) {
        const w = r === 6 || r === 13 ? 3 : r === 7 || r === 12 ? 4 : 5;
        for (let c = 8 - w; c < 8; c++) drawPixel(r, c, color);
      }
      // Leaf top
      drawPixel(4, 7, secondaryColor);
      drawPixel(3, 7, secondaryColor);
      drawPixel(4, 6, secondaryColor);
      break;

    case 7: // Mech/Shadow (floating core prism)
      for (let r = 5; r <= 12; r++) {
        const w = r === 5 || r === 12 ? 2 : r === 6 || r === 11 ? 4 : 5;
        for (let c = 8 - w; c < 8; c++) drawPixel(r, c, color);
      }
      // Orbiting core particles
      drawPixelAsymmetric(4, 2, secondaryColor);
      drawPixelAsymmetric(11, 13, secondaryColor);
      break;
  }

  // 2. Generate dark outline borders around body pixels
  // If a pixel is transparent but neighbors a colored pixel, it gets outline color
  const tempGrid = JSON.parse(JSON.stringify(grid));
  for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 16; c++) {
      if (tempGrid[r][c] === '') {
        const hasNeighbor = 
          (r > 0 && tempGrid[r - 1][c] !== '') ||
          (r < 15 && tempGrid[r + 1][c] !== '') ||
          (c > 0 && tempGrid[r][c - 1] !== '') ||
          (c < 15 && tempGrid[r][c + 1] !== '');
        
        if (hasNeighbor) {
          grid[r][c] = outlineColor;
        }
      }
    }
  }

  // 3. Draw Eyes and Facial Details (placed symmetrically on rows 6-7)
  if (bodyType !== 7) {
    // Left Eye
    drawPixelAsymmetric(7, 5, eyeWhite);
    drawPixelAsymmetric(7, 6, eyePupil);
    drawPixelAsymmetric(8, 5, cheekColor); // Cheek

    // Right Eye (Mirrored position)
    drawPixelAsymmetric(7, 10, eyeWhite);
    drawPixelAsymmetric(7, 9, eyePupil);
    drawPixelAsymmetric(8, 10, cheekColor); // Cheek

    // Mouth
    drawPixelAsymmetric(9, 7, outlineColor);
    drawPixelAsymmetric(9, 8, outlineColor);
  } else {
    // Mech eye core
    drawPixelAsymmetric(7, 7, '#ffffff');
    drawPixelAsymmetric(7, 8, '#ffffff');
    drawPixelAsymmetric(8, 7, secondaryColor);
    drawPixelAsymmetric(8, 8, secondaryColor);
  }

  const shinyFilter = shiny ? 'hue-rotate(135deg) saturate(1.4) contrast(1.1)' : undefined;

  return (
    <div 
      className="relative inline-flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      {/* Soft background aura glow */}
      <div 
        className="absolute inset-4 rounded-full filter blur-xl opacity-20 transition-all duration-300"
        style={{ backgroundColor: color, filter: shinyFilter }}
      />
      
      {/* SVG Pixel Grid Assembly */}
      <svg 
        viewBox="0 0 16 16" 
        width="100%" 
        height="100%"
        className={`relative z-10 transition-all duration-300 [image-rendering:pixelated] ${animating ? 'animate-bounce' : 'hover:scale-105'}`}
        style={{ filter: shinyFilter }}
      >
        {grid.map((rowArr, rIdx) => 
          rowArr.map((cellColor, cIdx) => {
            if (cellColor === '') return null;
            return (
              <rect
                key={`${rIdx}-${cIdx}`}
                x={cIdx}
                y={rIdx}
                width="1.05" // Overlap slightly to prevent gaps between pixels
                height="1.05"
                fill={cellColor}
              />
            );
          })
        )}
      </svg>

      {/* Shiny indicator sparkles */}
      {shiny && (
        <span 
          className="absolute -top-1 -right-1 text-yellow-400 text-xs font-bold z-20 animate-pulse drop-shadow-[0_0_4px_rgba(250,204,21,0.6)] select-none"
          title="Shiny Variant"
        >
          ✨
        </span>
      )}
    </div>
  );
};
export default PokemonSprite;
