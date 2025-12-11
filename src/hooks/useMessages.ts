import { useState, useEffect, useCallback } from 'react'
import { useSocket } from './useSocket'
import { useAuthStore } from '@/stores/auth-store'
import axios from 'axios'

export interface Message {
  _id: string
  userId: string
  username: string
  userAvatar?: string
  message: string
  type: 'text' | 'image' | 'system'
  imageUrl?: string
  createdAt: string
  channelId: string
}

export const useMessages = (channelId: string = 'general') => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const socket = useSocket()
  const { token, userProfile } = useAuthStore()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

  const fetchMessages = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const response = await axios.get(`${apiUrl}/messages/${channelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessages(response.data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setIsLoading(false)
    }
  }, [channelId, token, apiUrl])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  useEffect(() => {
    if (!socket) return

    socket.emit('join_channel', channelId)

    const handleNewMessage = (newMessage: Message) => {
      if (newMessage.channelId === channelId) {
        setMessages((prev) => [...prev, newMessage])
      }
    }

    socket.on('receive_message', handleNewMessage)

    return () => {
      socket.off('receive_message', handleNewMessage)
    }
  }, [socket, channelId])

  const sendMessage = async (content: string, type: 'text' | 'image' = 'text', imageUrl?: string) => {
    if (!socket || !token) return

    // Optimistic update could be added here
    
    socket.emit('send_message', {
      message: content,
      channelId,
      type,
      imageUrl,
      username: userProfile?.username || 'User',
      userAvatar: userProfile?.photoURL
    })
  }

  return { messages, isLoading, sendMessage }
}
