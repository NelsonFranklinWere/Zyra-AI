'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';

interface BusinessMemory {
  faqs?: Array<{ q: string; a: string }>;
  instructions?: Record<string, any>;
  negotiationRules?: Record<string, any>;
  deliveryRules?: Record<string, any>;
}

export default function AIMemoryPage() {
  const [memory, setMemory] = useState<BusinessMemory | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [faqs, setFaqs] = useState<Array<{ q: string; a: string }>>([]);
  const [instructions, setInstructions] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    loadMemory();
  }, []);

  const loadMemory = async () => {
    try {
      const response = await apiClient.get('/api/ai/memory');
      if (response.data.success) {
        const mem = response.data.data || {};
        setMemory(mem);
        setFaqs(mem.faqs || []);
        setInstructions(JSON.stringify(mem.instructions || {}, null, 2));
      }
    } catch (error) {
      console.error('Failed to load memory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let parsedInstructions;
      try {
        parsedInstructions = JSON.parse(instructions);
      } catch {
        alert('Invalid JSON in instructions');
        setSaving(false);
        return;
      }

      await apiClient.put('/api/ai/memory', {
        faqs: faqs.filter((f) => f.q.trim() && f.a.trim()),
        instructions: parsedInstructions,
        negotiationRules: memory?.negotiationRules,
        deliveryRules: memory?.deliveryRules,
      });

      alert('Memory saved successfully!');
      await loadMemory();
    } catch (error: any) {
      alert(`Failed to save: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testMessage.trim()) return;

    try {
      const response = await apiClient.post('/api/ai/simulate', {
        message: testMessage,
      });

      setTestResult(response.data.data);
    } catch (error: any) {
      alert(`Test failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const addFAQ = () => {
    setFaqs([...faqs, { q: '', a: '' }]);
  };

  const updateFAQ = (index: number, field: 'q' | 'a', value: string) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  const removeFAQ = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Business Memory</h1>
        <p className="text-muted-foreground">Manage FAQs, instructions, and business rules for AI</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FAQs</CardTitle>
          <CardDescription>Questions and answers for AI to reference</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="space-y-2 p-4 border rounded-lg">
              <div>
                <Label>Question</Label>
                <Textarea
                  value={faq.q}
                  onChange={(e) => updateFAQ(index, 'q', e.target.value)}
                  placeholder="Customer question..."
                />
              </div>
              <div>
                <Label>Answer</Label>
                <Textarea
                  value={faq.a}
                  onChange={(e) => updateFAQ(index, 'a', e.target.value)}
                  placeholder="AI answer..."
                />
              </div>
              <Button variant="destructive" size="sm" onClick={() => removeFAQ(index)}>
                Remove
              </Button>
            </div>
          ))}
          <Button onClick={addFAQ}>Add FAQ</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Instructions</CardTitle>
          <CardDescription>JSON format instructions for tone, style, and behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={10}
            placeholder='{"tone": "friendly", "style": "casual"}'
          />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Memory'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test AI Response</CardTitle>
          <CardDescription>Simulate a customer message to test AI behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Test Message</Label>
            <Textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Do you have black sneakers size 42?"
            />
          </div>
          <Button onClick={handleTest}>Test</Button>

          {testResult && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

