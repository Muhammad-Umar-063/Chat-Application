import { create } from 'zustand'
import { axiosInstance } from '../lib/axios.js'
import { toast } from 'react-hot-toast'
import { AxiosError } from 'axios'
import useAuthStore from './useAuthStore.js'

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
    image?: string | null
    seen?: boolean
    seenAt?: string | null
}

interface ChatStore {
    users: User[]
    messages: Message[]
    selectedChatUser?: User | null,
    isUserLoading: boolean,
    isMsgLoading: boolean,
    isOtherUserTyping: boolean

    unsubscribeFromMessages: () => void
    SubscribeToMsgs: () => void
    getUsers: () => Promise<void>
    getMsgs: (userId: string) => Promise<void>
    markMsgsAsSeen: (userId: string) => Promise<void>
    sendMsg: (userId: string, text: string, image?: string) => Promise<void>
    setSelectedChatUser: (selectedChatUser: User | null) => void
    setIsOtherUserTyping: (isTyping: boolean) => void
}

export const useChatStore = create<ChatStore>()((set, get) => ({
    users: [],
    messages: [],
    selectedChatUser: null,
    isUserLoading: false,
    isMsgLoading: false,
    isOtherUserTyping: false,


    getUsers: async () => {
        set({ isUserLoading: true });
        try {
            const res = await axiosInstance.get<User[]>('/messages/users')
            set({ users: res.data })
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            toast.error(err.response?.data?.message ?? 'Failed to load users');
        } finally {
            set({ isUserLoading: false });
        }
    },

    getMsgs: async (userId: string) => {
        set({ isMsgLoading: true });
        try {
            const res = await axiosInstance.get<Message[]>(`/messages/${userId}`)
            set({ messages: res.data })
            await get().markMsgsAsSeen(userId)
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            toast.error(err.response?.data?.message ?? 'Failed to load messages');
        } finally {
            set({ isMsgLoading: false });
        }
    },

    markMsgsAsSeen: async (userId: string) => {
        try {
            const res = await axiosInstance.post<{ messageIds: string[]; seenAt?: string }>(`/messages/seen/${userId}`)
            const messageIds = res.data.messageIds ?? []
            const seenAt = res.data.seenAt ?? new Date().toISOString()

            if (!messageIds.length) return

            set((state) => ({
                messages: state.messages.map((msg) =>
                    messageIds.includes(msg._id)
                        ? { ...msg, seen: true, seenAt }
                        : msg
                ),
            }))
        } catch (error) {
            console.error('Failed to mark messages as seen:', error)
        }
    },

    sendMsg: async (userId: string, text: string, image?: string) => {
        try {
            const res = await axiosInstance.post<Message>(`/messages/send/${userId}`, { text, image })
            set((state) => ({ messages: [...state.messages, res.data] }))
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            toast.error(err.response?.data?.message ?? 'Failed to send message');
        }
    },

    SubscribeToMsgs: () => {
        const {selectedChatUser} = get()
        if (!selectedChatUser) return 

        const socket = useAuthStore.getState().socket
        if (!socket) return

        // Remove old listeners first to prevent duplicates
        socket.off("newMessage")
        socket.off("typing")
        socket.off("stopTyping")
        socket.off("messagesSeen")

        socket.on("newMessage", (newMessage) => {
            set({
                messages: [...get().messages, newMessage]
            })
        })

        socket.on("typing", () => {
            set({ isOtherUserTyping: true })
        })

        socket.on("stopTyping", () => {
            set({ isOtherUserTyping: false })
        })

        socket.on("messagesSeen", ({ messageIds, seenAt }: { messageIds: string[]; seenAt: string }) => {
            set((state) => ({
                messages: state.messages.map((msg) =>
                    messageIds.includes(msg._id)
                        ? { ...msg, seen: true, seenAt }
                        : msg
                ),
            }))
        })
    },

    unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
    socket?.off("typing");
    socket?.off("stopTyping");
    socket?.off("messagesSeen");
  },


    setSelectedChatUser: (selectedChatUser: User | null) => {
        set({ selectedChatUser })
    },

    setIsOtherUserTyping: (isTyping: boolean) => {
        set({ isOtherUserTyping: isTyping })
    }

}))