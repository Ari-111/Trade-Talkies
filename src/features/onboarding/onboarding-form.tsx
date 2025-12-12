import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

const SUGGESTED_INTERESTS = [
  'Stocks', 'Crypto', 'Forex', 'Options', 'Tech', 'News', 'Startups', 'Investing', 'Real Estate', 'College'
]

export function OnboardingForm() {
  const navigate = useNavigate()
  const { user, token, setUserProfile } = useAuthStore()
  const [username, setUsername] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [customInterest, setCustomInterest] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddInterest = (interest: string) => {
    if (!interests.includes(interest)) {
      setInterests([...interests, interest])
    }
    setCustomInterest('')
  }

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      toast.error('Username is required')
      return
    }
    if (interests.length === 0) {
      toast.error('Please select at least one interest')
      return
    }

    setLoading(true)
    try {
      const res = await axios.post('http://localhost:8000/api/users/onboarding', {
        uid: user?.uid,
        email: user?.email,
        username,
        interests
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setUserProfile(res.data)
      toast.success('Profile updated!')
      navigate({ to: '/trade-talkies', search: { tab: 'discover' } })
    } catch (error) {
      console.error(error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Welcome to Trade Talkies!</CardTitle>
          <CardDescription>Let's set up your profile to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="How should we call you?"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Interests</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {SUGGESTED_INTERESTS.map(interest => (
                  <Badge
                    key={interest}
                    variant={interests.includes(interest) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleAddInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom interest..."
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (customInterest.trim()) handleAddInterest(customInterest.trim())
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    if (customInterest.trim()) handleAddInterest(customInterest.trim())
                  }}
                >
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {interests.map(interest => (
                  <Badge key={interest} variant="secondary" className="pl-2 pr-1 py-1">
                    {interest}
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
