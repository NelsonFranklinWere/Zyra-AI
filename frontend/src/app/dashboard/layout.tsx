'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getCurrentUser, logout } from '@/lib/auth';
import { useAuthStore } from '@/store/auth-store';
import { MessageSquare, Settings, LayoutDashboard, LogOut, Package, Users, Shield, FileText, Activity, AlertCircle, CheckCircle2, TrendingUp, Brain, Sparkles } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      // Check if user is already in store (from registration/login)
      const storeUser = useAuthStore.getState().user;
      if (storeUser) {
        setUser(storeUser);
        setLoading(false);
        // Still fetch fresh data in background
        try {
          const data = await getCurrentUser();
          setUser(data);
          useAuthStore.getState().setUser(data as any);
          if (data.organization) {
            useAuthStore.getState().setOrganization(data.organization as any);
          }
        } catch (error) {
          console.error('Failed to fetch current user:', error);
          // Don't redirect if we have a user in store
        }
        return;
      }

      // If no user in store, fetch from API
      try {
        const data = await getCurrentUser();
        setUser(data);
        useAuthStore.getState().setUser(data as any);
        if (data.organization) {
          useAuthStore.getState().setOrganization(data.organization as any);
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
        // Only redirect if we don't have a token cookie (middleware should handle this)
        const hasToken = document.cookie.split('; ').some(row => row.startsWith('token='));
        if (!hasToken) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await logout();
      useAuthStore.getState().clearAuth();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear local state even if API call fails
      useAuthStore.getState().clearAuth();
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <h1 className="text-xl font-bold">Zyra</h1>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/products"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <Package className="h-5 w-5" />
              Products
            </Link>
            <Link
              href="/dashboard/conversations"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <MessageSquare className="h-5 w-5" />
              Conversations
            </Link>
            <Link
              href="/dashboard/team"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <Users className="h-5 w-5" />
              Team
            </Link>
            <Link
              href="/dashboard/templates"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <FileText className="h-5 w-5" />
              Templates
            </Link>
            <Link
              href="/dashboard/rules"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <Shield className="h-5 w-5" />
              Rules
            </Link>
            <Link
              href="/dashboard/simulate"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <MessageSquare className="h-5 w-5" />
              Simulate
            </Link>
            <Link
              href="/dashboard/orders"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <Package className="h-5 w-5" />
              Orders
            </Link>
            <Link
              href="/dashboard/monitoring"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <Activity className="h-5 w-5" />
              Monitoring
            </Link>
            <Link
              href="/dashboard/dlq"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <AlertCircle className="h-5 w-5" />
              DLQ
            </Link>
            <Link
              href="/dashboard/moderation"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <Shield className="h-5 w-5" />
              Moderation
            </Link>
            <Link
              href="/dashboard/reconciliation"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <CheckCircle2 className="h-5 w-5" />
              Reconciliation
            </Link>
            <Link
              href="/dashboard/usage"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <TrendingUp className="h-5 w-5" />
              Usage
            </Link>
            <div className="border-t my-2"></div>
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              AI Automation
            </div>
            <Link
              href="/dashboard/ai/memory"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <Brain className="h-5 w-5" />
              AI Memory
            </Link>
            <Link
              href="/dashboard/ai/traces"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <Sparkles className="h-5 w-5" />
              AI Traces
            </Link>
            <Link
              href="/dashboard/ai/approvals"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <Shield className="h-5 w-5" />
              Approvals
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>

          <div className="border-t p-4">
            <div className="mb-3 text-sm text-gray-600">
              {user?.name && <div className="font-medium">{user.name}</div>}
              {user?.email && <div className="text-xs text-gray-500">{user.email}</div>}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

