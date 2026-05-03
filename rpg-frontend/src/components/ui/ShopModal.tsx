import { useGameStore } from '../../store/gamestore'
import type { ShopItem } from '../../api/client'
import { fetchShop } from '../../api/client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Swords, Shield, Heart, Zap, RefreshCw } from 'lucide-react'

const statIcons: Record<string, React.ReactNode> = {
  health:  <Heart  size={12} style={{ color: '#f87171' }} />,
  attack:  <Swords size={12} style={{ color: '#fb923c' }} />,
  defense: <Shield size={12} style={{ color: '#60a5fa' }} />,
  magic:   <Zap    size={12} style={{ color: '#c084fc' }} />,
}
const statColors: Record<string, string> = {
  health: '#f87171', attack: '#fb923c', defense: '#60a5fa', magic: '#c084fc',
}

function ShopItemCard({ item, onBuy, owned, canAfford }: {
  item: ShopItem; onBuy: () => void; owned: boolean; canAfford: boolean
}) {
  const isMove = item.type === 'move'
  const statColor = item.stat ? statColors[item.stat] : 'var(--gold)'
  const borderColor = owned ? 'var(--moss)' : !canAfford ? 'var(--rim)' : isMove ? 'var(--arcane-dk)' : 'var(--gold-dk)'

  return (
    <motion.div
      whileHover={!owned && canAfford ? { scale: 1.02, y: -2 } : {}}
      className="panel flex flex-col gap-2 p-3"
      style={{ borderColor, opacity: owned ? 0.7 : !canAfford ? 0.5 : 1 }}
    >
      {/* Type badge */}
      <div className="flex items-center justify-between">
        <span style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 5, letterSpacing: '0.2em',
          color: isMove ? 'var(--arcane-lt)' : statColor,
          background: isMove ? 'rgba(94,46,144,0.2)' : `${statColor}22`,
          padding: '2px 6px', border: `1px solid ${isMove ? 'var(--arcane-dk)' : `${statColor}44`}`,
        }}>
          {isMove ? '✦ MOVE' : `↑ ${item.stat?.toUpperCase()}`}
        </span>
        {owned && (
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: 'var(--moss-lt)' }}>✓ OWNED</span>
        )}
      </div>

      {/* Name */}
      <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: 'var(--ink-text)', lineHeight: 1.5 }}>
        {item.name}
      </p>

      {/* Description */}
      <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: 'var(--dim-text)', lineHeight: 1.7, flex: 1 }}>
        {item.description}
      </p>

      {/* Amount for stat upgrades */}
      {!isMove && item.amount && (
        <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: statColor }}>
          +{item.amount} {item.stat}
        </p>
      )}

      {/* Price + buy */}
      <div className="flex items-center justify-between mt-1">
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: 'var(--gold)' }}>
          💰 {item.cost}
        </span>
        <motion.button
          onClick={onBuy}
          disabled={owned || !canAfford}
          whileTap={!owned && canAfford ? { scale: 0.94 } : {}}
          className="pixel-button"
          style={{
            fontSize: 7, padding: '6px 12px',
            color: owned ? 'var(--mute-text)' : !canAfford ? 'var(--mute-text)' : 'var(--gold)',
            borderColor: owned ? 'var(--rim)' : !canAfford ? 'var(--rim)' : 'var(--gold-dk)',
            cursor: owned || !canAfford ? 'not-allowed' : 'pointer',
          }}
        >
          {owned ? 'Owned' : !canAfford ? 'Too Poor' : 'Buy'}
        </motion.button>
      </div>
    </motion.div>
  )
}

export function ShopModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { coins, buyMove, buyStatUpgrade, learnedMoves } = useGameStore()
  const [shopItems, setShopItems] = useState<ShopItem[] | null>(null)
  const [shopErr, setShopErr]     = useState<string | null>(null)
  const [buying, setBuying]       = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    let mounted = true
    setShopItems(null); setShopErr(null)
    fetchShop()
      .then(items => { if (mounted) setShopItems(items) })
      .catch(err  => { if (mounted) { setShopItems([]); setShopErr(err?.message || 'Failed') } })
    return () => { mounted = false }
  }, [isOpen])

  const handleBuy = (item: ShopItem) => {
    setBuying(item.id)
    let ok = false
    if (item.type === 'move' && item.move) {
      ok = buyMove(item.move, item.cost)
    } else if (item.type === 'stat') {
      ok = buyStatUpgrade(item.stat as any, item.amount || 0, item.cost)
    }
    if (!ok) alert('Not enough coins!')
    else onClose()
    setBuying(null)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="modal-bg"
        >
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.18 }}
            onClick={e => e.stopPropagation()}
            className="panel panel-gold w-full max-w-2xl overflow-hidden"
            style={{ maxHeight: '82vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--gold-dk)', flexShrink: 0 }}>
              <div className="flex items-center gap-3">
                <ShoppingBag size={16} style={{ color: 'var(--gold)' }} />
                <div>
                  <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: 'var(--gold-dk)', letterSpacing: '0.25em', marginBottom: 3 }}>
                    TRAVELING MERCHANT
                  </p>
                  <h2 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: 'var(--ink-text)' }}>
                    The Shop
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: 'var(--mute-text)', marginBottom: 2 }}>YOUR GOLD</p>
                  <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: 'var(--gold)' }}>💰 {coins}</p>
                </div>
                <button onClick={onClose} className="pixel-button p-2"><X size={14} /></button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {shopItems === null ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}>
                    <RefreshCw size={20} style={{ color: 'var(--gold)' }} />
                  </motion.div>
                  <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: 'var(--dim-text)' }}>
                    Consulting wares…
                  </p>
                </div>
              ) : shopErr ? (
                <div className="flex flex-col items-center gap-4 py-10">
                  <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#f87171' }}>{shopErr}</p>
                  <button onClick={() => { setShopItems(null); fetchShop().then(i => setShopItems(i)).catch(e => setShopErr(e?.message)) }}
                    className="pixel-button">
                    <RefreshCw size={10} /> Retry
                  </button>
                </div>
              ) : shopItems.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-3">
                  <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: 'var(--dim-text)' }}>Nothing for sale.</p>
                  <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: 'var(--mute-text)' }}>Start a run first.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {shopItems.map(item => (
                    <ShopItemCard
                      key={item.id}
                      item={item}
                      onBuy={() => handleBuy(item)}
                      owned={item.type === 'move' && !!learnedMoves.find(m => m.id === item.move?.id)}
                      canAfford={coins >= item.cost}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--gold-dk)' }}>
              <button onClick={onClose} className="w-full pixel-button justify-center"
                style={{ color: 'var(--gold)', borderColor: 'var(--gold-dk)', fontSize: 8, letterSpacing: '0.2em' }}>
                Leave Shop
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ShopModal