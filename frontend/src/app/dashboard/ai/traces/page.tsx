'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';

interface Trace {
  id: string;
  traceType: string;
  payload: any;
  success: boolean;
  errorMsg?: string;
  createdAt: string;
  conversationId?: string;
  messageId?: string;
}

export default function AITracesPage() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversationId');
  
  const [traces, setTraces] = useState<Trace[]>([]);
  const [loading, setLoading] = useState(true);
  const [traceTypeFilter, setTraceTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadTraces();
  }, [conversationId, traceTypeFilter]);

  const loadTraces = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (conversationId) params.conversationId = conversationId;
      if (traceTypeFilter !== 'all') params.traceType = traceTypeFilter;

      const response = await apiClient.get('/api/ai/traces', { params });
      if (response.data.success) {
        setTraces(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load traces:', error);
    } finally {
      setLoading(false);
    }
  };

  const traceTypeColors: Record<string, string> = {
    INTENT_DETECTED: 'bg-blue-100 text-blue-800',
    MUE_PARSED: 'bg-green-100 text-green-800',
    AI_REPLY: 'bg-purple-100 text-purple-800',
    ACTION_EXECUTED: 'bg-yellow-100 text-yellow-800',
    ORDER_STATE_UPDATED: 'bg-orange-100 text-orange-800',
    PAYMENT_TRIGGERED: 'bg-indigo-100 text-indigo-800',
    PAYMENT_CONFIRMED: 'bg-emerald-100 text-emerald-800',
    SOCIAL_LEAD_CAPTURED: 'bg-pink-100 text-pink-800',
  };

  if (loading) {
    return <div className="p-6">Loading traces...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Processing Traces</h1>
          <p className="text-muted-foreground">
            View detailed processing traces for AI operations
            {conversationId && ` - Conversation: ${conversationId}`}
          </p>
        </div>
        <Select value={traceTypeFilter} onValueChange={setTraceTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="INTENT_DETECTED">Intent Detected</SelectItem>
            <SelectItem value="MUE_PARSED">MUE Parsed</SelectItem>
            <SelectItem value="AI_REPLY">AI Reply</SelectItem>
            <SelectItem value="ACTION_EXECUTED">Action Executed</SelectItem>
            <SelectItem value="ORDER_STATE_UPDATED">Order Updated</SelectItem>
            <SelectItem value="PAYMENT_TRIGGERED">Payment Triggered</SelectItem>
            <SelectItem value="PAYMENT_CONFIRMED">Payment Confirmed</SelectItem>
            <SelectItem value="SOCIAL_LEAD_CAPTURED">Lead Captured</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {traces.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No traces found
            </CardContent>
          </Card>
        ) : (
          traces.map((trace) => (
            <Card key={trace.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          traceTypeColors[trace.traceType] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {trace.traceType}
                      </span>
                      {trace.success ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-red-600">✗</span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {new Date(trace.createdAt).toLocaleString()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {trace.errorMsg && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm font-semibold text-red-800">Error:</p>
                    <p className="text-sm text-red-600">{trace.errorMsg}</p>
                  </div>
                )}
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(trace.payload, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

