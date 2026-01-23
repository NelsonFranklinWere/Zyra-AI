'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api-client';
import { Plus, Trash2, Edit, FileText, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface Template {
  id: string;
  name: string;
  content: string;
  variables: string[];
  tone: string;
  createdAt: string;
  updatedAt: string;
}

const templateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  content: z.string().min(1, 'Content is required'),
  tone: z.string().default('friendly'),
});

type TemplateForm = z.infer<typeof templateSchema>;

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [preview, setPreview] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<TemplateForm>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      tone: 'friendly',
    },
  });

  const formContent = watch('content');

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    // Extract variables from content for preview
    const vars = formContent?.match(/\{\{(\w+)\}\}/g) || [];
    const varMap: Record<string, string> = {};
    vars.forEach((v) => {
      const key = v.replace(/\{\{|\}\}/g, '');
      varMap[key] = `[${key}]`;
    });
    
    let previewText = formContent || '';
    Object.entries(varMap).forEach(([key, value]) => {
      previewText = previewText.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });
    setPreview(previewText);
  }, [formContent]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ success: boolean; data: Template[] }>('/api/admin/templates');
      setTemplates(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: TemplateForm) => {
    try {
      setError(null);
      if (editingTemplate) {
        await apiClient.put(`/api/admin/templates/${editingTemplate.name}`, data);
      } else {
        await apiClient.post('/api/admin/templates', data);
      }
      await loadTemplates();
      reset();
      setShowForm(false);
      setEditingTemplate(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save template');
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    reset({
      name: template.name,
      content: template.content,
      tone: template.tone,
    });
    setShowForm(true);
  };

  const handleDelete = async (name: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await apiClient.delete(`/api/admin/templates/${name}`);
      setTemplates(templates.filter((t) => t.name !== name));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete template');
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Message Templates</h1>
          <p className="mt-2 text-gray-600">
            Manage automated response templates. Use {'{{variable}}'} for dynamic values.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadTemplates}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button onClick={() => {
            setEditingTemplate(null);
            setShowForm(true);
            reset();
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Template
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">
            {editingTemplate ? 'Edit Template' : 'Add New Template'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Template Name *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  disabled={!!editingTemplate}
                  placeholder="greeting"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm disabled:bg-gray-100 focus:border-primary focus:outline-none focus:ring-primary"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="tone" className="block text-sm font-medium text-gray-700">
                  Tone
                </label>
                <select
                  {...register('tone')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                >
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Template Content *
              </label>
              <textarea
                {...register('content')}
                rows={6}
                placeholder='Hello {{customer_name}}! Welcome to {{business_name}}.'
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Use {'{{variable_name}}'} for dynamic values
              </p>
            </div>

            {preview && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Preview</label>
                <div className="mt-1 rounded-md bg-gray-50 p-3 text-sm">
                  {preview}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit">
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingTemplate(null);
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
          <div className="text-gray-500">Loading templates...</div>
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-500">No templates yet. Add your first template above.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <div key={template.id} className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                      {template.tone}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{template.content}</p>
                  {template.variables && template.variables.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {template.variables.map((v) => (
                        <span
                          key={v}
                          className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    Updated: {new Date(template.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(template.name)}
                    className="text-red-600 hover:text-red-700"
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

