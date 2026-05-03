import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gamestore'
import { Swords, Shield, Eye, ShoppingBag, Scroll, LogOut, Heart, Zap } from 'lucide-react'
import { MoveManagementModal } from '../ui/MoveManagementModal'
import ShopModal from '../ui/ShopModal'
import { MonsterPreviewModal } from '../ui/MonsterPreviewModal'
import type { Monster } from '../../api/client'

const DIFFICULTY_COLORS = ['', '#4ade80', '#facc15', '#fb923c', '#f87171', '#c084fc']
const DIFFICULTY_LABELS = ['', 'Weak', 'Common', 'Dangerous', 'Deadly', 'Legendary']

export default function MapScreen() {
  const {
    config, currentEncounterIndex, enterBattle,
    hero, equippedMoves, learnedMoves, equipMove, coins,
  } = useGameStore()
  const [isManageMovesOpen, setIsManageMovesOpen] = useState(false)
  const [isShopOpen, setIsShopOpen] = useState(false)
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null)

  if (!config) return (
    <div className="flex items-center justify-center h-full text-[9px] tracking-widest" style={{ color: 'var(--text-muted)' }}>
      ⏳ Loading...
    </div>
  )

  const heroHpPct = hero.currentHp / hero.maxHp
  const hpColor = heroHpPct > 0.5 ? '#4ade80' : heroHpPct > 0.25 ? '#eab308' : '#f87171'

  return (
    <>
      <div className="flex w-full h-full overflow-hidden" style={{ background: 'linear-gradient(160deg, rgba(10,8,20,0.97), rgba(5,5,12,0.99))' }}>

        {/* ═══ SIDEBAR ═══ */}
        <div className="w-56 flex-shrink-0 flex flex-col gap-3 p-4 border-r overflow-y-auto" style={{ borderColor: 'var(--border)', background: 'rgba(3,2,10,0.6)' }}>

          {/* Hero card */}
          <div className="pixel-panel panel-gold p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold" style={{ color: 'var(--gold)' }}>⚔ Knight</p>
                <p className="text-[7px] mt-1" style={{ color: 'var(--text-muted)' }}>Level {hero.level}</p>
              </div>
              <div className="text-[9px] font-bold" style={{ color: '#facc15' }}>💰 {coins}</div>
            </div>

            {/* HP */}
            <div className="mb-3">
              <div className="flex justify-between text-[7px] mb-1" style={{ color: 'var(--text-secondary)' }}>
                <span className="flex items-center gap-1"><Heart size={8} /> HP</span>
                <span style={{ color: hpColor }}>{hero.currentHp}/{hero.maxHp}</span>
              </div>
              <div className="hp-bar-track">
                <motion.div
                  className={`hp-bar-fill ${heroHpPct > 0.5 ? 'hp-high' : heroHpPct > 0.25 ? 'hp-mid' : 'hp-low'}`}
                  animate={{ width: `${heroHpPct * 100}%` }}
                  transition={{ duration: 0.5, type: 'spring' }}
                />
              </div>
            </div>

            {/* Stats mini */}
            <div className="grid grid-cols-2 gap-1">
              {[
                { icon: <Swords size={8} />, label: 'ATK', val: hero.stats?.attack,  color: '#fb923c' },
                { icon: <Shield size={8} />, label: 'DEF', val: hero.stats?.defense, color: '#60a5fa' },
                { icon: <Zap    size={8} />, label: 'MAG', val: hero.stats?.magic,   color: '#c084fc' },
                { icon: <Heart  size={8} />, label: 'HP',  val: hero.stats?.health,  color: '#f87171' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-1 text-[7px]" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                  <span>{s.label} {s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Equipped moves */}
          <div className="pixel-panel p-3">
            <p className="text-[7px] tracking-[0.2em] mb-2" style={{ color: 'var(--text-secondary)' }}>EQUIPPED MOVES</p>
            <div className="flex flex-col gap-1">
              {equippedMoves.map((move, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-2 py-1 text-[7px]"
                  style={{ background: 'rgba(0,0,0,0.35)', borderLeft: `2px solid ${move.type === 'physical' ? '#fb923c44' : '#c084fc44'}` }}
                >
                  <span style={{ color: 'var(--text-primary)' }}>{move.name}</span>
                  <span style={{ color: move.type === 'physical' ? '#fb923c' : '#c084fc' }}>
                    {move.type === 'physical' ? '⚔' : '✦'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 mt-auto">
            <button onClick={() => setIsManageMovesOpen(true)} className="pixel-button w-full justify-center gap-2">
              <Scroll size={10} /> Moves
            </button>
            <button onClick={() => setIsShopOpen(true)} className="pixel-button w-full justify-center gap-2">
              <ShoppingBag size={10} /> Shop
            </button>
            <button
              onClick={() => { useGameStore.getState().saveRun(); useGameStore.getState().exitToMenu() }}
              className="pixel-button w-full justify-center gap-2 text-[7px]"
              style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
            >
              <LogOut size={10} /> Save & Exit
            </button>
          </div>
        </div>

        {/* ═══ MAIN MAP ═══ */}
        <div className="flex-1 flex flex-col items-center overflow-y-auto py-8 px-6 relative">

          {/* Atmospheric top glow */}
          <div className="pointer-events-none absolute top-0 inset-x-0 h-40"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(212,169,74,0.05), transparent)' }}
          />

          <motion.h2
            className="text-lg tracking-[0.3em] mb-2"
            style={{ color: 'var(--gold)', textShadow: '0 0 20px rgba(212,169,74,0.3)' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            THE GAUNTLET
          </motion.h2>
          <p className="text-[7px] tracking-[0.3em] mb-8" style={{ color: 'var(--text-muted)' }}>
            {currentEncounterIndex} / {config.monsters.length} defeated
          </p>

          {/* Path line */}
          <div className="relative w-full max-w-md flex flex-col items-center gap-3">
            <div
              className="absolute top-6 bottom-6 w-px opacity-30"
              style={{
                left: '50%',
                background: 'linear-gradient(180deg, var(--gold-dim), var(--verdant), var(--border))',
              }}
            />

            {config.monsters.map((monster, index) => {
              const isCurrent = index === currentEncounterIndex
              const isPast    = index < currentEncounterIndex
              const isLocked  = index > currentEncounterIndex

              return (
                <motion.div
                  key={monster.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22,1,0.36,1] }}
                  className={`map-node w-full flex items-center justify-between p-3 ${
                    isCurrent ? 'map-node-current' : isPast ? 'map-node-past' : 'map-node-locked'
                  }`}
                  onClick={() => isCurrent && enterBattle(index)}
                >
                  {/* Left: emoji + name */}
                  <div className="flex items-center gap-3">
                    <span className="text-3xl leading-none" style={{ filter: isPast ? 'grayscale(1)' : 'none' }}>
                      {isPast ? '💀' : '👹'}
                    </span>
                    <div>
                      <p className="text-[9px] font-bold" style={{ color: isCurrent ? 'var(--gold)' : 'var(--text-secondary)' }}>
                        {monster.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {Array.from({ length: monster.difficulty }).map((_, i) => (
                          <span key={i} className="text-[6px]" style={{ color: DIFFICULTY_COLORS[monster.difficulty] }}>⚔</span>
                        ))}
                        <span className="text-[6px]" style={{ color: DIFFICULTY_COLORS[monster.difficulty] }}>
                          {DIFFICULTY_LABELS[monster.difficulty]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedMonster(monster) }}
                      className="pixel-button py-1 px-2"
                      title="Preview"
                    >
                      <Eye size={10} />
                    </button>

                    {isCurrent && (
                      <button
                        onClick={e => { e.stopPropagation(); enterBattle(index) }}
                        className="pixel-button py-1.5 px-3 flex items-center gap-1"
                        style={{ color: '#f87171', borderColor: 'var(--crimson)', background: 'rgba(139,26,26,0.3)' }}
                      >
                        <Swords size={10} />
                        <span className="text-[7px]">FIGHT</span>
                      </button>
                    )}

                    {isPast && (
                      <div className="flex items-center gap-2">
                        <span className="text-[7px] tracking-wider" style={{ color: 'var(--verdant)' }}>✓ DONE</span>
                        <button
                          onClick={e => { e.stopPropagation(); enterBattle(index, true) }}
                          className="pixel-button py-1 px-2 text-[7px]"
                        >
                          Replay
                        </button>
                      </div>
                    )}

                    {isLocked && (
                      <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>🔒</span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      <MoveManagementModal
        isOpen={isManageMovesOpen}
        onClose={() => setIsManageMovesOpen(false)}
        allMoves={learnedMoves}
        equippedMoves={equippedMoves}
        onEquipMove={equipMove}
      />
      <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
      <MonsterPreviewModal isOpen={!!selectedMonster} onClose={() => setSelectedMonster(null)} monster={selectedMonster} />
    </>
  )
}