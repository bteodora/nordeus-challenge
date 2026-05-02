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
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 tracking-tighter drop-shadow-2xl mb-2">
          RPG GAUNTLET
        </h1>
        <p className="text-gray-400 text-lg tracking-widest">NORDEUS CHALLENGE</p>
      </motion.div>

      <motion.div 
        className="flex flex-col gap-4 w-64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={startNewRun}
          className="flex items-center justify-center gap-2 py-4 px-6 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(220,38,38,0.5)]"
        >
          <Play size={20} /> START RUN
        </button>
        {hasSave && (
          <button
            onClick={handleResume}
            className="flex items-center justify-center gap-2 py-3 px-6 bg-green-700 hover:bg-green-600 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            <RotateCcw size={20} /> RESUME
          </button>
        )}
        <button className="flex items-center justify-center gap-2 py-3 px-6 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all">
          <Settings size={20} /> SETTINGS
        </button>
        <button onClick={gotoEndless} className="flex items-center justify-center gap-2 py-3 px-6 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl transition-all">
          Endless Mode
        </button>
        <button className="flex items-center justify-center gap-2 py-3 px-6 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-xl transition-all">
          <X size={20} /> EXIT
        </button>
      </motion.div>
    </div>
  )
}