"use client"

import { Footer } from "@/components/shared/footer"
import { motion } from "framer-motion"
import { 
  Plus, 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Save, 
  Download,
  Upload,
  Zap,
  Brain,
  Database,
  Mail,
  Clock,
  Webhook,
  Filter,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  MoreHorizontal
} from "lucide-react"

const workflowTemplates = [
  {
    id: 1,
    name: "Email Automation",
    description: "Automatically process and respond to emails",
    icon: Mail,
    color: "electric-teal",
    nodes: 4,
    status: "active"
  },
  {
    id: 2,
    name: "Data Analysis Pipeline",
    description: "Process and analyze data with AI insights",
    icon: Brain,
    color: "aurora-purple",
    nodes: 6,
    status: "draft"
  },
  {
    id: 3,
    name: "Database Sync",
    description: "Sync data between multiple databases",
    icon: Database,
    color: "neon-coral",
    nodes: 3,
    status: "paused"
  },
  {
    id: 4,
    name: "Scheduled Reports",
    description: "Generate and send automated reports",
    icon: Clock,
    color: "electric-teal",
    nodes: 5,
    status: "active"
  }
]

const nodeTypes = [
  { type: "trigger", label: "Trigger", icon: Zap, color: "electric-teal" },
  { type: "data", label: "Data Source", icon: Database, color: "aurora-purple" },
  { type: "ai", label: "AI Processing", icon: Brain, color: "neon-coral" },
  { type: "action", label: "Action", icon: ArrowRight, color: "electric-teal" },
  { type: "condition", label: "Condition", icon: Filter, color: "aurora-purple" },
  { type: "webhook", label: "Webhook", icon: Webhook, color: "neon-coral" }
]

