import { create } from 'zustand'

const LS_KEY = 'profile_avatar_url'

type ProfileState = {
  avatarUrl: string | null
  setAvatarUrl: (url: string | null) => void
  setAvatarFile: (file: File) => Promise<void>
  reset: () => void
}

function getInitialAvatar(): string | null {
  try {
    if (typeof window === 'undefined') return null
    const v = window.localStorage.getItem(LS_KEY)
    return v ? v : null
  } catch {
    return null
  }
}

export const useProfileStore = create<ProfileState>()((set) => ({
  avatarUrl: getInitialAvatar(),
  setAvatarUrl: (url) => {
    try {
      if (typeof window !== 'undefined') {
        if (url) window.localStorage.setItem(LS_KEY, url)
        else window.localStorage.removeItem(LS_KEY)
      }
    } catch { void 0 }
    set((state) => ({ ...state, avatarUrl: url }))
  },
  setAvatarFile: async (file: File) => {
    if (!file || !file.type.startsWith('image/')) return
    const toDataUrl = (f: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(f)
      })
    try {
      const dataUrl = await toDataUrl(file)
      set((state) => {
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(LS_KEY, dataUrl)
          }
        } catch { void 0 }
        return { ...state, avatarUrl: dataUrl }
      })
    } catch { void 0 }
  },
  reset: () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(LS_KEY)
      }
    } catch { void 0 }
    set((state) => ({ ...state, avatarUrl: null }))
  },
}))
