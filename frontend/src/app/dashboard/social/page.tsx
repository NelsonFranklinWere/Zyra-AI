'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api-client';
import { Instagram, Facebook, MessageSquare, Plus, Trash2, Eye, Link } from 'lucide-react';

interface SocialAccount {
  id: string;
  platform: 'instagram' | 'facebook' | 'tiktok';
  username: string;
  connected: boolean;
  leadCapture: boolean;
  autoReply: boolean;
  createdAt: string;
}

interface Lead {
  id: string;
  platform: string;
  username: string;
  comment: string;
  intent: string;
  score: number;
  status: 'new' | 'contacted' | 'converted';
  createdAt: string;
}

export default function SocialPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    platform: 'instagram' as const,
    username: '',
    leadCapture: true,
    autoReply: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsRes, leadsRes] = await Promise.all([
        apiClient.get('/api/social/accounts'),
        apiClient.get('/api/social/leads'),
      ]);
      setAccounts(accountsRes.data.data || []);
      setLeads(leadsRes.data.data || []);
    } catch (error) {
      console.error('Failed to load social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async () => {
    try {
      await apiClient.post('/api/social/accounts', {
        ...newAccount,
        connected: false, // Always start as disconnected
      });
      setNewAccount({ platform: 'instagram', username: '', leadCapture: true, autoReply: false });
      setShowAddForm(false);
      await loadData();
    } catch (error: any) {
      alert('Failed to add account: ' + (error.response?.data?.message || error.message));
    }
  };

  const connectAccount = async (id: string) => {
    try {
      const account = accounts.find(a => a.id === id);
      if (!account) return;
      
      if (account.connected) {
        // Disconnect
        await apiClient.put(`/api/social/accounts/${id}`, { connected: false });
      } else {
        // Real OAuth connection
        window.location.href = `/api/social/auth/${account.platform}?accountId=${id}`;
      }
      await loadData();
    } catch (error: any) {
      alert('Failed to update connection: ' + (error.response?.data?.message || error.message));
    }
  };

  const toggleAccount = async (id: string, field: 'leadCapture' | 'autoReply') => {
    try {
      const account = accounts.find(a => a.id === id);
      if (!account) return;
      
      await apiClient.put(`/api/social/accounts/${id}`, { 
        [field]: !account[field] 
      });
      await loadData();
    } catch (error: any) {
      alert('Failed to update account: ' + (error.response?.data?.message || error.message));
    }
  };

  const removeAccount = async (id: string) => {
    if (!confirm('Remove this social account?')) return;
    try {
      await apiClient.delete(`/api/social/accounts/${id}`);
      await loadData();
    } catch (error: any) {
      alert('Failed to remove account: ' + (error.response?.data?.message || error.message));
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="h-5 w-5 text-pink-600" />;
      case 'facebook': return <Facebook className="h-5 w-5 text-blue-600" />;
      case 'tiktok': return <MessageSquare className="h-5 w-5 text-black" />;
      default: return <MessageSquare className="h-5 w-5 text-gray-600" />;
    }
  };

  const getLeadStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'converted': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="h-8 w-8" />
          Social Media Integration
        </h1>
        <p className="mt-2 text-gray-600">Capture leads from social media comments</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Connected Accounts */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Connected Accounts</h2>
            <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </div>

          {showAddForm && (
            <div className="rounded-lg bg-white p-4 shadow-sm border">
              <h3 className="font-medium mb-3">Add Social Account</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Platform</label>
                  <select
                    value={newAccount.platform}
                    onChange={(e) => setNewAccount({ ...newAccount, platform: e.target.value as any })}
                    className="w-full rounded border px-3 py-2"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input
                    type="text"
                    value={newAccount.username}
                    onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                    placeholder="@yourbusiness"
                    className="w-full rounded border px-3 py-2"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newAccount.leadCapture}
                      onChange={(e) => setNewAccount({ ...newAccount, leadCapture: e.target.checked })}
                    />
                    <span className="text-sm">Lead Capture</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newAccount.autoReply}
                      onChange={(e) => setNewAccount({ ...newAccount, autoReply: e.target.checked })}
                    />
                    <span className="text-sm">Auto Reply</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addAccount} size="sm">Add</Button>
                  <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm">Cancel</Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {accounts.length === 0 ? (
              <div className="rounded-lg bg-white p-6 text-center shadow-sm">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-500">No social accounts connected</p>
              </div>
            ) : (
              accounts.map((account) => (
                <div key={account.id} className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(account.platform)}
                      <div>
                        <div className="font-medium">{account.username}</div>
                        <div className="text-sm text-gray-500 capitalize">{account.platform}</div>
                      </div>
                      {account.connected ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                          ✓ Connected
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">
                          ✗ Not Connected
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => connectAccount(account.id)}
                        className={account.connected ? 'text-red-600' : 'text-green-600'}
                      >
                        {account.connected ? 'Disconnect' : 'Connect'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleAccount(account.id, 'leadCapture')}
                        title="Toggle lead capture"
                      >
                        <Eye className={`h-4 w-4 ${account.leadCapture ? 'text-green-600' : 'text-gray-400'}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAccount(account.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Recent Leads</h2>
          <div className="space-y-3">
            {leads.length === 0 ? (
              <div className="rounded-lg bg-white p-6 text-center shadow-sm">
                <Link className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-500">No leads captured yet</p>
              </div>
            ) : (
              leads.slice(0, 10).map((lead) => (
                <div key={lead.id} className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getPlatformIcon(lead.platform)}
                        <span className="font-medium">@{lead.username}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${getLeadStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">"{lead.comment}"</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Intent: {lead.intent}</span>
                        <span>Score: {lead.score}/100</span>
                        <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}