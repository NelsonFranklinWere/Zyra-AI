'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api-client';
import { CheckCircle2, XCircle, Eye, AlertCircle } from 'lucide-react';

interface PendingTemplate {
  id: string;
  name: string;
  content: string;
  status: string;
  sensitive: boolean;
  createdAt: string;
}

interface EscalatedConversation {
  id: string;
  externalId: string;
  requiresHuman: boolean;
  userId: string | null;
  messages: Array<{ text: string; createdAt: string }>;
}

export default function ModerationPage() {
  const [templates, setTemplates] = useState<PendingTemplate[]>([]);
  const [conversations, setConversations] = useState<EscalatedConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'templates' | 'escalations'>('templates');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'templates') {
        const response = await apiClient.get('/api/admin/moderation/templates');
        setTemplates(response.data.data || []);
      } else {
        const response = await apiClient.get('/api/admin/moderation/escalations');
        setConversations(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Failed to load moderation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTemplate = async (id: string, action: 'approve' | 'reject') => {
    try {
      await apiClient.post(`/api/admin/moderation/templates/${id}/approve`, { action });
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update template');
    }
  };

  const handleClaimConversation = async (id: string) => {
    try {
      await apiClient.post(`/api/admin/moderation/conversations/${id}/claim`);
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to claim conversation');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Moderation Queue</h1>
        <p className="mt-2 text-gray-600">Approve templates and handle escalations</p>
      </div>

      <div className="mb-6 flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'templates'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500'
          }`}
        >
          Pending Templates ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('escalations')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'escalations'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500'
          }`}
        >
          Escalations ({conversations.length})
        </button>
      </div>

      {activeTab === 'templates' && (
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow-sm">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <p className="mt-4 text-gray-500">No pending templates</p>
            </div>
          ) : (
            templates.map((template) => (
              <div key={template.id} className="rounded-lg bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{template.name}</h3>
                    {template.sensitive && (
                      <span className="mt-1 inline-block rounded bg-red-100 px-2 py-1 text-xs text-red-800">
                        Sensitive
                      </span>
                    )}
                    <pre className="mt-3 rounded bg-gray-100 p-3 text-sm">{template.content}</pre>
                    <div className="mt-3 text-xs text-gray-400">
                      Created: {new Date(template.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApproveTemplate(template.id, 'approve')}
                      className="text-green-600"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApproveTemplate(template.id, 'reject')}
                      className="text-red-600"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'escalations' && (
        <div className="space-y-4">
          {conversations.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow-sm">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <p className="mt-4 text-gray-500">No escalated conversations</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div key={conv.id} className="rounded-lg bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <div>
                        <h3 className="font-semibold">Conversation: {conv.externalId}</h3>
                        {conv.userId && (
                          <div className="text-sm text-gray-500">Claimed by user</div>
                        )}
                      </div>
                    </div>
                    {conv.messages.length > 0 && (
                      <div className="mt-3 rounded bg-gray-50 p-3">
                        <div className="text-sm font-medium">Latest message:</div>
                        <div className="mt-1 text-sm">{conv.messages[0].text}</div>
                      </div>
                    )}
                  </div>
                  {!conv.userId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleClaimConversation(conv.id)}
                    >
                      Claim
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

