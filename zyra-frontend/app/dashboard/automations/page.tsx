'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap, 
  Plus, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  Bot,
  MessageSquare,
  Mail,
  Calendar
} from 'lucide-react'

interface Automation {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'error'
  type: 'whatsapp' | 'email' | 'calendar' | 'ai'
  lastRun: string
  nextRun: string
  triggers: number
  actions: number
}

const mockAutomations: Automation[] = [
  {
    id: '1',
    name: 'Welcome New Users',
    description: 'Send welcome message to new WhatsApp users',
    status: 'active',
    type: 'whatsapp',
    lastRun: '2 minutes ago',
    nextRun: 'In 5 minutes',
    triggers: 3,
    actions: 2
  },
  {
    id: '2',
    name: 'Daily Report Generator',
    description: 'Generate and send daily analytics reports',
    status: 'active',
    type: 'email',
    lastRun: '1 hour ago',
    nextRun: 'Tomorrow at 9:00 AM',
    triggers: 1,
    actions: 4
  },
  {
    id: '3',
    name: 'Meeting Scheduler',
    description: 'Automatically schedule meetings based on availability',
    status: 'paused',
    type: 'calendar',
    lastRun: '3 hours ago',
    nextRun: 'Paused',
    triggers: 2,
    actions: 3
  },
  {
    id: '4',
    name: 'AI Content Generator',
    description: 'Generate social media posts using AI',
    status: 'error',
    type: 'ai',
    lastRun: 'Failed 1 hour ago',
    nextRun: 'Retry in 30 minutes',
    triggers: 1,
    actions: 1
  }
]

const automationTypes = {
  whatsapp: { icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-500/10' },
  email: { icon: Mail, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  calendar: { icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ai: { icon: Bot, color: 'text-cyan-400', bg: 'bg-cyan-500/10' }
}

const statusConfig = {
  active: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
  paused: { icon: Pause, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  error: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' }
}

export default function AutomationsPage() {
  const [automations] = useState<Automation[]>(mockAutomations)
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleAutomationAction = (id: string, action: 'play' | 'pause' | 'edit' | 'delete') => {
    console.log(`${action} automation ${id}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-cyber font-bold gradient-text mb-2">
            Automations
          </h1>
          <p className="text-zyra-text-secondary">
            Build and manage your AI-powered workflows
          </p>
        </div>
        
        <motion.button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 text-white rounded-xl font-medium transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          <span>Create Automation</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zyra-text-secondary text-sm">Total Automations</p>
              <p className="text-2xl font-bold text-white">{automations.length}</p>
            </div>
            <Zap className="w-8 h-8 text-zyra-electric-violet" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zyra-text-secondary text-sm">Active</p>
              <p className="text-2xl font-bold text-green-400">
                {automations.filter(a => a.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zyra-text-secondary text-sm">Paused</p>
              <p className="text-2xl font-bold text-yellow-400">
                {automations.filter(a => a.status === 'paused').length}
              </p>
            </div>
            <Pause className="w-8 h-8 text-yellow-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zyra-text-secondary text-sm">Errors</p>
              <p className="text-2xl font-bold text-red-400">
                {automations.filter(a => a.status === 'error').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </motion.div>
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        {automations.map((automation, index) => {
          const typeConfig = automationTypes[automation.type]
          const statusInfo = statusConfig[automation.status]
          const TypeIcon = typeConfig.icon
          const StatusIcon = statusInfo.icon

          return (
            <motion.div
              key={automation.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => setSelectedAutomation(automation)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${typeConfig.bg}`}>
                    <TypeIcon className={`w-6 h-6 ${typeConfig.color}`} />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {automation.name}
                    </h3>
                    <p className="text-zyra-text-secondary text-sm mb-2">
                      {automation.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-zyra-text-secondary">
                      <span>Last run: {automation.lastRun}</span>
                      <span>Next run: {automation.nextRun}</span>
                      <span>{automation.triggers} triggers</span>
                      <span>{automation.actions} actions</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${statusInfo.bg}`}>
                    <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                    <span className={`text-sm font-medium ${statusInfo.color}`}>
                      {automation.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAutomationAction(automation.id, 'play')
                      }}
                      className="p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAutomationAction(automation.id, 'pause')
                      }}
                      className="p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Pause className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAutomationAction(automation.id, 'edit')
                      }}
                      className="p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAutomationAction(automation.id, 'delete')
                      }}
                      className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Create Automation Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card p-8 rounded-2xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-cyber font-bold gradient-text mb-6">
              Create New Automation
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Automation Name
                </label>
                <input
                  type="text"
                  placeholder="Enter automation name"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white placeholder-zyra-text-secondary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Describe what this automation does"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white placeholder-zyra-text-secondary resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Automation Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(automationTypes).map(([type, config]) => {
                    const Icon = config.icon
                    return (
                      <button
                        key={type}
                        className={`p-4 rounded-xl border-2 border-transparent hover:border-zyra-cyan-blue/50 transition-colors text-left ${
                          type === 'whatsapp' ? 'border-zyra-cyan-blue/50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${config.bg}`}>
                            <Icon className={`w-5 h-5 ${config.color}`} />
                          </div>
                          <span className="text-white font-medium capitalize">{type}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 text-zyra-text-secondary hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 text-white rounded-xl font-medium transition-colors"
              >
                Create Automation
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
