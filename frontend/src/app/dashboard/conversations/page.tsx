'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { MessageSquare, User, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Conversation {
  id: string;
  externalId: string;
  status: string;
  requiresHuman: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
}

interface Message {
  id: string;
  sender: string;
  text: string;
  intent?: string;
  entities?: any;
  createdAt: string;
}

export default function ConversationsPage() {
  const { organization } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [auditTrace, setAuditTrace] = useState<any>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      loadAuditTrace(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ success: boolean; data: Conversation[] }>('/admin/conversations');
      setConversations(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      const response = await apiClient.get(`/admin/conversations/${conversationId}/messages`);
      setMessages(response.data.data?.messages || []);
    } catch (error: any) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadAuditTrace = async (conversationId: string) => {
    try {
      const response = await apiClient.get(`/admin/conversations/${conversationId}/audit`);
      setAuditTrace(response.data.data);
    } catch (error: any) {
      console.error('Failed to load audit trace:', error);
    }
  };

  const handleEscalate = async (conversationId: string) => {
    try {
      await apiClient.post(`/admin/conversations/${conversationId}/escalate`);
      await loadConversations();
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation({ ...selectedConversation, requiresHuman: true });
      }
    } catch (error: any) {
      console.error('Failed to escalate:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-6">
      {/* Conversations list */}
      <div className="w-1/3 rounded-lg bg-white shadow-sm">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">Conversations</h2>
        </div>
        <div className="divide-y overflow-y-auto max-h-[calc(100vh-200px)]">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No conversations yet</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 text-left hover:bg-gray-50 ${
                  selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{conv.externalId}</span>
                  </div>
                  {conv.requiresHuman && (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  )}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {conv._count?.messages || 0} messages
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {new Date(conv.updatedAt).toLocaleString()}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages view */}
      <div className="flex-1 rounded-lg bg-white shadow-sm">
        {selectedConversation ? (
          <>
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{selectedConversation.externalId}</h2>
                  <div className="mt-1 flex gap-2 text-sm text-gray-500">
                    {selectedConversation.intent && (
                      <span className="rounded bg-blue-100 px-2 py-1 text-blue-800">
                        Intent: {selectedConversation.intent}
                      </span>
                    )}
                  </div>
                </div>
                {!selectedConversation.requiresHuman && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEscalate(selectedConversation.id)}
                  >
                    Escalate to Human
                  </Button>
                )}
              </div>
            </div>

            <div className="divide-y p-4">
              {loadingMessages ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500">No messages yet</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="py-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          msg.sender === 'customer' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}
                      >
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {msg.sender === 'customer' ? 'Customer' : 'Business'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm">{msg.text}</p>
                        {msg.intent && (
                          <div className="mt-2 flex gap-2 text-xs">
                            <span className="rounded bg-purple-100 px-2 py-1 text-purple-800">
                              Intent: {msg.intent}
                            </span>
                            {msg.entities && (
                              <span className="rounded bg-green-100 px-2 py-1 text-green-800">
                                Entities detected
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Audit trace */}
            {auditTrace?.processingTraces && auditTrace.processingTraces.length > 0 && (
              <div className="border-t p-4">
                <h3 className="mb-2 text-sm font-semibold">Processing Trace</h3>
                <div className="space-y-2 text-xs">
                  {auditTrace.processingTraces.map((trace: any, idx: number) => (
                    <div key={idx} className="rounded bg-gray-50 p-2">
                      <div className="flex items-center gap-2">
                        {trace.success ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span className="font-medium">{trace.step}</span>
                        {trace.durationMs && (
                          <span className="text-gray-400">({trace.durationMs}ms)</span>
                        )}
                      </div>
                      {trace.error && (
                        <div className="mt-1 text-red-600">{trace.error}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            Select a conversation to view messages
          </div>
        )}
      </div>
    </div>
  );
}
