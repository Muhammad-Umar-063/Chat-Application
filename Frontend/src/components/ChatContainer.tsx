import { useEffect, useRef } from "react"
import { useChatStore } from "../hook/useChatStore"
import ChatHeader from "./ChatHeader"
import MsgInput from "./MsgInput"
import MessageSkeleton from "./skeleton/MessageSkeleton"
import { formatMessageTime } from "../lib/utils"
import useAuthStore from "../hook/useAuthStore"

const ChatContainer = () => {

    const { selectedChatUser, messages, isMsgLoading, getMsgs } = useChatStore()
    const { authUser } = useAuthStore()
  const messageEndRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
      if (!selectedChatUser?._id) return
      getMsgs(selectedChatUser._id)
    }, [selectedChatUser?._id, getMsgs])

    useEffect(() => {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

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

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
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
            ref={index === messages.length - 1 ? messageEndRef : null}
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
                  className="sm:max-w-50 rounded-md mb-2"
                />
              )}
              {messageText && <p>{messageText}</p>}
            </div>
          </div>
        )})}
      </div>

      <MsgInput />
    </div>
  )
}

export default ChatContainer
