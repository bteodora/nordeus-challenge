import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gamestore'
import type { Move } from '../../api/client'
import { MonsterTell } from '../ui/MonsterTell'
import BattleCharacter from '../battle/BattleCharacter'
import MoveButton from '../ui/MoveButton'
import BattleForestBackdrop from '../ui/BattleForestBackdrop'
import { ScrollText } from 'lucide-react'

export default function BattleScreen() {
  const {
    config, currentEncounterIndex, battleState, battleLog, monsterTell,
    selectMove, equippedMoves, damageNumbers, isRaging, endlessMode,
    endlessUpcoming, currentMonster,
  } = useGameStore()

  const [isProcessing, setIsProcessing] = useState(false)
  const [heroIsHit, setHeroIsHit]       = useState(false)
  const [monsterIsHit, setMonsterIsHit] = useState(false)
  const [showLog, setShowLog]           = useState(false)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const last = battleLog[battleLog.length - 1]
    if (!last?.damage) return
    if (last.actor === 'hero') {
      setMonsterIsHit(true); setTimeout(() => setMonsterIsHit(false), 320)
    } else {
      setHeroIsHit(true); setTimeout(() => setHeroIsHit(false), 320)
    }
  }, [battleLog])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [battleLog])

  if (!config || !battleState) return (
    <div className="flex items-center justify-center h-full text-[10px] tracking-widest" style={{ color: 'var(--text-muted)' }}>
      ⏳ Loading Battle...
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

  const heroDmg    = damageNumbers.filter(d => d.target === 'hero')
  const monsterDmg = damageNumbers.filter(d => d.target === 'monster')

  const heroHpPct    = battleState.hero_hp    / battleState.hero_max_hp
  const monsterHpPct = battleState.monster_hp / battleState.monster_max_hp

  const hpClass = (pct: number) =>
    pct > 0.5 ? 'hp-high' : pct > 0.25 ? 'hp-mid' : 'hp-low'

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      {/* ── Background ── */}
      <BattleForestBackdrop />

      {/* Atmospheric tinting */}
      <div className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 30% at 50% 0%,   rgba(180,150,80,0.08),  transparent),
            radial-gradient(ellipse 40% 30% at 10% 80%,  rgba(30,70,40,0.14),    transparent),
            radial-gradient(ellipse 40% 30% at 90% 80%,  rgba(30,70,40,0.14),    transparent),
            linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(2,2,8,0.92) 100%)
          `,
        }}
      />

      {/* Moonlight beam */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0"
        style={{
          height: '60%',
          background: 'linear-gradient(160deg, transparent 0%, rgba(180,180,255,0.04) 42%, transparent 58%)',
          animation: 'mist-pulse 8s ease-in-out infinite alternate',
        }}
      />

      {/* ── TOP BAR ── */}
      <div className="relative z-10 flex items-start justify-between px-5 pt-4 pb-2 gap-3 flex-shrink-0">

        {/* Turn counter */}
        <div className="pixel-panel panel-gold px-4 py-2 text-center flex-shrink-0" style={{ minWidth: 80 }}>
          <p className="text-[7px] tracking-[0.2em] mb-1" style={{ color: 'var(--text-secondary)' }}>TURN</p>
          <p className="text-2xl" style={{ color: 'var(--gold)' }}>{battleState.turn}</p>
        </div>

        {/* Monster tell or waiting */}
        <div className="flex-1 flex justify-center">
          <AnimatePresence mode="wait">
            {monsterTell ? (
              <motion.div
                key="tell"
                initial={{ opacity: 0, y: -12, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="monster-tell px-5 py-3 text-center max-w-xs w-full"
                style={{ clipPath: 'polygon(0 5px, 5px 5px, 5px 0, calc(100% - 5px) 0, calc(100% - 5px) 5px, 100% 5px, 100% calc(100% - 5px), calc(100% - 5px) calc(100% - 5px), calc(100% - 5px) 100%, 5px 100%, 5px calc(100% - 5px), 0 calc(100% - 5px))' }}
              >
                <MonsterTell monsterName={monster.name} move={monsterTell} />
              </motion.div>
            ) : (
              <motion.p
                key="wait"
                className="text-[8px] tracking-[0.25em] py-5"
                style={{ color: 'var(--text-muted)' }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
              >
                Awaiting action...
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Monster HP mini */}
        <div className="pixel-panel panel-crimson px-4 py-2 text-right flex-shrink-0" style={{ minWidth: 90 }}>
          <p className="text-[7px] tracking-[0.2em] mb-1" style={{ color: 'var(--text-secondary)' }}>FOE HP</p>
          <p className="text-sm font-bold" style={{ color: '#f87171' }}>
            {battleState.monster_hp}
            <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>/{battleState.monster_max_hp}</span>
          </p>
        </div>
      </div>

      {/* ── ARENA ── */}
      <div className="relative z-10 flex-1 flex items-end justify-between px-6 pb-3 min-h-0">

        {/* HERO side */}
        <div className={`flex flex-col items-center gap-2 ${heroIsHit ? 'is-hit' : ''}`}>
          <BattleCharacter
            name="Knight"
            spriteEmoji="🧙"
            hp={battleState.hero_hp}
            maxHp={battleState.hero_max_hp}
            isHero
            isHit={heroIsHit}
            damageNumbers={heroDmg}
          />
          {/* Hero HP bar */}
          <div className="w-40">
            <div className="flex justify-between text-[7px] mb-1" style={{ color: 'var(--text-secondary)' }}>
              <span>HP</span>
              <span>{battleState.hero_hp}/{battleState.hero_max_hp}</span>
            </div>
            <div className="hp-bar-track w-full" style={{ clipPath: 'polygon(0 2px, 2px 0, calc(100% - 2px) 0, 100% 2px, 100% 100%, 0 100%)' }}>
              <motion.div
                className={`hp-bar-fill ${hpClass(heroHpPct)}`}
                animate={{ width: `${heroHpPct * 100}%` }}
                transition={{ duration: 0.5, type: 'spring' }}
              />
            </div>
          </div>
        </div>

        {/* Center VS text */}
        <div className="flex flex-col items-center gap-1 opacity-25">
          <span className="text-[9px] tracking-[0.4em]" style={{ color: 'var(--text-muted)' }}>VS</span>
        </div>

        {/* MONSTER side */}
        <div className={`flex flex-col items-center gap-2 ${monsterIsHit ? 'is-hit' : ''} ${isRaging ? 'is-raging' : ''}`}>
          <BattleCharacter
            name={monster.name}
            spriteEmoji="👹"
            hp={battleState.monster_hp}
            maxHp={battleState.monster_max_hp}
            isRaging={isRaging}
            isHit={monsterIsHit}
            damageNumbers={monsterDmg}
          />
          {/* Monster HP bar */}
          <div className="w-40">
            <div className="flex justify-between text-[7px] mb-1" style={{ color: 'var(--text-secondary)' }}>
              <span>{monster.name}</span>
              <span>{battleState.monster_hp}/{battleState.monster_max_hp}</span>
            </div>
            <div className="hp-bar-track w-full" style={{ clipPath: 'polygon(0 0, calc(100% - 2px) 0, 100% 2px, 100% 100%, 2px 100%, 0 calc(100% - 2px))' }}>
              <motion.div
                className={`hp-bar-fill ${hpClass(monsterHpPct)}`}
                animate={{ width: `${monsterHpPct * 100}%` }}
                transition={{ duration: 0.5, type: 'spring' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── MOVE PANEL ── */}
      <div className="relative z-10 flex-shrink-0 px-4 pb-4">
        <div className="pixel-panel panel-gold relative p-4">
          {/* Processing overlay */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex items-center justify-center"
                style={{ background: 'rgba(3,2,10,0.7)', backdropFilter: 'blur(2px)' }}
              >
                <motion.p
                  className="text-[10px] tracking-[0.3em]"
                  style={{ color: 'var(--gold)' }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                >
                  ⚔ Processing...
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-[8px] tracking-[0.3em] uppercase" style={{ color: 'var(--text-secondary)' }}>
              ⚔ Choose Your Move
            </p>
            <button
              onClick={() => setShowLog(s => !s)}
              className="pixel-button text-[7px] py-1 px-2 flex items-center gap-1"
              style={{ color: showLog ? 'var(--gold)' : undefined }}
            >
              <ScrollText size={10} />
              {showLog ? 'Hide Log' : `Log (${battleLog.length})`}
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

          {/* Battle log (inline collapsible) */}
          <AnimatePresence>
            {showLog && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="rune-divider mt-3 mb-2 text-[7px]">Battle Log</div>
                <div ref={logRef} className="max-h-32 overflow-y-auto space-y-1">
                  {battleLog.length === 0 ? (
                    <p className="text-[7px] text-center py-2" style={{ color: 'var(--text-muted)' }}>No moves yet</p>
                  ) : battleLog.map((entry, idx) => (
                    <div
                      key={`${entry.turn}-${entry.actor}-${idx}`}
                      className={`text-[7px] px-2 py-1 leading-relaxed ${
                        entry.actor === 'hero' ? 'battle-log-hero' : 'battle-log-monster'
                      }`}
                      style={{ borderLeft: `2px solid ${entry.actor === 'hero' ? '#6366f1' : '#8b1a1a'}` }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>T{entry.turn} · </span>
                      <span style={{ color: entry.actor === 'hero' ? '#a5b4fc' : '#f87171' }}>
                        {entry.actor === 'hero' ? '🗡 ' : '💀 '}
                      </span>
                      {entry.moveName}
                      {entry.damage ? <span style={{ color: '#f87171' }}> −{entry.damage}</span> : null}
                      {entry.healing ? <span style={{ color: '#4ade80' }}> +{entry.healing}</span> : null}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}