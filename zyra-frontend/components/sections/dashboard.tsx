"use client"

import { motion } from "framer-motion"
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Zap,
  Brain,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"

const stats = [
  { label: "Campaigns Active", value: "24", change: "+12%", trend: "up" },
  { label: "Messages Sent", value: "2.4M", change: "+8%", trend: "up" },
  { label: "AI Personas", value: "156", change: "+23%", trend: "up" },
  { label: "Conversion Rate", value: "89.2%", change: "+2%", trend: "up" }
]

const recentActivities = [
  { action: "Persona analysis completed for Gen Z audience", time: "2 min ago", status: "success" },
  { action: "WhatsApp campaign triggered for Nairobi users", time: "5 min ago", status: "success" },
  { action: "AI generated 12 Instagram captions", time: "8 min ago", status: "success" },
  { action: "TikTok content scheduled for Friday 6PM", time: "12 min ago", status: "success" }
]

export const Dashboard = () => {
  return (
    <section className="py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center space-x-2 bg-electric-teal/10 border border-electric-teal/20 rounded-full px-4 py-2 mb-8">
            <BarChart3 className="w-4 h-4 text-electric-teal" />
            <span className="text-sm text-electric-teal font-medium">Marketing Intelligence Dashboard</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-8">
            <span className="bg-electric-gradient bg-clip-text text-transparent glow-text">
              Zyra Intelligence Center
            </span>
          </h2>
          
          <p className="text-xl text-soft-silver max-w-3xl mx-auto">
            Monitor your AI-powered marketing campaigns, track Gen Z engagement, and optimize conversion rates in real-time
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <div key={stat.label} className="glass-effect rounded-2xl p-6 border border-soft-silver/10 hover:border-electric-teal/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-electric-gradient rounded-xl flex items-center justify-center neon-glow">
                  <TrendingUp className="w-6 h-6 text-deep-space" />
                </div>
                <div className="flex items-center text-electric-teal">
                  <span className="text-sm font-medium">{stat.change}</span>
                  <TrendingUp className="w-4 h-4 ml-1" />
                </div>
              </div>
              
              <h3 className="text-3xl font-bold text-electric-teal mb-2">{stat.value}</h3>
              <p className="text-soft-silver-dark">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="glass-effect rounded-2xl p-8 border border-soft-silver/10"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-aurora-gradient rounded-xl flex items-center justify-center aurora-glow">
                <Activity className="w-5 h-5 text-deep-space" />
              </div>
              <h3 className="text-2xl font-semibold text-aurora-purple">AI Marketing Activity</h3>
            </div>
            
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 rounded-xl bg-deep-space-light/50">
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
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="glass-effect rounded-2xl p-8 border border-soft-silver/10"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-neon-coral to-pink-500 rounded-xl flex items-center justify-center coral-glow">
                <Zap className="w-5 h-5 text-deep-space" />
              </div>
              <h3 className="text-2xl font-semibold text-neon-coral">Marketing Actions</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="glass-effect border border-electric-teal/20 hover:border-electric-teal/40 p-4 rounded-xl text-center transition-all duration-300 group">
                <Brain className="w-8 h-8 text-electric-teal mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-sm font-medium text-electric-teal">Generate Personas</p>
              </button>
              
              <button className="glass-effect border border-aurora-purple/20 hover:border-aurora-purple/40 p-4 rounded-xl text-center transition-all duration-300 group">
                <Clock className="w-8 h-8 text-aurora-purple mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-sm font-medium text-aurora-purple">Create Campaign</p>
              </button>
              
              <button className="glass-effect border border-neon-coral/20 hover:border-neon-coral/40 p-4 rounded-xl text-center transition-all duration-300 group">
                <BarChart3 className="w-8 h-8 text-neon-coral mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-sm font-medium text-neon-coral">View Reports</p>
              </button>
              
              <button className="glass-effect border border-electric-teal/20 hover:border-electric-teal/40 p-4 rounded-xl text-center transition-all duration-300 group">
                <Zap className="w-8 h-8 text-electric-teal mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-sm font-medium text-electric-teal">Target Audience</p>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
