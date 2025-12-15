'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { Activity, AlertCircle, CheckCircle2, Clock, Database, MessageSquare, Package, TrendingUp } from 'lucide-react';

interface SystemMetrics {
  messages: {
    inbound: number;
    outbound: number;
    processed: number;
  };
  orders: {
    total: number;
    pending: number;
    paid: number;
  };
  queues: {
    messageProcessing: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
    };
  };
  database: {
    connections: number;
  };
  redis: {
    connected: boolean;
  };
}

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    loadMetrics();
    loadHealth();
    const interval = setInterval(() => {
      loadMetrics();
      loadHealth();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await apiClient.get('/system/metrics');
      setMetrics(response.data.data);
    } catch (error: any) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHealth = async () => {
    try {
      const response = await apiClient.get('/health');
      setHealth(response.data);
    } catch (error: any) {
      console.error('Failed to load health:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading metrics...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">System Monitoring</h1>
        <p className="mt-2 text-gray-600">Real-time system metrics and health status</p>
      </div>

      {/* Health Status */}
      {health && (
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Database className={`h-5 w-5 ${health.services?.database === 'healthy' ? 'text-green-500' : 'text-red-500'}`} />
              <div>
                <div className="text-sm text-gray-500">Database</div>
                <div className="font-semibold capitalize">{health.services?.database || 'unknown'}</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Activity className={`h-5 w-5 ${health.services?.redis === 'healthy' ? 'text-green-500' : 'text-gray-400'}`} />
              <div>
                <div className="text-sm text-gray-500">Redis</div>
                <div className="font-semibold capitalize">{health.services?.redis || 'not_configured'}</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              {health.status === 'healthy' ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <div className="text-sm text-gray-500">Overall Status</div>
                <div className="font-semibold capitalize">{health.status || 'unknown'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {metrics && (
        <>
          {/* Messages Metrics */}
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Inbound Messages (24h)</div>
                  <div className="text-2xl font-bold">{metrics.messages.inbound}</div>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Outbound Messages (24h)</div>
                  <div className="text-2xl font-bold">{metrics.messages.outbound}</div>
                </div>
                <MessageSquare className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Processed Messages (24h)</div>
                  <div className="text-2xl font-bold">{metrics.messages.processed}</div>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Orders Metrics */}
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Total Orders</div>
                  <div className="text-2xl font-bold">{metrics.orders.total}</div>
                </div>
                <Package className="h-8 w-8 text-gray-500" />
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Pending Orders</div>
                  <div className="text-2xl font-bold">{metrics.orders.pending}</div>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Paid Orders</div>
                  <div className="text-2xl font-bold">{metrics.orders.paid}</div>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Queue Metrics */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Queue Status</h2>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <div className="text-sm text-gray-500">Waiting</div>
                <div className={`text-xl font-bold ${metrics.queues.messageProcessing.waiting > 50 ? 'text-orange-500' : 'text-gray-900'}`}>
                  {metrics.queues.messageProcessing.waiting}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Active</div>
                <div className="text-xl font-bold">{metrics.queues.messageProcessing.active}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Completed</div>
                <div className="text-xl font-bold text-green-600">{metrics.queues.messageProcessing.completed}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Failed</div>
                <div className={`text-xl font-bold ${metrics.queues.messageProcessing.failed > 10 ? 'text-red-500' : 'text-gray-900'}`}>
                  {metrics.queues.messageProcessing.failed}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

