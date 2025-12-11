import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type ContentSectionProps = {
  title: string
  desc: string
  children: React.JSX.Element
  titleClassName?: string
  descClassName?: string
  compact?: boolean
}

export function ContentSection({ title, desc, children, titleClassName, descClassName, compact }: ContentSectionProps) {
  return (
    <div className='flex flex-1 min-h-0 flex-col'>
      <div className='flex-none'>
        <h3 className={cn('font-medium text-lg', titleClassName)}>{title}</h3>
        <p className={cn('text-muted-foreground text-sm', descClassName)}>{desc}</p>
      </div>
      <Separator className={cn('flex-none', compact ? 'my-2' : 'my-4')} />
      <div className='relative no-scrollbar flex-1 min-h-0 w-full overflow-y-auto scroll-smooth pe-4 pb-12'>
        <div className='relative -mx-1 px-1.5 md:mx-auto md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl'>
          <div className='rounded-xl bg-black/8 dark:bg-white/12 backdrop-blur-md border border-black/12 dark:border-white/25 ring-1 ring-black/10 dark:ring-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(255,255,255,0.08)] p-4 sm:p-6 md:p-8'>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
