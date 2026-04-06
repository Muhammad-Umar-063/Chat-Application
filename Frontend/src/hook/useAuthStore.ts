import { create } from 'zustand'
import { axiosInstance } from '../lib/axios.js'


interface User {
  _id: string
  fullName: string
  email: string
  profilePic?: string
}

interface AuthStore {
  authUser: User | null
  isLoggedIn: boolean
  isSigningUp?: boolean
  isUpdatingProfile?: boolean
  isCheckingAuth?: boolean

  checkAuth: () => Promise<void>
}

const useAuthStore = create<AuthStore>((set) => ({
  authUser: null,
  isLoggedIn: false,
  isSigningUp: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/check-auth');
      if (res.data){
        set({ authUser : res.data, isLoggedIn: true });
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      set({ authUser: null, isLoggedIn: false }); 
    } finally{
      set({ isCheckingAuth: false });
    }
  }

}))
export default useAuthStore