export default function AutomationPage() {
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
                  <span className="bg-aurora-gradient bg-clip-text text-transparent glow-text">
                    Automation Hub
                  </span>
                </h1>
                <p className="text-xl text-soft-silver">
                  Create, manage, and monitor intelligent workflows
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="glass-effect border border-aurora-purple/30 text-aurora-purple hover:bg-aurora-purple/10 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Import</span>
                </button>
                <button className="bg-aurora-gradient hover:scale-105 transition-all duration-300 aurora-glow text-lg px-6 py-3 rounded-xl font-semibold flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>New Workflow</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Workflow Templates */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-semibold text-soft-silver mb-6">Workflow Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {workflowTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="glass-effect rounded-2xl p-6 border border-soft-silver/10 hover:border-aurora-purple/30 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-${template.color}-gradient rounded-xl flex items-center justify-center neon-glow`}>
                      <template.icon className="w-6 h-6 text-deep-space" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        template.status === 'active' ? 'bg-electric-teal' :
                        template.status === 'paused' ? 'bg-neon-coral' :
                        'bg-soft-silver'
                      }`}></div>
                      <span className="text-xs text-soft-silver-dark capitalize">{template.status}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-soft-silver mb-2">{template.name}</h3>
                  <p className="text-soft-silver-dark text-sm mb-4">{template.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-soft-silver-dark">{template.nodes} nodes</span>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-aurora-purple/10 rounded transition-colors duration-300">
                        <Play className="w-4 h-4 text-aurora-purple" />
                      </button>
                      <button className="p-1 hover:bg-soft-silver/10 rounded transition-colors duration-300">
                        <Settings className="w-4 h-4 text-soft-silver" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual Workflow Builder */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-soft-silver">Workflow Builder</h2>
              <div className="flex items-center space-x-4">
                <button className="glass-effect border border-electric-teal/30 text-electric-teal hover:bg-electric-teal/10 px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button className="bg-electric-gradient hover:scale-105 transition-all duration-300 neon-glow px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
                  <Play className="w-4 h-4" />
                  <span>Run</span>
                </button>
              </div>
            </div>

            <div className="glass-effect rounded-2xl p-6 border border-soft-silver/10">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Node Palette */}
                <div className="lg:col-span-1">
                  <h3 className="text-lg font-semibold text-soft-silver mb-4">Node Types</h3>
                  <div className="space-y-3">
                    {nodeTypes.map((node, index) => (
                      <motion.div
                        key={node.type}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`glass-effect border border-${node.color}/20 hover:border-${node.color}/40 p-3 rounded-xl cursor-pointer transition-all duration-300 group`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 bg-${node.color}-gradient rounded-lg flex items-center justify-center`}>
                            <node.icon className="w-4 h-4 text-deep-space" />
                          </div>
                          <span className="text-sm font-medium text-soft-silver">{node.label}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Canvas Area */}
                <div className="lg:col-span-3">
                  <div className="relative h-96 bg-deep-space-light/30 rounded-xl border border-soft-silver/10 overflow-hidden">
                    {/* Sample Workflow Nodes */}
                    <div className="absolute inset-0 p-6">
                      {/* Trigger Node */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="absolute top-6 left-6 w-32 h-20 bg-electric-gradient rounded-xl flex items-center justify-center neon-glow cursor-pointer"
                      >
                        <div className="text-center">
                          <Zap className="w-6 h-6 text-deep-space mx-auto mb-1" />
                          <span className="text-xs font-medium text-deep-space">Webhook</span>
                        </div>
                      </motion.div>

                      {/* Connection Line */}
                      <svg className="absolute top-16 left-44 w-32 h-1">
                        <line x1="0" y1="0" x2="128" y2="0" stroke="url(#gradient)" strokeWidth="2" />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00FFC6" />
                            <stop offset="100%" stopColor="#7A5EFF" />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* Data Processing Node */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        className="absolute top-6 left-48 w-32 h-20 bg-aurora-gradient rounded-xl flex items-center justify-center aurora-glow cursor-pointer"
                      >
                        <div className="text-center">
                          <Database className="w-6 h-6 text-deep-space mx-auto mb-1" />
                          <span className="text-xs font-medium text-deep-space">Data Source</span>
                        </div>
                      </motion.div>

                      {/* AI Processing Node */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="absolute top-6 right-48 w-32 h-20 bg-gradient-to-r from-neon-coral to-pink-500 rounded-xl flex items-center justify-center coral-glow cursor-pointer"
                      >
                        <div className="text-center">
                          <Brain className="w-6 h-6 text-deep-space mx-auto mb-1" />
                          <span className="text-xs font-medium text-deep-space">AI Analysis</span>
                        </div>
                      </motion.div>

                      {/* Action Node */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.9 }}
                        className="absolute top-6 right-6 w-32 h-20 bg-electric-gradient rounded-xl flex items-center justify-center neon-glow cursor-pointer"
                      >
                        <div className="text-center">
                          <Mail className="w-6 h-6 text-deep-space mx-auto mb-1" />
                          <span className="text-xs font-medium text-deep-space">Send Email</span>
                        </div>
                      </motion.div>

                      {/* Connection Lines */}
                      <svg className="absolute top-16 left-48 w-32 h-1">
                        <line x1="0" y1="0" x2="128" y2="0" stroke="url(#gradient2)" strokeWidth="2" />
                        <defs>
                          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#7A5EFF" />
                            <stop offset="100%" stopColor="#FF4D6D" />
                          </linearGradient>
                        </defs>
                      </svg>

                      <svg className="absolute top-16 right-48 w-32 h-1">
                        <line x1="0" y1="0" x2="128" y2="0" stroke="url(#gradient3)" strokeWidth="2" />
                        <defs>
                          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FF4D6D" />
                            <stop offset="100%" stopColor="#00FFC6" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    {/* Canvas Controls */}
                    <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                      <button className="glass-effect border border-soft-silver/20 text-soft-silver hover:text-electric-teal p-2 rounded-lg transition-colors duration-300">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button className="glass-effect border border-soft-silver/20 text-soft-silver hover:text-electric-teal p-2 rounded-lg transition-colors duration-300">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Active Workflows */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-soft-silver">Active Workflows</h2>
              <button className="text-soft-silver hover:text-electric-teal transition-colors duration-300">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div className="glass-effect rounded-2xl p-6 border border-soft-silver/10">
              <div className="space-y-4">
                {workflowTemplates.filter(t => t.status === 'active').map((workflow, index) => (
                  <motion.div
                    key={workflow.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-deep-space-light/50 hover:bg-deep-space-light/70 transition-colors duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 bg-${workflow.color}-gradient rounded-lg flex items-center justify-center`}>
                        <workflow.icon className="w-5 h-5 text-deep-space" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-soft-silver">{workflow.name}</h3>
                        <p className="text-soft-silver-dark text-sm">{workflow.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-electric-teal rounded-full animate-pulse"></div>
                        <span className="text-sm text-electric-teal font-medium">Running</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-electric-teal/10 rounded-lg transition-colors duration-300">
                          <Pause className="w-4 h-4 text-electric-teal" />
                        </button>
                        <button className="p-2 hover:bg-neon-coral/10 rounded-lg transition-colors duration-300">
                          <Square className="w-4 h-4 text-neon-coral" />
                        </button>
                        <button className="p-2 hover:bg-soft-silver/10 rounded-lg transition-colors duration-300">
                          <Settings className="w-4 h-4 text-soft-silver" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

