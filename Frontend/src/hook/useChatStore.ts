import { create } from 'zustand'
import { axiosInstance } from '../lib/axios.js'
import { toast } from 'react-hot-toast'
import { AxiosError } from 'axios'
import useAuthStore from './useAuthStore.js'

interface User {
    _id: string
    fullName: string
    username?: string
    unreadCount?: number
    email: string
    profilePic?: string
    createdAt: string
}

interface Message {
    _id: string
    senderId?: string | { _id: string }
    receiverId?: string | { _id: string }
    sender?: User | string
    text?: string
    message?: string
    createdAt: string,
    image?: string | null
    seen?: boolean
    seenAt?: string | null
}

interface GetMsgsResponse {
    messages: Message[]
    hasMore: boolean
}

const extractId = (value?: string | { _id: string } | null): string | undefined => {
    if (!value) return undefined
    return typeof value === 'string' ? value : value._id
}

interface ChatStore {
    users: User[]
    messages: Message[]
    unreadCounts: Record<string, number>
    selectedChatUser?: User | null,
    isUserLoading: boolean,
    isMsgLoading: boolean,
    isOtherUserTyping: boolean
    hasMoreMsgs: boolean
    isLoadingOlderMsgs: boolean
    oldestMsgCreatedAt: string | null

    unsubscribeFromMessages: () => void
    SubscribeToMsgs: () => void
    getUsers: () => Promise<void>
    searchUsers: (username: string) => Promise<void>
    getMsgs: (userId: string) => Promise<void>
    loadOlderMsgs: (userId: string) => Promise<void>
    markMsgsAsSeen: (userId: string) => Promise<void>
    sendMsg: (userId: string, text: string, image?: string) => Promise<void>
    setSelectedChatUser: (selectedChatUser: User | null) => void
    setIsOtherUserTyping: (isTyping: boolean) => void
}

