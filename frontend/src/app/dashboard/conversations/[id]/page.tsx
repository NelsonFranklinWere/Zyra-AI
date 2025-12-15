'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface ProcessingTrace {
  id: string;
  step: string;
  input: any;
  output: any;
  success: boolean;
  error: string | null;
  durationMs: number | null;
  createdAt: string;
}

interface ConversationDetail {
  id: string;
  externalId: string;
  status: string;
  requiresHuman: boolean;
  messages: Array<{
    id: string;
    text: string;
    sender: string;
    intent: string | null;
    entities: any;
    createdAt: string;
  }>;
}

export default function ConversationDetailPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [traces, setTraces] = useState<ProcessingTrace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversation();
    loadAudit();
  }, [conversationId]);

  const loadConversation = async () => {
    try {
      const response = await apiClient.get(`/api/admin/conversations/${conversationId}`);
      setConversation(response.data.data);
    } catch (error: any) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAudit = async () => {
    try {
      const response = await apiClient.get(`/api/admin/conversations/${conversationId}/audit`);
      setTraces(response.data.data?.processingTraces || []);
    } catch (error: any) {
      console.error('Failed to load audit:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!conversation) {
    return <div className="p-8">Conversation not found</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Conversation Details</h1>
        <p className="mt-2 text-gray-600">Phone: {conversation.externalId}</p>
        {conversation.requiresHuman && (
          <span className="mt-2 inline-block rounded bg-orange-100 px-3 py-1 text-sm text-orange-800">
            Requires Human Attention
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Messages */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          {conversation.messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-lg p-4 ${
                message.sender === 'customer' ? 'bg-blue-50' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {message.sender === 'customer' ? 'Customer' : 'Business'}
                  </div>
                  <div className="mt-1">{message.text}</div>
                  {message.intent && (
                    <div className="mt-2 text-xs text-gray-500">
                      Intent: {message.intent}
                    </div>
                  )}
                  {message.entities && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-gray-500">Entities</summary>
                      <pre className="mt-1 text-xs">{JSON.stringify(message.entities, null, 2)}</pre>
                    </details>
                  )}
                </div>
                <div className="ml-4 text-xs text-gray-400">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Processing Traces */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Processing Timeline</h2>
          {traces.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
              No processing traces available
            </div>
          ) : (
            <div className="space-y-3">
              {traces.map((trace, idx) => (
                <div
                  key={trace.id}
                  className="flex gap-3 rounded-lg bg-white p-4 shadow-sm"
                >
                  <div className="flex-shrink-0">
                    {trace.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{trace.step}</div>
                    {trace.error && (
                      <div className="mt-1 text-sm text-red-600">{trace.error}</div>
                    )}
                    {trace.durationMs && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {trace.durationMs}ms
                      </div>
                    )}
                    <div className="mt-1 text-xs text-gray-400">
                      {new Date(trace.createdAt).toLocaleString()}
                    </div>
                    {trace.output && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-gray-500">Output</summary>
                        <pre className="mt-1 max-h-32 overflow-auto rounded bg-gray-100 p-2 text-xs">
                          {JSON.stringify(trace.output, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

