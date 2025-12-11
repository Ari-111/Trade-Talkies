import { Paperclip, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'

type ChatInputBarProps = {
  className?: string
  placeholder?: string
  onAttachClick?: () => void
  onMicClick?: () => void
  onSubmit?: (text: string) => void
  leftOffset?: number
  position?: 'fixed' | 'sticky' | 'absolute' | 'inline'
}

export function ChatInputBar({
  className,
  placeholder = 'Type a message…',
  onAttachClick,
  onMicClick,
  onSubmit,
  leftOffset = 0,
  position,
}: ChatInputBarProps) {
  const isMobile = useIsMobile()
  const resolvedPosition = position ?? (isMobile ? 'sticky' : 'fixed')
  return (
    <div
      className={cn(
        resolvedPosition === 'sticky'
          ? 'sticky bottom-0 z-40 w-full px-3 pb-3 pt-1 transition-[margin] duration-200 ease-out'
          : resolvedPosition === 'absolute'
          ? 'absolute bottom-0 z-40 w-full px-3 pb-3 pt-1 transition-[margin] duration-200 ease-out'
          : resolvedPosition === 'inline'
          ? 'w-full px-3 pb-3 pt-1 transition-[margin] duration-200 ease-out'
          : 'fixed bottom-0 z-40 w-full px-3 pb-3 pt-1 transition-[margin] duration-200 ease-out',
        className
      )}
      style={{ marginLeft: leftOffset, width: `calc(100% - ${leftOffset ?? 0}px)` }}
    >
      <form
        className={cn(
          'bg-black/8 dark:bg-white/12 backdrop-blur-md',
          'border border-black/12 dark:border-white/25 ring-1 ring-black/10 dark:ring-white/20',
          'shadow-[0_6px_20px_rgba(0,0,0,0.12)] dark:shadow-[0_6px_20px_rgba(255,255,255,0.10)]',
          'mx-auto flex h-12 w-full max-w-3xl items-center gap-2 rounded-full px-4'
        )}
        onSubmit={(e) => {
          e.preventDefault()
          const form = e.currentTarget
          const input = form.querySelector<HTMLInputElement>('input[type="text"]')
          const value = input?.value.trim() ?? ''
          if (value && onSubmit) onSubmit(value)
          if (input) input.value = ''
        }}
      >
        <Button
          type='button'
          size='icon'
          variant='ghost'
          className='rounded-full'
          onClick={onAttachClick}
          aria-label='Attach'
        >
          <Paperclip className='size-5 stroke-muted-foreground' />
        </Button>

        <input
          type='text'
          className='flex-1 bg-transparent text-base focus-visible:outline-hidden'
          placeholder={placeholder}
        />

        <Button
          type='button'
          size='icon'
          variant='ghost'
          className='rounded-full'
          onClick={onMicClick}
          aria-label='Voice input'
        >
          <Mic className='size-5 stroke-muted-foreground' />
        </Button>
      </form>
    </div>
  )
}
