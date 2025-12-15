'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';

interface ApprovalItem {
  id: string;
  message: string;
  replyText: string;
  conversationId: string;
  createdAt: string;
  traceId: string;
}

export default function AIApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    // This would fetch pending approvals from API
    // For now, this is a placeholder structure
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    // Approve logic
    alert('Approval functionality to be implemented');
  };

  const handleReject = async (id: string) => {
    // Reject logic
    alert('Rejection functionality to be implemented');
  };

  const handleEdit = async (id: string) => {
    // Edit logic
    alert('Edit functionality to be implemented');
  };

  if (loading) {
    return <div className="p-6">Loading approvals...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Message Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve AI-generated replies before sending
        </p>
      </div>

      {approvals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No pending approvals
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {approvals.map((approval) => (
            <Card key={approval.id}>
              <CardHeader>
                <CardTitle>Pending Approval</CardTitle>
                <CardDescription>
                  {new Date(approval.createdAt).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-1">Customer Message:</p>
                  <p className="text-sm bg-muted p-2 rounded">{approval.message}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">AI-Generated Reply:</p>
                  <p className="text-sm bg-muted p-2 rounded">{approval.replyText}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleApprove(approval.id)} variant="default">
                    Approve
                  </Button>
                  <Button onClick={() => handleEdit(approval.id)} variant="outline">
                    Edit
                  </Button>
                  <Button onClick={() => handleReject(approval.id)} variant="destructive">
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

