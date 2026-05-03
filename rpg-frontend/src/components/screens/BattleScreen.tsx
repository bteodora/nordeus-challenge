import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gamestore'
import type { Move } from '../../api/client'
import { MonsterTell } from '../ui/MonsterTell'
import BattleCharacter from '../battle/BattleCharacter'
import MoveButton from '../ui/MoveButton'
import { ScrollText, ChevronDown, ChevronUp } from 'lucide-react'

interface LogEntryData {
  actor: 'hero' | 'monster';
  type: 'physical' | 'magical' | 'buff' | 'debuff';
  turn: number;
  moveName: string;
  damage: number;
  healing: number;
}

// ─── HP bar (single instance per fighter) ─────────────────────────────────────
function HeroHP({ current, max }: { current: number; max: number }) {
  const pct = Math.max(0, Math.min(1, current / max))
  const cls = pct > 0.5 ? 'hp-high' : pct > 0.25 ? 'hp-mid' : 'hp-low'
  return (
    <div className="w-36 md:w-44">
      <div className="flex justify-between mb-1" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7 }}>
        <span style={{ color: 'var(--dim-text)' }}>HERO</span>
        <span style={{ color: pct > 0.5 ? '#4ade80' : pct > 0.25 ? '#facc15' : '#f87171' }}>
          {current}<span style={{ color: 'var(--mute-text)' }}>/{max}</span>
        </span>
      </div>
      <div className="hp-track">
        <motion.div
          className={`hp-fill ${cls}`}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.55, type: 'spring', bounce: 0.25 }}
        />
      </div>
    </div>
  )
}

function MonsterHP({ current, max, name }: { current: number; max: number; name: string }) {
  const pct = Math.max(0, Math.min(1, current / max))
  const cls = pct > 0.5 ? 'hp-high' : pct > 0.25 ? 'hp-mid' : 'hp-low'
  return (
    <div className="w-36 md:w-44">
      <div className="flex justify-between mb-1" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7 }}>
        <span style={{ color: 'var(--dim-text)' }}>{name.slice(0, 8).toUpperCase()}</span>
        <span style={{ color: pct > 0.5 ? '#4ade80' : pct > 0.25 ? '#facc15' : '#f87171' }}>
          {current}<span style={{ color: 'var(--mute-text)' }}>/{max}</span>
        </span>
      </div>
      <div className="hp-track" style={{ transform: 'scaleX(-1)' }}>
        <motion.div
          className={`hp-fill ${cls}`}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.55, type: 'spring', bounce: 0.25 }}
        />
      </div>
    </div>
  )
}

// ─── Turn indicator ───────────────────────────────────────────────────────────
function TurnBadge({ turn }: { turn: number }) {
  return (
    <div className="panel panel-gold flex flex-col items-center px-4 py-2" style={{ minWidth: 72 }}>
      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: 'var(--dim-text)', letterSpacing: '0.2em' }}>TURN</span>
      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 22, color: 'var(--gold)', lineHeight: 1.2,
        textShadow: '0 0 16px var(--gold-glow)' }}>
        {turn}
      </span>
    </div>
  )
}

