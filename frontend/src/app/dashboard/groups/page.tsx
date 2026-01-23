'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api-client';
import { MessageSquare, Plus, Trash2, Eye, AlertTriangle, TrendingUp, Users } from 'lucide-react';

interface WhatsAppGroup {
  id: string;
  name: string;
  groupId: string;
  scanning: boolean;
  consentGiven: boolean;
  insights: {
    messageCount: number;
    commonQuestions: string[];
    priceQueries: number;
    productMentions: string[];
  };
  createdAt: string;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    groupId: '',
    consentGiven: false,
  });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/whatsapp/groups');
      setGroups(response.data.data || []);
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGroup = async () => {
    if (!newGroup.consentGiven) {
      alert('You must confirm consent to scan this group');
      return;
    }
    
    try {
      await apiClient.post('/api/whatsapp/groups', newGroup);
      setNewGroup({ name: '', groupId: '', consentGiven: false });
      setShowAddForm(false);
      await loadGroups();
    } catch (error: any) {
      alert('Failed to add group: ' + (error.response?.data?.message || error.message));
    }
  };

  const toggleScanning = async (id: string, scanning: boolean) => {
    try {
      await apiClient.put(`/api/whatsapp/groups/${id}`, { scanning: !scanning });
      await loadGroups();
    } catch (error: any) {
      alert('Failed to update group: ' + (error.response?.data?.message || error.message));
    }
  };

  const removeGroup = async (id: string) => {
    if (!confirm('Remove this group from scanning?')) return;
    try {
      await apiClient.delete(`/api/whatsapp/groups/${id}`);
      await loadGroups();
    } catch (error: any) {
      alert('Failed to remove group: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          WhatsApp Group Scanning
        </h1>
        <p className="mt-2 text-gray-600">Monitor WhatsApp groups for business insights</p>
      </div>

      {/* Privacy Notice */}
      <div className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800">Privacy & Consent Notice</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Only add groups where you have explicit permission to monitor messages. 
              Zyra will only store aggregate insights, not individual messages, unless explicitly permitted.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Monitored Groups</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Group
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm border">
          <h3 className="font-medium mb-4">Add WhatsApp Group</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Group Name</label>
              <input
                type="text"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                placeholder="Customer Support Group"
                className="w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Group ID or Invite Link</label>
              <input
                type="text"
                value={newGroup.groupId}
                onChange={(e) => setNewGroup({ ...newGroup, groupId: e.target.value })}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full rounded border px-3 py-2"
              />
            </div>
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={newGroup.consentGiven}
                  onChange={(e) => setNewGroup({ ...newGroup, consentGiven: e.target.checked })}
                  className="mt-1"
                />
                <span className="text-sm text-red-800">
                  <strong>I confirm that:</strong> I have permission to monitor this group, 
                  all group members are aware of business monitoring, and I comply with local privacy laws.
                </span>
              </label>
            </div>
            <div className="flex gap-2">
              <Button onClick={addGroup} disabled={!newGroup.consentGiven}>Add Group</Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {groups.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-500">No groups being monitored</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageSquare className="h-5 w-5 text-gray-400" />
                    <h3 className="font-semibold">{group.name}</h3>
                    {group.scanning ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                        Scanning
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800">
                        Paused
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{group.groupId}</p>
                  
                  {/* Insights */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-blue-50 rounded p-3">
                      <div className="text-2xl font-bold text-blue-600">{group.insights.messageCount}</div>
                      <div className="text-xs text-blue-600">Messages Analyzed</div>
                    </div>
                    <div className="bg-green-50 rounded p-3">
                      <div className="text-2xl font-bold text-green-600">{group.insights.priceQueries}</div>
                      <div className="text-xs text-green-600">Price Queries</div>
                    </div>
                    <div className="bg-purple-50 rounded p-3">
                      <div className="text-2xl font-bold text-purple-600">{group.insights.commonQuestions.length}</div>
                      <div className="text-xs text-purple-600">Common Questions</div>
                    </div>
                    <div className="bg-orange-50 rounded p-3">
                      <div className="text-2xl font-bold text-orange-600">{group.insights.productMentions.length}</div>
                      <div className="text-xs text-orange-600">Product Mentions</div>
                    </div>
                  </div>

                  {/* Common Questions */}
                  {group.insights.commonQuestions.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Common Questions:</h4>
                      <div className="space-y-1">
                        {group.insights.commonQuestions.slice(0, 3).map((question, idx) => (
                          <div key={idx} className="text-sm text-gray-600 bg-gray-50 rounded px-2 py-1">
                            "{question}"
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Mentions */}
                  {group.insights.productMentions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Product Mentions:</h4>
                      <div className="flex flex-wrap gap-1">
                        {group.insights.productMentions.slice(0, 5).map((product, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {product}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleScanning(group.id, group.scanning)}
                    title={group.scanning ? 'Pause scanning' : 'Resume scanning'}
                  >
                    <Eye className={`h-4 w-4 ${group.scanning ? 'text-green-600' : 'text-gray-400'}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeGroup(group.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                Added: {new Date(group.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}