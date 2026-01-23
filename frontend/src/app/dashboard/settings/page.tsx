'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import apiClient from '@/lib/api-client';
import { Settings, User, Building, MessageSquare, Save } from 'lucide-react';

export default function SettingsPage() {
  const { user, organization } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [orgSettings, setOrgSettings] = useState({ name: '', automationEnabled: true });

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || '', email: user.email || '' });
    }
    if (organization) {
      setOrgSettings({ 
        name: organization.name || '', 
        automationEnabled: organization.automationEnabled ?? true 
      });
    }
  }, [user, organization]);

  const saveProfile = async () => {
    setLoading(true);
    try {
      await apiClient.put('/api/auth/profile', profile);
      alert('Profile updated successfully');
    } catch (error: any) {
      alert('Failed to update profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const saveOrgSettings = async () => {
    setLoading(true);
    try {
      await apiClient.put('/api/org/settings', orgSettings);
      alert('Organization settings updated successfully');
    } catch (error: any) {
      alert('Failed to update settings: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="mt-2 text-gray-600">Manage your account and business settings</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <User className="h-5 w-5" />
            Profile Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary"
              />
            </div>
            <Button onClick={saveProfile} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              Save Profile
            </Button>
          </div>
        </div>

        {/* Organization Settings */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Building className="h-5 w-5" />
            Organization Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                value={orgSettings.name}
                onChange={(e) => setOrgSettings({ ...orgSettings, name: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="automation"
                checked={orgSettings.automationEnabled}
                onChange={(e) => setOrgSettings({ ...orgSettings, automationEnabled: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="automation" className="text-sm font-medium text-gray-700">
                Enable AI Automation
              </label>
            </div>
            <Button onClick={saveOrgSettings} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              Save Organization
            </Button>
          </div>
        </div>

        {/* WhatsApp Integration */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5" />
            WhatsApp Integration
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                WhatsApp Business API configuration is managed by your system administrator.
                Contact support for setup assistance.
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <p><strong>Status:</strong> <span className="text-green-600">Connected</span></p>
              <p><strong>Provider:</strong> Meta WhatsApp Business API</p>
              <p><strong>Phone Number:</strong> +254700000000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

