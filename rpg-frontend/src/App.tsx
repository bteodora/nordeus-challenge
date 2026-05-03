import { useGameStore } from './store/gamestore'
import MainMenu from './components/screens/MainMenu'
import MapScreen from './components/screens/MapScreen'
import BattleScreen from './components/screens/BattleScreen'
import PostBattleScreen from './components/screens/PostBattleScreen'
import PostEndlessScreen from './components/screens/PostEndlessScreen'
import EndlessScreen from './components/screens/EndlessScreen'
import ForestAmbience from './components/ui/ForestAmbience'
import { AnimatePresence, motion } from 'framer-motion'

// Page transition wrapper
function PageTransition({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <motion.div
      key={id}
      className="w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

// Screens that should NOT show the parallax forest (have their own backdrop)
const BATTLE_SCREENS = ['battle']

export default function App() {
  const screen = useGameStore((state) => state.screen)
  const showForest = !BATTLE_SCREENS.includes(screen)

  return (
    <div className="w-full h-screen overflow-hidden pixel-ui" style={{ background: 'var(--ink)' }}>

      {/* ── Parallax forest background (visible on non-battle screens) ── */}
      {showForest && <ForestAmbience />}

      {/* ── Vignette (always on) ── */}
      <div className="vignette" />

      {/* ── Forest decorative frame ── */}
  
        {/* ── Screen content ── */}
        <div className="relative w-full h-full" style={{ zIndex: 5 }}>
          <AnimatePresence mode="wait">
            {screen === 'menu'       && <PageTransition id="menu"><MainMenu /></PageTransition>}
            {screen === 'map'        && <PageTransition id="map"><MapScreen /></PageTransition>}
            {screen === 'battle'     && <PageTransition id="battle"><BattleScreen /></PageTransition>}
            {screen === 'postbattle' && <PageTransition id="postbattle"><PostBattleScreen /></PageTransition>}
            {screen === 'postendless'&& <PageTransition id="postendless"><PostEndlessScreen /></PageTransition>}
            {screen === 'endless'    && <PageTransition id="endless"><EndlessScreen /></PageTransition>}
          </AnimatePresence>
        </div>


      {/* ── Overlays (topmost) ── */}
      <div className="crt-overlay" />
      <div className="grain" />
      <div className="mist-band" />
    </div>
  )
}