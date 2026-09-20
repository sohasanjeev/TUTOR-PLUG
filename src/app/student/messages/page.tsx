'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth-context';
import { chatService } from '@/services/chatService';
import { Conversation, Message } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import { Send, Paperclip, CheckCheck, ShieldCheck, User } from 'lucide-react';

export default function StudentMessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('conv-1');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    async function loadData() {
      const convs = await chatService.getConversations(user?.id || 'usr-stud-demo');
      setConversations(convs);
      if (convs.length > 0) {
        setSelectedConvId(convs[0].id);
        const msgs = await chatService.getMessages(convs[0].id);
        setMessages(msgs);
      }
    }
    loadData();
  }, [user]);

  const handleSelectConv = async (convId: string) => {
    setSelectedConvId(convId);
    const msgs = await chatService.getMessages(convId);
    setMessages(msgs);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvId) return;

    setIsSending(true);
    const sent = await chatService.sendMessage(
      selectedConvId,
      user?.id || 'usr-stud-demo',
      newMessage
    );
    setMessages((prev) => [...prev, sent]);
    setNewMessage('');
    setIsSending(false);
  };

  const activeConv = conversations.find((c) => c.id === selectedConvId);

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Tutor Messaging
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Secure, in-platform communication with your tutors. Phone numbers remain protected.
          </p>
        </div>

        {/* Chat Interface Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[600px]">
          {/* Left Conversations List */}
          <div className="md:col-span-1 border-r border-slate-200/80 flex flex-col">
            <div className="p-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500">
              Conversations ({conversations.length})
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {conversations.map((conv) => {
                const isSelected = conv.id === selectedConvId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConv(conv.id)}
                    className={`w-full p-4 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                      isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={conv.tutor?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                      alt="Tutor"
                      className="h-10 w-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {conv.tutor?.full_name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatTime(conv.last_message_at)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {conv.last_message?.message || 'Tap to open chat'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Active Message Thread */}
          <div className="md:col-span-2 flex flex-col h-full bg-slate-50/50">
            {/* Thread Header */}
            {activeConv ? (
              <>
                <div className="p-4 bg-white border-b border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeConv.tutor?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                      alt="Tutor"
                      className="h-9 w-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        {activeConv.tutor?.full_name}
                      </h3>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> In-App Protected Channel
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages Box */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.map((m) => {
                    const isMe = m.sender_id === (user?.id || 'usr-stud-demo');
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-xs sm:max-w-md rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs'
                              : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs shadow-xs'
                          }`}
                        >
                          <p>{m.message}</p>
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                              isMe ? 'text-indigo-200' : 'text-slate-400'
                            }`}
                          >
                            <span>{formatTime(m.created_at)}</span>
                            {isMe && <CheckCheck className="h-3 w-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Send Input Box */}
                <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="Attach notes or problem image"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>

                  <input
                    type="text"
                    placeholder="Type your message or doubt..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <Button
                    type="submit"
                    variant="gradient"
                    size="sm"
                    className="h-9 px-3.5"
                    isLoading={isSending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                Select a conversation to start chatting.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
