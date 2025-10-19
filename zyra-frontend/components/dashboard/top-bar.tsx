'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  Menu,
  Zap,
  Brain
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface TopBarProps {
  onMenuClick: () => void
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    avatarUrl?: string
  }
}

export function TopBar({ onMenuClick, user }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { logout } = useAuth()

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-nav border-b border-zyra-glass-border"
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <motion.button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu className="w-5 h-5" />
          </motion.button>

          {/* Search Bar */}
          <div className="relative hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zyra-text-secondary" />
              <input
                type="text"
                placeholder="Search automations, AI tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white placeholder-zyra-text-secondary"
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* AI Status Indicator */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-lg bg-zyra-electric-violet/10 border border-zyra-electric-violet/20">
            <div className="w-2 h-2 bg-zyra-cyan-blue rounded-full animate-pulse" />
            <span className="text-sm text-zyra-text-secondary">AI Core</span>
          </div>

          {/* Quick Actions */}
          <div className="hidden lg:flex items-center space-x-2">
            <motion.button
              className="p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="w-5 h-5" />
            </motion.button>
            <motion.button
              className="p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Brain className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-zyra-electric-violet rounded-full animate-pulse" />
            </motion.button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-2 w-80 glass-card p-4 rounded-xl border border-zyra-glass-border"
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-zyra-cyan-blue/10 border border-zyra-cyan-blue/20">
                    <div className="w-2 h-2 bg-zyra-cyan-blue rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">AI Automation Complete</p>
                      <p className="text-xs text-zyra-text-secondary">WhatsApp workflow executed successfully</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-zyra-electric-violet/10 border border-zyra-electric-violet/20">
                    <div className="w-2 h-2 bg-zyra-electric-violet rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">New Insight Available</p>
                      <p className="text-xs text-zyra-text-secondary">Data analysis completed for Q4</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.firstName}
                  className="w-8 h-8 rounded-full border border-zyra-glass-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zyra-electric-violet/20 border border-zyra-electric-violet/30 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              )}
              <div className="hidden lg:block text-left">
                <div className="text-sm font-medium text-white">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-zyra-text-secondary">
                  {user.email}
                </div>
              </div>
            </motion.button>

            {/* User Dropdown */}
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-2 w-64 glass-card p-2 rounded-xl border border-zyra-glass-border"
              >
                <div className="space-y-1">
                  <button className="w-full flex items-center space-x-3 p-3 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <div className="border-t border-zyra-glass-border my-1" />
                  <button
                    onClick={logout}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
