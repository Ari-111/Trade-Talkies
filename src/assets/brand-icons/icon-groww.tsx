import { type SVGProps } from 'react'
import { cn } from '@/lib/utils'

export function IconGroww({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      role='img'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      className={cn(className)}
      {...props}
    >
      <title>Groww</title>
      <defs>
        <linearGradient id='growwGradient' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stopColor='#00C389' />
          <stop offset='100%' stopColor='#1DB5E5' />
        </linearGradient>
      </defs>
      <circle cx='12' cy='12' r='10' fill='url(#growwGradient)' />
      <path
        d='M5 14c2.5-2.5 4.5-3.5 7-1s4.5 1.5 7-1'
        fill='none'
        stroke='#ffffff'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}