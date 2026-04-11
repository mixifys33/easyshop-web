// Chat System Types - Shared across User, Seller, and Admin UIs

export interface Participant {
  odiv: string;
  odiv_type: 'user' | 'seller' | 'admin';
  name: string;
  email: string;
  avatar?: string;
  shopId?: string;
  shopName?: string;
}

export interface Conversation {
  _id: string;
  participants: Participant[];
  type: 'user_seller' | 'user_admin' | 'seller_admin';
  productId?: string;
  productTitle?: string;
  productImage?: string;
  lastMessage?: {
    content: string;
    messageType: string;
    senderId: string;
    timestamp: string;
  };
  unreadCount: { odiv: string; count: number }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'seller' | 'admin' | 'ai';
  senderName: string;
  senderAvatar?: string;
  messageType: 'text' | 'image' | 'voice' | 'sticker' | 'emoji' | 'system';
  content: string;
  mediaUrl?: string;
  mediaDuration?: number;
  mediaSize?: number;
  stickerId?: string;
  stickerUrl?: string;
  replyTo?: string;
  isAIGenerated: boolean;
  isRead: boolean;
  readAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
}

export interface UserData {
  odiv: string;
  odiv_type: 'user' | 'seller' | 'admin';
  name: string;
  email: string;
  avatar?: string;
  shopId?: string;
  shopName?: string;
}

export interface UserStatus {
  status: 'online' | 'online_in_chat' | 'offline' | 'offline_with_ai';
  lastSeen?: string;
  currentConversationId?: string;
}

export interface ProductContext {
  productId: string;
  productTitle: string;
  productImage: string;
}

export interface SendMessageData {
  messageType: 'text' | 'image' | 'voice' | 'sticker' | 'emoji';
  content: string;
  mediaUrl?: string;
  mediaDuration?: number;
  mediaSize?: number;
  stickerId?: string;
  stickerUrl?: string;
  replyTo?: string;
}

export interface StartConversationData {
  recipientId: string;
  recipientType: 'user' | 'seller' | 'admin';
  recipientName: string;
  recipientEmail: string;
  recipientAvatar?: string;
  recipientShopId?: string;
  recipientShopName?: string;
  productId?: string;
  productTitle?: string;
  productImage?: string;
  initialMessage?: string;
}

export interface CartUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  products: { id: string; title: string; image: string }[];
  cartUpdatedAt: string;
}

export interface AISettings {
  isEnabled: boolean;
  greeting: string;
  personality: 'professional' | 'friendly' | 'casual';
  responseDelay: number;
  productRecommendations: boolean;
  handoffKeywords: string[];
}

export interface ConversationFilters {
  dateRange?: { start: Date; end: Date };
  participantType?: 'user' | 'seller' | 'admin';
  conversationType?: 'user_seller' | 'user_admin' | 'seller_admin';
  status?: 'active' | 'inactive';
  searchQuery?: string;
}

export interface NotificationSettings {
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
}

export interface AIHandledConversation {
  conversationId: string;
  customerName: string;
  messageCount: number;
}

// Chat Store State
export interface ChatState {
  isConnected: boolean;
  isAuthenticated: boolean;
  currentUser: UserData | null;
  conversations: Conversation[];
  activeConversationId: string | null;
  messagesByConversation: Record<string, Message[]>;
  loadingMessages: boolean;
  hasMoreMessages: Record<string, boolean>;
  userStatuses: Record<string, UserStatus>;
  typingUsers: Record<string, string[]>;
  totalUnreadCount: number;
  isMobileView: boolean;
  showConversationList: boolean;
  notificationSettings: NotificationSettings;
  aiHandledConversations: AIHandledConversation[];
}

// Socket Event Types
export interface SocketOutgoingEvents {
  authenticate: (userData: UserData) => void;
  start_conversation: (data: StartConversationData) => void;
  send_message: (data: SendMessageData & { conversationId: string }) => void;
  typing_start: (conversationId: string) => void;
  typing_stop: (conversationId: string) => void;
  mark_read: (data: { conversationId: string; messageIds: string[] }) => void;
  join_conversation: (conversationId: string) => void;
  leave_conversation: (conversationId: string) => void;
  get_user_status: (userIds: string[]) => void;
  delete_message: (messageId: string) => void;
  load_more_messages: (data: { conversationId: string; before: string }) => void;
  admin_join_conversation: (conversationId: string) => void;
}

export interface SocketIncomingEvents {
  authenticated: (data: { success: boolean; conversations: Conversation[] }) => void;
  new_conversation: (conversation: Conversation) => void;
  conversation_started: (conversation: Conversation) => void;
  new_message: (message: Message) => void;
  user_typing: (data: { userId: string; name: string; conversationId: string }) => void;
  user_stopped_typing: (data: { userId: string; conversationId: string }) => void;
  messages_read: (data: { conversationId: string; readBy: string; messageIds: string[] }) => void;
  user_status_changed: (data: { userId: string; status: string; lastSeen?: string }) => void;
  user_statuses: (statuses: Record<string, string>) => void;
  conversation_messages: (data: { conversationId: string; messages: Message[] }) => void;
  more_messages: (data: { conversationId: string; messages: Message[]; hasMore: boolean }) => void;
  message_deleted: (data: { messageId: string; conversationId: string }) => void;
  admin_joined: (data: { conversationId: string; admin: Participant }) => void;
  error: (data: { message: string }) => void;
}
