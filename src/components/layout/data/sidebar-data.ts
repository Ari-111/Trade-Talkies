import { Monitor, Bell, Palette, Settings, Wrench, UserCog, Users2 } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'User',
    email: 'user@moneybh.ai',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Moneybh.Ai',
      logo: Users2,
      plan: 'your financial assistant',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Trade Talkies',
          url: '/trade-talkies',
          icon: Users2,
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
      ],
    },
  ],
}
