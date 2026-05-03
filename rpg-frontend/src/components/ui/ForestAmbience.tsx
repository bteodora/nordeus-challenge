import { motion } from 'framer-motion';
import { useMouse } from '@uidotdev/usehooks';
import React from 'react'; // <-- Uvezite React

// Definišemo interfejs za jedan sloj
interface ParallaxLayer {
  src: string;
  strength: number;
  blendMode?: React.CSSProperties['mixBlendMode']; // Precizan tip za blend mode
}

// Kažemo TypeScriptu da je 'layers' niz objekata tipa 'ParallaxLayer'
const layers: ParallaxLayer[] = [
  // rpg-frontend\src\assets\parallax-forest\Layer_0000_9.png
  { src: '/assets/parallax-forest/Layer_0000_9.png', strength: 5 },
  { src: '/assets/parallax-forest/Layer_0001_8.png', strength: 10 },
  { src: '/assets/parallax-forest/Layer_0002_7.png', strength: 15 },
  { src: '/assets/parallax-forest/Layer_0003_6.png', strength: 20 },
  { src: '/assets/parallax-forest/Layer_0004_Lights.png', strength: 22, blendMode: 'screen' },
  { src: '/assets/parallax-forest/Layer_0005_5.png', strength: 25 },
  { src: '/assets/parallax-forest/Layer_0006_4.png', strength: 30 },
  { src: '/assets/parallax-forest/Layer_0007_Lights.png', strength: 33, blendMode: 'screen' },
  { src: '/assets/parallax-forest/Layer_0008_3.png', strength: 38 },
  { src: '/assets/parallax-forest/Layer_0009_2.png', strength: 45 },
  { src: '/assets/parallax-forest/Layer_0010_1.png', strength: 55 },
  { src: '/assets/parallax-forest/Layer_0011_0.png', strength: 70 },
];

export default function ForestAmbience() {
  const [mouse, ref] = useMouse();

  const x = mouse.x / window.innerWidth - 0.5;
  const y = mouse.y / window.innerHeight - 0.5;

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="absolute inset-0 overflow-hidden bg-black -z-10">
      {layers.map((layer, index) => (
        <motion.div
          key={index}
          className="parallax-layer"
          style={{
            backgroundImage: `url(${layer.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            // Sada TypeScript zna tačan tip i neće se buniti
            mixBlendMode: layer.blendMode,
          }}
          animate={{
            x: x * layer.strength,
            y: y * layer.strength,
          }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 20,
            mass: 0.5,
          }}
        />
      ))}
    </div>
  );
}