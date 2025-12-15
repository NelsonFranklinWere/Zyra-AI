'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api-client';
import { AlertCircle, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';

interface DLQItem {
  id: string;
  queueName: string;
  jobId: string | null;
  error: string;
  stackTrace: string | null;
  retryCount: number;
  status: string;
  createdAt: string;
  payload: any;
}

export default function DLQPage() {
  const [items, setItems] = useState<DLQItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDLQ();
  }, []);

  const loadDLQ = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/admin/dlq');
      setItems(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to load DLQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReprocess = async (id: string) => {
    try {
      await apiClient.post(`/api/admin/dlq/${id}/reprocess`);
      await loadDLQ();
    } catch (error: any) {
      console.error('Failed to reprocess:', error);
      alert(error.response?.data?.message || 'Failed to reprocess');
    }
  };

  const handleDiscard = async (id: string) => {
    if (!confirm('Are you sure you want to discard this DLQ item?')) {
      return;
    }

    try {
      await apiClient.delete(`/api/admin/dlq/${id}`, {
        data: { reason: 'Manually discarded by admin' },
      });
      await loadDLQ();
    } catch (error: any) {
      console.error('Failed to discard:', error);
      alert(error.response?.data?.message || 'Failed to discard');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading DLQ items...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dead Letter Queue</h1>
          <p className="mt-2 text-gray-600">Jobs that failed after retries</p>
        </div>
        <Button onClick={loadDLQ} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <p className="mt-4 text-gray-500">No items in dead letter queue</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <h3 className="font-semibold">Queue: {item.queueName}</h3>
                      <div className="mt-1 text-sm text-gray-500">
                        Job ID: {item.jobId || 'N/A'} • Retries: {item.retryCount} • Status: {item.status}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-md bg-red-50 p-3">
                    <div className="text-sm font-medium text-red-800">Error:</div>
                    <div className="mt-1 text-sm text-red-700">{item.error}</div>
                  </div>

                  {item.stackTrace && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-gray-600">Stack Trace</summary>
                      <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-3 text-xs">
                        {item.stackTrace}
                      </pre>
                    </details>
                  )}

                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-gray-600">Payload</summary>
                    <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-3 text-xs">
                      {JSON.stringify(item.payload, null, 2)}
                    </pre>
                  </details>

                  <div className="mt-3 text-xs text-gray-400">
                    Created: {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="ml-4 flex gap-2">
                  {item.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReprocess(item.id)}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reprocess
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDiscard(item.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Discard
                      </Button>
                    </>
                  )}
                  {item.status === 'reprocessed' && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-800">
                      Reprocessed
                    </span>
                  )}
                  {item.status === 'discarded' && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-800">
                      Discarded
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

