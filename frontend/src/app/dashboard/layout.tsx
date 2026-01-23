'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getCurrentUser, logout } from '@/lib/auth';
import { useAuthStore } from '@/store/auth-store';
import { MessageSquare, Settings, LayoutDashboard, LogOut, Package, Users, Shield, FileText, Activity, AlertCircle, CheckCircle2, TrendingUp, Brain, Sparkles, Menu, X, RefreshCw, Building, Instagram, UsersIcon } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const handleRefresh = () => {
    window.location.reload();
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const NavLink = ({ href, icon: Icon, children }: { href: string; icon: any; children: React.ReactNode }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          active
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <Icon className="h-5 w-5" />
        {children}
      </Link>
    );
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
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-sm transition-all duration-300`}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b px-6">
            {sidebarOpen && <h1 className="text-xl font-bold">Zyra</h1>}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            <NavLink href="/dashboard" icon={LayoutDashboard}>
              {sidebarOpen && 'Dashboard'}
            </NavLink>
            <NavLink href="/dashboard/business" icon={Building}>
              {sidebarOpen && 'Business Profile'}
            </NavLink>
            <NavLink href="/dashboard/products" icon={Package}>
              {sidebarOpen && 'Products'}
            </NavLink>
            <NavLink href="/dashboard/conversations" icon={MessageSquare}>
              {sidebarOpen && 'Conversations'}
            </NavLink>
            <NavLink href="/dashboard/team" icon={Users}>
              {sidebarOpen && 'Team'}
            </NavLink>
            <NavLink href="/dashboard/social" icon={Instagram}>
              {sidebarOpen && 'Social Media'}
            </NavLink>
            <NavLink href="/dashboard/groups" icon={UsersIcon}>
              {sidebarOpen && 'WhatsApp Groups'}
            </NavLink>
            <NavLink href="/dashboard/templates" icon={FileText}>
              {sidebarOpen && 'Templates'}
            </NavLink>
            <NavLink href="/dashboard/rules" icon={Shield}>
              {sidebarOpen && 'Rules'}
            </NavLink>
            <NavLink href="/dashboard/simulate" icon={MessageSquare}>
              {sidebarOpen && 'Simulate'}
            </NavLink>
            <NavLink href="/dashboard/orders" icon={Package}>
              {sidebarOpen && 'Orders'}
            </NavLink>
            <NavLink href="/dashboard/monitoring" icon={Activity}>
              {sidebarOpen && 'Monitoring'}
            </NavLink>
            <NavLink href="/dashboard/dlq" icon={AlertCircle}>
              {sidebarOpen && 'DLQ'}
            </NavLink>
            <NavLink href="/dashboard/moderation" icon={Shield}>
              {sidebarOpen && 'Moderation'}
            </NavLink>
            <NavLink href="/dashboard/reconciliation" icon={CheckCircle2}>
              {sidebarOpen && 'Reconciliation'}
            </NavLink>
            <NavLink href="/dashboard/usage" icon={TrendingUp}>
              {sidebarOpen && 'Usage'}
            </NavLink>
            {sidebarOpen && (
              <>
                <div className="border-t my-2"></div>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  AI Automation
                </div>
              </>
            )}
            <NavLink href="/dashboard/ai/memory" icon={Brain}>
              {sidebarOpen && 'AI Memory'}
            </NavLink>
            <NavLink href="/dashboard/ai/traces" icon={Sparkles}>
              {sidebarOpen && 'AI Traces'}
            </NavLink>
            <NavLink href="/dashboard/ai/approvals" icon={Shield}>
              {sidebarOpen && 'Approvals'}
            </NavLink>
            <NavLink href="/dashboard/settings" icon={Settings}>
              {sidebarOpen && 'Settings'}
            </NavLink>
          </nav>

          <div className="border-t p-4">
            {sidebarOpen && (
              <div className="mb-3 text-sm text-gray-600">
                {user?.name && <div className="font-medium">{user.name}</div>}
                {user?.email && <div className="text-xs text-gray-500">{user.email}</div>}
              </div>
            )}
            <Button
              variant="outline"
              size={sidebarOpen ? "sm" : "icon"}
              className={sidebarOpen ? "w-full" : "w-8 h-8"}
              onClick={handleLogout}
            >
              <LogOut className={sidebarOpen ? "mr-2 h-4 w-4" : "h-4 w-4"} />
              {sidebarOpen && 'Logout'}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        {/* Header with refresh button */}
        <div className="flex items-center justify-end border-b bg-white px-8 py-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className="h-8 w-8"
            title="Refresh page"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

