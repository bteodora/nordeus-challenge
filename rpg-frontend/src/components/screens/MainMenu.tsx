import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gamestore';
import { useEffect, useState } from 'react';
import { Play, Settings, X, RotateCcw, Crown } from 'lucide-react';
import React from 'react'; // <-- Uvezite React

// Definišemo tipove za props naše komponente
interface RuneButtonProps {
  onClick: () => void; // onClick je funkcija koja ne vraća ništa
  children: React.ReactNode; // children može biti bilo šta što React može da renderuje
  delay?: number; // delay je opcioni broj
}

// Primenjujemo definisane tipove na našu komponentu
const RuneButton = ({ onClick, children, delay = 0 }: RuneButtonProps) => (
  <motion.button
    onClick={onClick}
    className="rune-button"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay, duration: 0.5 }}
    whileHover={{ scale: 1.1, textShadow: "0 0 15px #ffc34d", y: -5 }}
  >
    {children}
  </motion.button>
);

// Ostatak MainMenu komponente ostaje isti...
export default function MainMenu() {
  const startNewRun = useGameStore((state) => state.startNewRun);
  const loadRun = useGameStore((state) => state.loadRun);
  const startEndless = useGameStore((s) => s.startEndless);
  const gotoEndless = () => startEndless();
  const [hasSave, setHasSave] = useState(false);
  
  useEffect(() => {
    const raw = localStorage.getItem('rpg_save');
    setHasSave(!!raw);
  }, []);

  const handleResume = async () => {
    const success = await loadRun();
    if (!success) {
      alert('Failed to load save');
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-end relative pb-16 md:pb-24">
      
      <motion.div
        initial={{ y: -50, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center mb-12" // Smanjili smo marginu
      >
        <img src="/assets/title-totem.png" alt="RPG Gauntlet" className="w-full max-w-sm md:max-w-md mx-auto" />
        <p className="text-gray-400 text-xs md:text-sm tracking-[0.2em] -mt-2">NORDEUS CHALLENGE</p>
      </motion.div>

      <div className="flex flex-col gap-6 w-64 items-center">
        {/* Dugmići ostaju isti */}
        <RuneButton onClick={startNewRun} delay={0.2}>
          <Play size={16} /> NEW ADVENTURE
        </RuneButton>
        {hasSave && (
          <RuneButton onClick={handleResume} delay={0.3}>
            <RotateCcw size={16} /> CONTINUE
          </RuneButton>
        )}
        <RuneButton onClick={gotoEndless} delay={0.4}>
          <Crown size={16} /> ENDLESS
        </RuneButton>
        <RuneButton onClick={() => {}} delay={0.5}>
          <Settings size={16} /> SETTINGS
        </RuneButton>
        <RuneButton onClick={() => {}} delay={0.6}>
          <X size={16} /> QUIT
        </RuneButton>
      </div>
    </div>
  );
}