'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import apiClient from '@/lib/api-client';
import { Building, Clock, MapPin, MessageCircle, Save } from 'lucide-react';

export default function BusinessProfilePage() {
  const { organization } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    description: '',
    tone: 'friendly',
    workingHours: {
      monday: { start: '09:00', end: '17:00', enabled: true },
      tuesday: { start: '09:00', end: '17:00', enabled: true },
      wednesday: { start: '09:00', end: '17:00', enabled: true },
      thursday: { start: '09:00', end: '17:00', enabled: true },
      friday: { start: '09:00', end: '17:00', enabled: true },
      saturday: { start: '09:00', end: '15:00', enabled: true },
      sunday: { start: '10:00', end: '14:00', enabled: false },
    },
    deliveryZones: ['Nairobi CBD', 'Westlands', 'Karen'],
    policies: {
      returns: 'Returns accepted within 7 days',
      exchanges: 'Exchanges allowed for size/color',
      cancellation: 'Free cancellation within 2 hours',
    }
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await apiClient.get('/api/business/profile');
      if (response.data.success) {
        setProfile({ ...profile, ...response.data.data });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      await apiClient.put('/api/business/profile', profile);
      alert('Business profile updated successfully!');
    } catch (error: any) {
      alert('Failed to save: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const updateWorkingHours = (day: string, field: string, value: any) => {
    setProfile({
      ...profile,
      workingHours: {
        ...profile.workingHours,
        [day]: { ...profile.workingHours[day], [field]: value }
      }
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building className="h-8 w-8" />
          Business Profile
        </h1>
        <p className="mt-2 text-gray-600">Teach Zyra about your business</p>
      </div>

      <div className="space-y-6">
        {/* Business Description */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Business Description</h2>
          <textarea
            value={profile.description}
            onChange={(e) => setProfile({ ...profile, description: e.target.value })}
            rows={6}
            placeholder="Describe your business, what you sell, your core policies, and how you operate..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary"
          />
        </div>

        {/* Tone Preferences */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5" />
            AI Tone & Style
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['friendly', 'formal', 'salesy', 'calm'].map((tone) => (
              <label key={tone} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tone"
                  value={tone}
                  checked={profile.tone === tone}
                  onChange={(e) => setProfile({ ...profile, tone: e.target.value })}
                  className="h-4 w-4"
                />
                <span className="capitalize">{tone}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Working Hours */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5" />
            Working Hours
          </h2>
          <div className="space-y-3">
            {Object.entries(profile.workingHours).map(([day, hours]) => (
              <div key={day} className="flex items-center gap-4">
                <div className="w-20">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hours.enabled}
                      onChange={(e) => updateWorkingHours(day, 'enabled', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="capitalize text-sm">{day}</span>
                  </label>
                </div>
                {hours.enabled && (
                  <>
                    <input
                      type="time"
                      value={hours.start}
                      onChange={(e) => updateWorkingHours(day, 'start', e.target.value)}
                      className="rounded border px-2 py-1 text-sm"
                    />
                    <span className="text-sm">to</span>
                    <input
                      type="time"
                      value={hours.end}
                      onChange={(e) => updateWorkingHours(day, 'end', e.target.value)}
                      className="rounded border px-2 py-1 text-sm"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Zones */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5" />
            Delivery Zones
          </h2>
          <div className="space-y-2">
            {profile.deliveryZones.map((zone, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={zone}
                  onChange={(e) => {
                    const zones = [...profile.deliveryZones];
                    zones[index] = e.target.value;
                    setProfile({ ...profile, deliveryZones: zones });
                  }}
                  className="flex-1 rounded border px-3 py-2"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const zones = profile.deliveryZones.filter((_, i) => i !== index);
                    setProfile({ ...profile, deliveryZones: zones });
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => setProfile({ ...profile, deliveryZones: [...profile.deliveryZones, ''] })}
            >
              Add Zone
            </Button>
          </div>
        </div>

        <Button onClick={saveProfile} disabled={loading} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Saving...' : 'Save Business Profile'}
        </Button>
      </div>
    </div>
  );
}