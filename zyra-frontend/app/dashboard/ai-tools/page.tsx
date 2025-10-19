'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Users,
  Sparkles,
  Download,
  Share,
  Edit,
  Brain,
  Zap,
  Target
} from 'lucide-react'

const aiTools = [
  {
    id: 'cv-builder',
    title: 'CV Builder',
    description: 'Generate professional CVs with AI-powered templates',
    icon: FileText,
    color: 'zyra-electric-violet',
    features: ['Modern templates', 'ATS optimization', 'Skills matching'],
    status: 'active'
  },
  {
    id: 'social-generator',
    title: 'Social Media Generator',
    description: 'Create engaging posts for LinkedIn, Twitter, Instagram',
    icon: MessageSquare,
    color: 'zyra-cyan-blue',
    features: ['Platform optimization', 'Trend analysis', 'Engagement boost'],
    status: 'active'
  },
  {
    id: 'data-insights',
    title: 'Data Insights',
    description: 'Analyze your data and get actionable insights',
    icon: BarChart3,
    color: 'zyra-teal',
    features: ['Pattern recognition', 'Predictive analytics', 'Visual reports'],
    status: 'active'
  },
  {
    id: 'audience-targeting',
    title: 'Audience Targeting',
    description: 'Find and target the right audience segments',
    icon: Users,
    color: 'zyra-violet',
    features: ['Demographic analysis', 'Behavior patterns', 'Custom segments'],
    status: 'beta'
  }
]

const recentGenerations = [
  {
    id: 1,
    type: 'cv',
    title: 'Software Engineer CV',
    description: 'Generated for John Doe',
    timestamp: '2 hours ago',
    status: 'completed'
  },
  {
    id: 2,
    type: 'social',
    title: 'LinkedIn Post - Tech Trends',
    description: 'Engagement: 89% higher than average',
    timestamp: '4 hours ago',
    status: 'completed'
  },
  {
    id: 3,
    type: 'insights',
    title: 'Q4 Sales Analysis',
    description: 'Revenue insights and recommendations',
    timestamp: '1 day ago',
    status: 'completed'
  },
  {
    id: 4,
    type: 'audience',
    title: 'Gen Z Marketing Segment',
    description: 'Target audience analysis',
    timestamp: '2 days ago',
    status: 'completed'
  }
]

export default function AIToolsPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-xl bg-zyra-electric-violet/20 border border-zyra-electric-violet/30">
            <Brain className="w-6 h-6 text-zyra-electric-violet" />
          </div>
          <div>
            <h1 className="text-4xl font-cyber font-bold gradient-text">
              AI Tools
            </h1>
            <p className="text-zyra-text-secondary text-lg">
              Powerful AI-driven tools for content creation and analysis
            </p>
          </div>
        </div>
      </motion.div>

      {/* AI Tools Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {aiTools.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
            className={`glass-card p-6 rounded-2xl border border-zyra-glass-border cursor-pointer transition-all duration-300 ${
              selectedTool === tool.id 
                ? `border-${tool.color}/50 bg-${tool.color}/10` 
                : 'hover:bg-white/5'
            }`}
            onClick={() => setSelectedTool(selectedTool === tool.id ? null : tool.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${tool.color}/20 border border-${tool.color}/30`}>
                <tool.icon className={`w-6 h-6 text-${tool.color}`} />
              </div>
              <div className="flex items-center space-x-2">
                {tool.status === 'beta' && (
                  <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                    Beta
                  </span>
                )}
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">{tool.title}</h3>
            <p className="text-zyra-text-secondary mb-4">{tool.description}</p>
            
            <div className="space-y-2">
              {tool.features.map((feature, featureIndex) => (
                <div key={featureIndex} className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-zyra-cyan-blue" />
                  <span className="text-sm text-zyra-text-secondary">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center space-x-3">
              <motion.button
                className="flex-1 bg-zyra-electric-violet text-white py-2 px-4 rounded-lg font-semibold hover:bg-zyra-electric-violet/90 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Use Tool
              </motion.button>
              <motion.button
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-zyra-text-secondary hover:text-white hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Edit className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Generations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card p-6 rounded-2xl border border-zyra-glass-border"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-cyber font-bold text-white">Recent Generations</h2>
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-zyra-cyan-blue" />
            <span className="text-sm text-zyra-text-secondary">AI Powered</span>
          </div>
        </div>

        <div className="space-y-4">
          {recentGenerations.map((generation, index) => (
            <motion.div
              key={generation.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  generation.type === 'cv' ? 'bg-zyra-electric-violet/20' :
                  generation.type === 'social' ? 'bg-zyra-cyan-blue/20' :
                  generation.type === 'insights' ? 'bg-zyra-teal/20' :
                  'bg-zyra-violet/20'
                }`}>
                  {generation.type === 'cv' && <FileText className="w-5 h-5 text-zyra-electric-violet" />}
                  {generation.type === 'social' && <MessageSquare className="w-5 h-5 text-zyra-cyan-blue" />}
                  {generation.type === 'insights' && <BarChart3 className="w-5 h-5 text-zyra-teal" />}
                  {generation.type === 'audience' && <Users className="w-5 h-5 text-zyra-violet" />}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{generation.title}</h3>
                  <p className="text-sm text-zyra-text-secondary">{generation.description}</p>
                  <p className="text-xs text-zyra-text-secondary mt-1">{generation.timestamp}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  generation.status === 'completed' ? 'bg-green-400' : 'bg-yellow-400'
                }`} />
                <span className="text-sm text-zyra-text-secondary capitalize">{generation.status}</span>
                <div className="flex items-center space-x-1">
                  <motion.button
                    className="p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    className="p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Share className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Performance Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="glass-card p-6 rounded-2xl border border-zyra-glass-border">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="w-6 h-6 text-zyra-cyan-blue" />
            <h3 className="text-lg font-semibold text-white">Accuracy Rate</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-2">94.2%</div>
          <p className="text-sm text-zyra-text-secondary">AI-generated content quality</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-zyra-glass-border">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="w-6 h-6 text-zyra-electric-violet" />
            <h3 className="text-lg font-semibold text-white">Processing Speed</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-2">0.3s</div>
          <p className="text-sm text-zyra-text-secondary">Average response time</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-zyra-glass-border">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="w-6 h-6 text-zyra-teal" />
            <h3 className="text-lg font-semibold text-white">AI Models</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-2">12</div>
          <p className="text-sm text-zyra-text-secondary">Active AI models</p>
        </div>
      </motion.div>
    </div>
  )
}
