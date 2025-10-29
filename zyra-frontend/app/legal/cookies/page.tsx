'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Cookie, 
  Settings, 
  Shield, 
  Eye, 
  BarChart3, 
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

interface CookieCategory {
  id: string
  name: string
  description: string
  required: boolean
  enabled: boolean
  cookies: {
    name: string
    purpose: string
    duration: string
  }[]
  icon: React.ComponentType<any>
  color: string
}

const cookieCategories: CookieCategory[] = [
  {
    id: 'essential',
    name: 'Essential Cookies',
    description: 'These cookies are necessary for the website to function and cannot be switched off.',
    required: true,
    enabled: true,
    cookies: [
      { name: 'session_id', purpose: 'Maintains your session state', duration: 'Session' },
      { name: 'csrf_token', purpose: 'Protects against cross-site request forgery', duration: 'Session' },
      { name: 'auth_token', purpose: 'Keeps you logged in securely', duration: '30 days' }
    ],
    icon: Shield,
    color: 'text-green-400'
  },
  {
    id: 'analytics',
    name: 'Analytics Cookies',
    description: 'These cookies help us understand how visitors interact with our website.',
    required: false,
    enabled: true,
    cookies: [
      { name: '_ga', purpose: 'Distinguishes unique users', duration: '2 years' },
      { name: '_ga_*', purpose: 'Stores session state', duration: '2 years' },
      { name: '_gid', purpose: 'Distinguishes unique users', duration: '24 hours' }
    ],
    icon: BarChart3,
    color: 'text-blue-400'
  },
  {
    id: 'marketing',
    name: 'Marketing Cookies',
    description: 'These cookies are used to track visitors across websites for advertising purposes.',
    required: false,
    enabled: false,
    cookies: [
      { name: '_fbp', purpose: 'Facebook pixel tracking', duration: '3 months' },
      { name: 'ads_id', purpose: 'Google Ads conversion tracking', duration: '1 year' },
      { name: 'utm_*', purpose: 'Campaign attribution', duration: '6 months' }
    ],
    icon: Target,
    color: 'text-purple-400'
  },
  {
    id: 'preferences',
    name: 'Preference Cookies',
    description: 'These cookies remember your choices and settings for a better experience.',
    required: false,
    enabled: true,
    cookies: [
      { name: 'theme', purpose: 'Remembers your theme preference', duration: '1 year' },
      { name: 'language', purpose: 'Stores your language setting', duration: '1 year' },
      { name: 'notifications', purpose: 'Remembers notification preferences', duration: '6 months' }
    ],
    icon: Settings,
    color: 'text-orange-400'
  }
]

