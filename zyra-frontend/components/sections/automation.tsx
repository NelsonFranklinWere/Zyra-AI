"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Play, 
  Pause, 
  Settings, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Brain,
  Target,
  MessageSquare,
  Calendar,
  TrendingUp
} from "lucide-react"

interface Automation {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'error' | 'completed'
  execution_count: number
  success_count: number
  error_count: number
  last_executed: string
  next_execution: string | null
  workflow_config: {
    n8n_workflow_id: string
    campaign_id: string
    persona_id: string
    channels: string[]
    schedule: any
  }
}

const mockAutomations: Automation[] = [
  {
    id: '1',
    name: 'Gen Z Sneaker Campaign',
    description: 'Automated marketing campaign targeting Gen Z audiences for sneaker collection',
    status: 'active',
    execution_count: 24,
    success_count: 22,
    error_count: 2,
    last_executed: '2024-01-15T18:00:00Z',
    next_execution: '2024-01-22T18:00:00Z',
    workflow_config: {
      n8n_workflow_id: 'wf_123',
      campaign_id: 'camp_456',
      persona_id: 'persona_789',
      channels: ['whatsapp', 'instagram', 'tiktok'],
      schedule: { type: 'weekly', day: 'friday', time: '18:00' }
    }
  },
  {
    id: '2',
    name: 'Nairobi Urban Shoppers',
    description: 'Targeted campaign for urban shoppers in Nairobi with WhatsApp and Instagram',
    status: 'paused',
    execution_count: 12,
    success_count: 10,
    error_count: 2,
    last_executed: '2024-01-10T14:30:00Z',
    next_execution: '2024-01-17T14:30:00Z',
    workflow_config: {
      n8n_workflow_id: 'wf_124',
      campaign_id: 'camp_457',
      persona_id: 'persona_790',
      channels: ['whatsapp', 'instagram'],
      schedule: { type: 'daily', time: '14:30' }
    }
  },
  {
    id: '3',
    name: 'Budget Buyers Email Sequence',
    description: 'Email automation for budget-conscious customers with discount offers',
    status: 'completed',
    execution_count: 8,
    success_count: 8,
    error_count: 0,
    last_executed: '2024-01-12T10:00:00Z',
    next_execution: null as string | null,
    workflow_config: {
      n8n_workflow_id: 'wf_125',
      campaign_id: 'camp_458',
      persona_id: 'persona_791',
      channels: ['email'],
      schedule: { type: 'one_time' }
    }
  }
]

