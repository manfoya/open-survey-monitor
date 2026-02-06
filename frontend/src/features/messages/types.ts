import { UserRole } from "@/features/auth/types";

export interface Message {
  id: number;
  sender_id: number;
  title: string;
  content: string;
  target_role: UserRole | null;
  target_user_id: number | null;
  created_at: string;
  sender_username: string; // Calculated field
  recipient_name?: string; // Calculated field
}

export interface MessageCreate {
  title: string;
  content: string;
  target_role: UserRole | null;
  target_user_id: number | null;
}

export interface MessageOut extends Message {}
