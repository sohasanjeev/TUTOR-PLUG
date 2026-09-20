import { Conversation, Message } from '@/lib/types';

class ChatService {
  private conversations: Conversation[] = [];
  private messages: Record<string, Message[]> = {};

  async getConversations(userId: string): Promise<Conversation[]> {
    await new Promise((res) => setTimeout(res, 120));
    return this.conversations.filter((c) => c.student_id === userId || c.tutor_id === userId);
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    await new Promise((res) => setTimeout(res, 100));
    return this.messages[conversationId] || [];
  }

  async sendMessage(conversationId: string, senderId: string, text: string): Promise<Message> {
    await new Promise((res) => setTimeout(res, 80));

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: senderId,
      message: text,
      created_at: new Date().toISOString(),
    };

    if (!this.messages[conversationId]) {
      this.messages[conversationId] = [];
    }
    this.messages[conversationId].push(newMsg);

    // Update conversation timestamp
    const conv = this.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.last_message_at = newMsg.created_at;
      conv.updated_at = newMsg.created_at;
      conv.last_message = newMsg;
    }

    return newMsg;
  }
}

export const chatService = new ChatService();
