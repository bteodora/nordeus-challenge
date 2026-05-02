import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gamestore'
import { useEffect, useState } from 'react'
import { Play, Settings, X, RotateCcw } from 'lucide-react'

export default function MainMenu() {
  const startNewRun = useGameStore((state) => state.startNewRun)
  const loadRun = useGameStore((state) => state.loadRun)
  const startEndless = useGameStore((s) => s.startEndless)
  const gotoEndless = () => startEndless()
  const [hasSave, setHasSave] = useState(false)
  

  useEffect(() => {
    // Proveravamo da li postoji sačuvani run
    const raw = localStorage.getItem('rpg_save')
    setHasSave(!!raw)
  }, [])

  const handleResume = async () => {
    const success = await loadRun()
    if (!success) {
      alert('Failed to load save')
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_50%_30%,rgba(168,119,64,0.16),transparent_24%),radial-gradient(circle_at_12%_18%,rgba(27,74,39,0.2),transparent_18%),radial-gradient(circle_at_88%_18%,rgba(27,74,39,0.2),transparent_18%)]" />
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center mb-12 relative z-10"
      >
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-red-400 to-amber-500 tracking-tighter drop-shadow-2xl mb-2">
          RPG GAUNTLET
        </h1>
        <p className="text-gray-300 text-sm md:text-lg tracking-[0.35em]">NORDEUS CHALLENGE</p>
      </motion.div>

      <motion.div
        className="flex flex-col gap-4 w-64 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <button onClick={startNewRun} className="pixel-button">
          <Play size={16} /> START RUN
        </button>

        {hasSave && (
          <button onClick={handleResume} className="pixel-button">
            <RotateCcw size={16} /> RESUME
          </button>
        )}

        <button className="pixel-button">
          <Settings size={16} /> SETTINGS
        </button>

        <button onClick={gotoEndless} className="pixel-button">
          Endless Mode
        </button>

        

        <button className="pixel-button">
          <X size={16} /> EXIT
        </button>
      </motion.div>

      
    </div>
  )
}