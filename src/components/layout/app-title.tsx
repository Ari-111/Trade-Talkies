// Removed toggle button and related imports
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Command } from 'lucide-react'
// Button import no longer needed

export function AppTitle() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className='relative flex items-center gap-2'>
          <SidebarMenuButton
            size='lg'
            className='gap-2 py-0 hover:bg-transparent active:bg-transparent text-sidebar-foreground hover:text-sidebar-foreground active:text-sidebar-foreground group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center'
            asChild
          >
            <div className='relative flex items-center gap-2 h-full w-full'>
              {/* Brand icon shown in collapsed icon mode */}
              <span className='hidden group-data-[collapsible=icon]:inline-flex items-center justify-center size-5 opacity-100 transition-opacity group-hover/menu-item:opacity-0 peer-hover/menu-button:opacity-0'>
                <Command className='size-4' />
              </span>
              {/* Brand text removed per request */}

              {/* Collapsed overlay trigger centered over brand icon */}
              <SidebarTrigger
                className='hidden size-6 z-10 group-data-[collapsible=icon]:grid group-data-[collapsible=icon]:place-items-center group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:inset-0 group-data-[collapsible=icon]:opacity-0 group-hover/menu-item:opacity-100 peer-hover/menu-button:opacity-100 group-data-[collapsible=icon]:pointer-events-none group-hover/menu-item:pointer-events-auto peer-hover/menu-button:pointer-events-auto'
              />
            </div>
          </SidebarMenuButton>
          {/* Expanded mode trigger to the right of text */}
          <SidebarTrigger
            className='size-6 ms-1 inline-flex z-10 transition-opacity group-data-[collapsible=icon]:hidden'
          />
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
