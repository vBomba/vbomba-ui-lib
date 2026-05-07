export type VbChatRole = 'user' | 'assistant' | 'system';

export interface VbChatbotMessage {
  id?: string;
  role: VbChatRole;
  text: string;
}
