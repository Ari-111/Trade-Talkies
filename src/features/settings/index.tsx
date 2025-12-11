import { Outlet } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

// Sidebar navigation removed per new design. Section links are provided
// within the Settings Profile page itself.

export function Settings() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='flex flex-1 min-h-0 w-full overflow-y-auto p-1'>
          <Outlet />
        </div>
      </Main>
    </>
  )
}
