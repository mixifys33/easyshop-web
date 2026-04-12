// Real-time chat via socket.io is not available in this deployment.
// This stub keeps the type contract intact so the build passes.

export interface UserData {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
}

interface UseChatProps {
  userData: UserData | null;
  enabled?: boolean;
}

export function useChat({ userData, enabled = true }: UseChatProps) {
  return {
    socket: null,
    isConnected: false,
    conversations: [],
    activeConversation: null,
    messages: [],
    isLoadingConversations: false,
    isLoadingMessages: false,
    unreadCount: 0,
    sendMessage: async () => {},
    loadMoreMessages: async () => {},
    setActiveConversation: () => {},
    startConversation: async () => null,
    markAsRead: async () => {},
    getUserStatus: () => 'offline' as const,
    typingUsers: {},
    sendTypingIndicator: () => {},
  };
}

export default useChat;
