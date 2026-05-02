import { useEffect, useRef } from 'react'

export default function BattleForestBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 360
    const H = 202
    canvas.width = W
    canvas.height = H
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.imageRendering = 'pixelated'
    canvas.style.display = 'block'

    const canopy = Array.from({ length: 9 }).map((_, i) => ({
      x: i * 46 + (Math.random() * 18 - 9),
      y: 32 + Math.random() * 12,
      scale: 0.7 + Math.random() * 0.7,
      sway: Math.random() * Math.PI * 2,
    }))

    const trunks = Array.from({ length: 8 }).map((_, i) => ({
      x: i * 52 + (Math.random() * 16 - 8),
      width: 9 + Math.random() * 5,
      height: 70 + Math.random() * 34,
      depth: i % 3,
    }))

    const fireflies = Array.from({ length: 20 }).map((_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.7 + H * 0.12,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.2,
      phase: Math.random() * Math.PI * 2,
      size: 0.8 + Math.random() * 1.2,
      hue: 50 + Math.random() * 18,
    }))

    const fogBands = Array.from({ length: 5 }).map((_, i) => ({
      x: -80 + i * 70,
      y: 120 + i * 10,
      w: 110 + Math.random() * 40,
      h: 14 + Math.random() * 8,
      vx: 0.06 + Math.random() * 0.08,
      alpha: 0.08 + Math.random() * 0.08,
    }))

    const leaves = Array.from({ length: 14 }).map((_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.75,
      vx: (Math.random() - 0.5) * 0.25,
      vy: 0.05 + Math.random() * 0.08,
      spin: Math.random() * Math.PI * 2,
      hue: i % 2 === 0 ? 25 : 95,
    }))

    let raf = 0
    let prev = performance.now()

    function draw(now: number) {
      const dt = Math.min(0.033, (now - prev) / 1000)
      prev = now

      // twilight sky
      const sky = ctx.createLinearGradient(0, 0, 0, H)
      sky.addColorStop(0, '#05060a')
      sky.addColorStop(0.42, '#10111a')
      sky.addColorStop(0.72, '#090b0e')
      sky.addColorStop(1, '#040405')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, H)

      // faint moon / canopy glow
      const moon = ctx.createRadialGradient(W * 0.74, H * 0.16, 0, W * 0.74, H * 0.16, 34)
      moon.addColorStop(0, 'rgba(225,235,255,0.7)')
      moon.addColorStop(0.22, 'rgba(145,170,255,0.18)')
      moon.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = moon
      ctx.fillRect(0, 0, W, H)

      // distant canopy ridge
      ctx.fillStyle = '#07120c'
      canopy.forEach((tree) => {
        const sway = Math.sin(now / 1400 + tree.sway) * 2.5
        const x = tree.x + sway
        const y = tree.y
        const crownW = 24 * tree.scale
        const crownH = 34 * tree.scale
        ctx.beginPath()
        ctx.moveTo(x, y + 24)
        ctx.lineTo(x + crownW * 0.2, y - crownH * 0.18)
        ctx.lineTo(x + crownW * 0.5, y - crownH)
        ctx.lineTo(x + crownW * 0.8, y - crownH * 0.18)
        ctx.lineTo(x + crownW, y + 24)
        ctx.closePath()
        ctx.fill()
        ctx.fillRect(x + crownW * 0.45, y + 20, 2, 12)
      })

      // midground trunks
      trunks.forEach((trunk, idx) => {
        const depthTint = idx % 3 === 0 ? '#15110e' : idx % 3 === 1 ? '#0d0f10' : '#0a0c0d'
        const sway = Math.sin(now / 2300 + idx) * (1 + trunk.depth * 0.2)
        const x = trunk.x + sway
        const baseY = 90 + trunk.depth * 8
        ctx.fillStyle = depthTint
        ctx.fillRect(x, baseY - trunk.height, trunk.width, trunk.height)
        ctx.fillStyle = 'rgba(45,62,33,0.18)'
        ctx.fillRect(x - 1, baseY - trunk.height + 6, trunk.width + 2, 10)
        ctx.fillStyle = '#08110b'
        ctx.fillRect(x - 6, baseY - trunk.height + 8, trunk.width + 12, 4)
      })

      // forest floor
      const floor = ctx.createLinearGradient(0, H * 0.62, 0, H)
      floor.addColorStop(0, 'rgba(9,12,10,0)')
      floor.addColorStop(0.35, 'rgba(9,12,10,0.8)')
      floor.addColorStop(1, 'rgba(2,3,2,0.95)')
      ctx.fillStyle = floor
      ctx.fillRect(0, H * 0.62, W, H * 0.38)

      // roots and rocks
      ctx.fillStyle = '#050604'
      for (let i = 0; i < 8; i++) {
        const x = i * 52 + Math.sin(now / 1200 + i) * 2
        const y = H * 0.78 + Math.cos(now / 900 + i) * 1.5
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + 10, y - 6)
        ctx.lineTo(x + 18, y)
        ctx.lineTo(x + 8, y + 4)
        ctx.closePath()
        ctx.fill()
      }

      // drifting fog bands behind characters
      fogBands.forEach((fog) => {
        fog.x += fog.vx * dt * 60
        if (fog.x > W + 100) fog.x = -120
        const fg = ctx.createLinearGradient(fog.x, fog.y, fog.x + fog.w, fog.y)
        fg.addColorStop(0, 'rgba(180,190,200,0)')
        fg.addColorStop(0.2, `rgba(170,180,190,${fog.alpha * 0.4})`)
        fg.addColorStop(0.5, `rgba(205,210,220,${fog.alpha})`)
        fg.addColorStop(0.8, `rgba(170,180,190,${fog.alpha * 0.5})`)
        fg.addColorStop(1, 'rgba(180,190,200,0)')
        ctx.fillStyle = fg
        ctx.beginPath()
        ctx.ellipse(fog.x, fog.y, fog.w, fog.h, 0, 0, Math.PI * 2)
        ctx.fill()
      })

      // fireflies - bright, magical, and slightly chaotic
      fireflies.forEach((fly) => {
        fly.x += fly.vx * dt * 60
        fly.y += fly.vy * dt * 60 + Math.sin(now / 600 + fly.phase) * 0.03
        fly.vx += Math.sin(now / 1700 + fly.phase) * 0.001
        fly.vy += Math.cos(now / 1300 + fly.phase) * 0.001

        if (fly.x < -12) fly.x = W + 12
        if (fly.x > W + 12) fly.x = -12
        if (fly.y < H * 0.08) fly.y = H * 0.08
        if (fly.y > H * 0.82) fly.y = H * 0.82

        const pulse = 0.55 + 0.45 * Math.sin(now / 180 + fly.phase)
        const r = fly.size * (0.8 + pulse)
        const glow = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, r * 6)
        glow.addColorStop(0, `hsla(${fly.hue}, 100%, 76%, 0.95)`)
        glow.addColorStop(0.18, `hsla(${fly.hue}, 100%, 65%, 0.42)`)
        glow.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(fly.x, fly.y, r * 2.2, 0, Math.PI * 2)
        ctx.fill()
      })

      // falling leaves / spores
      leaves.forEach((leaf) => {
        leaf.x += leaf.vx * dt * 60
        leaf.y += leaf.vy * dt * 60
        leaf.spin += dt * 1.8
        if (leaf.y > H * 0.92) {
          leaf.y = H * 0.15
          leaf.x = Math.random() * W
        }
        if (leaf.x < -8) leaf.x = W + 8
        if (leaf.x > W + 8) leaf.x = -8

        ctx.save()
        ctx.translate(leaf.x, leaf.y)
        ctx.rotate(leaf.spin)
        ctx.fillStyle = leaf.hue === 25 ? 'rgba(118,68,32,0.3)' : 'rgba(46,88,47,0.25)'
        ctx.fillRect(-2, -1, 4, 2)
        ctx.restore()
      })

      // foreground brambles / silhouette to frame the battle
      const bramble = ctx.createLinearGradient(0, H * 0.72, 0, H)
      bramble.addColorStop(0, 'rgba(0,0,0,0)')
      bramble.addColorStop(0.65, 'rgba(4,5,4,0.45)')
      bramble.addColorStop(1, 'rgba(0,0,0,0.95)')
      ctx.fillStyle = bramble
      ctx.fillRect(0, H * 0.72, W, H * 0.28)

      // foreground tree branches near the edges, to give depth
      ctx.fillStyle = '#030403'
      ctx.beginPath()
      ctx.moveTo(0, 146)
      ctx.quadraticCurveTo(30, 110, 58, 104)
      ctx.quadraticCurveTo(36, 122, 42, 164)
      ctx.lineTo(0, 164)
      ctx.closePath()
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(W, 146)
      ctx.quadraticCurveTo(W - 30, 108, W - 58, 102)
      ctx.quadraticCurveTo(W - 38, 124, W - 42, 164)
      ctx.lineTo(W, 164)
      ctx.closePath()
      ctx.fill()

      // subtle flicker like torchlight from somewhere offscreen
      const torch = 0.04 + 0.02 * Math.sin(now / 140 + Math.cos(now / 300))
      ctx.fillStyle = `rgba(255,160,80,${torch})`
      ctx.fillRect(0, 0, W, H)

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none z-0 opacity-95">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
