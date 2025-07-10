export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: string; 
  createdAt: string; 
  updatedAt: string; 
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: string | User;
  content: string;
  type: "text" | "image" | "file";
  fileUrl?: string;
  readBy: string[];
  createdAt: string; 
  updatedAt: string; 
}

export interface Conversation {
  _id: string;
  participants: string[] | User[];
  lastMessage?: Message;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  admins?: string[];
  createdAt: string; 
  updatedAt: string; 
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SocketEvents {
  "user:online": (userId: string) => void;
  "user:offline": (userId: string) => void;
  "message:send": (
    message: Omit<Message, "_id" | "createdAt" | "updatedAt">
  ) => void;
  "message:receive": (message: Message) => void;
  "message:read": (conversationId: string, userId: string) => void;
  "conversation:created": (conversation: Conversation) => void;
  "typing:start": (conversationId: string, userId: string) => void;
  "typing:stop": (conversationId: string, userId: string) => void;
}
