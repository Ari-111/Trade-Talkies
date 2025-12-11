'use client'

import { motion, useMotionValue, useSpring, useTransform, type SpringOptions, type MotionValue, AnimatePresence } from 'motion/react'
import React, { Children, cloneElement, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronUp } from 'lucide-react'

export type DockItemData = {
  icon: React.ReactNode
  label: React.ReactNode
  onClick: () => void
  className?: string
  active?: boolean
}

export type DockProps = {
  items: DockItemData[]
  className?: string
  distance?: number
  panelHeight?: number
  baseItemSize?: number
  dockHeight?: number
  magnification?: number
  spring?: SpringOptions
  onSwipeUp?: () => void
  collapsed?: boolean
}

type DockItemProps = {
  className?: string
  children: React.ReactNode
  onClick?: () => void
  mouseX: MotionValue<number>
  isPressing?: MotionValue<number>
  spring: SpringOptions
  distance: number
  baseItemSize: number
  magnification: number
  active?: boolean
}

function DockItem({
  children,
  className = '',
  onClick,
  mouseX,
  isPressing,
  spring,
  distance,
  magnification,
  baseItemSize,
  active = false,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isHovered = useMotionValue(0)

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize,
    }
    return val - rect.x - baseItemSize / 2
  })

  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize])
  const size = useSpring(targetSize, spring)

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size,
      }}
      animate={{ scale: active ? 1.1 : 1, y: active ? -6 : 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 20 }}
      onPointerEnter={() => {
        isHovered.set(1)
        if (isPressing?.get() === 1 && onClick) {
          onClick()
        }
      }}
      onPointerLeave={() => isHovered.set(0)}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-xl bg-black/8 dark:bg-white/12 backdrop-blur-md border border-black/12 dark:border-white/25 ring-1 ring-black/10 dark:ring-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(255,255,255,0.08)] transition-colors hover:bg-black/10 dark:hover:bg-white/14 focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/30 ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {Children.map(children, (child) =>
        React.isValidElement(child)
          ? cloneElement(child as React.ReactElement<{ isHovered?: MotionValue<number> }>, { isHovered })
          : child
      )}
    </motion.div>
  )
}

type DockLabelProps = {
  className?: string
  children: React.ReactNode
  isHovered?: MotionValue<number>
}

function DockLabel({ children, className = '', isHovered }: DockLabelProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!isHovered) return
    const unsubscribe = isHovered.on('change', (latest) => {
      setIsVisible(latest === 1)
    })
    return () => unsubscribe()
  }, [isHovered])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`${className} absolute -top-6 left-1/2 w-fit whitespace-pre rounded-md border border-black/10 dark:border-white/30 bg-black/8 dark:bg-white/10 backdrop-blur-md px-2 py-0.5 text-xs text-neutral-800 dark:text-white shadow-[0_2px_6px_rgba(0,0,0,0.10)] dark:shadow-[0_2px_6px_rgba(255,255,255,0.12)]`}
          role="tooltip"
          style={{ x: '-50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

type DockIconProps = {
  className?: string
  children: React.ReactNode
  isHovered?: MotionValue<number>
}

function DockIcon({ children, className = '' }: DockIconProps) {
  return <div className={`flex items-center justify-center ${className}`}>{children}</div>
}

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 64,
  dockHeight = 256,
  baseItemSize = 50,
  onSwipeUp,
  collapsed = false,
}: DockProps) {
  const mouseX = useMotionValue(Infinity)
  const isHovered = useMotionValue(0)
  const isPressing = useMotionValue(0)
  const startYRef = useRef<number | null>(null)
  const swipeTriggeredRef = useRef(false)

  const maxHeight = useMemo(() => Math.max(dockHeight, magnification + magnification / 2 + 4), [magnification, dockHeight])
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight])
  const height = useSpring(heightRow, spring)

  return (
    <motion.div style={{ height, scrollbarWidth: 'none', touchAction: 'pan-y' }} className="mx-2 flex max-w-full items-center select-none">
      <motion.div
        onPointerDown={(e) => {
          isHovered.set(1)
          isPressing.set(1)
          mouseX.set(e.clientX)
          startYRef.current = e.clientY
          swipeTriggeredRef.current = false
        }}
        onPointerMove={(e) => {
          isHovered.set(1)
          mouseX.set(e.clientX)
          if (isPressing.get() === 1 && startYRef.current != null && !swipeTriggeredRef.current) {
            const deltaY = startYRef.current - e.clientY
            if (deltaY > 48) {
              swipeTriggeredRef.current = true
              onSwipeUp?.()
            }
          }
        }}
        onPointerUp={() => {
          isHovered.set(0)
          isPressing.set(0)
          mouseX.set(Infinity)
          startYRef.current = null
          swipeTriggeredRef.current = false
        }}
        onPointerCancel={() => {
          isHovered.set(0)
          isPressing.set(0)
          mouseX.set(Infinity)
          startYRef.current = null
          swipeTriggeredRef.current = false
        }}
        onPointerLeave={() => {
          isHovered.set(0)
          isPressing.set(0)
          mouseX.set(Infinity)
          startYRef.current = null
          swipeTriggeredRef.current = false
        }}
        className={`${className} absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-end w-fit gap-4 rounded-3xl bg-black/10 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/30 ring-1 ring-black/10 dark:ring-white/15 shadow-[0_2px_10px_rgba(0,0,0,0.10)] dark:shadow-[0_2px_10px_rgba(255,255,255,0.10)] pb-2 px-4 ${collapsed ? 'pointer-events-none' : 'pointer-events-auto'}`}
        animate={{ y: collapsed ? 80 : 0, opacity: collapsed ? 0 : 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        {/* caret chevron above dock */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSwipeUp?.()
          }}
          onPointerDownCapture={(e) => e.stopPropagation()}
          onPointerUpCapture={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onSwipeUp?.()
            }
          }}
          aria-label="Open apps"
          title="All Pages"
          className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-auto text-neutral-700 dark:text-white opacity-70 hover:opacity-100"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            isPressing={isPressing}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
            active={item.active}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  )
}
