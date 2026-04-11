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

interface Message {
  _id: string
        senderId?: string | { _id: string }
    receiverId?: string
        sender?: User | string
    text?: string
        message?: string
  createdAt: string,
  image ?: string | null
}

interface ChatStore {
    users: User[]
    messages: Message[]
    selectedChatUser?: User | null,
    isUserLoading: boolean,
    isMsgLoading: boolean

    getUsers: () => Promise<void>
    getMsgs: (userId: string) => Promise<void>
    sendMsg: (userId: string, text: string, image?: string) => Promise<void>
    setSelectedChatUser: (selectedChatUser: User | null) => void
}

export const useChatStore = create<ChatStore>()((set) => ({
    users: [],
    messages: [],
    selectedChatUser: null,
    isUserLoading: false,
    isMsgLoading: false,


getUsers: async () => {
    set({ isUserLoading: true });
    try{ 
        const res = await axiosInstance.get<User[]>('/messages/users')
        set({ users: res.data})
    }catch (error){
        const err = error as AxiosError<{ message: string }>;
        toast.error(err.response?.data?.message ?? 'Failed to load users');
    }finally{
        set({ isUserLoading: false });
    }
},

getMsgs: async (userId: string) => {
    set({ isMsgLoading: true });
    try{
        const res = await axiosInstance.get<Message[]>(`/messages/${userId}`)
        set({ messages: res.data})
    }catch (error){
        const err = error as AxiosError<{ message: string }>;
        toast.error(err.response?.data?.message ?? 'Failed to load messages');
    }finally{
        set({ isMsgLoading: false });
    }
},

sendMsg: async (userId: string, text: string, image?: string) => {
    set({ isMsgLoading: true });
    try{
        const res = await axiosInstance.post<Message>(`/messages/send/${userId}`, { text, image })
        set((state) => ({ messages: [...state.messages, res.data] }))
    }catch (error){
        const err = error as AxiosError<{ message: string }>;
        toast.error(err.response?.data?.message ?? 'Failed to send message');
    }finally{
        set({ isMsgLoading: false });
    }
},

setSelectedChatUser: (selectedChatUser: User | null) => {
    set({ selectedChatUser })
}

}))