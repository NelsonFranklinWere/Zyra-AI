'use client'

import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Users, 
  Zap, 
  Brain,
  MessageSquare,
  BarChart3,
  Activity,
  Target
} from 'lucide-react'

const stats = [
  {
    title: 'Active Automations',
    value: '12',
    change: '+3 this week',
    icon: Zap,
    color: 'zyra-electric-violet',
    trend: 'up'
  },
  {
    title: 'AI Tasks Completed',
    value: '1,247',
    change: '+156 today',
    icon: Brain,
    color: 'zyra-cyan-blue',
    trend: 'up'
  },
  {
    title: 'WhatsApp Messages',
    value: '3,891',
    change: '+234 today',
    icon: MessageSquare,
    color: 'zyra-teal',
    trend: 'up'
  },
  {
    title: 'Data Insights',
    value: '89',
    change: '+12 this week',
    icon: BarChart3,
    color: 'zyra-violet',
    trend: 'up'
  }
]

const recentActivities = [
  {
    id: 1,
    type: 'automation',
    title: 'WhatsApp Auto-Reply Triggered',
    description: 'Responded to 15 customer inquiries automatically',
    time: '2 minutes ago',
    status: 'success'
  },
  {
    id: 2,
    type: 'ai',
    title: 'CV Generated Successfully',
    description: 'Professional CV created for John Doe',
    time: '5 minutes ago',
    status: 'success'
  },
  {
    id: 3,
    type: 'insight',
    title: 'New Data Insight Available',
    description: 'Q4 performance analysis completed',
    time: '1 hour ago',
    status: 'info'
  },
  {
    id: 4,
    type: 'social',
    title: 'Social Media Post Scheduled',
    description: 'LinkedIn post scheduled for tomorrow',
    time: '2 hours ago',
    status: 'pending'
  }
]

const quickActions = [
  {
    title: 'Create Automation',
    description: 'Build a new workflow',
    icon: Zap,
    href: '/dashboard/automations',
    color: 'zyra-electric-violet'
  },
  {
    title: 'AI Tools',
    description: 'Generate content with AI',
    icon: Brain,
    href: '/dashboard/ai-tools',
    color: 'zyra-cyan-blue'
  },
  {
    title: 'WhatsApp Setup',
    description: 'Configure messaging bot',
    icon: MessageSquare,
    href: '/dashboard/whatsapp',
    color: 'zyra-teal'
  },
  {
    title: 'View Analytics',
    description: 'Check performance metrics',
    icon: BarChart3,
    href: '/dashboard/analytics',
    color: 'zyra-violet'
  }
]

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-cyber font-bold gradient-text mb-2">
          Welcome Back!
        </h1>
        <p className="text-zyra-text-secondary text-lg">
          Here's what's happening with your Zyra automations and AI tools.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
            className="glass-card p-6 rounded-2xl border border-zyra-glass-border"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}/20 border border-${stat.color}/30`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}`} />
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">{stat.change}</span>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-zyra-text-secondary">{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 glass-card p-6 rounded-2xl border border-zyra-glass-border"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-cyber font-bold text-white">Recent Activity</h2>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-zyra-cyan-blue" />
              <span className="text-sm text-zyra-text-secondary">Live</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className={`w-3 h-3 rounded-full mt-2 ${
                  activity.status === 'success' ? 'bg-green-400' :
                  activity.status === 'info' ? 'bg-blue-400' :
                  'bg-yellow-400'
                }`} />
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{activity.title}</h3>
                  <p className="text-sm text-zyra-text-secondary">{activity.description}</p>
                  <p className="text-xs text-zyra-text-secondary mt-1">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          <div className="glass-card p-6 rounded-2xl border border-zyra-glass-border">
            <h2 className="text-2xl font-cyber font-bold text-white mb-6">Quick Actions</h2>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <motion.a
                  key={action.title}
                  href={action.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                >
                  <div className={`p-3 rounded-xl bg-${action.color}/20 border border-${action.color}/30 group-hover:bg-${action.color}/30 transition-colors`}>
                    <action.icon className={`w-5 h-5 text-${action.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{action.title}</h3>
                    <p className="text-sm text-zyra-text-secondary">{action.description}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>

          {/* AI Status */}
          <div className="glass-card p-6 rounded-2xl border border-zyra-glass-border">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-zyra-cyan-blue rounded-full animate-pulse" />
              <h3 className="text-lg font-semibold text-white">AI Core Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zyra-text-secondary">Processing Power</span>
                <span className="text-sm text-white">87%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zyra-text-secondary">Active Models</span>
                <span className="text-sm text-white">4/4</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zyra-text-secondary">Response Time</span>
                <span className="text-sm text-white">0.3s</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
