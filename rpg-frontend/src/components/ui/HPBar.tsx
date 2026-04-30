import { motion } from 'framer-motion'

interface HPBarProps {
  current: number
  max: number
  label: string
}

export default function HPBar({ current, max, label }: HPBarProps) {
  const percent = Math.max(0, Math.min(100, (current / max) * 100))
  
  // Boja zavisi od procenta HP-a
  const barColor = percent > 50 ? 'bg-green-500' : percent > 25 ? 'bg-yellow-500' : 'bg-red-600'

  return (
    <div className="w-full max-w-sm mb-4">
      <div className="flex justify-between mb-1 text-sm font-bold">
        <span>{label}</span>
        <span>{current} / {max}</span>
      </div>
      <div className="h-6 w-full bg-gray-700 rounded-full overflow-hidden border-2 border-gray-600 relative shadow-inner">
        <motion.div
          className={`h-full ${barColor}`}
          initial={{ width: `${percent}%` }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, type: 'spring' }}
        />
      </div>
    </div>
  )
}