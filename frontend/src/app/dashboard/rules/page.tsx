'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api-client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Settings, Edit, ToggleLeft, ToggleRight } from 'lucide-react';

interface Rule {
  id: string;
  key: string;
  value: {
    name?: string;
    enabled?: boolean;
    priority?: number;
    trigger?: any;
    conditions?: any[];
    actions?: any[];
  };
  createdAt: string;
}

const ruleSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  name: z.string().min(1, 'Name is required'),
  enabled: z.boolean().default(true),
  priority: z.coerce.number().int().default(100),
  trigger: z.object({
    type: z.enum(['intent', 'keyword', 'event']),
    value: z.union([z.string(), z.array(z.string())]),
  }),
  conditions: z.array(z.any()).optional(),
  actions: z.array(z.any()).min(1, 'At least one action required'),
});

type RuleForm = z.infer<typeof ruleSchema>;

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<RuleForm>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      enabled: true,
      priority: 100,
      trigger: { type: 'intent', value: '' },
      conditions: [],
      actions: [],
    },
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ success: boolean; data: Rule[] }>('/rules');
      setRules(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load rules');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: RuleForm) => {
    try {
      setError(null);
      const ruleValue = {
        name: data.name,
        enabled: data.enabled,
        priority: data.priority,
        trigger: data.trigger,
        conditions: data.conditions || [],
        actions: data.actions,
      };

      if (editingRule) {
        await apiClient.put(`/admin/rules/${editingRule.id}`, {
          value: ruleValue,
        });
      } else {
        await apiClient.post('/admin/rules', {
          key: data.key,
          value: ruleValue,
        });
      }

      await loadRules();
      reset();
      setShowAddForm(false);
      setEditingRule(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save rule');
    }
  };

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule);
    setValue('key', rule.key);
    setValue('name', rule.value.name || rule.key);
    setValue('enabled', rule.value.enabled ?? true);
    setValue('priority', rule.value.priority || 100);
    setValue('trigger', rule.value.trigger || { type: 'intent', value: '' });
    setValue('conditions', rule.value.conditions || []);
    setValue('actions', rule.value.actions || []);
    setShowAddForm(true);
  };

  const handleToggle = async (rule: Rule) => {
    try {
      await apiClient.put(`/admin/rules/${rule.id}`, {
        value: {
          ...rule.value,
          enabled: !rule.value.enabled,
        },
      });
      await loadRules();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle rule');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      await apiClient.delete(`/admin/rules/${id}`);
      setRules(rules.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete rule');
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automation Rules</h1>
          <p className="mt-2 text-gray-600">
            Configure rules for automated conversation handling
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Rule
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">
            {editingRule ? 'Edit Rule' : 'Add New Rule'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="key" className="block text-sm font-medium text-gray-700">
                  Rule Key *
                </label>
                <input
                  {...register('key')}
                  type="text"
                  disabled={!!editingRule}
                  placeholder="e.g., product_inquiry_rule"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm disabled:bg-gray-100 focus:border-primary focus:outline-none focus:ring-primary"
                />
                {errors.key && (
                  <p className="mt-1 text-sm text-red-600">{errors.key.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Rule Name *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Product Inquiry Response"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <input
                  {...register('priority')}
                  type="number"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  {...register('enabled')}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label className="text-sm font-medium text-gray-700">Enabled</label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Rule Value (JSON) *</label>
              <textarea
                {...register('value', {
                  setValueAs: (v) => {
                    try {
                      return typeof v === 'string' ? JSON.parse(v) : v;
                    } catch {
                      return v;
                    }
                  },
                })}
                rows={12}
                placeholder={JSON.stringify({
                  trigger: { type: 'intent', value: 'product_inquiry' },
                  conditions: [],
                  actions: [{ type: 'send_message', params: { template: 'greeting' } }],
                }, null, 2)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-xs shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter valid JSON with trigger, conditions, and actions
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="submit">{editingRule ? 'Update Rule' : 'Create Rule'}</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingRule(null);
                  reset();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <div className="text-gray-500">Loading rules...</div>
        </div>
      ) : rules.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <Settings className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-500">No rules yet. Add your first rule above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.id} className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {rule.value.name || rule.key}
                    </h3>
                    {rule.value.enabled ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                        Enabled
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800">
                        Disabled
                      </span>
                    )}
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                      Priority: {rule.value.priority || 100}
                    </span>
                  </div>
                  {rule.value.trigger && (
                    <div className="mt-2 text-sm text-gray-600">
                      Trigger: {rule.value.trigger.type} = {Array.isArray(rule.value.trigger.value) ? rule.value.trigger.value.join(', ') : rule.value.trigger.value}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    {rule.value.actions?.length || 0} action(s) • Created: {new Date(rule.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggle(rule)}
                    title={rule.value.enabled ? 'Disable' : 'Enable'}
                  >
                    {rule.value.enabled ? (
                      <ToggleRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(rule)}
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(rule.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

