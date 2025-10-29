"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Settings, 
  Mail, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

interface EmailAutomation {
  id: string;
  name: string;
  description?: string;
  triggers: any;
  conditions: any;
  actions: any;
  schedule?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AutomationSettingsPage() {
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<EmailAutomation | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    triggers: {},
    conditions: {},
    actions: {},
    schedule: {},
    isActive: true
  });

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/automations/email');
      const data = await response.json();
      if (data.success) {
        setAutomations(data.data);
      }
    } catch (error) {
      console.error('Error fetching automations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/automations/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        setAutomations([...automations, data.data]);
        setShowCreateForm(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating automation:', error);
    }
  };

  const handleUpdateAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAutomation) return;

    try {
      const response = await fetch(`/api/automations/email/${editingAutomation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        setAutomations(automations.map(a => 
          a.id === editingAutomation.id ? { ...a, ...formData } : a
        ));
        setEditingAutomation(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating automation:', error);
    }
  };

  const handleDeleteAutomation = async (id: string) => {
    try {
      const response = await fetch(`/api/automations/email/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        setAutomations(automations.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Error deleting automation:', error);
    }
  };

  const handleTriggerAutomation = async (id: string) => {
    try {
      const response = await fetch(`/api/automations/email/${id}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerPayload: { manual: true } })
      });
      
      const data = await response.json();
      if (data.success) {
        // Show success message
        console.log('Automation triggered successfully');
      }
    } catch (error) {
      console.error('Error triggering automation:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      triggers: {},
      conditions: {},
      actions: {},
      schedule: {},
      isActive: true
    });
  };

  const openEditForm = (automation: EmailAutomation) => {
    setEditingAutomation(automation);
    setFormData({
      name: automation.name,
      description: automation.description || "",
      triggers: automation.triggers,
      conditions: automation.conditions,
      actions: automation.actions,
      schedule: automation.schedule || {},
      isActive: automation.isActive
    });
    setShowCreateForm(true);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zyra-cyan-blue mb-2">Email Automation</h1>
        <p className="text-zyra-text-secondary">
          Create and manage automated email workflows to engage your audience
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-zyra-cyan-blue">
            {automations.length} Automations
          </Badge>
          <Badge variant="outline" className="text-green-500">
            {automations.filter(a => a.isActive).length} Active
          </Badge>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="neon-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Automation
        </Button>
      </div>

      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-8"
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-zyra-cyan-blue">
                {editingAutomation ? 'Edit Automation' : 'Create New Automation'}
              </CardTitle>
              <CardDescription>
                Set up automated email workflows with triggers, conditions, and actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingAutomation ? handleUpdateAutomation : handleCreateAutomation}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Automation Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Welcome Email Series"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe what this automation does..."
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Triggers</Label>
                      <div className="p-4 border border-zyra-glass-border rounded-lg bg-zyra-glass/20">
                        <p className="text-sm text-zyra-text-secondary">
                          Configure when this automation should trigger
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          <Settings className="w-4 h-4 mr-2" />
                          Configure Triggers
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Conditions</Label>
                      <div className="p-4 border border-zyra-glass-border rounded-lg bg-zyra-glass/20">
                        <p className="text-sm text-zyra-text-secondary">
                          Set conditions for when automation should run
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          <Settings className="w-4 h-4 mr-2" />
                          Configure Conditions
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 mt-6">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingAutomation(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="neon-button">
                    {editingAutomation ? 'Update Automation' : 'Create Automation'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="glass-card animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-zyra-glass-border rounded mb-4"></div>
                <div className="h-3 bg-zyra-glass-border rounded mb-2"></div>
                <div className="h-3 bg-zyra-glass-border rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          automations.map((automation) => (
            <motion.div
              key={automation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-card hover:border-zyra-cyan-blue/50 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-zyra-cyan-blue mb-1">
                        {automation.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {automation.description || 'No description'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {automation.isActive ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zyra-text-secondary">Status</span>
                      <Badge variant={automation.isActive ? "default" : "secondary"}>
                        {automation.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zyra-text-secondary">Created</span>
                      <span>{new Date(automation.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTriggerAutomation(automation.id)}
                        className="flex-1"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Test
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditForm(automation)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteAutomation(automation.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {automations.length === 0 && !loading && (
        <div className="text-center py-12">
          <Mail className="w-16 h-16 text-zyra-text-secondary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-zyra-cyan-blue mb-2">
            No Automations Yet
          </h3>
          <p className="text-zyra-text-secondary mb-6">
            Create your first email automation to start engaging your audience
          </p>
          <Button onClick={() => setShowCreateForm(true)} className="neon-button">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Automation
          </Button>
        </div>
      )}
    </div>
  );
}
