import { create } from 'zustand'
import { User } from 'firebase/auth'

export interface UserProfile {
  _id: string
  uid: string
  username: string
  email: string
  interests: string[]
  photoURL?: string
  displayName?: string
}

interface AuthState {
  user: User | null
  token: string | null
  userProfile: UserProfile | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setUserProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  userProfile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setUserProfile: (userProfile) => set({ userProfile }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, token: null, userProfile: null }),
}))
