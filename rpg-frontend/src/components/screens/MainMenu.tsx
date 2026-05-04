import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gamestore'
import { useEffect, useState } from 'react'
import { Play, RotateCcw, Crown } from 'lucide-react'

interface RuneButtonProps {
  onClick: () => void
  children: React.ReactNode
  delay?: number
  variant?: 'primary' | 'secondary' | 'danger'
  icon?: React.ReactNode
}

const RuneButton = ({ onClick, children, delay = 0, icon }: RuneButtonProps) => (
  <motion.button
    onClick={onClick}
    className="rune-button"
    initial={{ opacity: 0, y: 16, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    whileTap={{ scale: 0.97 }}
  >
    {icon && <span className="opacity-80">{icon}</span>}
    {children}
  </motion.button>
)

// Floating ember particle
function Ember({ style }: { style: React.CSSProperties }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: 3,
        height: 3,
        background: 'radial-gradient(circle, #fbbf24, #f97316)',
        boxShadow: '0 0 6px 2px rgba(251,191,36,0.6)',
        ...style,
      }}
      animate={{
        y: [0, -80 - Math.random() * 60],
        x: [0, (Math.random() - 0.5) * 40],
        opacity: [0, 0.9, 0],
        scale: [0.5, 1.2, 0],
      }}
      transition={{
        duration: 2.5 + Math.random() * 2,
        repeat: Infinity,
        delay: Math.random() * 3,
        ease: 'easeOut',
      }}
    />
  )
}

const EMBERS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${8 + Math.random() * 84}%`,
  bottom: `${8 + Math.random() * 30}%`,
}))

export default function MainMenu() {
  const startNewRun = useGameStore((s) => s.startNewRun)
  const loadRun    = useGameStore((s) => s.loadRun)
  const startEndless = useGameStore((s) => s.startEndless)
  const [hasSave, setHasSave] = useState(false)
  const [titleVisible, setTitleVisible] = useState(false)

  useEffect(() => {
    setHasSave(!!localStorage.getItem('rpg_save'))
    const t = setTimeout(() => setTitleVisible(true), 200)
    return () => clearTimeout(t)
  }, [])

  const handleResume = async () => {
    const ok = await loadRun()
    if (!ok) alert('Failed to load save')
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-around relative overflow-hidden py-12">
      {/* ── Embers ── */}
      {EMBERS.map((e) => (
        <Ember key={e.id} style={{ left: e.left, bottom: e.bottom }} />
      ))}

      {/* ── Moonlight beam ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 320,
          height: '70%',
          background: 'linear-gradient(180deg, rgba(200,210,255,0.07) 0%, transparent 100%)',
          filter: 'blur(24px)',
        }}
      />

      {/* ── Title area ── */}
      <AnimatePresence>
        {titleVisible && (
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Title image or fallback text */}
            <div className="title-glow">
              <img
                src="/assets/title-totem.png"
                alt="RPG Gauntlet"
                className="w-72 md:w-96 mx-auto"
                onError={(e) => {
                  const el = e.currentTarget
                  el.style.display = 'none'
                  el.nextElementSibling?.removeAttribute('hidden')
                }}
              />
              {/* Fallback title text (hidden by default) */}
              <div hidden className="text-center px-4">
                <h1
                  className="text-3xl md:text-4xl tracking-[0.15em]"
                  style={{
                    color: '#d4a94a',
                    textShadow: '0 0 20px rgba(212,169,74,0.6), 0 2px 0 #000, 0 4px 0 rgba(0,0,0,0.5)',
                  }}
                >
                  RPG GAUNTLET
                </h1>
              </div>
            </div>

            <motion.p
              className="text-xs tracking-[0.35em] mt-3 uppercase"
              style={{ color: 'var(--text-muted)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              ✦ Nordeus Challenge ✦
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ── Buttons ── */}
      <div className="flex flex-col gap-4 w-60 items-center">
        <RuneButton onClick={startNewRun} delay={0.3} icon={<Play size={14} />}>
          New Adventure
        </RuneButton>

        {hasSave && (
          <RuneButton onClick={handleResume} delay={0.38} icon={<RotateCcw size={14} />}>
            Continue
          </RuneButton>
        )}

        <RuneButton onClick={() => startEndless()} delay={0.44} icon={<Crown size={14} />}>
          Endless Mode
        </RuneButton>

        {/* Faint separator */}
        <div className="rune-divider w-full mt-1 mb-1" style={{ opacity: 0.4 }}>·</div>

        {/* Small secondary buttons */}
        <motion.div
          className="flex gap-3 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
        </motion.div>
      </div>

      {/* ── Version tag ── */}
      <motion.p
        className="text-[7px] tracking-widest absolute bottom-4"
        style={{ color: 'var(--text-muted)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        v0.1.0 · ALPHA
      </motion.p>

      {/* ── Ground mist ── */}
      <div
        className="absolute bottom-0 inset-x-0 pointer-events-none"
        style={{
          height: 160,
          background: 'linear-gradient(0deg, rgba(80,100,120,0.12) 0%, transparent 100%)',
        }}
      />
    </div>
  )
}