"use client"

import { Footer } from "@/components/shared/footer"
import { Dashboard } from "@/components/sections/dashboard"
import { motion } from "framer-motion"
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Zap,
  Brain,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Settings,
  Download
} from "lucide-react"

const stats = [
  { label: "Active Automations", value: "24", change: "+12%", trend: "up", color: "electric-teal" },
  { label: "Data Processed", value: "2.4K", change: "+8%", trend: "up", color: "aurora-purple" },
  { label: "AI Insights", value: "156", change: "+23%", trend: "up", color: "neon-coral" },
  { label: "Success Rate", value: "98.7%", change: "+2%", trend: "up", color: "electric-teal" }
]

const recentActivities = [
  { action: "Data analysis completed", time: "2 min ago", status: "success", type: "analysis" },
  { action: "Workflow automation triggered", time: "5 min ago", status: "success", type: "automation" },
  { action: "AI insight generated", time: "8 min ago", status: "success", type: "ai" },
  { action: "Email automation failed", time: "12 min ago", status: "error", type: "automation" },
  { action: "New data source uploaded", time: "15 min ago", status: "success", type: "data" },
  { action: "Workflow template created", time: "20 min ago", status: "success", type: "template" }
]

const quickActions = [
  { icon: Brain, label: "AI Analysis", color: "electric-teal", action: "analyze" },
  { icon: Clock, label: "Schedule Task", color: "aurora-purple", action: "schedule" },
  { icon: BarChart3, label: "View Reports", color: "neon-coral", action: "reports" },
  { icon: Zap, label: "New Workflow", color: "electric-teal", action: "workflow" }
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-zyra-gradient">
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                  <span className="bg-electric-gradient bg-clip-text text-transparent glow-text">
                    Dashboard
                  </span>
                </h1>
                <p className="text-xl text-soft-silver">
                  Your intelligent automation command center
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="glass-effect border border-electric-teal/30 text-electric-teal hover:bg-electric-teal/10 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Export Data</span>
                </button>
                <button className="bg-electric-gradient hover:scale-105 transition-all duration-300 neon-glow text-lg px-6 py-3 rounded-xl font-semibold flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>New Automation</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className="glass-effect rounded-2xl p-6 border border-soft-silver/10 hover:border-electric-teal/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-${stat.color}-gradient rounded-xl flex items-center justify-center neon-glow`}>
                    <TrendingUp className="w-6 h-6 text-deep-space" />
                  </div>
                  <div className="flex items-center text-electric-teal">
                    <span className="text-sm font-medium">{stat.change}</span>
                    <TrendingUp className="w-4 h-4 ml-1" />
                  </div>
                </div>
                
                <h3 className={`text-3xl font-bold text-${stat.color} mb-2`}>{stat.value}</h3>
                <p className="text-soft-silver-dark">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="glass-effect rounded-2xl p-8 border border-soft-silver/10"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-aurora-gradient rounded-xl flex items-center justify-center aurora-glow">
                    <Activity className="w-5 h-5 text-deep-space" />
                  </div>
                  <h3 className="text-2xl font-semibold text-aurora-purple">Recent Activity</h3>
                </div>
                <button className="text-soft-silver hover:text-electric-teal transition-colors duration-300">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 rounded-xl bg-deep-space-light/50 hover:bg-deep-space-light/70 transition-colors duration-300"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.status === 'success' ? 'bg-electric-teal/20' : 'bg-neon-coral/20'
                    }`}>
                      {activity.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-electric-teal" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-neon-coral" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-soft-silver font-medium">{activity.action}</p>
                      <p className="text-soft-silver-dark text-sm">{activity.time}</p>
                    </div>
                    
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activity.type === 'ai' ? 'bg-electric-teal/20 text-electric-teal' :
                      activity.type === 'automation' ? 'bg-aurora-purple/20 text-aurora-purple' :
                      activity.type === 'data' ? 'bg-neon-coral/20 text-neon-coral' :
                      'bg-soft-silver/20 text-soft-silver'
                    }`}>
                      {activity.type}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="glass-effect rounded-2xl p-8 border border-soft-silver/10"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-neon-coral to-pink-500 rounded-xl flex items-center justify-center coral-glow">
                  <Zap className="w-5 h-5 text-deep-space" />
                </div>
                <h3 className="text-2xl font-semibold text-neon-coral">Quick Actions</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`glass-effect border border-${action.color}/20 hover:border-${action.color}/40 p-4 rounded-xl text-center transition-all duration-300 group`}
                  >
                    <action.icon className={`w-8 h-8 text-${action.color} mx-auto mb-2 group-hover:scale-110 transition-transform duration-300`} />
                    <p className={`text-sm font-medium text-${action.color}`}>{action.label}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Performance Charts Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="glass-effect rounded-2xl p-8 border border-soft-silver/10"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-electric-gradient rounded-xl flex items-center justify-center neon-glow">
                  <BarChart3 className="w-5 h-5 text-deep-space" />
                </div>
                <h3 className="text-2xl font-semibold text-electric-teal">Performance Overview</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 bg-electric-teal/10 text-electric-teal rounded-lg text-sm font-medium">7 Days</button>
                <button className="px-4 py-2 text-soft-silver hover:text-electric-teal rounded-lg text-sm font-medium">30 Days</button>
                <button className="px-4 py-2 text-soft-silver hover:text-electric-teal rounded-lg text-sm font-medium">90 Days</button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-deep-space-light" />
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" 
                            strokeDasharray="251.2" strokeDashoffset="25.12" className="text-electric-teal" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-electric-teal">90%</span>
                  </div>
                </div>
                <p className="text-soft-silver font-medium">Automation Success</p>
              </div>
              
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-deep-space-light" />
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" 
                            strokeDasharray="251.2" strokeDashoffset="50.24" className="text-aurora-purple" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-aurora-purple">80%</span>
                  </div>
                </div>
                <p className="text-soft-silver font-medium">Data Processing</p>
              </div>
              
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-deep-space-light" />
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" 
                            strokeDasharray="251.2" strokeDashoffset="12.56" className="text-neon-coral" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-neon-coral">95%</span>
                  </div>
                </div>
                <p className="text-soft-silver font-medium">AI Accuracy</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

