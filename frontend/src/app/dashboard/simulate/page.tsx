'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';

const simulateSchema = z.object({
  from: z.string().min(1, 'Phone number required'),
  message: z.string().min(1, 'Message required'),
});

type SimulateForm = z.infer<typeof simulateSchema>;

export default function SimulatePage() {
  const { organization } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SimulateForm>({
    resolver: zodResolver(simulateSchema),
    defaultValues: {
      from: '+254700000000',
      message: '',
    },
  });

  const onSubmit = async (data: SimulateForm) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.post('/api/admin/simulate/message', {
        from: data.from,
        message: data.message,
        orgId: organization?.id,
      });

      setResult({
        ...response.data,
        timestamp: new Date().toLocaleTimeString(),
      });
      
      // Reset form after successful submission
      setTimeout(() => {
        reset({ from: data.from, message: '' });
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to simulate message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Simulate Inbox</h1>
        <p className="mt-2 text-gray-600">
          Test message processing by simulating incoming WhatsApp messages
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Simulate form */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Send Test Message</h2>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {result && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              Message processed! 
              {result.processing && (
                <div className="ml-2 text-xs">
                  Intent: <strong>{result.processing.intent}</strong> | 
                  Rule: <strong>{result.processing.matchedRule || 'None'}</strong>
                </div>
              )}
            </div>
          )}

          {result?.processing && (
            <div className="mb-4 rounded-md bg-blue-50 border border-blue-200 p-4">
              <h3 className="font-semibold text-blue-800 mb-2">AI Response:</h3>
              <div className="bg-white rounded p-3 border">
                <p className="text-sm">{result.processing.response}</p>
              </div>
              {result.processing.actions?.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-medium text-blue-700 mb-1">Actions Triggered:</h4>
                  <ul className="text-xs text-blue-600">
                    {result.processing.actions.map((action: any, idx: number) => (
                      <li key={idx}>• {action.type}: {JSON.stringify(action.params || {})}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="from" className="block text-sm font-medium text-gray-700">
                From (Phone Number)
              </label>
              <input
                {...register('from')}
                type="text"
                placeholder="+254700000000"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
              />
              {errors.from && (
                <p className="mt-1 text-sm text-red-600">{errors.from.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                {...register('message')}
                rows={6}
                placeholder='Try: "Do you have size 42 black sneakers?"'
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              <Send className="mr-2 h-4 w-4" />
              {loading ? 'Sending...' : 'Send Test Message'}
            </Button>
          </form>
        </div>

        {/* Examples */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Example Messages</h2>
          <div className="space-y-3">
            {[
              { text: 'Do you have size 42 black sneakers?', intent: 'product_inquiry' },
              { text: 'I want to buy 2 pairs of black sneakers', intent: 'order_request' },
              { text: 'Hello, what products do you have?', intent: 'greeting' },
              { text: 'I just paid via Mpesa', intent: 'payment_confirm' },
              { text: 'When will my order be delivered?', intent: 'delivery_query' },
            ].map((example, idx) => (
              <button
                key={idx}
                onClick={() => {
                  reset({ from: '+254700000000', message: example.text });
                }}
                className="w-full rounded-lg border border-gray-200 p-3 text-left text-sm hover:bg-gray-50"
              >
                <div className="font-medium">{example.text}</div>
                <div className="mt-1 text-xs text-gray-500">Expected: {example.intent}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

