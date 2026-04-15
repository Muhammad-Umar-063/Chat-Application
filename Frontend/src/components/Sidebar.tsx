import { useEffect, useState } from "react";
import { useChatStore } from "../hook/useChatStore";
import SidebarSkeleton from "./skeleton/sidebarSkeleton";
import { Search, Users, X } from "lucide-react";
import useAuthStore from "../hook/useAuthStore";

interface SidebarProps {
  isMobileExpanded?: boolean;
  onUsersButtonClick?: () => void;
  onMobileCloseClick?: () => void;
  onMobileChatSelected?: () => void;
}

const Sidebar = ({
  isMobileExpanded = false,
  onUsersButtonClick,
  onMobileCloseClick,
  onMobileChatSelected,
}: SidebarProps) => {
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
  } = useChatStore();

  const { onlineUsers = [] } = useAuthStore();
  const [searchInput, setSearchInput] = useState("");
  const [isSearchDelayLoading, setIsSearchDelayLoading] = useState(false);

  useEffect(() => {
    SubscribeToMsgs();
    return () => unsubscribeFromMessages();
  }, [SubscribeToMsgs, unsubscribeFromMessages]);

  useEffect(() => {
    const searchTerm = searchInput.trim();

    if (!searchTerm) {
      setIsSearchDelayLoading(false);
      getUsers();
      return;
    }

    setIsSearchDelayLoading(true);

    let isCancelled = false;
    const debounceId = setTimeout(async () => {
      await searchUsers(searchTerm);
      if (!isCancelled) {
        setIsSearchDelayLoading(false);
      }
    }, 2000);

    return () => {
      isCancelled = true;
      clearTimeout(debounceId);
    };
  }, [searchInput, searchUsers, getUsers]);

  const showSkeleton = isUserLoading || isSearchDelayLoading;

  return (
    <aside
      className={`h-full border-r border-base-300 flex flex-col transition-all duration-200 ${
        isMobileExpanded ? "w-full lg:w-72" : "w-20 lg:w-72"
      }`}
    >
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onUsersButtonClick}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            aria-label="Open users panel"
          >
            <Users className="size-6" />
            <span
              className={`font-medium ${
                isMobileExpanded ? "block" : "hidden lg:block"
              }`}
            >
              Chats
            </span>
          </button>

          {isMobileExpanded && (
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-square lg:hidden"
              onClick={onMobileCloseClick}
              aria-label="Close users panel"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        <div className={`mt-3 ${isMobileExpanded ? "block" : "hidden lg:block"}`}>
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

        {!showSkeleton &&
          users.map((user) => {
            const unreadCount = unreadCounts[user._id] ?? user.unreadCount ?? 0;

            return (
              <button
                key={user._id}
                onClick={() => {
                  setSelectedChatUser(user);
                  if (isMobileExpanded) {
                    onMobileChatSelected?.();
                  }
                }}
                className={`
                  w-full p-3 flex items-center justify-between gap-3
                  hover:bg-base-300 transition-colors
                  ${
                    selectedChatUser?._id === user._id
                      ? "bg-base-300 ring-1 ring-base-300"
                      : ""
                  }
                `}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`relative ${
                      isMobileExpanded ? "mx-0" : "mx-auto lg:mx-0"
                    }`}
                  >
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="size-12 object-cover rounded-full"
                    />
                    {onlineUsers.includes(user._id) && (
                      <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                    )}
                  </div>

                  <div
                    className={`text-left min-w-0 ${
                      isMobileExpanded ? "block" : "hidden lg:block"
                    }`}
                  >
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
            );
          })}

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