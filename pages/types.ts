
export interface UserProfile {
  name: string;
  email: string;
  farmName: string;
  location: string;
  avatar: string;
  role: 'farmer' | 'buyer';
  preferences: {
    language: string;
    notifications: boolean;
    theme: 'light' | 'dark' | 'farmer';
  };
}

export type ViewState = 'about' | 'how-it-works' | 'login' | 'signup' | 'dashboard' | 'buyer-dashboard' | 'wallet' | 'logistics' | 'messages' | 'profile' | 'farming-calendar' | 'community-hub' | 'marketplace' | 'seller-profile';

export interface Conversation {
  id: string;
  participantName: string;
  participantAvatar: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: string;
  content: string;
  timestamp: string;
  isMe: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

export interface Transaction {
  id: string;
  type: 'incoming' | 'outgoing';
  amount: number;
  item: string;
  date: string;
  status: 'completed' | 'pending';
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'planting' | 'harvesting' | 'market' | 'maintenance';
  description: string;
  isPending?: boolean;
}

export interface OfflineAction {
  id: string;
  type: 'send_message' | 'create_event';
  payload: any;
  timestamp: number;
}