export default function CookieSettingsPage() {
  const [categories, setCategories] = useState<CookieCategory[]>(cookieCategories)
  const [showDetails, setShowDetails] = useState(false)

  const handleCategoryToggle = (categoryId: string) => {
    setCategories(prev => 
      prev.map(category => 
        category.id === categoryId 
          ? { ...category, enabled: !category.enabled }
          : category
      )
    )
  }

  const handleSavePreferences = () => {
    // Save cookie preferences to localStorage
    const preferences = categories.reduce((acc, category) => {
      acc[category.id] = category.enabled
      return acc
    }, {} as Record<string, boolean>)
    
    localStorage.setItem('cookie_preferences', JSON.stringify(preferences))
    console.log('Cookie preferences saved:', preferences)
  }

  const handleAcceptAll = () => {
    setCategories(prev => 
      prev.map(category => ({ ...category, enabled: true }))
    )
  }

  const handleRejectAll = () => {
    setCategories(prev => 
      prev.map(category => ({ 
        ...category, 
        enabled: category.required 
      }))
    )
  }

  const getStatusIcon = (enabled: boolean, required: boolean) => {
    if (required) return <CheckCircle className="w-5 h-5 text-green-400" />
    return enabled ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />
  }

  const getStatusText = (enabled: boolean, required: boolean) => {
    if (required) return 'Required'
    return enabled ? 'Enabled' : 'Disabled'
  }

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
              Cookie Settings
            </h1>
            <p className="text-zyra-text-secondary text-lg">
              Manage your cookie preferences and privacy settings
            </p>
            <Badge variant="outline" className="mt-4 text-zyra-cyan-blue">
              Last updated: {new Date().toLocaleDateString()}
            </Badge>
          </div>

          <div className="space-y-6">
            {/* Cookie Overview */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-zyra-cyan-blue flex items-center">
                  <Cookie className="w-5 h-5 mr-2" />
                  What Are Cookies?
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  Cookies are small text files that are stored on your device when you visit our website. 
                  They help us provide you with a better experience by remembering your preferences and 
                  understanding how you use our site.
                </p>
                <p>
                  We use different types of cookies for various purposes. You can control which types 
                  of cookies we use, except for essential cookies which are necessary for the website 
                  to function properly.
                </p>
              </CardContent>
            </Card>

            {/* Cookie Categories */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Cookie Categories</h2>
              
              {categories.map((category, index) => {
                const Icon = category.icon
                
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-card">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg bg-white/5`}>
                              <Icon className={`w-5 h-5 ${category.color}`} />
                            </div>
                            <div>
                              <CardTitle className="text-white">{category.name}</CardTitle>
                              <p className="text-sm text-zyra-text-secondary">{category.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(category.enabled, category.required)}
                              <span className={`text-sm font-medium ${
                                category.enabled ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {getStatusText(category.enabled, category.required)}
                              </span>
                            </div>
                            
                            {!category.required && (
                              <button
                                onClick={() => handleCategoryToggle(category.id)}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                  category.enabled
                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                }`}
                              >
                                {category.enabled ? 'Disable' : 'Enable'}
                              </button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      
                      {showDetails && (
                        <CardContent>
                          <div className="space-y-3">
                            <h4 className="font-semibold text-white">Cookies Used:</h4>
                            {category.cookies.map((cookie, cookieIndex) => (
                              <div key={cookieIndex} className="p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-white">{cookie.name}</div>
                                    <div className="text-sm text-zyra-text-secondary">{cookie.purpose}</div>
                                  </div>
                                  <div className="text-sm text-zyra-text-secondary">{cookie.duration}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {/* Cookie Details Toggle */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center space-x-2 px-4 py-2 text-zyra-cyan-blue hover:text-zyra-cyan-blue/80 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>{showDetails ? 'Hide' : 'Show'} Cookie Details</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={handleRejectAll}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Reject All Non-Essential
              </Button>
              
              <Button
                onClick={handleSavePreferences}
                className="w-full sm:w-auto bg-zyra-electric-violet hover:bg-zyra-electric-violet/80"
              >
                Save Preferences
              </Button>
              
              <Button
                onClick={handleAcceptAll}
                className="w-full sm:w-auto bg-zyra-cyan-blue hover:bg-zyra-cyan-blue/80"
              >
                Accept All
              </Button>
            </div>

            {/* Privacy Information */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-zyra-cyan-blue flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Privacy Information
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <div className="space-y-4">
                  <p>
                    Your privacy is important to us. We only use cookies to improve your experience 
                    and provide our services. You can change your cookie preferences at any time.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-zyra-glass-border rounded-lg">
                      <h4 className="font-semibold text-zyra-cyan-blue mb-2">Data Protection</h4>
                      <p className="text-sm">
                        We comply with GDPR, CCPA, and other privacy regulations. 
                        Your data is encrypted and securely stored.
                      </p>
                    </div>
                    
                    <div className="p-4 border border-zyra-glass-border rounded-lg">
                      <h4 className="font-semibold text-zyra-cyan-blue mb-2">Third-Party Services</h4>
                      <p className="text-sm">
                        Some cookies are set by third-party services we use for analytics 
                        and functionality. You can control these through your browser settings.
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-yellow-500/30 rounded-lg bg-yellow-500/10">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-400 mb-1">Important Notice</h4>
                        <p className="text-sm">
                          Disabling certain cookies may affect the functionality of our website. 
                          Essential cookies cannot be disabled as they are necessary for the site to work.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-zyra-cyan-blue">Questions About Cookies?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    If you have any questions about our use of cookies or this cookie policy, 
                    please contact us:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-zyra-cyan-blue mb-2">Privacy Team</h4>
                      <p className="text-sm">Email: privacy@zyra.com</p>
                      <p className="text-sm">Phone: +1 (555) 123-4567</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-zyra-cyan-blue mb-2">Data Protection Officer</h4>
                      <p className="text-sm">Email: dpo@zyra.com</p>
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
  )
}
