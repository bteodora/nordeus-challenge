import { motion } from 'framer-motion'

export default function ForestFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-full w-full overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(72,52,28,0.28),transparent_24%),radial-gradient(circle_at_10%_20%,rgba(21,61,35,0.24),transparent_18%),radial-gradient(circle_at_90%_18%,rgba(84,32,46,0.18),transparent_14%),linear-gradient(180deg,#0b0b10_0%,#111217_40%,#060607_100%)]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(10,18,12,0.92),rgba(10,18,12,0))]" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_75%,rgba(60,92,48,0.35),transparent_20%),radial-gradient(circle_at_80%_72%,rgba(35,71,52,0.3),transparent_18%),radial-gradient(circle_at_50%_82%,rgba(18,24,18,0.8),transparent_28%)]" />
        <motion.div
          aria-hidden
          animate={{ x: [0, -8, 0, 8, 0], y: [0, 1, 0, -1, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-0 right-0 top-0 h-full opacity-25"
        >
          <div className="absolute left-[-4%] bottom-0 w-48 h-[70%] bg-[linear-gradient(180deg,#07110d_0%,#020303_100%)] [clip-path:polygon(0_100%,8%_70%,16%_74%,24%_46%,33%_62%,42%_26%,52%_56%,61%_34%,70%_58%,79%_22%,88%_52%,100%_100%)]" />
          <div className="absolute right-[-6%] bottom-0 w-56 h-[76%] bg-[linear-gradient(180deg,#07110d_0%,#020303_100%)] [clip-path:polygon(0_100%,10%_60%,19%_64%,28%_38%,38%_52%,46%_24%,56%_55%,67%_30%,78%_50%,88%_18%,100%_100%)]" />
        </motion.div>
      </div>
      <div className="relative z-10 min-h-full w-full">{children}</div>
    </div>
  )
}
