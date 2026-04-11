import { create } from 'zustand'
import { axiosInstance } from '../lib/axios.js'
import { toast } from 'react-hot-toast'
import { AxiosError } from 'axios'
import { io, type Socket } from 'socket.io-client'

const BASE_URL = 'http://localhost:5001'

interface User {
  _id: string
  fullName: string
  email: string
  profilePic?: string
  createdAt: string
}

interface AuthStore {
  authUser: User | null
  socket: Socket | null
  onlineUsers: string[]
  isCheckingAuth: boolean
  isSigningUp: boolean
  isLoggingIn: boolean
  isUpdatingProfile: boolean

  checkAuth: () => Promise<void>
  signUp: (data: { fullName: string; email: string; password: string }) => Promise<void>
  login: (data: { email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: { fullName?: string; profilePic?: string }) => Promise<void>
  connectSocket: () => void
  disconnectSocket: () => void
}

const useAuthStore = create<AuthStore>((set, get) => ({
  authUser: null,
  socket: null,
  onlineUsers: [],
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,

  // ─── Auth ────────────────────────────────────────────────────────────────

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/check-auth')
      set({ authUser: res.data })
      get().connectSocket()
    } catch {
      set({ authUser: null })
    } finally {
      set({ isCheckingAuth: false })
    }
  },

  signUp: async (data) => {
    set({ isSigningUp: true })
    try {
      const res = await axiosInstance.post<User>('/auth/signup', data)
      set({ authUser: res.data })
      toast.success('Account created successfully')
      get().connectSocket()
    } catch (error) {
      const err = error as AxiosError<{ message: string }>
      toast.error(err.response?.data?.message ?? 'Signup failed')
    } finally {
      set({ isSigningUp: false })
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true })
    try {
      const res = await axiosInstance.post<User>('/auth/login', data)
      set({ authUser: res.data })
      toast.success('Logged in successfully')
      get().connectSocket()
    } catch (error) {
      const err = error as AxiosError<{ message: string }>
      toast.error(err.response?.data?.message ?? 'Login failed')
    } finally {
      set({ isLoggingIn: false })
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout')
      set({ authUser: null })
      get().disconnectSocket()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true })
    try {
      const res = await axiosInstance.put<User>('/auth/update-profile', data)
      set({ authUser: res.data })
      toast.success('Profile updated successfully')
    } catch (error) {
      const err = error as AxiosError<{ message: string }>
      toast.error(err.response?.data?.message ?? 'Profile update failed')
    } finally {
      set({ isUpdatingProfile: false })
    }
  },

  // ─── Socket ───────────────────────────────────────────────────────────────

  connectSocket: () => {
    const { authUser, socket } = get()
    if (!authUser || socket?.connected) return

    const newSocket = io(BASE_URL, {
      query: { userId: authUser._id },
    })

    newSocket.on('getOnlineUsers', (userIds: string[]) => {
      set({ onlineUsers: userIds })
    })

    set({ socket: newSocket })
  },

  disconnectSocket: () => {
    const { socket } = get()
    if (!socket) return

    socket.off('getOnlineUsers')
    socket.disconnect()
    set({ socket: null, onlineUsers: [] })
  },
}))

export default useAuthStore