export const Automation = () => {
  const [automations, setAutomations] = useState<Automation[]>(mockAutomations)
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-electric-teal'
      case 'paused': return 'text-aurora-purple'
      case 'error': return 'text-neon-coral'
      case 'completed': return 'text-soft-silver'
      default: return 'text-soft-silver-dark'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />
      case 'paused': return <Pause className="w-4 h-4" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getSuccessRate = (automation: Automation) => {
    if (automation.execution_count === 0) return 0
    return Math.round((automation.success_count / automation.execution_count) * 100)
  }

  return (
    <section className="py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-electric-teal/10 border border-electric-teal/20 rounded-full px-4 py-2 mb-8">
            <Zap className="w-4 h-4 text-electric-teal" />
            <span className="text-sm text-electric-teal font-medium">Marketing Automation</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-8">
            <span className="bg-electric-gradient bg-clip-text text-transparent glow-text">
              Zyra Automation Hub
            </span>
          </h2>
          
          <p className="text-xl text-soft-silver max-w-3xl mx-auto">
            Create, manage, and monitor AI-powered marketing automations that reach the right audience at the right time
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16"
        >
          <div className="glass-effect rounded-2xl p-6 border border-electric-teal/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-electric-gradient rounded-xl flex items-center justify-center neon-glow">
                <Zap className="w-6 h-6 text-deep-space" />
              </div>
              <span className="text-2xl font-bold text-electric-teal">{automations.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-electric-teal mb-1">Active Automations</h3>
            <p className="text-soft-silver-dark">Running campaigns</p>
          </div>

          <div className="glass-effect rounded-2xl p-6 border border-aurora-purple/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-aurora-gradient rounded-xl flex items-center justify-center aurora-glow">
                <MessageSquare className="w-6 h-6 text-deep-space" />
              </div>
              <span className="text-2xl font-bold text-aurora-purple">
                {automations.reduce((sum, a) => sum + a.execution_count, 0)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-aurora-purple mb-1">Messages Sent</h3>
            <p className="text-soft-silver-dark">Total executions</p>
          </div>

          <div className="glass-effect rounded-2xl p-6 border border-neon-coral/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-neon-coral to-pink-500 rounded-xl flex items-center justify-center coral-glow">
                <TrendingUp className="w-6 h-6 text-deep-space" />
              </div>
              <span className="text-2xl font-bold text-neon-coral">
                {Math.round(automations.reduce((sum, a) => sum + getSuccessRate(a), 0) / automations.length)}%
              </span>
            </div>
            <h3 className="text-lg font-semibold text-neon-coral mb-1">Success Rate</h3>
            <p className="text-soft-silver-dark">Average performance</p>
          </div>

          <div className="glass-effect rounded-2xl p-6 border border-electric-teal/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-electric-gradient rounded-xl flex items-center justify-center neon-glow">
                <Brain className="w-6 h-6 text-deep-space" />
              </div>
              <span className="text-2xl font-bold text-electric-teal">
                {automations.filter(a => a.status === 'active').length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-electric-teal mb-1">AI Active</h3>
            <p className="text-soft-silver-dark">Intelligent campaigns</p>
          </div>
        </motion.div>

        {/* Automation List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {automations.map((automation, index) => (
            <motion.div
              key={automation.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-effect rounded-2xl p-8 border border-soft-silver/10 hover:border-electric-teal/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    automation.status === 'active' ? 'bg-electric-gradient neon-glow' :
                    automation.status === 'paused' ? 'bg-aurora-gradient aurora-glow' :
                    automation.status === 'error' ? 'bg-gradient-to-r from-neon-coral to-pink-500 coral-glow' :
                    'bg-soft-silver/20'
                  }`}>
                    {getStatusIcon(automation.status)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-soft-silver mb-1">{automation.name}</h3>
                    <p className="text-sm text-soft-silver-dark">{automation.description}</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${
                  automation.status === 'active' ? 'border-electric-teal/30 bg-electric-teal/10' :
                  automation.status === 'paused' ? 'border-aurora-purple/30 bg-aurora-purple/10' :
                  automation.status === 'error' ? 'border-neon-coral/30 bg-neon-coral/10' :
                  'border-soft-silver/30 bg-soft-silver/10'
                }`}>
                  <span className={`text-xs font-medium ${getStatusColor(automation.status)}`}>
                    {automation.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-2xl font-bold text-electric-teal mb-1">{automation.execution_count}</div>
                  <div className="text-sm text-soft-silver-dark">Executions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-aurora-purple mb-1">{getSuccessRate(automation)}%</div>
                  <div className="text-sm text-soft-silver-dark">Success Rate</div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-soft-silver-dark">Channels</span>
                  <div className="flex space-x-2">
                    {automation.workflow_config.channels.map((channel, idx) => (
                      <span key={idx} className="px-2 py-1 bg-electric-teal/10 text-electric-teal text-xs rounded-full">
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-soft-silver-dark">Last Executed</span>
                  <span className="text-sm text-soft-silver">{formatDate(automation.last_executed)}</span>
                </div>
                {automation.next_execution && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-soft-silver-dark">Next Execution</span>
                    <span className="text-sm text-soft-silver">{formatDate(automation.next_execution)}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button className="flex-1 bg-electric-gradient hover:scale-105 transition-all duration-300 neon-glow text-sm px-4 py-2 rounded-xl font-semibold">
                  <Play className="w-4 h-4 mr-2 inline" />
                  Execute
                </button>
                <button className="flex-1 glass-effect border border-aurora-purple/30 text-aurora-purple hover:bg-aurora-purple/10 text-sm px-4 py-2 rounded-xl font-semibold">
                  <Settings className="w-4 h-4 mr-2 inline" />
                  Configure
                </button>
                <button className="glass-effect border border-soft-silver/30 text-soft-silver hover:bg-soft-silver/10 p-2 rounded-xl">
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Create New Automation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="glass-effect rounded-2xl p-12 border border-electric-teal/20 max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-electric-gradient rounded-3xl flex items-center justify-center mb-8 mx-auto neon-glow">
              <Zap className="w-10 h-10 text-deep-space" />
            </div>
            
            <h3 className="text-3xl font-display font-bold text-electric-teal mb-4">
              Ready to automate your marketing?
            </h3>
            
            <p className="text-lg text-soft-silver mb-8 max-w-2xl mx-auto">
              Create intelligent marketing automations that reach your Gen Z audience with precision targeting and AI-powered content generation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-electric-gradient hover:scale-105 transition-all duration-300 neon-glow text-lg px-8 py-4 rounded-xl font-semibold"
              >
                Create Automation
              </button>
              <button className="glass-effect border border-electric-teal/30 text-electric-teal hover:bg-electric-teal/10 text-lg px-8 py-4 rounded-xl font-semibold">
                View Templates
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
