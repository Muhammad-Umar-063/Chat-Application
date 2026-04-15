import { useRef, useState } from "react";
import { useChatStore } from "../hook/useChatStore.ts";
import ChatContainer from "../components/ChatContainer.tsx";
import Sidebar from "../components/Sidebar.tsx";
import NoChatSelected from "../components/NoChatSelected.tsx";

const HomePage = () => {
  const { selectedChatUser, setSelectedChatUser } = useChatStore();
  const [isMobileSidebarExpanded, setIsMobileSidebarExpanded] = useState(false);
  const previousSelectedChatRef = useRef<typeof selectedChatUser>(null);

  const isMobileViewport = () =>
    window.matchMedia("(max-width: 1023px)").matches;

  const handleUsersButtonClick = () => {
    if (!isMobileViewport() || isMobileSidebarExpanded) return;

    previousSelectedChatRef.current = selectedChatUser ?? null;
    setSelectedChatUser(null);
    setIsMobileSidebarExpanded(true);
  };

  const handleMobileSidebarClose = () => {
    setIsMobileSidebarExpanded(false);
  };

  const handleMobileSidebarCloseAndRestore = () => {
    setIsMobileSidebarExpanded(false);
    setSelectedChatUser(previousSelectedChatRef.current ?? null);
  };

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar
              isMobileExpanded={isMobileSidebarExpanded}
              onUsersButtonClick={handleUsersButtonClick}
              onMobileCloseClick={handleMobileSidebarCloseAndRestore}
              onMobileChatSelected={handleMobileSidebarClose}
            />

            <div
              className={`flex-1 ${
                isMobileSidebarExpanded ? "hidden lg:flex" : "flex"
              }`}
            >
              {!selectedChatUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;