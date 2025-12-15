'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { TrendingUp, MessageSquare, Brain, Package, DollarSign } from 'lucide-react';

interface UsageData {
  organization: {
    id: string;
    name: string;
    automationEnabled: boolean;
    llmBudgetDaily: number | null;
  };
  llmUsage: {
    totalCalls: number;
    totalTokens: number;
    totalCostCents: number;
    dailyUsage: Array<{ date: string; calls: number; tokens: number }>;
  };
  messages: {
    inbound: number;
    outbound: number;
  };
  orders: {
    total: number;
    pending: number;
    paid: number;
  };
}

export default function UsagePage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      setLoading(true);
      // Get current user's org
      const userResponse = await apiClient.get('/api/auth/me');
      const orgId = userResponse.data.data.orgId;

      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const response = await apiClient.get(
        `/api/admin/organizations/${orgId}/usage?${params.toString()}`
      );
      setUsage(response.data.data);
    } catch (error: any) {
      console.error('Failed to load usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading usage data...</div>;
  }

  if (!usage) {
    return <div className="p-8">No usage data available</div>;
  }

  const llmRemaining = usage.organization.llmBudgetDaily
    ? Math.max(0, usage.organization.llmBudgetDaily - usage.llmUsage.totalCalls)
    : null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Usage & Billing</h1>
        <p className="mt-2 text-gray-600">Organization: {usage.organization.name}</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Inbound Messages</div>
              <div className="text-2xl font-bold">{usage.messages.inbound}</div>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Outbound Messages</div>
              <div className="text-2xl font-bold">{usage.messages.outbound}</div>
            </div>
            <MessageSquare className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">LLM Calls</div>
              <div className="text-2xl font-bold">{usage.llmUsage.totalCalls}</div>
              {usage.organization.llmBudgetDaily && (
                <div className="text-xs text-gray-400">
                  {llmRemaining} remaining today
                </div>
              )}
            </div>
            <Brain className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Orders</div>
              <div className="text-2xl font-bold">{usage.orders.total}</div>
              <div className="text-xs text-gray-400">
                {usage.orders.paid} paid
              </div>
            </div>
            <Package className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* LLM Usage Chart */}
      {usage.llmUsage.dailyUsage.length > 0 && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">LLM Usage (Daily)</h2>
          <div className="space-y-2">
            {usage.llmUsage.dailyUsage.slice(-7).map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600">{day.date}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 rounded bg-purple-500"
                      style={{
                        width: `${Math.min(100, (day.calls / (usage.organization.llmBudgetDaily || 100)) * 100)}%`,
                      }}
                    />
                    <span className="text-sm">{day.calls} calls</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cost Summary */}
      {usage.llmUsage.totalCostCents > 0 && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Estimated Costs</h2>
          <div className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-green-600" />
            <div>
              <div className="text-2xl font-bold">
                ${(usage.llmUsage.totalCostCents / 100).toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">LLM API costs (estimated)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

