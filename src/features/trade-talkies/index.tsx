import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Plus, MoreVertical, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { RoomsSidebarInline } from './components/rooms-sidebar-inline'
import { RoomsSidebarSheet } from './components/rooms-sidebar-sheet'
import { ChatInputBar } from './components/chat-input-bar'
import { ScrollToLatestButton } from './components/scroll-to-latest-button'
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'
import { useMessages } from '@/hooks/useMessages'
import { useAuthStore } from '@/stores/auth-store'
import axios from 'axios'
import { toast } from 'sonner'

const DEFAULT_BANNERS = [
  'https://images.unsplash.com/photo-1611974765270-ca1258634369?q=80&w=600&auto=format&fit=crop', // Trading/Charts
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=600&auto=format&fit=crop', // Stock Market
  'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=600&auto=format&fit=crop', // Crypto
  'https://images.unsplash.com/photo-1526304640152-d4619684e484?q=80&w=600&auto=format&fit=crop', // Finance
]

type Role = 'owner' | 'admin' | 'moderator' | 'member'
// Backend Message Type
type Message = {
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

type Channel = { id: string; name: string; type: 'text' }
type Member = { id: string; name: string; role: Role }
type Room = {
  id: string
  name: string
  icon?: string
  banner?: string
  isPublic: boolean
  memberCount: number
  role: Role // current user role in this room
  joined: boolean // whether current user has joined
  channels: Channel[]
  members: Member[]
  tags?: string[]
  ageLimit?: number
}

// Helper: map role to a compact badge label
function roleToBadge(role: Role | 'system') {
  switch (role) {
    case 'owner':
      return 'Owner'
    case 'admin':
      return 'Admin'
    case 'moderator':
      return 'Moderator'
    case 'member':
      return 'Member'
    default:
      return 'System'
  }
}

// Helper: derive sender display name and badge from the room context
function getSenderInfo(message: Message, room: Room | null, currentUserId?: string) {
  if (message.type === 'system') {
    return { name: 'System', badge: roleToBadge('system') }
  }
  if (message.userId === currentUserId) {
    const badge = roleToBadge(room?.role ?? 'member')
    return { name: 'You', badge }
  }
  const member = room?.members.find((m) => m.id === message.userId)
  return { name: message.username || member?.name || 'User', badge: roleToBadge(member?.role ?? 'member') }
}



export function TradeTalkies({ initialTab = 'myRooms' }: { initialTab?: 'discover' | 'myRooms' }) {
  const [tab, setTab] = useState<'discover' | 'myRooms'>(initialTab)
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
  
  const { messages: backendMessages, sendMessage } = useMessages(selectedChannelId || '')
  const { user, token } = useAuthStore()

  const [createRoomOpen, setCreateRoomOpen] = useState(false)
  const [createRoomStep, setCreateRoomStep] = useState(1)
  const [createChannelOpen, setCreateChannelOpen] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [roomTags, setRoomTags] = useState('')
  const [roomTagList, setRoomTagList] = useState<string[]>([])
  const [ageGateEnabled, setAgeGateEnabled] = useState(false)
  const [ageLimit, setAgeLimit] = useState<number>(18)
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public')
  const [channelName, setChannelName] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [discoverQuery, setDiscoverQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile()
  const closeTimerRef = useRef<number | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const [atBottom, setAtBottom] = useState(true)
  
  const [previewActive, setPreviewActive] = useState(false)

  const [inputText, setInputText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [baseText, setBaseText] = useState('')

  const handleMicClick = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        
        let mimeType = 'audio/webm'
        let extension = 'webm'
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4'
          extension = 'mp4'
          if (!MediaRecorder.isTypeSupported(mimeType)) {
             console.warn('Neither audio/webm nor audio/mp4 supported. Using default.')
             mimeType = ''
             extension = 'webm' // Fallback assumption
          }
        }

        const options = mimeType ? { mimeType } : undefined
        const mediaRecorder = new MediaRecorder(stream, options)
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []
        setBaseText(inputText) // Save what user typed before speaking

        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
            
            // Create blob from ALL chunks so far to get full context
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || mediaRecorder.mimeType })
            const formData = new FormData()
            formData.append('audio', audioBlob, `recording.${extension}`)

            try {
              const response = await axios.post('http://localhost:8000/api/ai/transcribe', formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              })
              
              if (response.data.text) {
                // Replace text with base + new transcription
                setInputText((baseText ? baseText + ' ' : '') + response.data.text)
              }
            } catch (error) {
              console.error('Error transcribing audio chunk:', error)
            }
          }
        }

        mediaRecorder.onstop = () => {
           stream.getTracks().forEach(track => track.stop());
        }

        // Request data every 2 seconds to simulate streaming
        mediaRecorder.start(2000)
        setIsRecording(true)
      } catch (error) {
        console.error('Error accessing microphone:', error)
        toast.error('Microphone access denied')
      }
    }
  }

  // Fetch rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      if (!user || !token) return
      try {
        // Fetch joined rooms
        const joinedRes = await axios.get('http://localhost:8000/api/rooms/joined', {
          params: { uid: user.uid },
          headers: { Authorization: `Bearer ${token}` }
        })
        
        // Fetch recommended/public rooms for discover
        const publicRes = await axios.get('http://localhost:8000/api/rooms/recommended', {
          params: { uid: user.uid },
          headers: { Authorization: `Bearer ${token}` }
        })

        // Merge and format rooms
        const joinedRooms = joinedRes.data.map((r: any) => ({
          ...r,
          id: r._id,
          joined: true,
          role: r.ownerId === user.uid ? 'owner' : 'member',
          memberCount: r.members.length,
          channels: r.channels.map((c: any) => ({ ...c, id: c._id }))
        }))

        const publicRooms = publicRes.data.map((r: any) => ({
          ...r,
          id: r._id,
          joined: r.members.includes(user.uid),
          role: r.ownerId === user.uid ? 'owner' : 'member',
          memberCount: r.members.length,
          channels: r.channels.map((c: any) => ({ ...c, id: c._id }))
        }))

        // Combine unique rooms
        const allRoomsMap = new Map()
        joinedRooms.forEach((r: Room) => allRoomsMap.set(r.id, r))
        publicRooms.forEach((r: Room) => {
          if (!allRoomsMap.has(r.id)) allRoomsMap.set(r.id, r)
        })

        const allRooms = Array.from(allRoomsMap.values())
        setRooms(allRooms)

        // Select first joined room if available and nothing selected
        if (!selectedRoomId && joinedRooms.length > 0) {
          setSelectedRoomId(joinedRooms[0].id)
          if (joinedRooms[0].channels.length > 0) {
            setSelectedChannelId(joinedRooms[0].channels[0].id)
          }
        }
      } catch (error) {
        console.error('Error fetching rooms:', error)
      }
    }

    fetchRooms()
  }, [user, token])

  const selectedRoom = useMemo(() => rooms.find((r) => r.id === selectedRoomId) || null, [rooms, selectedRoomId])
  const selectedChannel = useMemo(
    () => selectedRoom?.channels.find((c) => c.id === selectedChannelId) || null,
    [selectedRoom, selectedChannelId]
  )

  const isJoined = selectedRoom?.joined ?? false

  const canManage = selectedRoom ? ['owner', 'admin'].includes(selectedRoom.role) : false
  const canModerate = selectedRoom ? ['owner', 'admin', 'moderator'].includes(selectedRoom.role) : false

  
  // Track scroll position to show/hide the older-messages banner
  // and smoothly jump to the latest messages when requested.
  const handleScrollCheck = () => {
    const el = messagesContainerRef.current
    if (!el) return
    const threshold = 72
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setAtBottom(distanceFromBottom < threshold)
  }

  // Attach scroll listener
  useEffect(() => {
    const el = messagesContainerRef.current
    if (!el) return
    const onScroll = () => handleScrollCheck()
    el.addEventListener('scroll', onScroll)
    // Initial check
    handleScrollCheck()
    return () => {
      el.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Always start at the latest message when switching channels
  useEffect(() => {
    const el = messagesContainerRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight
      setAtBottom(true)
    })
  }, [selectedChannelId])

  // Keep pointer at present when new messages arrive
  useEffect(() => {
    const el = messagesContainerRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight
      setAtBottom(true)
    })
  }, [backendMessages.length])

  const createRoom = async () => {
    if (!user) {
      toast.error('You must be logged in to create a room')
      return
    }
    const name = roomName.trim()
    if (!name) return
    const tags = (roomTagList.length
      ? roomTagList
      : roomTags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter((t) => t.length > 0))
    
    try {
      const res = await axios.post('http://localhost:8000/api/rooms', {
        name,
        description: 'A new community',
        tags,
        isPublic: privacy === 'public',
        ownerId: user?.uid,
        ageLimit: ageGateEnabled ? ageLimit : undefined,
        banner: bannerUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const newRoomData = res.data
      const newRoom: Room = {
        ...newRoomData,
        id: newRoomData._id,
        joined: true,
        role: 'owner',
        memberCount: 1,
        channels: newRoomData.channels.map((c: any) => ({ ...c, id: c._id })),
        members: [{ id: user?.uid || '', name: 'You', role: 'owner' }]
      }

      setRooms((prev) => [newRoom, ...prev])
      setSelectedRoomId(newRoom.id)
      setSelectedChannelId(newRoom.channels[0].id)
      setCreateRoomOpen(false)
      setRoomName('')
      setBannerUrl('')
      setRoomTags('')
      setRoomTagList([])
      setAgeGateEnabled(false)
      setAgeLimit(18)
      setPrivacy('public')
      setCreateRoomStep(1)
    } catch (error) {
      console.error('Error creating room:', error)
    }
  }

  // Tag helpers
  const addTag = (raw: string) => {
    const t = raw.trim().toLowerCase()
    if (!t) return
    setRoomTagList((prev) => (prev.includes(t) ? prev : [...prev, t]))
    setRoomTags('')
  }

  const removeTag = (tag: string) => {
    setRoomTagList((prev) => prev.filter((t) => t !== tag))
  }

  const createChannel = async () => {
    if (!selectedRoom) return
    const name = channelName.trim()
    if (!name) return

    try {
      const res = await axios.post(`http://localhost:8000/api/rooms/${selectedRoom.id}/channels`, {
        name,
        type: 'text'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const newChanData = res.data
      const newChan: Channel = { ...newChanData, id: newChanData._id }
      
      setRooms((prev) =>
        prev.map((room) =>
          room.id === selectedRoom.id ? { ...room, channels: [...room.channels, newChan] } : room
        )
      )
      setSelectedChannelId(newChan.id)
      setCreateChannelOpen(false)
      setChannelName('')
    } catch (error) {
      console.error('Error creating channel:', error)
    }
  }

  const joinRoom = async (roomId: string) => {
    try {
      await axios.post(`http://localhost:8000/api/rooms/${roomId}/join`, {
        uid: user?.uid
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setRooms((prev) =>
        prev.map((room) =>
          room.id === roomId
            ? { ...room, role: room.role || 'member', memberCount: room.memberCount + 1, joined: true }
            : room
        )
      )
      setSelectedRoomId(roomId)
      setTab('myRooms')
      setPreviewActive(false)
    } catch (error) {
      console.error('Error joining room:', error)
    }
  }

  const openPreview = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return
    setSelectedRoomId(roomId)
    setSelectedChannelId(room.channels[0]?.id ?? selectedChannelId)
    setTab('myRooms')
    setPreviewActive(!room.joined)
  }

  return (
    <>
      <Header
        fixed
        renderSidebarTrigger={false}
        leftAction={
          <Button
            variant="outline"
            size="icon"
            className="bg-black/8 dark:bg-white/12 backdrop-blur-md border border-black/10 dark:border-white/20"
            aria-label="Open communities sidebar"
            onClick={() => setSidebarOpen((prev) => !prev)}
            onMouseEnter={() => {
              if (!isMobile) {
                if (closeTimerRef.current) {
                  window.clearTimeout(closeTimerRef.current)
                  closeTimerRef.current = null
                }
                setSidebarOpen(true)
              }
            }}
            onMouseLeave={() => {
              if (!isMobile) {
                closeTimerRef.current = window.setTimeout(() => {
                  setSidebarOpen(false)
                  closeTimerRef.current = null
                }, 300)
              }
            }}
            onFocus={() => !isMobile && setSidebarOpen(true)}
            onBlur={() => !isMobile && setSidebarOpen(false)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        }
      >
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          {/* Theme and profile controls moved to Settings › Profile › Appearance */}
        </div>
      </Header>

      <Main fixed fluid className='relative flex h-full overflow-hidden px-0 py-0'>
        {!isMobile && (
          <RoomsSidebarInline
            open={sidebarOpen}
            rooms={rooms.map((r) => ({ id: r.id, name: r.name, memberCount: r.memberCount }))}
            selectedRoomId={selectedRoomId}
            onSelectRoom={(id) => {
              setTab('myRooms')
              setSelectedRoomId(id)
              const first = rooms.find((r) => r.id === id)?.channels[0]?.id
              if (first) setSelectedChannelId(first)
            }}
            onCreateRoomClick={() => setCreateRoomOpen(true)}
            onOpenChange={(open) => {
              if (closeTimerRef.current) {
                window.clearTimeout(closeTimerRef.current)
                closeTimerRef.current = null
              }
              setSidebarOpen(open)
            }}
            onDiscoverClick={() => setTab('discover')}
          />
        )}

        <div className='relative flex flex-1 min-h-0 flex-col gap-3 sm:gap-4 px-4 sm:px-6'>
          {/* Removed page heading and description to maximize chat area */}

          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as 'discover' | 'myRooms')}
            className='w-full flex-1 min-h-0 overflow-hidden'
          >
          {/* Removed top tabs trigger to hide 'My Rooms' button above columns */}

          {/* My Rooms: show channels column on the left (desktop) and widened chat */}
          <TabsContent value='myRooms' className='min-h-0 overflow-hidden'>
            {/* Top preview banner */}
            {previewActive && !isJoined && (
              <div className='mx-0 mb-3 rounded-none bg-blue-600 px-4 py-2 text-blue-50 md:rounded-2xl'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm'>You’re in preview mode. Join this community to start chatting.</p>
                  {selectedRoom && (
                    <Button size='sm' variant='secondary' className='bg-blue-50 text-blue-700 hover:bg-blue-100'
                      onClick={() => joinRoom(selectedRoom.id)}
                    >
                      Join
                    </Button>
                  )}
                </div>
              </div>
            )}
            <div className='grid grid-cols-1 md:grid-cols-[300px_minmax(0,1fr)] gap-3 sm:gap-4 flex-1 min-h-0'>
              {/* Channels column (desktop) */}
              {!isMobile && (
                <Card className='relative min-w-0 min-h-0 overflow-hidden p-0 h-[calc(100svh-96px)] rounded-2xl bg-black/8 dark:bg-white/12 backdrop-blur-md border border-black/12 dark:border-white/25 ring-1 ring-black/10 dark:ring-white/20 shadow-[0_6px_20px_rgba(0,0,0,0.12)] dark:shadow-[0_6px_20px_rgba(255,255,255,0.10)]'>
                  <div className='border-border flex items-center justify-between border-b px-4 py-2'>
                    <div className='min-w-0'>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium'>Channels</span>
                      </div>
                    </div>
                    {canModerate && (
                      <Button variant='outline' size='icon' onClick={() => setCreateChannelOpen(true)} aria-label='Create channel'>
                        <Plus className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                  <ScrollArea className='h-[calc(100%-44px)] px-2 pb-4'>
                    <SidebarMenu className='gap-2'>
                      {selectedRoom?.channels.map((ch) => (
                        <SidebarMenuItem key={ch.id}>
                          <SidebarMenuButton
                            asChild
                            size='lg'
                            isActive={selectedChannelId === ch.id}
                            className='rounded-lg px-3 py-2'
                          >
                            <button type='button' className='w-full text-left' onClick={() => setSelectedChannelId(ch.id)}>
                              <div className='min-w-0'>
                                <span className='truncate font-medium'># {ch.name}</span>
                              </div>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                      {(!selectedRoom || selectedRoom.channels.length === 0) && (
                        <div className='px-3 py-2 text-xs text-muted-foreground'>No channels yet.</div>
                      )}
                    </SidebarMenu>
                  </ScrollArea>
                </Card>
              )}

              {/* Chat window */}
              <Card className='relative grid grid-rows-[auto_1fr_auto] min-w-0 min-h-0 overflow-hidden p-0 h-[calc(100svh-96px)] w-full max-w-none rounded-2xl bg-black/8 dark:bg-white/12 backdrop-blur-md border border-black/12 dark:border-white/25 ring-1 ring-black/10 dark:ring-white/20 shadow-[0_6px_20px_rgba(0,0,0,0.12)] dark:shadow-[0_6px_20px_rgba(255,255,255,0.10)]'>
                {/* Channel header with admin actions */}
                <div className='border-border flex items-center justify-between border-b px-4 py-2'>
                  <div className='min-w-0'>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'># {selectedChannel?.name ?? 'select-channel'}</span>
                      <span className='text-muted-foreground text-xs'>in {selectedRoom?.name}</span>
                    </div>
                  </div>
                  {canManage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size='icon' variant='ghost'>
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuLabel>Room Admin</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setInviteOpen(true)}>Copy invite link</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled>Manage members</DropdownMenuItem>
                        <DropdownMenuItem disabled>Manage roles</DropdownMenuItem>
                        <DropdownMenuItem disabled>Room settings</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Messages viewport */}
                <div
                  ref={messagesContainerRef}
                  className={cn('overflow-auto p-4')}
                  data-slot='tt-messages-viewport'
                  onScroll={handleScrollCheck}
                >
                  <div className='space-y-6'>
                    {backendMessages.map((message, idx, arr) => {
                      const currentDay = new Date(message.createdAt).toDateString()
                      const prevDay = idx > 0 ? new Date(arr[idx - 1].createdAt).toDateString() : null
                      const showDayDivider = currentDay !== prevDay
                      const sender = getSenderInfo(message, selectedRoom, user?.uid)
                      const dateStr = new Date(message.createdAt).toLocaleDateString([], {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })
                      const timeStr = new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      return (
                        <div key={message._id} className='space-y-3'>
                          {showDayDivider && (
                            <div className='flex items-center gap-3'>
                              <div className='h-px flex-1 bg-border' />
                              <div className='text-muted-foreground text-xs'>
                                {new Date(message.createdAt).toLocaleDateString([], {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </div>
                              <div className='h-px flex-1 bg-border' />
                            </div>
                          )}
                          <div className={cn('flex', message.userId === user?.uid ? 'justify-end' : 'justify-start')}>
                            <div
                              className={cn(
                                'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ring-1',
                                message.userId === user?.uid
                                  ? 'bg-primary text-primary-foreground ring-primary/20'
                                  : 'bg-black/6 dark:bg-white/10 text-foreground ring-black/10 dark:ring-white/15'
                              )}
                            >
                              <div className='flex items-center justify-between mb-1 text-[11px]'>
                                <div className='flex items-center gap-2'>
                                  <span className='font-medium'>{sender.name}</span>
                                  <span className='inline-flex items-center rounded-full border border-black/12 dark:border-white/20 bg-black/8 dark:bg-white/12 px-2 py-0.5 text-[10px] uppercase tracking-wide'>
                                    {sender.badge}
                                  </span>
                                </div>
                                <span className='text-muted-foreground'>{dateStr} {timeStr}</span>
                              </div>
                              <p className='text-sm'>{message.message}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {backendMessages.length === 0 && (
                      <p className='text-muted-foreground'>Select a channel to start chatting. Create channels for topics you love.</p>
                    )}
                  </div>
                </div>

                {/* Down-arrow to jump to latest, positioned above the chat bar */}
                <div className='pointer-events-none absolute left-0 right-0' style={{ bottom: !isMobile ? 88 : 64 }}>
                  <ScrollToLatestButton
                    visible={!atBottom}
                    onClick={() => {
                      const el = messagesContainerRef.current
                      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
                    }}
                  />
                </div>

                {/* Bottom chat bar inside chat window (sticky within card) */}
                <ChatInputBar
                  position={isMobile ? 'sticky' : 'inline'}
                  className={cn(previewActive && !isJoined ? 'opacity-60 pointer-events-none' : '')}
                  placeholder={previewActive && !isJoined ? 'Join to start chatting' : `Message #${selectedChannel?.name ?? 'channel'}`}
                  value={inputText}
                  onChange={setInputText}
                  isRecording={isRecording}
                  onMicClick={handleMicClick}
                  onSubmit={(text) => {
                    if (!selectedRoom || !selectedChannel) return
                    if (previewActive && !isJoined) return
                    const trimmed = text.trim()
                    if (!trimmed) return
                    
                    sendMessage(trimmed)
                    setInputText('')
                    setBaseText('') // Clear base text on submit

                    const el = messagesContainerRef.current
                    if (el) {
                      requestAnimationFrame(() => {
                        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
                      })
                    }
                  }}
                  leftOffset={0}
                />
              </Card>
            </div>
          </TabsContent>

          {/* Discover: Join public rooms */}
          <TabsContent value='discover' className='space-y-4'>
            {/* Discover container with dock-style glassmorphic theme */}
            <Card className='rounded-2xl p-0 h-[calc(100svh-96px)] overflow-hidden bg-black/8 dark:bg-white/12 backdrop-blur-md border border-black/12 dark:border-white/25 ring-1 ring-black/10 dark:ring-white/20 shadow-[0_6px_20px_rgba(0,0,0,0.12)] dark:shadow-[0_6px_20px_rgba(255,255,255,0.10)]'>
              <ScrollArea className='h-[calc(100svh-96px)]'>
                <div className='p-6'>
                  <div className='mb-4'>
                    <h3 className='text-xl font-semibold'>Discover communities</h3>
                    <p className='text-muted-foreground text-sm'>Find welcoming rooms by topic, region, or stocks.</p>
                  </div>
                  <div className='mb-6 flex gap-2'>
                    <Input
                      value={discoverQuery}
                      onChange={(e) => setDiscoverQuery(e.target.value)}
                      placeholder='Search communities…'
                      aria-label='Search communities'
                      className='max-w-md'
                    />
                  </div>
                  {/* Banner-style cards inspired by Discord */}
                  <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
                    {rooms
                      .filter((r) => r.isPublic)
                      .filter((r) => r.name.toLowerCase().includes(discoverQuery.toLowerCase()))
                      .map((room) => (
                        <div
                          key={room.id}
                          className='relative overflow-hidden rounded-2xl bg-black/8 dark:bg-white/12 backdrop-blur-md border border-black/12 dark:border-white/25 ring-1 ring-black/10 dark:ring-white/20 shadow-[0_8px_28px_rgba(0,0,0,0.14)] dark:shadow-[0_8px_28px_rgba(255,255,255,0.10)]'
                        >
                          {/* Banner area */}
                          <div
                            className='relative h-28 sm:h-32 md:h-36 cursor-pointer'
                            role='button'
                            tabIndex={0}
                            aria-label={`Preview ${room.name}`}
                            onClick={() => openPreview(room.id)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openPreview(room.id) }}
                          >
                            {room.banner ? (
                              <img src={room.banner} alt={room.name} className='absolute inset-0 w-full h-full object-cover' />
                            ) : (
                              <div className='absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-transparent dark:from-white/10 dark:via-white/8 dark:to-transparent' />
                            )}
                            <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                            <div className='absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-3'>
                              <div className='min-w-0'>
                                <p className='truncate text-base font-semibold'>{room.name}</p>
                                <p className='text-muted-foreground text-xs'>{room.memberCount} members</p>
                              </div>
                              <Button size='sm' onClick={() => joinRoom(room.id)} aria-label={`Join ${room.name}`} className='rounded-full'>
                                Join
                              </Button>
                            </div>
                          </div>
                          {/* Description */}
                          <div className='px-4 py-3'>
                            <p className='text-sm text-muted-foreground'>Chat about markets, news, and ideas.</p>
                          </div>
                        </div>
                      ))}
                    {rooms
                      .filter((r) => r.isPublic)
                      .filter((r) => r.name.toLowerCase().includes(discoverQuery.toLowerCase())).length === 0 && (
                      <p className='text-muted-foreground text-sm'>No communities match your search.</p>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>
          </Tabs>

          {/* Create Room Dialog */}
          <Dialog
            open={createRoomOpen}
            onOpenChange={(open) => {
              setCreateRoomOpen(open)
              if (open) {
                setCreateRoomStep(1)
              }
            }}
          >
            <DialogContent className='sm:max-w-lg rounded-2xl bg-black/8 dark:bg-white/12 backdrop-blur-md border border-black/12 dark:border-white/25 ring-1 ring-black/10 dark:ring-white/20 shadow-[0_8px_28px_rgba(0,0,0,0.14)] dark:shadow-[0_8px_28px_rgba(255,255,255,0.10)]'>
              <DialogHeader>
                <DialogTitle>Create a Community</DialogTitle>
              </DialogHeader>
              <div className='space-y-4'>
                <div className='flex items-center justify-between text-xs text-muted-foreground'>
                  <span>Step {createRoomStep} of 4</span>
                  <span>{createRoomStep === 1 && 'Basics' || createRoomStep === 2 && 'Tags' || createRoomStep === 3 && 'Age Barrier' || 'Privacy'}</span>
                </div>

                {createRoomStep === 1 && (
                  <div className='space-y-3'>
                    <div className='space-y-2'>
                      <div className='text-sm font-medium'>Community name</div>
                      <Input placeholder='e.g. Indian Markets' value={roomName} onChange={(e) => setRoomName(e.target.value)} />
                    </div>
                    <div className='space-y-2'>
                      <div className='text-sm font-medium'>Banner Image</div>
                      <div className='grid grid-cols-4 gap-2 mb-2'>
                        {DEFAULT_BANNERS.map((url) => (
                          <div 
                            key={url} 
                            className={cn(
                              'relative aspect-video cursor-pointer rounded-md overflow-hidden border-2',
                              bannerUrl === url ? 'border-primary' : 'border-transparent'
                            )}
                            onClick={() => setBannerUrl(url)}
                          >
                            <img src={url} alt="Banner option" className='object-cover w-full h-full' />
                          </div>
                        ))}
                      </div>
                      <Input placeholder='https://example.com/banner.jpg' value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} />
                      <p className='text-xs text-muted-foreground'>Choose a default banner or paste a direct link to an image.</p>
                    </div>
                  </div>
                )}

                {createRoomStep === 2 && (
                  <div className='space-y-3'>
                    <div className='space-y-2'>
                      <div className='text-sm font-medium'>Tags</div>
                      <Input
                        placeholder='Comma-separated tags (e.g. stocks, options, news)'
                        value={roomTags}
                        onChange={(e) => setRoomTags(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault()
                            addTag(roomTags)
                          }
                        }}
                        onBlur={() => addTag(roomTags)}
                      />
                      {/* Chips */}
                      <div className='flex flex-wrap gap-2 pt-2'>
                        {roomTagList.map((tag) => (
                          <Badge
                            key={tag}
                            variant='outline'
                            className='group rounded-full px-2 py-1 text-xs bg-black/5 dark:bg-white/10 border-black/15 dark:border-white/20'
                            aria-label={`Tag ${tag}`}
                          >
                            <span>{tag}</span>
                            <button
                              type='button'
                              onClick={() => removeTag(tag)}
                              className='ms-1 inline-flex items-center rounded-full p-0.5 opacity-0 transition-opacity group-hover:opacity-100'
                              aria-label={`Remove ${tag}`}
                            >
                              <X className='size-3' />
                            </button>
                          </Badge>
                        ))}
                        {roomTagList.length === 0 && (
                          <p className='text-xs text-muted-foreground'>Add a few tags to help people discover your community.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {createRoomStep === 3 && (
                  <div className='space-y-3'>
                    <div className='space-y-2'>
                      <div className='text-sm font-medium'>Age barrier</div>
                      <div className='flex items-center justify-between rounded-md border px-3 py-2'>
                        <div>
                          <div className='text-sm'>Require minimum age</div>
                          <p className='text-xs text-muted-foreground'>Enable and set a minimum age if needed.</p>
                        </div>
                        <Switch checked={ageGateEnabled} onCheckedChange={setAgeGateEnabled} aria-label='Require minimum age' />
                      </div>
                      {ageGateEnabled && (
                        <div className='grid grid-cols-2 gap-3'>
                          <div className='space-y-2'>
                            <div className='text-sm font-medium'>Minimum age</div>
                            <Input
                              type='number'
                              min={13}
                              max={100}
                              value={ageLimit}
                              onChange={(e) => setAgeLimit(Number(e.target.value))}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {createRoomStep === 4 && (
                  <div className='space-y-3'>
                    <div className='space-y-2'>
                      <div className='text-sm font-medium'>Privacy</div>
                      <RadioGroup value={privacy} onValueChange={(v) => setPrivacy(v as 'public' | 'private')}>
                        <div className='flex items-center gap-3'>
                          <RadioGroupItem value='public' id='privacy-public' />
                          <label htmlFor='privacy-public' className='text-sm'>Public (visible and discoverable)</label>
                        </div>
                        <div className='flex items-center gap-3'>
                          <RadioGroupItem value='private' id='privacy-private' />
                          <label htmlFor='privacy-private' className='text-sm'>Private (invite-only)</label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}

                <div className='flex items-center justify-between pt-2'>
                  <Button variant='outline' onClick={() => setCreateRoomOpen(false)}>Cancel</Button>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      onClick={() => setCreateRoomStep((s) => Math.max(1, s - 1))}
                      disabled={createRoomStep === 1}
                    >
                      Back
                    </Button>
                    {createRoomStep < 4 ? (
                      <Button
                        onClick={() => setCreateRoomStep((s) => Math.min(4, s + 1))}
                        disabled={createRoomStep === 1 && roomName.trim().length === 0}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button onClick={createRoom} disabled={roomName.trim().length === 0}>Create</Button>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

        {/* Create Channel Dialog */}
        <Dialog open={createChannelOpen} onOpenChange={setCreateChannelOpen}>
          <DialogContent className='sm:max-w-lg rounded-2xl bg-black/8 dark:bg-white/12 backdrop-blur-md border border-black/12 dark:border-white/25 ring-1 ring-black/10 dark:ring-white/20 shadow-[0_8px_28px_rgba(0,0,0,0.14)] dark:shadow-[0_8px_28px_rgba(255,255,255,0.10)]'>
            <DialogHeader>
              <DialogTitle>Create a Channel</DialogTitle>
            </DialogHeader>
            <div className='space-y-3'>
              <Input placeholder='Channel name' value={channelName} onChange={(e) => setChannelName(e.target.value)} />
              <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={() => setCreateChannelOpen(false)}>Cancel</Button>
                <Button onClick={createChannel} disabled={!canModerate}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

          {/* Invite Link Dialog */}
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogContent className='sm:max-w-lg rounded-2xl bg-black/8 dark:bg-white/12 backdrop-blur-md border border-black/12 dark:border-white/25 ring-1 ring-black/10 dark:ring-white/20 shadow-[0_8px_28px_rgba(0,0,0,0.14)] dark:shadow-[0_8px_28px_rgba(255,255,255,0.10)]'>
              <DialogHeader>
                <DialogTitle>Invite link</DialogTitle>
              </DialogHeader>
              <div className='space-y-3'>
                <Input readOnly value={`https://app.moneybh.ai/invite/${selectedRoomId ?? 'room'}`} />
                <div className='flex justify-end'>
                  <Button onClick={() => setInviteOpen(false)}>Done</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Mobile sidebar sheet */}
          {isMobile && (
            <RoomsSidebarSheet
              open={sidebarOpen}
              rooms={rooms.map((r) => ({ id: r.id, name: r.name, memberCount: r.memberCount }))}
              selectedRoomId={selectedRoomId}
              onOpenChange={setSidebarOpen}
              onDiscoverClick={() => { setTab('discover'); setSidebarOpen(false); }}
              onSelectRoom={(id) => {
                setTab('myRooms')
                setSelectedRoomId(id)
                const first = rooms.find((r) => r.id === id)?.channels[0]?.id
                if (first) setSelectedChannelId(first)
                setSidebarOpen(false)
              }}
              onCreateRoomClick={() => setCreateRoomOpen(true)}
              channels={selectedRoom?.channels.map((c) => ({ id: c.id, name: c.name })) ?? []}
              selectedChannelId={selectedChannelId}
              onSelectChannel={(id) => { setSelectedChannelId(id); setTab('myRooms'); setSidebarOpen(false); }}
              onCreateChannelClick={() => setCreateChannelOpen(true)}
              canModerate={canModerate}
            />
          )}
        </div>
      </Main>
    </>
  )
}
