import { useGameStore } from '../../store/gamestore'
import type { ShopItem } from '../../api/client'
import { fetchShop } from '../../api/client'
import { useEffect, useState } from 'react'

export function ShopModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { coins, buyMove, buyStatUpgrade, learnedMoves } = useGameStore()
  const [shopItems, setShopItems] = useState<ShopItem[] | null>(null)
  const [shopErr, setShopErr] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    // always fetch shop items from server when modal opens
    let mounted = true
    setShopItems(null)
    setShopErr(null)
    fetchShop()
      .then(items => { if (mounted) { setShopItems(items); setShopErr(null) } })
      .catch((err) => { console.error('fetchShop error', err); if (mounted) { setShopItems([]); setShopErr(err?.message || 'Failed to load shop') } })
    return () => { mounted = false }
  }, [isOpen])

  if (!isOpen) return null
  const shop: ShopItem[] = shopItems || []

  const buy = (item: ShopItem) => {
    if (item.type === 'move' && item.move) {
      const owned = learnedMoves.find(m => m.id === item.move?.id)
      if (owned) return
      const ok = buyMove(item.move, item.cost)
      if (!ok) alert('Not enough coins')
      else onClose()
    } else if (item.type === 'stat') {
      const stat = item.stat as 'health' | 'attack' | 'defense' | 'magic'
      const ok = buyStatUpgrade(stat, item.amount || 0, item.cost)
      if (!ok) alert('Not enough coins')
      else onClose()
    }
  }

  if (shopItems === null) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="w-full max-w-md bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">Loading shop...</div>
      </div>
    )
  }
  if (shopItems.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="w-full max-w-md bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">
          {shopErr ? (
            <>
              <p className="text-sm text-red-400">{shopErr}</p>
              <button
                onClick={() => {
                  setShopItems(null)
                  setShopErr(null)
                  fetchShop().then(i => setShopItems(i)).catch(e => { console.error('fetchShop retry error', e); setShopErr(e?.message || 'Failed') })
                }}
                className="mt-4 px-3 py-1 bg-indigo-600 rounded">
                Retry
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-300">No items available in the shop.</p>
              <p className="text-xs text-gray-400 mt-2">If you haven't started a run yet, click "Start" to initialize run config.</p>
            </>
          )}
          <div className="mt-4 text-right">
            <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded">Close</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-full max-w-2xl bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Shop</h3>
          <div className="text-sm text-gray-300">Coins: {coins}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shop.map((item) => (
            <div key={item.id} className="p-3 bg-gray-700 rounded-lg flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">{item.name}</div>
                  <div className="text-xs text-gray-400">{item.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{item.cost}</div>
                  <button
                    onClick={() => buy(item)}
                    disabled={item.type === 'move' && !!learnedMoves.find(m => m.id === item.move?.id)}
                    className="mt-2 px-3 py-1 bg-indigo-600 rounded disabled:opacity-50"
                  >{item.type === 'move' && !!learnedMoves.find(m => m.id === item.move?.id) ? 'Owned' : 'Buy'}</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded">Close</button>
        </div>
      </div>
    </div>
  )
}

export default ShopModal
