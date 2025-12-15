'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api-client';
import { RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface UnmatchedPayment {
  attempt: {
    id: string;
    orderId: string;
    amountCents: number;
    status: string;
    externalRef: string | null;
    createdAt: string;
  };
  reason: string;
}

export default function ReconciliationPage() {
  const [unmatched, setUnmatched] = useState<UnmatchedPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastReconciled, setLastReconciled] = useState<{ reconciled: number; unmatched: number } | null>(null);

  const runReconciliation = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/admin/payments/reconcile');
      setUnmatched(response.data.data?.unmatched || []);
      setLastReconciled({
        reconciled: response.data.data?.reconciled || 0,
        unmatched: response.data.data?.unmatched?.length || 0,
      });
    } catch (error: any) {
      console.error('Reconciliation failed:', error);
      alert(error.response?.data?.message || 'Reconciliation failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runReconciliation();
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Reconciliation</h1>
          <p className="mt-2 text-gray-600">Reconcile payment attempts with provider records</p>
        </div>
        <Button onClick={runReconciliation} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Run Reconciliation
        </Button>
      </div>

      {lastReconciled && (
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-gray-600">Reconciled</div>
                <div className="text-2xl font-bold text-green-600">{lastReconciled.reconciled}</div>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-orange-50 p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-sm text-gray-600">Unmatched</div>
                <div className="text-2xl font-bold text-orange-600">{lastReconciled.unmatched}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {unmatched.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <p className="mt-4 text-gray-500">All payments reconciled</p>
        </div>
      ) : (
        <div className="space-y-4">
          {unmatched.map((item, idx) => (
            <div key={idx} className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">Payment Attempt: {item.attempt.id}</h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <div>Order ID: {item.attempt.orderId}</div>
                    <div>Amount: KES {(item.attempt.amountCents / 100).toFixed(2)}</div>
                    <div>Status: {item.attempt.status}</div>
                    <div>External Ref: {item.attempt.externalRef || 'N/A'}</div>
                    <div className="mt-2 rounded bg-orange-50 p-2 text-orange-800">
                      Reason: {item.reason}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

