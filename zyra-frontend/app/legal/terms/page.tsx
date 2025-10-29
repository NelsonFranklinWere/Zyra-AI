"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, Shield, Gavel, Users, DollarSign } from "lucide-react";

export default function TermsOfServicePage() {
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
              Terms of Service
            </h1>
            <p className="text-zyra-text-secondary text-lg">
              Please read these terms carefully before using our services
            </p>
            <Badge variant="outline" className="mt-4 text-zyra-cyan-blue">
              Last updated: {new Date().toLocaleDateString()}
            </Badge>
          </div>

          <div className="space-y-8">
            {/* Agreement */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-zyra-cyan-blue flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Agreement to Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  By accessing and using Zyra's AI-powered automation and analytics platform 
                  ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
                  If you disagree with any part of these terms, you may not access the Service.
                </p>
                <p>
                  These Terms constitute a legally binding agreement between you and Zyra Inc. 
                  ("Company," "we," "us," or "our"). Your use of the Service is also governed 
                  by our Privacy Policy, which is incorporated by reference.
                </p>
              </CardContent>
            </Card>

            {/* Service Description */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-zyra-cyan-blue flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Service Description
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  Zyra provides an AI-powered platform for business automation, data analysis, 
                  and intelligent insights. Our services include:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-4">
                  <li>Email automation and workflow management</li>
                  <li>AI-powered content generation and analysis</li>
                  <li>Data synchronization and integration services</li>
                  <li>Automated reporting and analytics</li>
                  <li>Social media management and optimization</li>
                  <li>Payment processing and financial automation</li>
                </ul>
                <p className="mt-4">
                  We reserve the right to modify, suspend, or discontinue any part of the Service 
                  at any time with or without notice.
                </p>
              </CardContent>
            </Card>

            {/* User Responsibilities */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-zyra-cyan-blue flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  User Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-zyra-cyan-blue mb-2">Account Security</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Maintain the confidentiality of your account credentials</li>
                      <li>Notify us immediately of any unauthorized access</li>
                      <li>Use strong, unique passwords and enable two-factor authentication</li>
                      <li>Keep your contact information up to date</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-zyra-cyan-blue mb-2">Acceptable Use</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Use the Service only for lawful purposes</li>
                      <li>Comply with all applicable laws and regulations</li>
                      <li>Respect intellectual property rights</li>
                      <li>Do not attempt to reverse engineer or hack the Service</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-zyra-cyan-blue mb-2">Prohibited Activities</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Spam, phishing, or malicious activities</li>
                      <li>Violation of privacy or data protection laws</li>
                      <li>Distribution of malware or harmful content</li>
                      <li>Circumvention of security measures</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-zyra-cyan-blue flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Payment Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-zyra-cyan-blue mb-2">Billing & Payments</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                      <li>All fees are non-refundable unless otherwise specified</li>
                      <li>We may change pricing with 30 days' notice</li>
                      <li>Payment is due immediately upon invoice generation</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-zyra-cyan-blue mb-2">Usage Limits</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Service usage is subject to plan limits and fair use policies</li>
                      <li>Excessive usage may result in additional charges</li>
                      <li>We reserve the right to throttle or suspend excessive usage</li>
                      <li>AI processing costs are calculated based on actual usage</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-zyra-cyan-blue mb-2">Refunds & Cancellations</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>You may cancel your subscription at any time</li>
                      <li>Cancellation takes effect at the end of the current billing period</li>
                      <li>No refunds for partial months or unused services</li>
                      <li>Data export is available for 30 days after cancellation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-zyra-cyan-blue flex items-center">
                  <Gavel className="w-5 h-5 mr-2" />
                  Intellectual Property
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-zyra-cyan-blue mb-2">Our Rights</h4>
                    <p className="text-sm">
                      The Service and its original content, features, and functionality are owned by 
                      Zyra Inc. and are protected by international copyright, trademark, patent, 
                      trade secret, and other intellectual property laws.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-zyra-cyan-blue mb-2">Your Content</h4>
                    <p className="text-sm">
                      You retain ownership of content you upload to the Service. By using the Service, 
                      you grant us a limited license to process, store, and analyze your content 
                      solely for the purpose of providing the Service.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-zyra-cyan-blue mb-2">AI-Generated Content</h4>
                    <p className="text-sm">
                      Content generated by our AI systems is provided for your use but may be subject 
                      to third-party intellectual property rights. You are responsible for ensuring 
                      your use of AI-generated content complies with applicable laws.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Limitation of Liability */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-zyra-cyan-blue flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Limitation of Liability
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <div className="space-y-4">
                  <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, ZYRA SHALL NOT BE LIABLE FOR ANY 
                    INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING 
                    WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE 
                    LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
                  </p>
                  
                  <p>
                    OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE 
                    TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US FOR THE SERVICE 
                    IN THE TWELVE MONTHS PRECEDING THE CLAIM.
                  </p>

                  <div className="p-4 border border-yellow-500/30 rounded-lg bg-yellow-500/10">
                    <h4 className="font-semibold text-yellow-400 mb-2">Important Notice</h4>
                    <p className="text-sm">
                      Some jurisdictions do not allow the exclusion of certain warranties or 
                      limitations of liability, so the above limitations may not apply to you.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Termination */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-zyra-cyan-blue">Termination</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-zyra-cyan-blue mb-2">Termination by You</h4>
                    <p className="text-sm">
                      You may terminate your account at any time by contacting our support team. 
                      Upon termination, your right to use the Service will cease immediately.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-zyra-cyan-blue mb-2">Termination by Us</h4>
                    <p className="text-sm">
                      We may terminate or suspend your account immediately, without prior notice, 
                      for conduct that we believe violates these Terms or is harmful to other users, 
                      us, or third parties, or for any other reason.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-zyra-cyan-blue mb-2">Effect of Termination</h4>
                    <p className="text-sm">
                      Upon termination, your right to use the Service will cease immediately. 
                      We may delete your account and data after a reasonable period, subject to 
                      our data retention policies and legal obligations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-zyra-cyan-blue">Governing Law & Disputes</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <div className="space-y-4">
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of 
                    the State of California, without regard to its conflict of law provisions.
                  </p>
                  
                  <p>
                    Any disputes arising out of or relating to these Terms or the Service shall be 
                    resolved through binding arbitration in accordance with the rules of the 
                    American Arbitration Association.
                  </p>

                  <p>
                    You agree that any arbitration will be conducted in San Francisco, California, 
                    and that you waive any right to a jury trial.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-zyra-cyan-blue">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-zyra-cyan-blue mb-2">Legal Department</h4>
                      <p className="text-sm">Email: legal@zyra.com</p>
                      <p className="text-sm">Phone: +1 (555) 123-4567</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-zyra-cyan-blue mb-2">General Support</h4>
                      <p className="text-sm">Email: support@zyra.com</p>
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
