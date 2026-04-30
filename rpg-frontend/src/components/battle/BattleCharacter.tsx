import { motion, AnimatePresence } from 'framer-motion'
import HPBar from '../ui/HPBar'
import type { DamageNumber as DmgNumType } from '../../store/gamestore'

interface BattleCharacterProps {
  name: string
  spriteEmoji: string // Zameni sa <img /> kad budeš imala sprajtove
  hp: number
  maxHp: number
  isHero?: boolean
  isRaging?: boolean
  isHit: boolean // Za animaciju
  damageNumbers: DmgNumType[]
}

export default function BattleCharacter({ name, spriteEmoji, hp, maxHp, isHero = false, isRaging = false, isHit, damageNumbers }: BattleCharacterProps) {
  return (
    <div className={`w-1/3 flex flex-col items-center relative ${isHero ? 'items-start' : 'items-end'}`}>
      <HPBar current={hp} max={maxHp} label={name} />
      
      <motion.div 
        key={isHit ? 'hit' : 'idle'} // Promena key-a resetuje animaciju
        animate={{ 
          x: isHit ? (isHero ? [0, 10, -10, 5, 0] : [0, -10, 10, -5, 0]) : 0, // Shake animacija
          scale: isRaging ? 1.1 : 1,
        }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 500 }}
        className={`relative ${isRaging ? 'filter drop-shadow-[0_0_15px_rgba(255,0,0,0.7)]' : ''}`}
      >
        <div className="text-8xl">{spriteEmoji}</div>
        {isRaging && <div className="absolute -top-2 -right-2 text-red-500 font-black text-xs animate-pulse">ENRAGED</div>}
      </motion.div>
      
      {/* Container za damage brojeve */}
      <div className="absolute top-0 left-0 w-full h-full">
        <AnimatePresence>
          {damageNumbers.map((dmg) => (
            <motion.div
              key={dmg.id}
              initial={{ y: 0, opacity: 1, scale: 0.8 }}
              animate={{ y: -80, opacity: 0, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className={`absolute left-1/2 -translate-x-1/2 font-black text-3xl pointer-events-none
                ${dmg.type === 'damage' ? 'text-red-400' : 'text-green-400'}`}
              style={{ textShadow: '2px 2px 2px #000' }}
            >
              {dmg.type === 'damage' ? '' : '+'}{dmg.value}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}