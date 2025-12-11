import { ContentSection } from '../components/content-section'
import { Link } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronRight } from 'lucide-react'
import * as React from 'react'
import { useProfileStore } from '@/stores/profile-store'
import { useAuthStore } from '@/stores/auth-store'

export function SettingsProfile() {
  const { avatarUrl, setAvatarFile } = useProfileStore()
  const { userProfile } = useAuthStore()
  const fileRef = React.useRef<HTMLInputElement | null>(null)

  const onAvatarClick = () => {
    fileRef.current?.click()
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      void setAvatarFile(file)
      // reset input value so same file can be reselected if needed
      e.target.value = ''
    }
  }

  return (
    <ContentSection title='Settings › Profile' desc='Manage your profile and preferences' titleClassName='text-base' descClassName='text-xs' compact>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
        <div className='relative rounded-2xl border border-white/30 dark:border-white/20 bg-white/55 dark:bg-slate-900/30 backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(255,255,255,0.06)] p-4 sm:p-5 md:col-span-2'>
          <div className='grid grid-cols-[1fr_auto] grid-rows-[auto_auto] gap-x-4 gap-y-2 items-center'>
            <div className='min-w-0 row-start-1 col-start-1'>
              <div className='text-2xl font-bold sm:text-3xl leading-tight'>
                <span>Hi,</span>
                <br />
                <span>{userProfile?.username || 'User'}</span>
              </div>
            </div>
            <div className='flex flex-col items-center gap-2 self-start row-start-1 col-start-2'>
              <input ref={fileRef} type='file' accept='image/*' className='hidden' onChange={onFileChange} />
              <Avatar onClick={onAvatarClick} title='Change profile picture' className='h-16 w-16 sm:h-20 sm:w-20 ring-1 ring-black/10 dark:ring-white/20 cursor-pointer hover:ring-foreground/30'>
                <AvatarImage src={avatarUrl ?? '/avatars/shadcn.jpg'} alt='Profile' />
                <AvatarFallback>{userProfile?.username?.slice(0, 2).toUpperCase() || 'US'}</AvatarFallback>
              </Avatar>
            </div>
            <div className='text-sm text-muted-foreground truncate row-start-2 col-start-1'>{userProfile?.email || 'No email'}</div>
            <div className='row-start-2 col-start-2 justify-self-end self-end'>
              <Link to='/settings/account' aria-label='Edit profile' className='inline-flex items-center justify-center'>
                <ChevronRight className='size-5 text-muted-foreground hover:text-foreground transition-colors' />
              </Link>
            </div>
          </div>
        </div>

        <div className='relative rounded-2xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-slate-900/25 backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_16px_rgba(255,255,255,0.05)] px-4 py-3 sm:px-5 sm:py-4 overflow-hidden'>
          <img src='/images/bhaipoints.png' alt='Bhai Points banner' className='absolute inset-0 w-full h-full object-cover rounded-2xl opacity-90 pointer-events-none' />
          <div className='relative flex items-center justify-between gap-3'>
            <div className='min-w-0'>
              <div className='text-sm font-medium'>Bhai Points</div>
              <div className='text-xs text-muted-foreground'>Your reward progress</div>
            </div>
          </div>
        </div>

        <div className='relative rounded-2xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-slate-900/25 backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_16px_rgba(255,255,255,0.05)]'>
          <div className='px-4 pt-3 sm:px-5 sm:pt-3'>
            <span className='text-xs text-muted-foreground'>Accessibility</span>
          </div>
          <ul className='divide-y divide-black/10 dark:divide-white/15'>
            <li>
              <Link to='/settings/appearance' className='flex items-center justify-between px-4 py-4 sm:px-5 hover:bg-black/5 dark:hover:bg-white/5'>
                <span className='text-sm sm:text-base'>Appearance</span>
                <ChevronRight className='size-4 opacity-70' />
              </Link>
            </li>
            <li>
              <Link to='/settings/notifications' className='flex items-center justify-between px-4 py-4 sm:px-5 hover:bg-black/5 dark:hover:bg-white/5'>
                <span className='text-sm sm:text-base'>Notifications</span>
                <ChevronRight className='size-4 opacity-70' />
              </Link>
            </li>
            
          </ul>
        </div>
      </div>
    </ContentSection>
  )
}
