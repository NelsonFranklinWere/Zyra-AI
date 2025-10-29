'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  Users,
  Headphones,
  FileText,
  Zap,
  Globe,
  Twitter,
  Linkedin,
  Github
} from 'lucide-react'

interface ContactMethod {
  id: string
  title: string
  description: string
  value: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  action: string
}

interface SupportCategory {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  responseTime: string
}

const contactMethods: ContactMethod[] = [
  {
    id: 'email',
    title: 'Email Support',
    description: 'Get help via email with detailed responses',
    value: 'support@zyra.com',
    icon: Mail,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    action: 'Send Email'
  },
  {
    id: 'phone',
    title: 'Phone Support',
    description: 'Speak directly with our support team',
    value: '+1 (555) 123-4567',
    icon: Phone,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    action: 'Call Now'
  },
  {
    id: 'chat',
    title: 'Live Chat',
    description: 'Get instant help through our chat system',
    value: 'Available 24/7',
    icon: MessageSquare,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    action: 'Start Chat'
  },
  {
    id: 'office',
    title: 'Visit Our Office',
    description: 'Come visit us at our headquarters',
    value: '123 Tech Street, San Francisco, CA 94105',
    icon: MapPin,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    action: 'Get Directions'
  }
]

const supportCategories: SupportCategory[] = [
  {
    id: 'technical',
    title: 'Technical Support',
    description: 'API issues, integrations, and technical problems',
    icon: Zap,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    responseTime: '2-4 hours'
  },
  {
    id: 'billing',
    title: 'Billing & Account',
    description: 'Payment issues, subscription changes, account management',
    icon: FileText,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    responseTime: '1-2 hours'
  },
  {
    id: 'sales',
    title: 'Sales & Partnerships',
    description: 'New features, enterprise plans, partnership opportunities',
    icon: Users,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    responseTime: '24 hours'
  },
  {
    id: 'general',
    title: 'General Inquiries',
    description: 'Questions about features, documentation, or general help',
    icon: Headphones,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    responseTime: '4-8 hours'
  }
]

const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: '#', color: 'text-blue-400' },
  { name: 'LinkedIn', icon: Linkedin, href: '#', color: 'text-blue-600' },
  { name: 'GitHub', icon: Github, href: '#', color: 'text-gray-400' }
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    category: '',
    subject: '',
    message: '',
    priority: 'medium'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        company: '',
        category: '',
        subject: '',
        message: '',
        priority: 'medium'
      })
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-zyra-gradient cyber-grid">
      <div className="container mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-zyra-cyan-blue mb-4">
              Contact Us
            </h1>
            <p className="text-zyra-text-secondary text-lg mb-8">
              Get in touch with our team. We're here to help you succeed with Zyra.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Methods */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white">Get in Touch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contactMethods.map((method, index) => {
                    const Icon = method.icon
                    return (
                      <motion.div
                        key={method.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border border-white/10 rounded-xl hover:border-zyra-cyan-blue/50 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${method.bgColor}`}>
                            <Icon className={`w-5 h-5 ${method.color}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-1">{method.title}</h4>
                            <p className="text-sm text-zyra-text-secondary mb-2">{method.description}</p>
                            <p className="text-sm text-zyra-cyan-blue mb-3">{method.value}</p>
                            <Button 
                              size="sm" 
                              className="bg-zyra-cyan-blue hover:bg-zyra-cyan-blue/80"
                            >
                              {method.action}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Business Hours */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zyra-text-secondary">Monday - Friday</span>
                      <span className="text-white">9:00 AM - 6:00 PM PST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zyra-text-secondary">Saturday</span>
                      <span className="text-white">10:00 AM - 4:00 PM PST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zyra-text-secondary">Sunday</span>
                      <span className="text-white">Closed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white">Follow Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    {socialLinks.map((social, index) => {
                      const Icon = social.icon
                      return (
                        <motion.a
                          key={social.name}
                          href={social.href}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors ${social.color}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Icon className="w-5 h-5" />
                        </motion.a>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white">Send us a Message</CardTitle>
                  <p className="text-zyra-text-secondary">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </CardHeader>
                <CardContent>
                  {submitStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg mb-6"
                    >
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-medium">Message sent successfully!</span>
                      </div>
                      <p className="text-sm text-green-400 mt-1">
                        We'll get back to you within 24 hours.
                      </p>
                    </motion.div>
                  )}

                  {submitStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-6"
                    >
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span className="text-red-400 font-medium">Error sending message</span>
                      </div>
                      <p className="text-sm text-red-400 mt-1">
                        Please try again or contact us directly.
                      </p>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white placeholder-zyra-text-secondary"
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white placeholder-zyra-text-secondary"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Company
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white placeholder-zyra-text-secondary"
                          placeholder="Your company name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Priority
                        </label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white"
                      >
                        <option value="">Select a category</option>
                        {supportCategories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white placeholder-zyra-text-secondary"
                        placeholder="Brief description of your inquiry"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white placeholder-zyra-text-secondary resize-none"
                        placeholder="Please provide details about your inquiry..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 text-white py-3"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Sending...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Send className="w-5 h-5" />
                          <span>Send Message</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Support Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl text-white text-center">Support Categories</CardTitle>
                <p className="text-zyra-text-secondary text-center">
                  Choose the right support channel for your needs
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {supportCategories.map((category, index) => {
                    const Icon = category.icon
                    return (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center p-6 border border-white/10 rounded-xl hover:border-zyra-cyan-blue/50 hover:bg-white/5 transition-colors"
                      >
                        <div className={`w-12 h-12 ${category.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                          <Icon className={`w-6 h-6 ${category.color}`} />
                        </div>
                        <h4 className="font-semibold text-white mb-2">{category.title}</h4>
                        <p className="text-sm text-zyra-text-secondary mb-3">{category.description}</p>
                        <div className="text-xs text-zyra-cyan-blue">
                          Response time: {category.responseTime}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
