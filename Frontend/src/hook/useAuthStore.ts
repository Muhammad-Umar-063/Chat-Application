import { create } from 'zustand'
import { axiosInstance } from '../lib/axios.js'
import { toast } from 'react-hot-toast'
import { AxiosError } from 'axios'



interface User {
  _id: string
  fullName: string
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


  checkAuth: () => Promise<void>
  signUp: (data: { fullName: string; email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  login: (data: { email: string; password: string }) => Promise<void>
  updateProfile: (data: { fullName?: string; profilePic?: string }) => Promise<void>
}

const useAuthStore = create<AuthStore>((set, get) => ({
  authUser: null,
  isLoggingIn: false,
  isSigningUp: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],


  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/check-auth');
      if (res.data){
        set({ authUser : res.data, isLoggingIn: true });
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
    // get().connectSocket();
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
      // get().connectSocket();
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

}))
export default useAuthStore