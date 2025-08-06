// User types
export interface User {
  id: string;
  email: string;
  username: string;
  profile: UserProfile;
  messageSettings: MessageSettings;
  createdAt: Date;
}

export interface UserProfile {
  nickname?: string;
  avatar?: string;
  bio?: string;
  hobbies?: string[];
  socialLinks?: Record<string, string>;
}

export interface MessageSettings {
  acceptFrom: 'all' | 'friends_only';
  emailNotifications: boolean;
}

// Friend types
export interface FriendRequest {
  id: string;
  senderId: string;
  senderName?: string;
  senderEmail?: string;
  recipientId: string;
  recipientName?: string;
  recipientEmail?: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  requestedAt: Date | string;
  respondedAt?: Date | string;
}

export interface FriendRelation {
  userId: string;
  friendId: string;
  addedAt: Date;
}

// Message types
export interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  recipientId: string;
  recipientName?: string;
  content: string;
  encrypted: boolean;
  read: boolean;
  createdAt: Date | string;
}

export interface MessageThread {
  userId: string;
  username: string;
  avatar?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

// Event types
export interface Event {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  type: 'online' | 'offline';
  location: string;
  maxParticipants?: number;
  price?: number;
  currency?: string;
  reminderSettings?: ReminderSettings;
  cancelPolicy?: string;
  startAt: Date;
  endAt: Date;
  createdAt: Date;
}

export interface ReminderSettings {
  twoDaysBefore: boolean;
  oneDayBefore: boolean;
  customHours?: number[];
}

export interface EventParticipant {
  eventId: string;
  userId: string;
  joinedAt: Date;
  paymentId?: string;
}

// Post types
export interface Post {
  id: string;
  authorId: string;
  content: string;
  images?: string[];
  visibility: 'public' | 'friends_only';
  createdAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

// Block types
export interface BlockRelation {
  userId: string;
  blockedUserId: string;
  level: 'full';
  blockedAt: Date;
}

// Interest types
export interface InterestRelation {
  userId: string;
  targetUserId: string;
  addedAt: Date;
}