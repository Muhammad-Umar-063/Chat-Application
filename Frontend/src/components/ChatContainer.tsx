import { useEffect, useRef, useState } from "react"
import { useChatStore } from "../hook/useChatStore"
import ChatHeader from "./ChatHeader"
import MsgInput from "./MsgInput"
import MessageSkeleton from "./skeleton/MessageSkeleton"
import { formatMessageTime, formatRelativeTime } from "../lib/utils"
import useAuthStore from "../hook/useAuthStore"
import { X } from "lucide-react"


const ChatContainer = () => {

    const {
      selectedChatUser,
      messages,
      isMsgLoading,
      getMsgs,
      loadOlderMsgs,
      hasMoreMsgs,
      isLoadingOlderMsgs,
      SubscribeToMsgs,
      unsubscribeFromMessages,
      isOtherUserTyping,
      markMsgsAsSeen,
    } = useChatStore()
    const { authUser } = useAuthStore()
    const messagesContainerRef = useRef<HTMLDivElement | null>(null)
    const previousMessageCountRef = useRef(0)
    const didInitialScrollRef = useRef(false)
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    useEffect(() => {
      if (!selectedChatUser?._id) return

      didInitialScrollRef.current = false
      previousMessageCountRef.current = 0
      getMsgs(selectedChatUser._id)
      SubscribeToMsgs()

      return () => {
        unsubscribeFromMessages()
      }
    }, [selectedChatUser?._id])

    useEffect(() => {
      const container = messagesContainerRef.current
      if (!container || isMsgLoading || !messages.length) return

      // On first load of a chat, jump instantly to the latest message.
      if (!didInitialScrollRef.current) {
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight
          didInitialScrollRef.current = true
          previousMessageCountRef.current = messages.length
        })
        return
      }

      // Auto-scroll only when user is already near bottom and new messages arrive.
      const hasNewMessage = messages.length > previousMessageCountRef.current
      if (hasNewMessage) {
        const distanceFromBottom = container.scrollHeight - (container.scrollTop + container.clientHeight)
        if (distanceFromBottom < 180) {
          container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
        }
      }

      previousMessageCountRef.current = messages.length
    }, [messages.length, isMsgLoading])

    useEffect(() => {
      if (!isOtherUserTyping) return

      const container = messagesContainerRef.current
      if (!container) return

      const distanceFromBottom = container.scrollHeight - (container.scrollTop + container.clientHeight)
      if (distanceFromBottom < 180) {
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
      }
    }, [isOtherUserTyping])

    useEffect(() => {
      if (!selectedChatUser?._id || !authUser?._id) return

      const hasIncomingUnseen = messages.some((message) => {
        const senderId =
          typeof message.senderId === "string"
            ? message.senderId
            : message.senderId?._id
        return senderId === selectedChatUser._id && !message.seen
      })

      if (hasIncomingUnseen) {
        markMsgsAsSeen(selectedChatUser._id)
      }
    }, [messages, selectedChatUser?._id, authUser?._id, markMsgsAsSeen])

    const handleMessagesScroll = async () => {
      const container = messagesContainerRef.current
      if (!container || !selectedChatUser?._id) return
      if (!hasMoreMsgs || isLoadingOlderMsgs) return

      if (container.scrollTop <= 80) {
        const previousScrollHeight = container.scrollHeight
        const previousScrollTop = container.scrollTop

        await loadOlderMsgs(selectedChatUser._id)

        requestAnimationFrame(() => {
          const nextScrollHeight = container.scrollHeight
          container.scrollTop = nextScrollHeight - previousScrollHeight + previousScrollTop
        })
      }
    }

    if (isMsgLoading) {
      return (
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatHeader />
          <MessageSkeleton />
          <MsgInput />
        </div>
      )
    }


  return (
<div className="flex-1 flex flex-col overflow-hidden">
      <ChatHeader />

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
      >
        {isLoadingOlderMsgs && (
          <div className="text-center text-xs opacity-60 py-1">Loading older messages...</div>
        )}
        {messages.map((message) => {
          const messageSenderId =
            typeof message.senderId === "string"
              ? message.senderId
              : message.senderId?._id ??
                (typeof message.sender === "string" ? message.sender : message.sender?._id)
          const isMine = messageSenderId === authUser?._id
          const messageText = message.text ?? message.message
          const statusText = `${message.seen ? "Seen" : "Sent"} ${formatRelativeTime(message.seenAt || message.createdAt)}`
          
          return (
            <div
            key={message._id}
            className={`chat ${isMine ? "chat-end" : "chat-start"}`}
            >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    isMine
                      ? authUser?.profilePic || "/avatar.png"
                      : (typeof message.sender === "object" ? message.sender.profilePic : undefined) || selectedChatUser?.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-50 rounded-md mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setPreviewImage(message.image!)}
                />
              )}
              {messageText && <p>{messageText}</p>}
            </div>
              {isMine && (
                <p className="mt-1 text-[9px] opacity-70 text-right">{statusText}</p>
              )}
          </div>
        )})}
        {isOtherUserTyping && (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={selectedChatUser?.profilePic || "/avatar.png"}
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-bubble">
              <span className="loading loading-dots loading-sm"></span>
            </div>
          </div>
        )}
      </div>

      <MsgInput />

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-screen flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={previewImage} 
              alt="Preview" 
              className="max-h-screen max-w-full object-contain rounded-lg"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 btn btn-circle btn-sm bg-base-200 hover:bg-base-300"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatContainer
