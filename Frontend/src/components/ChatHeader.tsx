import useAuthStore from "../hook/useAuthStore"
import { useChatStore } from "../hook/useChatStore"
import { X } from "lucide-react"

const ChatHeader = () => {

    const {selectedChatUser, setSelectedChatUser} = useChatStore()
    const { onlineUsers = [] } = useAuthStore()

  if (!selectedChatUser) return null

  const isOnline = onlineUsers.includes(selectedChatUser._id)

  return (
      <div className="p-2.5 border-b border-base-300">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedChatUser.profilePic || "/avatar.png"} alt={selectedChatUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedChatUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button
          className="btn btn-ghost btn-sm btn-square"
          onClick={() => setSelectedChatUser(null)}
          aria-label="Close chat"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  )
}

export default ChatHeader
