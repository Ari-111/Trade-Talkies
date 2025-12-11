import { useLayout } from '@/context/layout-provider'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { useAuthStore } from '@/stores/auth-store'
import { useProfileStore } from '@/stores/profile-store'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const isMobile = useIsMobile()
  const { user, userProfile } = useAuthStore()
  const { avatarUrl } = useProfileStore()

  const userData = {
    name: userProfile?.username || user?.displayName || 'User',
    email: userProfile?.email || user?.email || '',
    avatar: avatarUrl || '/avatars/shadcn.jpg',
  }

  // Ensure desktop collapse shows icon rail instead of fully offcanvas
  const safeCollapsible = !isMobile && collapsible === 'offcanvas' ? 'icon' : collapsible
  return (
    <Sidebar collapsible={safeCollapsible} variant={variant}>
      <SidebarHeader>
        <AppTitle />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
