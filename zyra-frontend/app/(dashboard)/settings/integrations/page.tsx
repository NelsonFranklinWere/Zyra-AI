"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  XCircle, 
  Settings, 
  Mail, 
  MessageSquare, 
  CreditCard, 
  Database,
  Cloud,
  Shield,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  description: string;
  icon: React.ReactNode;
  lastSync?: string;
  credentials?: any;
}

interface VerificationStatus {
  facebook: boolean;
  instagram: boolean;
  whatsapp: boolean;
}

export default function IntegrationsSettingsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    facebook: false,
    instagram: false,
    whatsapp: false
  });
  const [loading, setLoading] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    fetchIntegrations();
    fetchVerificationStatus();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/integrations/status');
      const data = await response.json();
      if (data.success) {
        setIntegrations(data.data);
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch('/api/integrations/verify/status');
      const data = await response.json();
      if (data.success) {
        setVerificationStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    }
  };

  const handleConnectIntegration = async (integrationType: string) => {
    try {
      const response = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: integrationType })
      });
      
      const data = await response.json();
      if (data.success) {
        // Handle OAuth flow or configuration
        if (data.authUrl) {
          window.open(data.authUrl, '_blank');
        }
        fetchIntegrations();
      }
    } catch (error) {
      console.error('Error connecting integration:', error);
    }
  };

  const handleDisconnectIntegration = async (integrationType: string) => {
    try {
      const response = await fetch('/api/integrations/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: integrationType })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchIntegrations();
      }
    } catch (error) {
      console.error('Error disconnecting integration:', error);
    }
  };

  const handleRequestVerification = async (provider: string, identifier: string, method: string) => {
    try {
      const response = await fetch('/api/integrations/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          identifier,
          method
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setSelectedIntegration(provider);
        setShowVerificationModal(true);
      }
    } catch (error) {
      console.error('Error requesting verification:', error);
    }
  };

  const handleConfirmVerification = async () => {
    try {
      const response = await fetch('/api/integrations/verify/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode })
      });
      
      const data = await response.json();
      if (data.success) {
        setShowVerificationModal(false);
        setVerificationCode("");
        fetchVerificationStatus();
      }
    } catch (error) {
      console.error('Error confirming verification:', error);
    }
  };

  const handleTestConnection = async (integrationType: string) => {
    try {
      const response = await fetch('/api/integrations/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: integrationType })
      });
      
      const data = await response.json();
      if (data.success) {
        // Show success message
        console.log('Connection test successful');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zyra-cyan-blue mb-2">Integrations</h1>
        <p className="text-zyra-text-secondary">
          Connect and manage your third-party services and platforms
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Email Integration */}
        <Card className="glass-card hover:border-zyra-cyan-blue/50 transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="w-8 h-8 text-zyra-cyan-blue" />
                <div>
                  <CardTitle className="text-lg text-zyra-cyan-blue">Email Service</CardTitle>
                  <CardDescription>SMTP & Email Automation</CardDescription>
                </div>
              </div>
              {getStatusIcon(integrations.find(i => i.type === 'email')?.status || 'disconnected')}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zyra-text-secondary">Status</span>
                <Badge variant={integrations.find(i => i.type === 'email')?.status === 'connected' ? 'default' : 'secondary'}>
                  {integrations.find(i => i.type === 'email')?.status || 'Disconnected'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTestConnection('email')}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Test
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleConnectIntegration('email')}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SMS Integration */}
        <Card className="glass-card hover:border-zyra-cyan-blue/50 transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-8 h-8 text-zyra-cyan-blue" />
                <div>
                  <CardTitle className="text-lg text-zyra-cyan-blue">SMS Service</CardTitle>
                  <CardDescription>Twilio SMS & Notifications</CardDescription>
                </div>
              </div>
              {getStatusIcon(integrations.find(i => i.type === 'sms')?.status || 'disconnected')}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zyra-text-secondary">Status</span>
                <Badge variant={integrations.find(i => i.type === 'sms')?.status === 'connected' ? 'default' : 'secondary'}>
                  {integrations.find(i => i.type === 'sms')?.status || 'Disconnected'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTestConnection('sms')}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Test
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleConnectIntegration('sms')}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Integrations */}
        <Card className="glass-card hover:border-zyra-cyan-blue/50 transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-8 h-8 text-zyra-cyan-blue" />
                <div>
                  <CardTitle className="text-lg text-zyra-cyan-blue">Payments</CardTitle>
                  <CardDescription>Stripe & MPesa Integration</CardDescription>
                </div>
              </div>
              {getStatusIcon(integrations.find(i => i.type === 'payment')?.status || 'disconnected')}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zyra-text-secondary">Status</span>
                <Badge variant={integrations.find(i => i.type === 'payment')?.status === 'connected' ? 'default' : 'secondary'}>
                  {integrations.find(i => i.type === 'payment')?.status || 'Disconnected'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTestConnection('payment')}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Test
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleConnectIntegration('payment')}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Integrations */}
        <Card className="glass-card hover:border-zyra-cyan-blue/50 transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-zyra-cyan-blue" />
                <div>
                  <CardTitle className="text-lg text-zyra-cyan-blue">Social Media</CardTitle>
                  <CardDescription>Facebook, Instagram, WhatsApp</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {verificationStatus.facebook && <CheckCircle className="w-4 h-4 text-green-500" />}
                {verificationStatus.instagram && <CheckCircle className="w-4 h-4 text-green-500" />}
                {verificationStatus.whatsapp && <CheckCircle className="w-4 h-4 text-green-500" />}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zyra-text-secondary">Facebook</span>
                  <Badge variant={verificationStatus.facebook ? 'default' : 'secondary'}>
                    {verificationStatus.facebook ? 'Verified' : 'Not Verified'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zyra-text-secondary">Instagram</span>
                  <Badge variant={verificationStatus.instagram ? 'default' : 'secondary'}>
                    {verificationStatus.instagram ? 'Verified' : 'Not Verified'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zyra-text-secondary">WhatsApp</span>
                  <Badge variant={verificationStatus.whatsapp ? 'default' : 'secondary'}>
                    {verificationStatus.whatsapp ? 'Verified' : 'Not Verified'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRequestVerification('facebook_page', 'page_123', 'email')}
                  className="flex-1"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Verify
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleConnectIntegration('social')}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Integration */}
        <Card className="glass-card hover:border-zyra-cyan-blue/50 transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Database className="w-8 h-8 text-zyra-cyan-blue" />
                <div>
                  <CardTitle className="text-lg text-zyra-cyan-blue">Database</CardTitle>
                  <CardDescription>MySQL, PostgreSQL, MongoDB</CardDescription>
                </div>
              </div>
              {getStatusIcon(integrations.find(i => i.type === 'database')?.status || 'disconnected')}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zyra-text-secondary">Status</span>
                <Badge variant={integrations.find(i => i.type === 'database')?.status === 'connected' ? 'default' : 'secondary'}>
                  {integrations.find(i => i.type === 'database')?.status || 'Disconnected'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTestConnection('database')}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Test
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleConnectIntegration('database')}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cloud Storage */}
        <Card className="glass-card hover:border-zyra-cyan-blue/50 transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Cloud className="w-8 h-8 text-zyra-cyan-blue" />
                <div>
                  <CardTitle className="text-lg text-zyra-cyan-blue">Cloud Storage</CardTitle>
                  <CardDescription>AWS S3, Cloudinary</CardDescription>
                </div>
              </div>
              {getStatusIcon(integrations.find(i => i.type === 'storage')?.status || 'disconnected')}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zyra-text-secondary">Status</span>
                <Badge variant={integrations.find(i => i.type === 'storage')?.status === 'connected' ? 'default' : 'secondary'}>
                  {integrations.find(i => i.type === 'storage')?.status || 'Disconnected'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTestConnection('storage')}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Test
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleConnectIntegration('storage')}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <Card className="glass-card w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-zyra-cyan-blue">Verify Ownership</CardTitle>
              <CardDescription>
                Enter the verification code sent to your {selectedIntegration} account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter verification code"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowVerificationModal(false);
                    setVerificationCode("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmVerification}
                  className="neon-button"
                >
                  Verify
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
