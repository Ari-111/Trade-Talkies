import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  renderSidebarTrigger?: boolean
  leftAction?: React.ReactNode
  ref?: React.Ref<HTMLElement>
}

export function Header({ className, fixed, children, renderSidebarTrigger = false, leftAction, ...props }: HeaderProps) {
  const [offset, setOffset] = useState(0)
  const headerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const getScrollParent = (node: HTMLElement | null): HTMLElement | null => {
      let parent = node?.parentElement ?? null
      while (parent) {
        const style = window.getComputedStyle(parent)
        const oy = style.overflowY
        if ((oy === 'auto' || oy === 'scroll') && parent.scrollHeight > parent.clientHeight) {
          return parent
        }
        parent = parent.parentElement
      }
      return null
    }

    const onScrollContainer = (el: HTMLElement) => () => setOffset(el.scrollTop)
    const onScrollDoc = () =>
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)

    const container = getScrollParent(headerRef.current)

    if (container) {
      const handler = onScrollContainer(container)
      container.addEventListener('scroll', handler, { passive: true })
      // Initialize offset
      setOffset(container.scrollTop)
      return () => container.removeEventListener('scroll', handler)
    } else {
      document.addEventListener('scroll', onScrollDoc, { passive: true })
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
      return () => document.removeEventListener('scroll', onScrollDoc)
    }
  }, [])

  return (
    <header
      ref={headerRef}
      className={cn(
        'z-50 h-16',
        fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
        offset > 10 && fixed ? 'shadow' : 'shadow-none',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative flex h-full items-center gap-3 p-4 sm:gap-4',
          // Always show frosted overlay when header is fixed (mobile + desktop)
          fixed && 'after:bg-background/20 after:absolute after:inset-0 after:-z-10 after:backdrop-blur-lg'
        )}
      >
        {renderSidebarTrigger ? (
          <SidebarTrigger variant='outline' className='hidden md:inline-flex' />
        ) : leftAction ? (
          leftAction
        ) : null}
        {(renderSidebarTrigger || !!leftAction) && (
          <Separator orientation='vertical' className='h-6' />
        )}
        {children}
      </div>
    </header>
  )
}
