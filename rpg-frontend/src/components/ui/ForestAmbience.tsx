import { useEffect, useRef } from 'react'

export default function ForestAmbience() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    // low-res buffer for pixel look
    const W = 320
    const H = 180
    canvas.width = W
    canvas.height = H
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.imageRendering = 'pixelated'
    canvas.style.position = 'fixed'
    canvas.style.inset = '0'
    canvas.style.zIndex = '0'
    canvas.style.pointerEvents = 'none'

    // fireflies + drifting wisps
    const flies = Array.from({ length: 18 }).map(() => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.6 + H * 0.2,
      r: 0.6 + Math.random() * 1.2,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.3,
      t: Math.random() * Math.PI * 2,
    }))
    const wisps = Array.from({ length: 7 }).map(() => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.55 + H * 0.2,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.06,
      r: 10 + Math.random() * 18,
      hue: 120 + Math.random() * 40,
    }))

    let raf = 0
    let t0 = performance.now()

    function draw(time: number) {
      const dt = (time - t0) / 1000
      t0 = time

      // background gradient
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, 'rgba(6,6,8,0.0)')
      g.addColorStop(1, 'rgba(0,0,0,0.6)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)

      // distant tree silhouettes (simple repeated shapes)
      ctx.fillStyle = '#071018'
      for (let i = -1; i < 6; i++) {
        const tx = (i * 70 + (Math.sin(time / 600 + i) * 6)) % (W + 80) - 40
        const base = H * 0.65
        ctx.beginPath()
        ctx.moveTo(tx, H)
        ctx.lineTo(tx + 20, base - 36)
        ctx.lineTo(tx + 36, H)
        ctx.closePath()
        ctx.fill()
      }

      // mid trees
      ctx.fillStyle = '#0b1220'
      for (let i = 0; i < 5; i++) {
        const tx = (i * 64 + (Math.cos(time / 800 + i) * 4)) % (W + 120) - 60
        const base = H * 0.72
        ctx.beginPath()
        ctx.moveTo(tx, H)
        ctx.lineTo(tx + 20, base - 18)
        ctx.lineTo(tx + 34, H)
        ctx.closePath()
        ctx.fill()
      }

      // foreground dark trees
      ctx.fillStyle = '#06080a'
      for (let i = 0; i < 6; i++) {
        const tx = (i * 52 + (Math.sin(time / 400 + i) * 2)) % (W + 120) - 60
        const base = H * 0.78
        ctx.beginPath()
        ctx.moveTo(tx, H)
        ctx.lineTo(tx + 18, base - 8)
        ctx.lineTo(tx + 32, H)
        ctx.closePath()
        ctx.fill()
      }

      // soft fog layer
      ctx.fillStyle = 'rgba(10,8,14,0.14)'
      ctx.fillRect(0, H * 0.68, W, H * 0.28)

      // moon / pale hole in the canopy
      const moonGrad = ctx.createRadialGradient(W * 0.75, H * 0.18, 0, W * 0.75, H * 0.18, 18)
      moonGrad.addColorStop(0, 'rgba(230,225,255,0.9)')
      moonGrad.addColorStop(0.4, 'rgba(180,160,255,0.24)')
      moonGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = moonGrad
      ctx.beginPath()
      ctx.arc(W * 0.75, H * 0.18, 12, 0, Math.PI * 2)
      ctx.fill()

      // drifting wisps / magical spores
      wisps.forEach((wisp) => {
        wisp.x += wisp.vx * dt * 60
        wisp.y += wisp.vy * dt * 60 + Math.sin(time / 700 + wisp.x) * 0.03
        if (wisp.x < -20) wisp.x = W + 20
        if (wisp.x > W + 20) wisp.x = -20
        if (wisp.y < H * 0.12) wisp.y = H * 0.12
        if (wisp.y > H * 0.78) wisp.y = H * 0.78

        const glow = ctx.createRadialGradient(wisp.x, wisp.y, 0, wisp.x, wisp.y, wisp.r)
        glow.addColorStop(0, `hsla(${wisp.hue},80%,72%,0.24)`)
        glow.addColorStop(0.5, `hsla(${wisp.hue},80%,55%,0.08)`)
        glow.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(wisp.x, wisp.y, wisp.r, 0, Math.PI * 2)
        ctx.fill()
      })

      // hanging lantern silhouettes on trees
      ctx.fillStyle = 'rgba(210,140,60,0.08)'
      for (let i = 0; i < 4; i++) {
        const lx = 44 + i * 74 + Math.sin(time / 900 + i) * 2
        const ly = 58 + Math.cos(time / 700 + i) * 2
        ctx.fillRect(lx, ly, 2, 10)
        ctx.fillStyle = 'rgba(255,180,80,0.22)'
        ctx.fillRect(lx - 2, ly + 8, 6, 6)
        ctx.fillStyle = 'rgba(210,140,60,0.08)'
      }

      // fireflies
      flies.forEach((f) => {
        f.x += f.vx
        f.y += f.vy + Math.sin((time + f.t) / 300) * 0.2
        if (f.x < -10) f.x = W + 10
        if (f.x > W + 10) f.x = -10
        if (f.y < H * 0.15) f.y = H * 0.15
        if (f.y > H * 0.95) f.y = H * 0.95

        const pulse = 0.5 + 0.5 * Math.sin((time + f.t) / 200 + f.x)
        const radius = f.r * (0.8 + pulse)
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, radius * 6)
        grad.addColorStop(0, 'rgba(255,220,140,0.9)')
        grad.addColorStop(0.2, 'rgba(255,200,90,0.6)')
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(f.x, f.y, radius * 4, 0, Math.PI * 2)
        ctx.fill()
      })

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)

    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={canvasRef} />
}