// ─── Battle log entry ─────────────────────────────────────────────────────────
function LogEntry({ entry, monsterName }: { entry: any; monsterName: string }) {
  const isHero = entry.actor === 'hero'
  return (
    <div className={isHero ? 'log-hero' : 'log-monster'}>
      <span style={{ color: 'var(--mute-text)' }}>T{entry.turn} </span>
      <span style={{ color: isHero ? '#818cf8' : '#f87171' }}>
        {isHero ? '⚔ Hero' : `☠ ${monsterName}`}
      </span>
      {' → '}
      <span style={{ color: 'var(--ink-text)' }}>{entry.moveName}</span>
      {entry.damage > 0 && <span style={{ color: '#f87171' }}> -{entry.damage}</span>}
      {entry.healing > 0 && <span style={{ color: '#4ade80' }}> +{entry.healing}</span>}
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function BattleScreen() {
  const {
    config, currentEncounterIndex, battleState, battleLog, monsterTell,
    selectMove, equippedMoves, damageNumbers, isRaging, endlessMode,
    endlessUpcoming, currentMonster,
  } = useGameStore()

  const [isProcessing, setIsProcessing] = useState(false)
  const [heroIsHit, setHeroIsHit]       = useState(false)
  const [monsterIsHit, setMonsterIsHit] = useState(false)
  const [heroAttacking, setHeroAttacking]    = useState(false)
  const [monsterAttacking, setMonsterAttacking] = useState(false)
  const [heroVFX, setHeroVFX]     = useState<'slash' | 'magic' | null>(null)
  const [monsterVFX, setMonsterVFX] = useState<'slash' | 'magic' | null>(null)
  const [showLog, setShowLog]     = useState(false)
  const logRef = useRef<HTMLDivElement>(null)

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [battleLog])

  // Hit / attack animations from log
  useEffect(() => {
    const last = battleLog[battleLog.length - 1] as LogEntryData | undefined
    if (!last) return

    if (last.actor === 'hero') {
      // Hero attacked → hero plays attack anim, monster gets hit
      setHeroAttacking(true)
      setHeroVFX(last.type === 'magical' ? 'magic' : 'slash')
      setTimeout(() => setHeroAttacking(false), 420)
      setTimeout(() => setHeroVFX(null), 420)
      if (last.damage) {
        setTimeout(() => {
          setMonsterIsHit(true)
          setMonsterVFX(null)
          setTimeout(() => setMonsterIsHit(false), 340)
        }, 180)
      }
    } else {
      // Monster attacked → monster plays attack, hero gets hit
      setMonsterAttacking(true)
      setMonsterVFX(last.type === 'magical' ? 'magic' : 'slash')
      setTimeout(() => setMonsterAttacking(false), 420)
      setTimeout(() => setMonsterVFX(null), 420)
      if (last.damage) {
        setTimeout(() => {
          setHeroIsHit(true)
          setTimeout(() => setHeroIsHit(false), 340)
        }, 180)
      }
    }
  }, [battleLog])

  if (!config || !battleState) return (
    <div className="flex items-center justify-center h-full" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: 'var(--mute-text)' }}>
      Loading Battle...
    </div>
  )

  const monster = endlessMode && currentMonster
    ? currentMonster
    : config.monsters[currentEncounterIndex]

  const handleSelectMove = async (move: Move) => {
    if (isProcessing) return
    setIsProcessing(true)
    await selectMove(move)
    setIsProcessing(false)
  }

  const heroDmgNums    = damageNumbers.filter(d => d.target === 'hero')
  const monsterDmgNums = damageNumbers.filter(d => d.target === 'monster')

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      {/* ── Animated forest backdrop (canvas) ── */}


      {/* ── Atmospheric tints ── */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        background: `
          radial-gradient(ellipse 70% 28% at 50% 0%,  rgba(160,130,60,0.07), transparent),
          radial-gradient(ellipse 35% 28% at 8%  80%, rgba(20,55,30,0.15),  transparent),
          radial-gradient(ellipse 35% 28% at 92% 80%, rgba(20,55,30,0.15),  transparent),
          linear-gradient(180deg, transparent 40%, rgba(2,1,9,0.88) 100%)
        `
      }} />

      {/* Moonbeam */}
      <div className="absolute inset-x-0 top-0 pointer-events-none z-0" style={{
        height: '65%',
        background: 'linear-gradient(155deg, transparent 0%, rgba(170,175,255,0.04) 40%, transparent 60%)',
        animation: 'mist-breathe 9s ease-in-out infinite alternate',
      }} />

      {/* ── TOP BAR ── */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-0 gap-2 flex-shrink-0">
        <TurnBadge turn={battleState.turn} />

        {/* Monster tell / await */}
        <div className="flex-1 flex justify-center min-w-0">
          <AnimatePresence mode="wait">
            {monsterTell ? (
              <motion.div
                key="tell"
                initial={{ opacity: 0, y: -10, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className="monster-tell-box px-4 py-2 text-center w-full max-w-xs"
              >
                <MonsterTell monsterName={monster.name} move={monsterTell} />
              </motion.div>
            ) : (
              <motion.p
                key="idle"
                className="py-5 text-center blink"
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: 'var(--mute-text)', letterSpacing: '0.2em' }}
              >
                — Awaiting move —
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Endless upcoming strip */}
        {endlessMode && endlessUpcoming?.length > 0 && (
          <div className="flex gap-1">
            {endlessUpcoming.slice(0, 3).map((u: any, i: number) => (
              <div key={i} className="panel px-2 py-1 text-center" style={{ minWidth: 52 }}>
                <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: 'var(--mute-text)' }}>#{i + 2}</p>
                <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: 'var(--dim-text)' }}>
                  {u.type === 'monster' ? u.monster?.name?.slice(0, 6) : '✦ Event'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ARENA ── */}
      <div className="relative z-10 flex-1 flex items-end justify-between px-6 pb-2 min-h-0">

        {/* HERO */}
        <div className="flex flex-col items-center gap-2">
          <BattleCharacter
            isHero
            isHit={heroIsHit}
            isAttacking={heroAttacking}
            damageNumbers={heroDmgNums
                .filter(d => d.type === 'damage' || d.type === 'heal') // Sklanjamo 'buff' jer ga komponenta ne podržava
                .map(d => ({
                  id: String(d.id),
                  value: Number(d.value) || 0,
                  type: d.type as 'damage' | 'heal' // "Ubeđujemo" TS da su ostali samo validni tipovi
                }))}
            showVFX={heroVFX}
            scale={5}
          />
          <HeroHP current={battleState.hero_hp} max={battleState.hero_max_hp} />
        </div>

        {/* Center VS */}
        <div className="absolute inset-x-0 bottom-28 flex justify-center pointer-events-none">
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: 'rgba(255,255,255,0.07)', letterSpacing: '0.5em' }}>VS</span>
        </div>

        {/* MONSTER */}
        <div className="flex flex-col items-center gap-2">
          <BattleCharacter
            monsterName={monster.name}
            isHit={monsterIsHit}
            isAttacking={monsterAttacking}
            isRaging={isRaging}
            damageNumbers={monsterDmgNums
                .filter(d => d.type === 'damage' || d.type === 'heal')
                .map(d => ({
                  id: String(d.id),
                  value: Number(d.value) || 0,
                  type: d.type as 'damage' | 'heal'
                }))}
            showVFX={monsterVFX}
            scale={5}
          />
          <MonsterHP current={battleState.monster_hp} max={battleState.monster_max_hp} name={monster.name} />
        </div>
      </div>

      {/* ── MOVE PANEL ── */}
      <div className="relative z-10 flex-shrink-0 px-3 pb-3">
        <div className="panel panel-gold p-3 relative">

          {/* Processing overlay */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex items-center justify-center"
                style={{ background: 'rgba(2,1,9,0.72)', backdropFilter: 'blur(3px)' }}
              >
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.1 }}
                  style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: 'var(--gold)', letterSpacing: '0.25em' }}
                >
                  ⚔ Processing…
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: 'var(--dim-text)', letterSpacing: '0.2em' }}>
              SELECT MOVE
            </span>
            <button
              onClick={() => setShowLog(s => !s)}
              className="pixel-button py-1 px-2 flex items-center gap-1"
              style={{ fontSize: 7, color: showLog ? 'var(--gold)' : undefined }}
            >
              <ScrollText size={9} />
              {showLog ? <ChevronDown size={9} /> : <ChevronUp size={9} />}
              LOG {battleLog.length > 0 && `(${battleLog.length})`}
            </button>
          </div>

          {/* Move grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {equippedMoves.map((move, idx) => (
              <MoveButton
                key={idx}
                move={move}
                onClick={() => handleSelectMove(move)}
                disabled={isProcessing}
              />
            ))}
          </div>

          {/* Battle log collapsible */}
          <AnimatePresence>
            {showLog && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="rune-line mt-3 mb-2" style={{ fontSize: 7 }}>battle log</div>
                <div
                  ref={logRef}
                  className="flex flex-col gap-0.5 overflow-y-auto"
                  style={{ maxHeight: 120 }}
                >
                  {battleLog.length === 0
                    ? <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: 'var(--mute-text)', textAlign: 'center', padding: '8px 0' }}>No moves yet</p>
                    : battleLog.map((e, i) => <LogEntry key={i} entry={e} monsterName={monster.name} />)
                  }
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}