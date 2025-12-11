import { useEffect } from 'react'
import { onIdTokenChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuthStore } from '@/stores/auth-store'
import axios from 'axios'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setToken, setLoading, setUserProfile } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        const token = await user.getIdToken()
        setToken(token)
        
        // Fetch user profile from backend
        try {
          const res = await axios.get(`http://localhost:8000/api/users/${user.uid}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setUserProfile(res.data)
        } catch (error) {
          console.error('Error fetching user profile:', error)
          setUserProfile(null)
        }
      } else {
        setToken(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [setUser, setToken, setLoading, setUserProfile])

  return <>{children}</>
}
