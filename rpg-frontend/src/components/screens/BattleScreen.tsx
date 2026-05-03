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

// ─── HP bar ────────────────────────────────────────────────────────────────
function HeroHP({ current, max }: { current: number; max: number }) {
  const pct = Math.max(0, Math.min(1, current / max))
  const cls = pct > 0.5 ? 'hp-high' : pct > 0.25 ? 'hp-mid' : 'hp-low'
  return (
    // IZMENA: Širi HP bar i veći font
    <div className="w-64 md:w-72">
      <div className="flex justify-between mb-1.5" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10 }}>
        <span style={{ color: 'var(--dim-text)' }}>HERO</span>
        <span style={{ color: pct > 0.5 ? '#4ade80' : pct > 0.25 ? '#facc15' : '#f87171' }}>
          {current}<span style={{ color: 'var(--mute-text)' }}>/{max}</span>
        </span>
      </div>
      <div className="hp-track" style={{ height: 10 }}> {/* IZMENA: Deblji HP bar */}
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
    <div className="w-64 md:w-72">
      <div className="flex justify-between mb-1.5" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10 }}>
        <span style={{ color: 'var(--dim-text)' }}>{name.toUpperCase()}</span>
        <span style={{ color: pct > 0.5 ? '#4ade80' : pct > 0.25 ? '#facc15' : '#f87171' }}>
          {current}<span style={{ color: 'var(--mute-text)' }}>/{max}</span>
        </span>
      </div>
      <div className="hp-track" style={{ transform: 'scaleX(-1)', height: 10 }}>
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
    // IZMENA: Povećan badge i fontovi
    <div className="panel panel-gold flex flex-col items-center px-5 py-3" style={{ minWidth: 90 }}>
      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: 'var(--dim-text)', letterSpacing: '0.2em' }}>TURN</span>
      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 28, color: 'var(--gold)', lineHeight: 1.2,
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
    // IZMENA: Povećan font
    <div className={isHero ? 'log-hero' : 'log-monster'} style={{ fontSize: 11 }}>
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

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [battleLog])

  // Logika za animacije ostaje ista, trebalo bi da radi ispravno.
  useEffect(() => {
    const last = battleLog[battleLog.length - 1] as any | undefined
    if (!last) return

    if (last.actor === 'hero') {
      setHeroAttacking(true)
      setHeroVFX(last.type === 'magical' ? 'magic' : 'slash')
      setTimeout(() => setHeroAttacking(false), 420)
      setTimeout(() => setHeroVFX(null), 420)
      if (last.damage > 0) {
        setTimeout(() => {
          setMonsterIsHit(true)
          setTimeout(() => setMonsterIsHit(false), 340)
        }, 180)
      }
    } else {
      setMonsterAttacking(true)
      setMonsterVFX(last.type === 'magical' ? 'magic' : 'slash')
      setTimeout(() => setMonsterAttacking(false), 420)
      setTimeout(() => setMonsterVFX(null), 420)
      if (last.damage > 0) {
        setTimeout(() => {
          setHeroIsHit(true)
          setTimeout(() => setHeroIsHit(false), 340)
        }, 180)
      }
    }
  }, [battleLog])

  if (!config || !battleState) return (
    <div className="flex items-center justify-center h-full" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: 'var(--mute-text)' }}>
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
    // ISPRAVKA: Glavni kontejner sada koristi `h-full flex flex-col` da podeli ekran na 3 dela.
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      {/* Pozadina ostaje ista */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        background: `radial-gradient(ellipse at 50% 100%, #05040d, #0d0c21)`,
      }}/>
       <div className="absolute inset-0 pointer-events-none z-0" style={{
        background: `
          radial-gradient(ellipse 70% 28% at 50% 0%,  rgba(160,130,60,0.07), transparent),
          radial-gradient(ellipse 35% 28% at 8%  80%, rgba(20,55,30,0.15),  transparent),
          radial-gradient(ellipse 35% 28% at 92% 80%, rgba(20,55,30,0.15),  transparent),
          linear-gradient(180deg, transparent 40%, rgba(2,1,9,0.88) 100%)
        `
      }} />

      {/* ── TOP BAR (Fiksna visina) ── */}
      <div className="relative z-10 flex items-center justify-between gap-4 w-full p-4 md:p-6">
        <TurnBadge turn={battleState.turn} />
        <div className="flex-1 flex justify-center min-w-0">
          <AnimatePresence mode="wait">
            {monsterTell ? (
              <motion.div
                key="tell"
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="monster-tell-box px-5 py-3 text-center w-full max-w-md"
              >
                <MonsterTell monsterName={monster.name} move={monsterTell} />
              </motion.div>
            ) : (
              <motion.p
                key="idle"
                className="py-5 text-center blink"
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: 'var(--mute-text)', letterSpacing: '0.2em' }}
              >
                — Awaiting move —
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        
        {/* ISPRAVKA: Prikaz za Endless Mode */}
        <div className="flex gap-2" style={{ minWidth: 200, justifyContent: 'flex-end' }}>
            {endlessMode && endlessUpcoming?.length > 0 && (
                endlessUpcoming.slice(0, 3).map((u: any, i: number) => (
                <div key={i} className="panel px-3 py-2 text-center">
                    <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: 'var(--mute-text)' }}>#{battleState.turn + i + 1}</p>
                    <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: 'var(--dim-text)' }}>
                    {u.type === 'monster' ? u.monster?.name?.slice(0, 8) : '✦ Event'}
                    </p>
                </div>
                ))
            )}
        </div>
      </div>

      {/* ── ARENA (flex-1 zauzima sav preostali prostor) ── */}
      <div className="relative z-10 flex-1 flex items-center justify-around px-6 w-full">
        {/* HERO */}
        <div className="flex flex-col items-center gap-4">
          <BattleCharacter
            isHero
            isHit={heroIsHit}
            isAttacking={heroAttacking}
            damageNumbers={heroDmgNums.map(d => ({
              id: String(d.id), value: Number(d.value) || 0, type: d.type as 'damage' | 'heal'
            }))}
            showVFX={heroVFX}
            scale={9}
          />
          <HeroHP current={battleState.hero_hp} max={battleState.hero_max_hp} />
        </div>

        {/* VS */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none">
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: 'rgba(255,255,255,0.08)', letterSpacing: '0.5em' }}>VS</span>
        </div>

        {/* MONSTER */}
        <div className="flex flex-col items-center gap-4">
          <BattleCharacter
            monsterName={monster.name}
            isHit={monsterIsHit}
            isAttacking={monsterAttacking}
            isRaging={isRaging}
            damageNumbers={monsterDmgNums.map(d => ({
              id: String(d.id), value: Number(d.value) || 0, type: d.type as 'damage' | 'heal'
            }))}
            showVFX={monsterVFX}
            scale={9}
          />
          <MonsterHP current={battleState.monster_hp} max={battleState.monster_max_hp} name={monster.name} />
        </div>
      </div>

      {/* ── MOVE PANEL (Fiksna visina) ── */}
      <div className="relative z-10 w-full p-3 md:p-4">
        <div className="panel panel-gold p-4 relative">
          {/* ... Processing overlay ... */}

          <div className="flex items-center justify-between mb-3">
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: 'var(--dim-text)', letterSpacing: '0.2em' }}>
              SELECT MOVE
            </span>
            <button
              onClick={() => setShowLog(s => !s)}
              className="pixel-button py-1.5 px-2.5 flex items-center gap-2"
              style={{ fontSize: 9, color: showLog ? 'var(--gold)' : undefined }}
            >
              <ScrollText size={11} />
              {showLog ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
              LOG {battleLog.length > 0 && `(${battleLog.length})`}
            </button>
          </div>

          {/* ISPRAVKA: Dugmad sada imaju w-full da popune grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {equippedMoves.map((move, idx) => (
              <MoveButton
                key={idx}
                move={move}
                onClick={() => handleSelectMove(move)}
                disabled={isProcessing}
                className="w-full"
              />
            ))}
          </div>

          {/* ISPRAVKA: Log se sada otvara unutar panela i neće pomerati arenu */}
          <AnimatePresence>
            {showLog && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="rune-line mt-4 mb-2" style={{ fontSize: 9 }}>battle log</div>
                <div
                  ref={logRef}
                  className="flex flex-col gap-1 overflow-y-auto"
                  style={{ maxHeight: 160 }}
                >
                  {battleLog.length === 0
                    ? <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: 'var(--mute-text)', textAlign: 'center', padding: '12px 0' }}>No moves yet</p>
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