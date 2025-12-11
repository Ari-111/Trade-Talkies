import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

type TopNavProps = React.HTMLAttributes<HTMLElement> & {
  links: {
    title: string
    href: string
    isActive: boolean
    disabled?: boolean
  }[]
}

export function TopNav({ className, links, ...props }: TopNavProps) {
  return (
    <>
      {/* Mobile dropdown removed: tabs already shown on dashboard */}

      <nav
        className={cn(
          'hidden items-center space-x-4 lg:flex lg:space-x-4 xl:space-x-6',
          className
        )}
        {...props}
      >
        {links.map(({ title, href, isActive, disabled }) => (
          <Link
            key={`${title}-${href}`}
            to={href}
            disabled={disabled}
            className={`hover:text-primary text-sm font-medium transition-colors ${isActive ? '' : 'text-muted-foreground'}`}
          >
            {title}
          </Link>
        ))}
      </nav>
    </>
  )
}
