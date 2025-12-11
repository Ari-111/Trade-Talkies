import { Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'
import { useIsMobile } from '@/hooks/use-mobile'
import { BottomNav } from '@/components/layout/bottom-nav'
import { useAuthStore } from '@/stores/auth-store'
import { useEffect } from 'react'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  const isMobile = useIsMobile()
  const { user, userProfile, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isLoading && user) {
      // If user is logged in but has no profile or username, and is not on onboarding page
      if ((!userProfile || !userProfile.username) && location.pathname !== '/onboarding') {
        navigate({ to: '/onboarding' })
      }
    }
  }, [user, userProfile, isLoading, location.pathname, navigate])

  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          {!isMobile && <AppSidebar />}
          <SidebarInset
            className={cn(
              // Set content container, so we can use container queries
              '@container/content',

              // If layout is fixed, set the height
              // to 100svh to prevent overflow
              'has-[[data-layout=fixed]]:h-svh',

              // If layout is fixed and sidebar is inset,
              // set the height to 100svh - spacing (total margins) to prevent overflow
              'peer-data-[variant=inset]:has-[[data-layout=fixed]]:h-[calc(100svh-(var(--spacing)*4))]',

              // On desktop, always constrain inset to viewport height so only content scrolls
              'md:peer-data-[variant=inset]:h-[calc(100svh-(var(--spacing)*4))]'
            )}
          >
            {children ?? <Outlet />}
          </SidebarInset>
          {isMobile && <BottomNav />}
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
