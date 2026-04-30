import { useState } from 'react'
import { motion } from 'framer-motion' // OVO JE FALILO
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    // Koristimo <div> umesto <> jer Tailwind h-screen treba roditeljski element
    <div className="flex h-screen items-center justify-center bg-slate-900">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="rounded-lg bg-[#87a96b] p-10 shadow-2xl" // Zamenio sam ghibli-grass sa hex kodom dok ga ne dodaš u config
      >
        <h1 className="text-3xl font-bold text-white mb-4">RPG Setup spreman! ⚔️</h1>
        
        <button 
          onClick={() => setCount((count) => count + 1)}
          className="px-4 py-2 bg-white rounded-md font-bold text-slate-900 hover:bg-slate-200 transition-colors"
        >
          Level: {count}
        </button>
      </motion.div>
    </div>
  )
}

export default App