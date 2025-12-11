import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'

const notificationsFormSchema = z.object({
  type: z.enum(['all', 'mentions', 'none'], {
    error: (iss) =>
      iss.input === undefined
        ? 'Please select a notification type.'
        : undefined,
  }),
  mobile: z.boolean().default(false).optional(),
  communication_emails: z.boolean().default(false).optional(),
  marketing_emails: z.boolean().default(false).optional(),
  security_emails: z.boolean(),
})

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>

// This can come from your database or API.
const defaultValues: Partial<NotificationsFormValues> = {
  communication_emails: false,
  marketing_emails: false,
  security_emails: true,
}

export function NotificationsForm() {
  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues,
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => showSubmittedData(data))}
        className='space-y-4 sm:space-y-6'
      >
        {/* Notify me about... */}
        <div className='relative rounded-2xl border border-white/30 dark:border-white/20 bg-white/55 dark:bg-slate-900/30 backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(255,255,255,0.06)] p-4 sm:p-5'>
          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem className='space-y-3'>
                <FormLabel className='text-sm'>Notify me about...</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className='flex flex-col gap-2'
                  >
                    <FormItem className='flex items-center gap-3'>
                      <FormControl>
                        <RadioGroupItem value='all' />
                      </FormControl>
                      <FormLabel className='font-normal'>All new messages</FormLabel>
                    </FormItem>
                    <FormItem className='flex items-center gap-3'>
                      <FormControl>
                        <RadioGroupItem value='mentions' />
                      </FormControl>
                      <FormLabel className='font-normal'>Direct messages and mentions</FormLabel>
                    </FormItem>
                    <FormItem className='flex items-center gap-3'>
                      <FormControl>
                        <RadioGroupItem value='none' />
                      </FormControl>
                      <FormLabel className='font-normal'>Nothing</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Email notifications list */}
        <div className='relative rounded-2xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-slate-900/25 backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_16px_rgba(255,255,255,0.05)]'>
          <div className='px-4 pt-3 sm:px-5 sm:pt-3'>
            <span className='text-sm font-medium'>Email Notifications</span>
          </div>
          <ul className='divide-y divide-black/10 dark:divide-white/15'>
            <li>
              <FormField
                control={form.control}
                name='communication_emails'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between px-4 py-4 sm:px-5'>
                    <div className='min-w-0'>
                      <FormLabel className='text-base'>Communication emails</FormLabel>
                      <FormDescription>Receive emails about your account activity.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </li>
            <li>
              <FormField
                control={form.control}
                name='marketing_emails'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between px-4 py-4 sm:px-5'>
                    <div className='min-w-0'>
                      <FormLabel className='text-base'>Marketing emails</FormLabel>
                      <FormDescription>Receive emails about new products, features, and more.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </li>
            <li>
              {/* Removed: Social emails option */}
            </li>
            <li>
              <FormField
                control={form.control}
                name='security_emails'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between px-4 py-4 sm:px-5'>
                    <div className='min-w-0'>
                      <FormLabel className='text-base'>Security emails</FormLabel>
                      <FormDescription>Receive emails about your account activity and security.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled aria-readonly />
                    </FormControl>
                  </FormItem>
                )}
              />
            </li>
          </ul>
        </div>

        {/* Mobile settings note */}
        <div className='relative rounded-2xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-slate-900/25 backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_16px_rgba(255,255,255,0.05)] px-4 py-3 sm:px-5 sm:py-4'>
          <FormField
            control={form.control}
            name='mobile'
            render={({ field }) => (
              <FormItem className='flex items-start gap-3'>
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel className='text-sm'>Use different settings for my mobile devices</FormLabel>
                  <FormDescription>
                    You can manage your mobile notifications in the{' '}
                    <Link to='/settings' className='underline decoration-dashed underline-offset-4 hover:decoration-solid'>
                      mobile settings
                    </Link>{' '}
                    page.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className='flex justify-end'>
          <Button type='submit' variant='secondary' className='rounded-lg'>Update notifications</Button>
        </div>
      </form>
    </Form>
  )
}
