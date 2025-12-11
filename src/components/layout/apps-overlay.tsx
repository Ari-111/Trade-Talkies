 
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'

export type AppsOverlayItem = {
  label: string
  to: string
  imageSrc: string
}

type AppsOverlayProps = {
  open: boolean
  items: AppsOverlayItem[]
  onClose: () => void
  onSelect: (to: string) => void
}

export function AppsOverlay({ open, items, onClose, onSelect }: AppsOverlayProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-end justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden
          />
          {/* Panel */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative z-[61] mb-4 w-[92%] max-w-md rounded-3xl bg-black/10 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/30 ring-1 ring-black/10 dark:ring-white/15 shadow-[0_2px_10px_rgba(0,0,0,0.10)] dark:shadow-[0_2px_10px_rgba(255,255,255,0.10)] text-neutral-800 dark:text-white"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <h2 className="text-lg font-semibold">All Pages</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-md p-1 bg-black/8 dark:bg-white/12 hover:bg-black/12 dark:hover:bg-white/16 border border-black/10 dark:border-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-4 pb-4">
              <ul className="grid grid-cols-3 gap-5"
              >
                {items.map((item) => (
                  <li key={item.label} className="text-center">
                    <button
                      type="button"
                      onClick={() => onSelect(item.to)}
                      className="group flex w-full flex-col items-center gap-2"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-black/8 dark:bg-white/12 backdrop-blur-md border border-black/12 dark:border-white/25 ring-1 ring-black/10 dark:ring-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(255,255,255,0.08)] transition-colors hover:bg-black/10 dark:hover:bg-white/14 focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/30">
                        <img
                          src={item.imageSrc}
                          alt={item.label}
                          className="h-[85%] w-[85%] object-contain"
                        />
                      </div>
                      <span className="text-xs text-neutral-800 dark:text-white group-hover:text-neutral-900 dark:group-hover:text-white">
                        {item.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
