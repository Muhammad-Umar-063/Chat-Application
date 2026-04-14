import { useEffect, useState } from "react"
import { useChatStore } from "../hook/useChatStore"
import SidebarSkeleton from "./skeleton/sidebarSkeleton"
import { Search, Users } from "lucide-react"
import useAuthStore from "../hook/useAuthStore";
const Sidebar = () => {
    const {
      getUsers,
      searchUsers,
      isUserLoading,
      users,
      unreadCounts,
      selectedChatUser,
      setSelectedChatUser,
      SubscribeToMsgs,
      unsubscribeFromMessages,
    } = useChatStore()
  const { onlineUsers = [] } = useAuthStore()
    const [searchInput, setSearchInput] = useState("")
    const [isSearchDelayLoading, setIsSearchDelayLoading] = useState(false)

    useEffect(() => {
      SubscribeToMsgs()
      return () => unsubscribeFromMessages()
    }, [SubscribeToMsgs, unsubscribeFromMessages])

    useEffect(() => {
      const searchTerm = searchInput.trim()

      if (!searchTerm) {
        setIsSearchDelayLoading(false)
        getUsers()
        return
      }

      setIsSearchDelayLoading(true)

      let isCancelled = false
      const debounceId = setTimeout(async () => {
        await searchUsers(searchTerm)
        if (!isCancelled) {
          setIsSearchDelayLoading(false)
        }
      }, 2000)

      return () => {
        isCancelled = true
        clearTimeout(debounceId)
      }
    }, [searchInput, searchUsers, getUsers])

  const showSkeleton = isUserLoading || isSearchDelayLoading

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Chats</span>
        </div>

        <div className="mt-3 hidden lg:block">
          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toLowerCase())}
              placeholder="Search by username"
              className="input input-sm input-bordered w-full pl-9"
            />
          </div>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {showSkeleton && <SidebarSkeleton listOnly />}

        {!showSkeleton && users.map((user) => (
          (() => {
            const unreadCount = unreadCounts[user._id] ?? user.unreadCount ?? 0

            return (
              <button
                key={user._id}
                onClick={() => setSelectedChatUser(user)}
                className={`
                  w-full p-3 flex items-center justify-between gap-3
                  hover:bg-base-300 transition-colors
                  ${selectedChatUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
                `}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative mx-auto lg:mx-0">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="size-12 object-cover rounded-full"
                    />
                    {onlineUsers.includes(user._id) && (
                      <span
                        className="absolute bottom-0 right-0 size-3 bg-green-500 
                        rounded-full ring-2 ring-zinc-900"
                      />
                    )}
                  </div>

                  {/* User info - only visible on larger screens */}
                  <div className="hidden lg:block text-left min-w-0">
                    <div className="font-medium truncate">{user.fullName}</div>
                    <div className="text-xs text-zinc-400 truncate">
                      {user.username ? `@${user.username}` : "No username"}
                    </div>
                    <div className="text-sm text-zinc-400">
                      {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                    </div>
                  </div>
                </div>

                {unreadCount > 0 && (
                  <span className="min-w-6 h-6 px-1 rounded-full bg-green-500 text-white text-xs font-semibold flex items-center justify-center">
                    {unreadCount > 4 ? "4+" : unreadCount}
                  </span>
                )}
              </button>
            )
          })()
        ))}

        {!showSkeleton && users.length === 0 && (
          <div className="text-center text-zinc-500 py-4 px-3 text-sm">
            {searchInput.trim()
              ? "No users found for this username"
              : "No chats yet. Search a username to start chatting."}
          </div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
