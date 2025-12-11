import { ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type ScrollToLatestButtonProps = {
  visible: boolean
  onClick: () => void
  className?: string
}

export function ScrollToLatestButton({ visible, onClick, className }: ScrollToLatestButtonProps) {
  if (!visible) return null
  return (
    <div className={cn('pointer-events-none flex justify-center', className)}>
      <button
        type='button'
        onClick={onClick}
        className='pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/30 hover:opacity-90'
        aria-label='Jump to latest messages'
      >
        <ArrowDown className='h-4 w-4' />
      </button>
    </div>
  )
}
