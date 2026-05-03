import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef } from 'react'

const layers = [
  { src: '/assets/parallax-forest/Layer_0000_9.png', strength: 4  },
  { src: '/assets/parallax-forest/Layer_0001_8.png', strength: 8  },
  { src: '/assets/parallax-forest/Layer_0002_7.png', strength: 12 },
  { src: '/assets/parallax-forest/Layer_0003_6.png', strength: 16 },
  { src: '/assets/parallax-forest/Layer_0004_Lights.png', strength: 18, blendMode: 'screen' as const },
  { src: '/assets/parallax-forest/Layer_0005_5.png', strength: 22 },
  { src: '/assets/parallax-forest/Layer_0006_4.png', strength: 26 },
  { src: '/assets/parallax-forest/Layer_0007_Lights.png', strength: 28, blendMode: 'screen' as const },
  { src: '/assets/parallax-forest/Layer_0008_3.png', strength: 33 },
  { src: '/assets/parallax-forest/Layer_0009_2.png', strength: 40 },
  { src: '/assets/parallax-forest/Layer_0010_1.png', strength: 48 },
  { src: '/assets/parallax-forest/Layer_0011_0.png', strength: 60 },
]

export default function ForestAmbience() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Raw mouse position (−0.5 to 0.5)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  // Springy versions — much smoother than the useMouse hook approach
  const springX = useSpring(rawX, { stiffness: 60, damping: 20, mass: 1 })
  const springY = useSpring(rawY, { stiffness: 60, damping: 20, mass: 1 })

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      rawX.set(e.clientX / window.innerWidth  - 0.5)
      rawY.set(e.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [rawX, rawY])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden forest-fallback"
      style={{ zIndex: 0 }}
    >
      {layers.map((layer, i) => (
        <motion.div
          key={i}
          className="parallax-layer"
          style={{
            backgroundImage: `url(${layer.src})`,
            mixBlendMode: layer.blendMode,
            x: springX.get() === 0 ? 0 : undefined,
            // We use style with a derived motion value
          }}
          // Use animate with a custom transformer
          animate={{
            x: 0, // placeholder; real value below
            y: 0,
          }}
          // Instead, we listen to springX/springY and update directly
        >
          {/* Inner div driven by spring values */}
          <ParallaxInner springX={springX} springY={springY} strength={layer.strength} />
        </motion.div>
      ))}

      {/* Subtle torch-flicker overlay */}
      <TorchFlicker />
    </div>
  )
}

// Separate component so each layer has its own transform subscription
function ParallaxInner({
  springX,
  springY,
  strength,
}: {
  springX: ReturnType<typeof useSpring>
  springY: ReturnType<typeof useSpring>
  strength: number
}) {
  return (
    <motion.div
      className="absolute inset-0 w-full h-full"
      style={{
        x: useMotionDerived(springX, v => v * strength),
        y: useMotionDerived(springY, v => v * strength),
      }}
    />
  )
}

// Helper to derive a motion value
function useMotionDerived(
  source: ReturnType<typeof useSpring>,
  transform: (v: number) => number
) {
  const derived = useMotionValueDerived(source, transform)
  return derived
}

import { useTransform } from 'framer-motion'
function useMotionValueDerived(
  source: ReturnType<typeof useSpring>,
  fn: (v: number) => number
) {
  return useTransform(source, fn)
}

// Canvas-based torch flicker that's cheaper than a CSS animation
function TorchFlicker() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf = 0
    function tick() {
      if (ref.current) {
        const t = performance.now()
        const flicker = 0.025 + 0.015 * Math.sin(t / 120) * Math.cos(t / 300)
        ref.current.style.opacity = String(flicker)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      ref={ref}
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'rgba(255,140,60,1)',
        mixBlendMode: 'soft-light',
        opacity: 0.025,
      }}
    />
  )
}