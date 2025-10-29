"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Lock, Database, Trash2, Download } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-zyra-gradient cyber-grid">
      <div className="container mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-zyra-cyan-blue mb-4">
              Privacy Policy
            </h1>
            <p className="text-zyra-text-secondary text-lg">
              Your privacy and data protection are our top priorities
            </p>
            <Badge variant="outline" className="mt-4 text-zyra-cyan-blue">
              Last updated: {new Date().toLocaleDateString()}
            </Badge>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-zyra-cyan-blue flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Introduction
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  Zyra ("we," "our," or "us") is committed to protecting your privacy and personal data. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                  when you use our AI-powered automation and analytics platform.
                </p>
                <p>
                  This policy complies with applicable data protection laws including GDPR, CCPA, and local 
                  cybercrime legislation. By using our services, you agree to the collection and use of 
                  information in accordance with this policy.
                </p>
              </CardContent>
            </Card>

            {/* Data Collection */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-zyra-cyan-blue flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <h3 className="text-xl font-semibold text-zyra-cyan-blue mb-4">Personal Information</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Name, email address, and contact information</li>
                  <li>Account credentials and authentication data</li>
                  <li>Payment and billing information</li>
                  <li>Profile information and preferences</li>
                </ul>

                <h3 className="text-xl font-semibold text-zyra-cyan-blue mb-4 mt-6">Usage Data</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Platform usage patterns and analytics</li>
                  <li>AI interaction data and feedback</li>
                  <li>Automation workflows and configurations</li>
                  <li>Integration and API usage data</li>
                </ul>

                <h3 className="text-xl font-semibold text-zyra-cyan-blue mb-4 mt-6">Technical Data</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>IP addresses and device information</li>
                  <li>Browser type and version</li>
                  <li>Operating system and hardware specifications</li>
                  <li>Log files and error reports</li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Usage */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-zyra-cyan-blue flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-zyra-cyan-blue mb-2">Service Delivery</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Provide AI-powered automation services</li>
                      <li>• Process and analyze your data</li>
                      <li>• Generate insights and recommendations</li>
                      <li>• Maintain and improve platform functionality</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-zyra-cyan-blue mb-2">Communication</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Send service notifications</li>
                      <li>• Provide customer support</li>
                      <li>• Share important updates</li>
                      <li>• Marketing communications (with consent)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-zyra-cyan-blue mb-2">Security & Compliance</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Prevent fraud and abuse</li>
                      <li>• Comply with legal obligations</li>
                      <li>• Protect user safety</li>
                      <li>• Enforce terms of service</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-zyra-cyan-blue mb-2">Analytics & Improvement</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Analyze usage patterns</li>
                      <li>• Improve AI models</li>
                      <li>• Develop new features</li>
                      <li>• Optimize performance</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Protection */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-zyra-cyan-blue flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Data Protection & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-zyra-cyan-blue mb-2">Technical Safeguards</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>End-to-end encryption for data in transit and at rest</li>
                      <li>Multi-factor authentication for account access</li>
                      <li>Regular security audits and penetration testing</li>
                      <li>Secure cloud infrastructure with SOC 2 compliance</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-zyra-cyan-blue mb-2">Access Controls</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Role-based access controls for team members</li>
                      <li>Principle of least privilege for data access</li>
                      <li>Regular access reviews and permissions audits</li>
                      <li>Secure API authentication and authorization</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-zyra-cyan-blue mb-2">Monitoring & Incident Response</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>24/7 security monitoring and threat detection</li>
                      <li>Automated incident response procedures</li>
                      <li>Data breach notification within 72 hours</li>
                      <li>Regular security training for all staff</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-zyra-cyan-blue flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Your Rights & Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-zyra-cyan-blue mb-2">Access & Portability</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Request copies of your personal data</li>
                      <li>• Export your data in machine-readable formats</li>
                      <li>• Access detailed data processing information</li>
                      <li>• Receive data in a structured, commonly used format</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-zyra-cyan-blue mb-2">Correction & Deletion</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Correct inaccurate personal information</li>
                      <li>• Request deletion of your data ("right to be forgotten")</li>
                      <li>• Restrict processing of your data</li>
                      <li>• Object to certain types of data processing</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-zyra-cyan-blue mb-2">Consent & Preferences</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Withdraw consent for data processing</li>
                      <li>• Opt-out of marketing communications</li>
                      <li>• Manage cookie preferences</li>
                      <li>• Control data sharing with third parties</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-zyra-cyan-blue mb-2">Complaints & Appeals</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Lodge complaints with supervisory authorities</li>
                      <li>• Request human review of automated decisions</li>
                      <li>• Appeal data processing decisions</li>
                      <li>• Seek compensation for data breaches</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Retention */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-zyra-cyan-blue flex items-center">
                  <Trash2 className="w-5 h-5 mr-2" />
                  Data Retention & Deletion
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <div className="space-y-4">
                  <p>
                    We retain your personal data only for as long as necessary to fulfill the purposes 
                    outlined in this privacy policy, unless a longer retention period is required by law.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-zyra-glass-border rounded-lg">
                      <h4 className="font-semibold text-zyra-cyan-blue mb-2">Account Data</h4>
                      <p className="text-sm">Retained while account is active + 30 days</p>
                    </div>
                    <div className="p-4 border border-zyra-glass-border rounded-lg">
                      <h4 className="font-semibold text-zyra-cyan-blue mb-2">Usage Analytics</h4>
                      <p className="text-sm">Anonymized after 2 years</p>
                    </div>
                    <div className="p-4 border border-zyra-glass-border rounded-lg">
                      <h4 className="font-semibold text-zyra-cyan-blue mb-2">AI Training Data</h4>
                      <p className="text-sm">Anonymized after 1 year</p>
                    </div>
                  </div>

                  <p className="text-sm text-zyra-text-secondary">
                    Upon account deletion, we will permanently delete your personal data within 30 days, 
                    except where retention is required for legal compliance or legitimate business purposes.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-zyra-cyan-blue">Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    If you have any questions about this Privacy Policy or our data practices, 
                    please contact us:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-zyra-cyan-blue mb-2">Data Protection Officer</h4>
                      <p className="text-sm">Email: privacy@zyra.com</p>
                      <p className="text-sm">Phone: +1 (555) 123-4567</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-zyra-cyan-blue mb-2">Legal Department</h4>
                      <p className="text-sm">Email: legal@zyra.com</p>
                      <p className="text-sm">Address: 123 Tech Street, San Francisco, CA 94105</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
