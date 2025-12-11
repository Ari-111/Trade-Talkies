import { type SVGProps } from 'react'
import { cn } from '@/lib/utils'

export function IconZerodha({ className, ...props }: SVGProps<SVGSVGElement>) {
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
      <title>Zerodha</title>
      <rect x='2' y='2' width='20' height='20' rx='4' fill='#0B5FFF' />
      <path
        d='M7 8h10l-10 8h10'
        fill='none'
        stroke='#ffffff'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}