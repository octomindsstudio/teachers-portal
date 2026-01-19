import { User as PrismaUser } from "~/generated/prisma/client";

export interface User extends PrismaUser {}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  syncSession: () => Promise<void>;
  resetStore: () => void;
}
