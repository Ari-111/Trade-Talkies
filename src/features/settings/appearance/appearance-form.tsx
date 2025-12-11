import { z } from 'zod'
import { type SVGProps } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { fonts } from '@/config/fonts'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { cn } from '@/lib/utils'
import { useFont } from '@/context/font-provider'
import { useTheme } from '@/context/theme-provider'
import { useDirection } from '@/context/direction-provider'
import { useLayout } from '@/context/layout-provider'
import { useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { SelectDropdown } from '@/components/select-dropdown'
import { CircleCheck } from 'lucide-react'
import { Root as Radio, Item } from '@radix-ui/react-radio-group'
import { IconLayoutDefault } from '@/assets/custom/icon-layout-default'
import { IconLayoutCompact } from '@/assets/custom/icon-layout-compact'
import { IconLayoutFull } from '@/assets/custom/icon-layout-full'
import { IconThemeDark } from '@/assets/custom/icon-theme-dark'
import { IconThemeLight } from '@/assets/custom/icon-theme-light'
import { IconThemeSystem } from '@/assets/custom/icon-theme-system'
import { IconSidebarInset } from '@/assets/custom/icon-sidebar-inset'
import { IconSidebarFloating } from '@/assets/custom/icon-sidebar-floating'
import { IconSidebarSidebar } from '@/assets/custom/icon-sidebar-sidebar'
import { IconDir } from '@/assets/custom/icon-dir'

const appearanceFormSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']),
  variant: z.enum(['inset', 'floating', 'sidebar']),
  layout: z.enum(['default', 'icon', 'offcanvas']),
  direction: z.enum(['ltr', 'rtl']),
  font: z.enum(fonts),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

export function AppearanceForm() {
  const { font, setFont, resetFont } = useFont()
  const { theme, setTheme, resetTheme } = useTheme()
  const { defaultDir, dir, setDir } = useDirection()
  const { collapsible, setCollapsible, variant, setVariant, resetLayout } = useLayout()
  const { open, setOpen } = useSidebar()

  // This can come from your database or API.
  const defaultValues: Partial<AppearanceFormValues> = {
    theme: theme as 'system' | 'light' | 'dark',
    variant,
    layout: (open ? 'default' : collapsible) as 'default' | 'icon' | 'offcanvas',
    direction: dir,
    font,
  }

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues,
  })

  function onSubmit(data: AppearanceFormValues) {
    if (data.font !== font) setFont(data.font)
    if (data.theme !== theme) setTheme(data.theme)

    if (data.variant !== variant) setVariant(data.variant)

    // Layout handling mirrors ConfigDrawer behavior
    if (data.layout === 'default') {
      if (!open) setOpen(true)
    } else {
      if (open) setOpen(false)
      if (data.layout !== collapsible) setCollapsible(data.layout)
    }

    if (data.direction !== dir) setDir(data.direction)

    showSubmittedData(data)
  }

  // Visual radio item reused from the previous Theme Settings drawer
  function VisualRadioItem({
    item,
    isTheme,
  }: {
    item: {
      value: string
      label: string
      icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement
    }
    isTheme?: boolean
  }) {
    return (
      <Item
        value={item.value}
        className='group outline-none transition duration-200 ease-in'
        aria-label={`Select ${item.label.toLowerCase()}`}
        aria-describedby={`${item.value}-description`}
      >
        <div
          className='ring-border relative rounded-[6px] ring-[1px] group-data-[state=checked]:ring-primary group-data-[state=checked]:shadow-2xl group-focus-visible:ring-2'
          role='img'
          aria-hidden='false'
          aria-label={`${item.label} option preview`}
        >
          <CircleCheck
            className='fill-primary size-6 stroke-white group-data-[state=unchecked]:hidden absolute top-0 right-0 translate-x-1/2 -translate-y-1/2'
            aria-hidden='true'
          />
          <item.icon
            className={cn(
              !isTheme &&
                'stroke-primary fill-primary group-data-[state=unchecked]:stroke-muted-foreground group-data-[state=unchecked]:fill-muted-foreground'
            )}
            aria-hidden='true'
          />
        </div>
        <div className='mt-1 text-xs' id={`${item.value}-description`} aria-live='polite'>
          {item.label}
        </div>
      </Item>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 sm:space-y-6'>
        {/* Theme with visual figures */}
        <div className='relative rounded-2xl border border-white/30 dark:border-white/20 bg-white/55 dark:bg-slate-900/30 backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(255,255,255,0.06)] p-4 sm:p-5'>
          <FormField
            control={form.control}
            name='theme'
            render={({ field }) => (
              <FormItem className='space-y-3'>
                <FormLabel className='text-sm'>Theme</FormLabel>
                <FormDescription className='text-xs'>Adjust the app color scheme.</FormDescription>
                <FormControl>
                  <Radio
                    value={field.value}
                    onValueChange={field.onChange}
                    className='grid w-full max-w-md grid-cols-3 gap-4'
                    aria-label='Select theme preference'
                    aria-describedby='theme-description'
                  >
                    {[
                      { value: 'system', label: 'System', icon: IconThemeSystem },
                      { value: 'light', label: 'Light', icon: IconThemeLight },
                      { value: 'dark', label: 'Dark', icon: IconThemeDark },
                    ].map((item) => (
                      <VisualRadioItem key={item.value} item={item} isTheme />
                    ))}
                  </Radio>
                </FormControl>
                <div id='theme-description' className='sr-only'>
                  Choose between system preference, light mode, or dark mode
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Sidebar variant with visual figures */}
        <div className='relative rounded-2xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-slate-900/25 backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_16px_rgba(255,255,255,0.05)] p-4 sm:p-5'>
          <FormField
            control={form.control}
            name='variant'
            render={({ field }) => (
              <FormItem className='space-y-3'>
                <FormLabel className='text-sm'>Sidebar</FormLabel>
                <FormDescription className='text-xs'>Choose inset, floating, or standard sidebar.</FormDescription>
                <FormControl>
                  <Radio
                    value={field.value}
                    onValueChange={field.onChange}
                    className='grid w-full max-w-md grid-cols-3 gap-4'
                    aria-label='Select sidebar style'
                    aria-describedby='sidebar-description'
                  >
                    {[
                      { value: 'inset', label: 'Inset', icon: IconSidebarInset },
                      { value: 'floating', label: 'Floating', icon: IconSidebarFloating },
                      { value: 'sidebar', label: 'Sidebar', icon: IconSidebarSidebar },
                    ].map((item) => (
                      <VisualRadioItem key={item.value} item={item} />
                    ))}
                  </Radio>
                </FormControl>
                <div id='sidebar-description' className='sr-only'>
                  Choose between inset, floating, or standard sidebar layout
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Layout with visual figures */}
        <div className='relative rounded-2xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-slate-900/25 backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_16px_rgba(255,255,255,0.05)] p-4 sm:p-5'>
          <FormField
            control={form.control}
            name='layout'
            render={({ field }) => (
              <FormItem className='space-y-3'>
                <FormLabel className='text-sm'>Layout</FormLabel>
                <FormDescription className='text-xs'>Default expanded, compact icon-only, or full layout.</FormDescription>
                <FormControl>
                  <Radio
                    value={field.value}
                    onValueChange={field.onChange}
                    className='grid w-full max-w-md grid-cols-3 gap-4'
                    aria-label='Select layout style'
                    aria-describedby='layout-description'
                  >
                    {[
                      { value: 'default' as const, label: 'Default', icon: IconLayoutDefault },
                      { value: 'icon' as const, label: 'Compact', icon: IconLayoutCompact },
                      { value: 'offcanvas' as const, label: 'Full layout', icon: IconLayoutFull },
                    ].map((item) => (
                      <VisualRadioItem key={item.value} item={item} />
                    ))}
                  </Radio>
                </FormControl>
                <div id='layout-description' className='sr-only'>
                  Choose between default expanded, compact icon-only, or full layout mode
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Direction with visual figures */}
        <div className='relative rounded-2xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-slate-900/25 backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_16px_rgba(255,255,255,0.05)] p-4 sm:p-5'>
          <FormField
            control={form.control}
            name='direction'
            render={({ field }) => (
              <FormItem className='space-y-3'>
                <FormLabel className='text-sm'>Direction</FormLabel>
                <FormDescription className='text-xs'>Left-to-right or right-to-left.</FormDescription>
                <FormControl>
                  <Radio
                    value={field.value}
                    onValueChange={field.onChange}
                    className='grid w-full max-w-md grid-cols-2 gap-4'
                    aria-label='Select site direction'
                    aria-describedby='direction-description'
                  >
                    {[
                      {
                        value: 'ltr',
                        label: 'Left to Right',
                        icon: (props: SVGProps<SVGSVGElement>) => (
                          <IconDir dir='ltr' {...props} />
                        ),
                      },
                      {
                        value: 'rtl',
                        label: 'Right to Left',
                        icon: (props: SVGProps<SVGSVGElement>) => (
                          <IconDir dir='rtl' {...props} />
                        ),
                      },
                    ].map((item) => (
                      <VisualRadioItem key={item.value} item={item} />
                    ))}
                  </Radio>
                </FormControl>
                <div id='direction-description' className='sr-only'>
                  Choose between left-to-right or right-to-left site direction
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Font */}
        <div className='relative rounded-2xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-slate-900/25 backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_16px_rgba(255,255,255,0.05)] p-4 sm:p-5'>
          <FormField
            control={form.control}
            name='font'
            render={({ field }) => (
              <FormItem className='space-y-2'>
                <FormLabel className='text-sm'>Font</FormLabel>
                <div className='relative w-[220px]'>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    isControlled
                    items={fonts.map((f) => ({ label: f, value: f }))}
                    className='w-full rounded-lg border border-black/10 dark:border-white/20 ring-1 ring-black/10 dark:ring-white/10 bg-white/70 dark:bg-slate-900/35 backdrop-blur-md px-3 py-2 text-sm'
                    contentClassName='rounded-xl border border-black/10 dark:border-white/20 bg-white/85 dark:bg-slate-900/80 backdrop-blur-md ring-1 ring-black/10 dark:ring-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_16px_rgba(255,255,255,0.05)]'
                    itemClassName='rounded-md px-3 py-2 text-sm focus:bg-black/10 dark:focus:bg-white/12 focus:text-foreground'
                  />
                </div>
                <FormDescription className='text-xs font-manrope'>
                  Set the font you want to use in the dashboard.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex items-center justify-between gap-3'>
          <Button
            type='button'
            variant='ghost'
            className='rounded-lg'
            onClick={() => {
              // Reset everything to app defaults
              resetTheme()
              resetFont()
              resetLayout()
              setOpen(true)
              setDir(defaultDir)
            }}
          >
            Reset
          </Button>
          <Button type='submit' variant='secondary' className='rounded-lg'>Update preferences</Button>
        </div>
      </form>
    </Form>
  )
}
