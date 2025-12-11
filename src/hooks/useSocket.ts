import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth-store'
import { create } from 'zustand'

interface SocketState {
  socket: Socket | null
  isConnected: boolean
  setSocket: (socket: Socket | null) => void
  setIsConnected: (isConnected: boolean) => void
}

export const useSocketStore = create<SocketState>((set) => ({
  socket: null,
  isConnected: false,
  setSocket: (socket) => set({ socket }),
  setIsConnected: (isConnected) => set({ isConnected }),
}))

export const useSocket = () => {
  const { token, user } = useAuthStore()
  const { socket, setSocket, setIsConnected } = useSocketStore()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    // Avoid reconnecting if token hasn't changed significantly or if already connected
    // But we need to update auth token if it changes.
    // Socket.io auth option is sent on handshake.
    
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000'
    
    if (!socketRef.current) {
      socketRef.current = io(socketUrl, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      socketRef.current.on('connect', () => {
        console.log('Socket connected')
        setIsConnected(true)
      })

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected')
        setIsConnected(false)
      })

      socketRef.current.on('connect_error', (err) => {
        console.error('Socket connection error:', err)
      })

      setSocket(socketRef.current)
    } else {
        // If socket exists, update the auth token for future reconnections?
        // Socket.io doesn't support dynamic auth update easily without reconnect.
        // For now, we assume token refresh might trigger a re-mount or we can handle it if needed.
        if (socketRef.current.auth) {
            (socketRef.current.auth as any).token = token;
        }
    }

    return () => {
      // Cleanup on unmount? Maybe not if we want persistent connection across pages.
      // But if token changes (logout), we disconnect.
    }
  }, [token, user, setSocket, setIsConnected])

  return socket
}
