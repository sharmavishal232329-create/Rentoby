'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/context/AuthContext';
import { formatDateTime } from '@/lib/utils';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  CheckCheck,
  ShieldCheck,
  MapPin,
} from 'lucide-react';

interface ConversationItem {
  id: string;
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
  otherUser?: {
    id: string;
    name: string;
    city: string;
    localArea: string;
    avatarUrl: string | null;
  };
}

interface MessageItem {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  sender: { id: string; name: string };
}

export default function MessagesPage() {
  return (
    <React.Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Loading messages...</div>}>
      <MessagesView />
    </React.Suspense>
  );
}

function MessagesView() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const newRecipient = searchParams.get('newRecipient');
  const listingId = searchParams.get('listingId');
  const serviceId = searchParams.get('serviceId');

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    searchParams.get('conversationId') || null
  );
  const [activeMessages, setActiveMessages] = useState<MessageItem[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      setConversations(data.conversations || []);

      if (!activeConversationId && data.conversations && data.conversations.length > 0 && !newRecipient) {
        setActiveConversationId(data.conversations[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/messages?conversationId=${convId}`);
      const data = await res.json();
      if (data.conversation) {
        setActiveMessages(data.conversation.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      fetchActiveMessages(activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    setSending(true);

    try {
      const payload: any = {
        content: newMessageText.trim(),
      };

      if (activeConversationId) {
        payload.conversationId = activeConversationId;
      } else if (newRecipient) {
        payload.recipientId = newRecipient;
        if (listingId) payload.listingId = listingId;
        if (serviceId) payload.serviceId = serviceId;
      }

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');

      setNewMessageText('');
      if (data.conversationId) {
        setActiveConversationId(data.conversationId);
        fetchActiveMessages(data.conversationId);
        fetchConversations();
      }
    } catch (err: any) {
      alert(err.message || 'Error sending message');
    } finally {
      setSending(false);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[580px] grid grid-cols-1 md:grid-cols-3">
      {/* Conversations List Sidebar */}
      <div className="border-r border-slate-200 bg-slate-50/60 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-600" />
            <span>Messages</span>
          </h3>
        </div>

        <div className="flex-grow overflow-y-auto divide-y divide-slate-100">
          {loading ? (
            <p className="p-4 text-xs text-slate-400">Loading messages...</p>
          ) : conversations.length === 0 && !newRecipient ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No conversations yet. When you contact an owner or receive requests, messages will appear here.
            </div>
          ) : (
            <>
              {newRecipient && !activeConversationId && (
                <div className="p-4 bg-brand-50/80 border-l-4 border-brand-600 text-xs">
                  <span className="font-bold text-brand-900">New Message</span>
                  <p className="text-[11px] text-brand-700 mt-0.5">Send a message below to start this conversation.</p>
                </div>
              )}

              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveConversationId(c.id)}
                  className={`w-full p-4 text-left flex items-start gap-3 transition ${
                    activeConversationId === c.id ? 'bg-white shadow-sm' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {c.otherUser?.name.charAt(0) || 'U'}
                  </div>

                  <div className="flex-grow overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {c.otherUser?.name || 'User'}
                      </span>
                      {c.unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-brand-600 text-white rounded-full text-[10px] font-black">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {c.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Active Conversation Chat Window */}
      <div className="md:col-span-2 flex flex-col h-[580px]">
        {activeConversation || newRecipient ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                  {activeConversation?.otherUser?.name.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">
                    {activeConversation?.otherUser?.name || 'Marketplace Member'}
                  </h4>
                  {activeConversation?.otherUser && (
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{activeConversation.otherUser.localArea}, {activeConversation.otherUser.city}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Encrypted In-App Chat</span>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-slate-50/40">
              {activeMessages.map((msg) => {
                const isMe = user && msg.senderId === user.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-brand-600 text-white rounded-br-none shadow-sm'
                          : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p>{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {formatDateTime(msg.createdAt)}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your message regarding equipment, dates, or delivery..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-grow bg-slate-50 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
              />
              <button
                type="submit"
                disabled={sending || !newMessageText.trim()}
                className="p-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-md transition disabled:opacity-50 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
            <MessageSquare className="w-10 h-10 opacity-30" />
            <p className="text-xs">Select a conversation from the left to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
}
