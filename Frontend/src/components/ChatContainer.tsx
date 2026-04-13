import { useEffect, useRef, useState } from "react"
import { useChatStore } from "../hook/useChatStore"
import ChatHeader from "./ChatHeader"
import MsgInput from "./MsgInput"
import MessageSkeleton from "./skeleton/MessageSkeleton"
import { formatMessageTime } from "../lib/utils"
import useAuthStore from "../hook/useAuthStore"
import { X } from "lucide-react"


const ChatContainer = () => {

    const { selectedChatUser, messages, isMsgLoading, getMsgs, SubscribeToMsgs, unsubscribeFromMessages, isOtherUserTyping } = useChatStore()
    const { authUser } = useAuthStore()
    const messagesContainerRef = useRef<HTMLDivElement | null>(null)
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    useEffect(() => {
      if (!selectedChatUser?._id) return
      getMsgs(selectedChatUser._id)
      SubscribeToMsgs()
      return () => {
        unsubscribeFromMessages()
      }
    }, [selectedChatUser?._id])

    useEffect(() => {
      if (messages.length > 0) {
        setTimeout(() => {
          messagesContainerRef.current?.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: "smooth"
          })
        }, 0)
      }
    }, [messages, isOtherUserTyping])

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

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesContainerRef}>
        {messages.map((message) => {
          const messageSenderId =
            typeof message.senderId === "string"
              ? message.senderId
              : message.senderId?._id ??
                (typeof message.sender === "string" ? message.sender : message.sender?._id)
          const isMine = messageSenderId === authUser?._id
          const messageText = message.text ?? message.message

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
