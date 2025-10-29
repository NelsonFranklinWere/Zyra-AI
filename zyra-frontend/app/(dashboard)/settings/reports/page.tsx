"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Play, 
  Download, 
  Settings, 
  FileText, 
  BarChart3,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

interface Report {
  id: string;
  name: string;
  type: 'scheduled' | 'ad-hoc';
  frequency?: 'daily' | 'weekly' | 'monthly';
  query: any;
  lastRunAt?: string;
  recipients?: any[];
  settings: any;
  createdAt: string;
}

interface ReportRun {
  id: string;
  reportId: string;
  runTime: string;
  resultUrl?: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  error?: string;
}

export default function ReportsSettingsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [reportRuns, setReportRuns] = useState<ReportRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "scheduled" as const,
    frequency: "daily" as const,
    query: {},
    recipients: [],
    settings: {
      format: "pdf",
      template: "default"
    }
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports');
      const data = await response.json();
      if (data.success) {
        setReports(data.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportRuns = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/runs`);
      const data = await response.json();
      if (data.success) {
        setReportRuns(data.data);
      }
    } catch (error) {
      console.error('Error fetching report runs:', error);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        setReports([...reports, data.data]);
        setShowCreateForm(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const handleRunReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/run`, {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.success) {
        // Refresh report runs
        fetchReportRuns(reportId);
      }
    } catch (error) {
      console.error('Error running report:', error);
    }
  };

  const handleDownloadReport = async (runId: string, resultUrl: string) => {
    try {
      const response = await fetch(`/api/reports/download/${runId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${runId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "scheduled",
      frequency: "daily",
      query: {},
      recipients: [],
      settings: {
        format: "pdf",
        template: "default"
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'RUNNING':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zyra-cyan-blue mb-2">Reports & Analytics</h1>
        <p className="text-zyra-text-secondary">
          Create and manage automated reports with AI-powered insights
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-zyra-cyan-blue">
            {reports.length} Reports
          </Badge>
          <Badge variant="outline" className="text-green-500">
            {reports.filter(r => r.type === 'scheduled').length} Scheduled
          </Badge>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="neon-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Report
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
                {editingReport ? 'Edit Report' : 'Create New Report'}
              </CardTitle>
              <CardDescription>
                Set up automated reports with custom queries and scheduling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateReport}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Report Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Monthly Sales Report"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="type">Report Type</Label>
                      <Select 
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="ad-hoc">Ad-hoc</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.type === 'scheduled' && (
                      <div>
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select 
                          value={formData.frequency}
                          onValueChange={(value) => setFormData({ ...formData, frequency: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Query Configuration</Label>
                      <div className="p-4 border border-zyra-glass-border rounded-lg bg-zyra-glass/20">
                        <p className="text-sm text-zyra-text-secondary mb-2">
                          Configure data source and query
                        </p>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-2" />
                          Configure Query
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Recipients</Label>
                      <div className="p-4 border border-zyra-glass-border rounded-lg bg-zyra-glass/20">
                        <p className="text-sm text-zyra-text-secondary mb-2">
                          Add email recipients for report delivery
                        </p>
                        <Button variant="outline" size="sm">
                          <Users className="w-4 h-4 mr-2" />
                          Add Recipients
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
                      setEditingReport(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="neon-button">
                    {editingReport ? 'Update Report' : 'Create Report'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="runs">Run History</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
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
              reports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="glass-card hover:border-zyra-cyan-blue/50 transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-zyra-cyan-blue mb-1">
                            {report.name}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {report.type === 'scheduled' ? 'Scheduled' : 'On-demand'} Report
                          </CardDescription>
                        </div>
                        <Badge variant={report.type === 'scheduled' ? 'default' : 'secondary'}>
                          {report.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zyra-text-secondary">Frequency</span>
                          <span>{report.frequency || 'On-demand'}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zyra-text-secondary">Last Run</span>
                          <span>
                            {report.lastRunAt 
                              ? new Date(report.lastRunAt).toLocaleDateString()
                              : 'Never'
                            }
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zyra-text-secondary">Format</span>
                          <span className="capitalize">{report.settings?.format || 'PDF'}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 pt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRunReport(report.id)}
                            className="flex-1"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Run Now
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchReportRuns(report.id)}
                          >
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {reports.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-zyra-text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-zyra-cyan-blue mb-2">
                No Reports Yet
              </h3>
              <p className="text-zyra-text-secondary mb-6">
                Create your first automated report to start gaining insights
              </p>
              <Button onClick={() => setShowCreateForm(true)} className="neon-button">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Report
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="runs" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-zyra-cyan-blue">Report Run History</CardTitle>
              <CardDescription>
                Track the execution history of your reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportRuns.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-zyra-text-secondary mx-auto mb-4" />
                    <p className="text-zyra-text-secondary">No report runs yet</p>
                  </div>
                ) : (
                  reportRuns.map((run) => (
                    <div key={run.id} className="flex items-center justify-between p-4 border border-zyra-glass-border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(run.status)}
                        <div>
                          <p className="font-medium text-zyra-text-primary">
                            Report Run #{run.id.slice(-8)}
                          </p>
                          <p className="text-sm text-zyra-text-secondary">
                            {new Date(run.runTime).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={run.status === 'SUCCESS' ? 'default' : 'destructive'}>
                          {run.status}
                        </Badge>
                        
                        {run.status === 'SUCCESS' && run.resultUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadReport(run.id, run.resultUrl!)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
