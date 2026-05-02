import { useGameStore } from './store/gamestore'
import MainMenu from './components/screens/MainMenu'
import MapScreen from './components/screens/MapScreen'
import BattleScreen from './components/screens/BattleScreen'
import PostBattleScreen from './components/screens/PostBattleScreen'
import PostEndlessScreen from './components/screens/PostEndlessScreen'
import EndlessScreen from './components/screens/EndlessScreen'
// import SummaryScreen from './screens/SummaryScreen' // Za kasnije

function App() {
  const screen = useGameStore((state) => state.screen)

  return (
    <div className="w-full h-screen bg-gray-900 text-white overflow-hidden font-sans">
      {screen === 'menu' && <MainMenu />}
      {screen === 'map' && <MapScreen />}
      {screen === 'battle' && <BattleScreen />}
      {screen === 'postbattle' && <PostBattleScreen />}
      {screen === 'postendless' && <PostEndlessScreen />}
      {screen === 'endless' && <EndlessScreen />}
      {/* {screen === 'summary' && <SummaryScreen />} */}
    </div>
  )
}

export default App