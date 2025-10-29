'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Key,
  Mail,
  Phone,
  CreditCard,
  Download,
  Upload,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Check,
  X
} from 'lucide-react'

interface SettingSection {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
}

const settingSections: SettingSection[] = [
  {
    id: 'profile',
    title: 'Profile',
    description: 'Manage your personal information',
    icon: User,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Configure alert preferences',
    icon: Bell,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10'
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Password and authentication',
    icon: Shield,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10'
  },
  {
    id: 'appearance',
    title: 'Appearance',
    description: 'Theme and display settings',
    icon: Palette,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10'
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connected services and APIs',
    icon: Globe,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10'
  },
  {
    id: 'billing',
    title: 'Billing',
    description: 'Subscription and payment methods',
    icon: CreditCard,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10'
  }
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    automation: true,
    ai: true
  })
  const [theme, setTheme] = useState('dark')
  const [language, setLanguage] = useState('en')

  const handleSave = () => {
    console.log('Settings saved')
  }

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">First Name</label>
            <input
              type="text"
              defaultValue="John"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Last Name</label>
            <input
              type="text"
              defaultValue="Doe"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Email</label>
            <input
              type="email"
              defaultValue="john.doe@example.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Phone</label>
            <input
              type="tel"
              defaultValue="+1 (555) 123-4567"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Profile Picture</h3>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-zyra-electric-violet/20 flex items-center justify-center">
            <User className="w-8 h-8 text-zyra-electric-violet" />
          </div>
          <div className="space-y-2">
            <button className="px-4 py-2 bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 text-white rounded-lg transition-colors">
              Upload Photo
            </button>
            <p className="text-sm text-zyra-text-secondary">JPG, PNG or GIF. Max size 2MB.</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
      
      <div className="space-y-4">
        {Object.entries(notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 glass-card rounded-xl">
            <div>
              <div className="font-medium text-white capitalize">{key.replace('_', ' ')}</div>
              <div className="text-sm text-zyra-text-secondary">
                {key === 'email' && 'Receive notifications via email'}
                {key === 'push' && 'Browser push notifications'}
                {key === 'sms' && 'SMS notifications to your phone'}
                {key === 'automation' && 'Automation status updates'}
                {key === 'ai' && 'AI assistant notifications'}
              </div>
            </div>
            <button
              onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                value ? 'bg-zyra-electric-violet' : 'bg-white/20'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                value ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white pr-12"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zyra-text-secondary hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">New Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
        <div className="p-4 glass-card rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white">2FA is disabled</div>
              <div className="text-sm text-zyra-text-secondary">Add an extra layer of security to your account</div>
            </div>
            <button className="px-4 py-2 bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 text-white rounded-lg transition-colors">
              Enable 2FA
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-4">
          {['light', 'dark', 'auto'].map((themeOption) => (
            <button
              key={themeOption}
              onClick={() => setTheme(themeOption)}
              className={`p-4 rounded-xl border-2 transition-colors ${
                theme === themeOption 
                  ? 'border-zyra-cyan-blue bg-zyra-cyan-blue/10' 
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="text-white font-medium capitalize">{themeOption}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Language</h3>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>
    </div>
  )

  const renderIntegrationsSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Connected Services</h3>
      
      <div className="space-y-4">
        {[
          { name: 'Google', status: 'connected', icon: '🔗' },
          { name: 'WhatsApp Business', status: 'connected', icon: '📱' },
          { name: 'Slack', status: 'disconnected', icon: '💬' },
          { name: 'Mailchimp', status: 'connected', icon: '📧' }
        ].map((service) => (
          <div key={service.name} className="flex items-center justify-between p-4 glass-card rounded-xl">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{service.icon}</span>
              <div>
                <div className="font-medium text-white">{service.name}</div>
                <div className={`text-sm ${
                  service.status === 'connected' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {service.status}
                </div>
              </div>
            </div>
            <button className={`px-4 py-2 rounded-lg transition-colors ${
              service.status === 'connected' 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 text-white'
            }`}>
              {service.status === 'connected' ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )

  const renderBillingSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Current Plan</h3>
        <div className="p-6 glass-card rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-white">Pro Plan</div>
              <div className="text-zyra-text-secondary">$29/month</div>
            </div>
            <button className="px-4 py-2 bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 text-white rounded-lg transition-colors">
              Upgrade
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
        <div className="p-4 glass-card rounded-xl">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-6 h-6 text-zyra-text-secondary" />
            <div>
              <div className="font-medium text-white">•••• •••• •••• 1234</div>
              <div className="text-sm text-zyra-text-secondary">Expires 12/25</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSection()
      case 'notifications': return renderNotificationsSection()
      case 'security': return renderSecuritySection()
      case 'appearance': return renderAppearanceSection()
      case 'integrations': return renderIntegrationsSection()
      case 'billing': return renderBillingSection()
      default: return renderProfileSection()
    }
  }

  return (
    <div className="h-full flex">
      {/* Settings Sidebar */}
      <div className="w-80 glass-sidebar border-r border-zyra-glass-border p-6">
        <h2 className="text-xl font-cyber font-bold gradient-text mb-6">Settings</h2>
        
        <div className="space-y-2">
          {settingSections.map((section, index) => {
            const Icon = section.icon
            const isActive = activeSection === section.id
            
            return (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveSection(section.id)}
                className={`w-full p-4 rounded-xl text-left transition-colors ${
                  isActive 
                    ? 'bg-zyra-electric-violet/20 border border-zyra-electric-violet/30' 
                    : 'hover:bg-white/5'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${section.bgColor}`}>
                    <Icon className={`w-5 h-5 ${section.color}`} />
                  </div>
                  <div>
                    <div className="font-medium text-white">{section.title}</div>
                    <div className="text-sm text-zyra-text-secondary">{section.description}</div>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl">
          {renderActiveSection()}
          
          {/* Save Button */}
          <div className="mt-8 flex items-center justify-end space-x-4">
            <button className="px-6 py-3 text-zyra-text-secondary hover:text-white transition-colors">
              Cancel
            </button>
            <motion.button
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-3 bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 text-white rounded-xl font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save className="w-5 h-5" />
              <span>Save Changes</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
