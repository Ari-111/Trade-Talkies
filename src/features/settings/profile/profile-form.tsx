import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/stores/auth-store'
import { useEffect } from 'react'
import { toast } from 'sonner'
import axios from 'axios'

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, 'Username must be at least 2 characters.')
    .max(30, 'Username must not be longer than 30 characters.'),
  email: z.string().email(),
  interests: z.string().optional(), // Comma separated for now
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const { user, userProfile, token, setUserProfile } = useAuthStore()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
      email: '',
      interests: '',
    },
    mode: 'onChange',
  })

  useEffect(() => {
    if (user || userProfile) {
      form.reset({
        username: userProfile?.username || user?.displayName || '',
        email: userProfile?.email || user?.email || '',
        interests: userProfile?.interests?.join(', ') || '',
      })
    }
  }, [user, userProfile, form])

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const interests = data.interests ? data.interests.split(',').map(i => i.trim()).filter(Boolean) : []
      
      const res = await axios.post('http://localhost:8000/api/users/onboarding', {
        uid: user?.uid,
        email: data.email,
        username: data.username,
        interests
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setUserProfile(res.data)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error(error)
      toast.error('Failed to update profile')
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8'
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder='shadcn' {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormDescription>
                You can manage verified email addresses in your email settings.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='interests'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interests</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Stocks, Crypto, Tech'
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Comma-separated list of your interests.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit'>Update profile</Button>
      </form>
    </Form>
  )
}