export const useChatStore = create<ChatStore>()((set, get) => ({
    users: [],
    messages: [],
    unreadCounts: {},
    selectedChatUser: null,
    isUserLoading: false,
    isMsgLoading: false,
    isOtherUserTyping: false,
    hasMoreMsgs: false,
    isLoadingOlderMsgs: false,
    oldestMsgCreatedAt: null,


    getUsers: async () => {
        set({ isUserLoading: true });
        try {
            const res = await axiosInstance.get<User[]>('/messages/users')
            const unreadFromApi = Object.fromEntries(
                res.data.map((user) => [user._id, user.unreadCount ?? 0])
            )

            set((state) => ({
                users: res.data,
                unreadCounts: {
                    ...state.unreadCounts,
                    ...unreadFromApi,
                },
            }))
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            toast.error(err.response?.data?.message ?? 'Failed to load users');
        } finally {
            set({ isUserLoading: false });
        }
    },

    searchUsers: async (username: string) => {
        const searchTerm = username.trim()
        if (!searchTerm) {
            await get().getUsers()
            return
        }

        set({ isUserLoading: true })
        try {
            const res = await axiosInstance.get<User[]>(`/messages/search?username=${encodeURIComponent(searchTerm)}`)
            set({ users: res.data })
        } catch (error) {
            const err = error as AxiosError<{ message: string }>
            toast.error(err.response?.data?.message ?? 'Failed to search users')
        } finally {
            set({ isUserLoading: false })
        }
    },

    getMsgs: async (userId: string) => {
        set((state) => ({
            isMsgLoading: true,
            messages: [],
            hasMoreMsgs: false,
            oldestMsgCreatedAt: null,
            unreadCounts: {
                ...state.unreadCounts,
                [userId]: 0,
            },
        }));
        try {
            const res = await axiosInstance.get<GetMsgsResponse | Message[]>(`/messages/${userId}?limit=30`)
            const payload = Array.isArray(res.data)
                ? { messages: res.data, hasMore: false }
                : res.data

            const nextMessages = payload.messages ?? []

            set({
                messages: nextMessages,
                hasMoreMsgs: Boolean(payload.hasMore),
                oldestMsgCreatedAt: nextMessages.length ? nextMessages[0].createdAt : null,
            })
            await get().markMsgsAsSeen(userId)
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            toast.error(err.response?.data?.message ?? 'Failed to load messages');
        } finally {
            set({ isMsgLoading: false });
        }
    },

    loadOlderMsgs: async (userId: string) => {
        const { hasMoreMsgs, isLoadingOlderMsgs, oldestMsgCreatedAt } = get()
        if (!hasMoreMsgs || isLoadingOlderMsgs || !oldestMsgCreatedAt) return

        set({ isLoadingOlderMsgs: true })
        try {
            const res = await axiosInstance.get<GetMsgsResponse | Message[]>(
                `/messages/${userId}?limit=30&before=${encodeURIComponent(oldestMsgCreatedAt)}`
            )

            const payload = Array.isArray(res.data)
                ? { messages: res.data, hasMore: false }
                : res.data

            const olderBatch = payload.messages ?? []

            set((state) => {
                const existingIds = new Set(state.messages.map((msg) => msg._id))
                const uniqueOlder = olderBatch.filter((msg) => !existingIds.has(msg._id))
                const mergedMessages = [...uniqueOlder, ...state.messages]

                return {
                    messages: mergedMessages,
                    hasMoreMsgs: Boolean(payload.hasMore),
                    oldestMsgCreatedAt: mergedMessages.length ? mergedMessages[0].createdAt : null,
                }
            })
        } catch (error) {
            console.error('Failed to load older messages:', error)
        } finally {
            set({ isLoadingOlderMsgs: false })
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
                unreadCounts: {
                    ...state.unreadCounts,
                    [userId]: 0,
                },
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
        const socket = useAuthStore.getState().socket
        if (!socket) return

        // Remove old listeners first to prevent duplicates
        socket.off("newMessage")
        socket.off("typing")
        socket.off("stopTyping")
        socket.off("messagesSeen")

        socket.on("newMessage", (newMessage: Message) => {
            const activeUserId = get().selectedChatUser?._id
            const authUserId = useAuthStore.getState().authUser?._id
            if (!authUserId) return

            const senderId = extractId(newMessage.senderId) ??
                (typeof newMessage.sender === 'string' ? newMessage.sender : newMessage.sender?._id)
            const receiverId = extractId(newMessage.receiverId)
            const isIncoming = receiverId === authUserId

            const isForActiveChat = Boolean(activeUserId && (senderId === activeUserId || receiverId === activeUserId))

            if (isForActiveChat) {
                set((state) => {
                    if (state.messages.some((msg) => msg._id === newMessage._id)) {
                        return state
                    }
                    return {
                        messages: [...state.messages, newMessage],
                    }
                })
            }

            if (isIncoming && senderId) {
                const isFromActiveChat = activeUserId === senderId

                if (isFromActiveChat) {
                    get().markMsgsAsSeen(senderId)
                } else {
                    set((state) => ({
                        unreadCounts: {
                            ...state.unreadCounts,
                            [senderId]: (state.unreadCounts[senderId] ?? 0) + 1,
                        },
                    }))

                    if (!get().users.some((user) => user._id === senderId)) {
                        get().getUsers()
                    }
                }
            }
        })

        socket.on("typing", ({ senderId }: { senderId?: string } = {}) => {
            const activeUserId = get().selectedChatUser?._id
            if (!activeUserId) return
            if (!senderId || senderId === activeUserId) {
                set({ isOtherUserTyping: true })
            }
        })

        socket.on("stopTyping", ({ senderId }: { senderId?: string } = {}) => {
            const activeUserId = get().selectedChatUser?._id
            if (!activeUserId) return
            if (!senderId || senderId === activeUserId) {
                set({ isOtherUserTyping: false })
            }
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
        set((state) => ({
            selectedChatUser,
            unreadCounts: selectedChatUser
                ? {
                    ...state.unreadCounts,
                    [selectedChatUser._id]: 0,
                }
                : state.unreadCounts,
        }))
    },

    setIsOtherUserTyping: (isTyping: boolean) => {
        set({ isOtherUserTyping: isTyping })
    }

}))