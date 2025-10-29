'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Zap, 
  Brain, 
  MessageSquare, 
  Settings, 
  Bot,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react'

interface SidebarProps {
  onClose: () => void
}

const navigation = [
  {
    name: 'Overview',
    href: '/dashboard/overview',
    icon: LayoutDashboard,
    description: 'Analytics and insights'
  },
  {
    name: 'Automations',
    href: '/dashboard/automations',
    icon: Zap,
    description: 'Build and manage workflows'
  },
  {
    name: 'AI Tools',
    href: '/dashboard/ai-tools',
    icon: Brain,
    description: 'CV builder, posts, insights'
  },
  {
    name: 'WhatsApp',
    href: '/dashboard/whatsapp',
    icon: MessageSquare,
    description: 'WhatsApp automation'
  },
  {
    name: 'Assistant',
    href: '/dashboard/assistant',
    icon: Bot,
    description: 'Chat with Zyra AI'
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Account and preferences'
  }
]

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-6 border-b border-zyra-glass-border">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div 
              className="relative w-10 h-10 rounded-xl overflow-hidden"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-neon-gradient opacity-90" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-2xl font-cyber font-bold gradient-text">
                Zyra
              </span>
              <span className="text-xs text-zyra-text-secondary font-medium tracking-wider">
                AI AUTOMATION
              </span>
            </div>
          </Link>
        </div>
        
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Home Link */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            href="/"
            onClick={onClose}
            className="group flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 text-zyra-text-secondary hover:text-white hover:bg-white/5 mb-2"
          >
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Home</div>
              <div className="text-xs text-zyra-text-secondary group-hover:text-zyra-text-secondary/80">
                Back to main site
              </div>
            </div>
          </Link>
        </motion.div>
        
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const isExpanded = expandedItems.includes(item.name)
          
          return (
            <motion.div
              key={item.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-zyra-electric-violet/20 border border-zyra-electric-violet/30 text-white'
                    : 'text-zyra-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isActive 
                      ? 'bg-zyra-electric-violet/30' 
                      : 'bg-white/5 group-hover:bg-white/10'
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-zyra-text-secondary group-hover:text-zyra-text-secondary/80">
                      {item.description}
                    </div>
                  </div>
                </div>
                
                {item.name === 'AI Tools' && (
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault()
                      toggleExpanded(item.name)
                    }}
                    className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronRight 
                      className={`w-4 h-4 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`} 
                    />
                  </motion.button>
                )}
              </Link>

              {/* AI Tools Submenu */}
              {item.name === 'AI Tools' && isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-8 mt-2 space-y-1"
                >
                  <Link
                    href="/dashboard/ai-tools/cv-builder"
                    className="flex items-center space-x-2 p-2 rounded-lg text-sm text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                    onClick={onClose}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>CV Builder</span>
                  </Link>
                  <Link
                    href="/dashboard/ai-tools/social-generator"
                    className="flex items-center space-x-2 p-2 rounded-lg text-sm text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                    onClick={onClose}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Social Generator</span>
                  </Link>
                  <Link
                    href="/dashboard/ai-tools/insights"
                    className="flex items-center space-x-2 p-2 rounded-lg text-sm text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                    onClick={onClose}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Data Insights</span>
                  </Link>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zyra-glass-border">
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-zyra-cyan-blue rounded-full animate-pulse" />
            <span className="text-sm text-zyra-text-secondary">AI Core Active</span>
          </div>
          <p className="text-xs text-zyra-text-secondary">
            Powered by advanced AI
          </p>
        </div>
      </div>
    </div>
  )
}
