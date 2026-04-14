import { create } from 'zustand'
import { axiosInstance } from '../lib/axios.js'
import { toast } from 'react-hot-toast'
import { AxiosError } from 'axios'
import { io } from 'socket.io-client'

const BASE_URL = import.meta.env.MODE === 'development'? 'http://localhost:5001' : '/api'

interface User {
  _id: string
  fullName: string
  username?: string
  email: string
  profilePic?: string
  createdAt: string
}

interface AuthStore {
  authUser: User | null
  isLoggingIn: boolean
  isSigningUp?: boolean
  isUpdatingProfile?: boolean
  isCheckingAuth?: boolean
  onlineUsers?: string[]
  socket: ReturnType<typeof io> | null

  connectSocket: () => void
  disconnectSocket: () => void
  checkAuth: () => Promise<void>
  signUp: (data: { fullName: string; username: string; email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  login: (data: { username: string; password: string }) => Promise<void>
  updateProfile: (data: { fullName?: string; profilePic?: string }) => Promise<void>
}

const useAuthStore = create<AuthStore>((set, get) => ({
  authUser: null,
  isLoggingIn: false,
  isSigningUp: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,



  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/check-auth');
      if (res.data){
        set({ authUser : res.data, isLoggingIn: true });
        get().connectSocket();
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      set({ authUser: null, isLoggingIn: false }); 
    } finally{
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (data) => {
  set({ isSigningUp: true });
  try {
    const res = await axiosInstance.post<User>("/auth/signup", data);
    set({ authUser: res.data, isLoggingIn: true  });
    toast.success("Account created successfully");
    get().connectSocket();
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message ?? 'Signup failed')
  } finally {
    set({ isSigningUp: false });
  }
},

  logout: async () => {
    try{
      await axiosInstance.post("/auth/logout")
      set({authUser: null, isLoggingIn: false})
      get().disconnectSocket()
    }
    catch(error) {
      console.error("Error logging out:", error);
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post<User>("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message ?? 'Login failed')
    } finally {
      set({ isLoggingIn: false });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try{
      const res = await axiosInstance.put<User>("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    }catch(error){
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message ?? 'Profile update failed')
    }finally{
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;
    
    const newSocket = io(BASE_URL, {
      query: { userId: authUser._id }  // lets the server track online users
    });
    newSocket.connect()
    newSocket.on("getOnlineUsers", (userIds: string[]) => {
      set({ onlineUsers: userIds });
    })
    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  }
}))
export default useAuthStore