import { create } from 'zustand'
import { axiosInstance } from '../lib/axios.js'


interface User {
  _id: string
  fullname: string
  email: string
  profilePicture?: string
}

interface AuthStore {
  user: User | null
  isLoggedIn: boolean
  isSigningUp?: boolean
  isUpdatingProfile?: boolean
  isCheckingAuth?: boolean

  checkAuth: () => Promise<void>
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoggedIn: false,
  isSigningUp: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/check');
      if (res.data.success){
        set({ user : res.data.user, isLoggedIn: true });
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      set({ user: null, isLoggedIn: false }); 
    } finally{
      set({ isCheckingAuth: false });
    }
  }

}))
export default useAuthStore