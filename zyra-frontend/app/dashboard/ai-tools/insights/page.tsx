'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  LineChart,
  Activity,
  Target,
  Users,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'

interface Insight {
  id: string
  title: string
  description: string
  value: string
  change: number
  trend: 'up' | 'down' | 'stable'
  category: 'performance' | 'engagement' | 'revenue' | 'users'
  timestamp: string
  priority: 'high' | 'medium' | 'low'
}

interface ChartData {
  name: string
  value: number
  color: string
}

const mockInsights: Insight[] = [
  {
    id: '1',
    title: 'User Engagement Increased',
    description: 'Daily active users increased by 25% compared to last month',
    value: '2,847',
    change: 25.3,
    trend: 'up',
    category: 'engagement',
    timestamp: '2 hours ago',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Revenue Growth',
    description: 'Monthly recurring revenue shows consistent growth',
    value: '$45,230',
    change: 12.7,
    trend: 'up',
    category: 'revenue',
    timestamp: '4 hours ago',
    priority: 'high'
  },
  {
    id: '3',
    title: 'Conversion Rate Drop',
    description: 'Website conversion rate decreased by 3.2% this week',
    value: '2.4%',
    change: -3.2,
    trend: 'down',
    category: 'performance',
    timestamp: '6 hours ago',
    priority: 'medium'
  },
  {
    id: '4',
    title: 'New User Registrations',
    description: 'Steady flow of new user registrations maintained',
    value: '156',
    change: 0.8,
    trend: 'stable',
    category: 'users',
    timestamp: '8 hours ago',
    priority: 'low'
  }
]

const chartData: ChartData[] = [
  { name: 'Mobile', value: 45, color: '#8B5CF6' },
  { name: 'Desktop', value: 35, color: '#06B6D4' },
  { name: 'Tablet', value: 20, color: '#10B981' }
]

const categoryIcons = {
  performance: Activity,
  engagement: Users,
  revenue: DollarSign,
  users: Target
}

const categoryColors = {
  performance: 'text-blue-400',
  engagement: 'text-green-400',
  revenue: 'text-purple-400',
  users: 'text-orange-400'
}

const priorityColors = {
  high: 'text-red-400',
  medium: 'text-yellow-400',
  low: 'text-green-400'
}

export default function InsightsPage() {
  const [insights] = useState<Insight[]>(mockInsights)
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  const handleExportData = () => {
    console.log('Exporting insights data...')
  }

  const filteredInsights = insights.filter(insight => 
    selectedCategory === 'all' || insight.category === selectedCategory
  )

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-400" />
      case 'down': return <ArrowDown className="w-4 h-4 text-red-400" />
      default: return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400'
      case 'down': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-cyber font-bold gradient-text mb-2">
            AI Insights
          </h1>
          <p className="text-zyra-text-secondary">
            Data-driven insights powered by artificial intelligence
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </motion.button>
          
          <motion.button
            onClick={handleExportData}
            className="flex items-center space-x-2 px-4 py-2 bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 text-white rounded-xl transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-5 h-5" />
            <span>Export</span>
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-zyra-text-secondary" />
          <span className="text-sm text-zyra-text-secondary">Filter by:</span>
        </div>
        
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white"
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white"
        >
          <option value="all">All Categories</option>
          <option value="performance">Performance</option>
          <option value="engagement">Engagement</option>
          <option value="revenue">Revenue</option>
          <option value="users">Users</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zyra-text-secondary text-sm">Total Insights</p>
              <p className="text-2xl font-bold text-white">{insights.length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-zyra-electric-violet" />
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
              <p className="text-zyra-text-secondary text-sm">High Priority</p>
              <p className="text-2xl font-bold text-red-400">
                {insights.filter(i => i.priority === 'high').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
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
              <p className="text-zyra-text-secondary text-sm">Positive Trends</p>
              <p className="text-2xl font-bold text-green-400">
                {insights.filter(i => i.trend === 'up').length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
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
              <p className="text-zyra-text-secondary text-sm">Avg. Change</p>
              <p className="text-2xl font-bold text-white">
                {insights.reduce((sum, i) => sum + i.change, 0) / insights.length}%
              </p>
            </div>
            <Activity className="w-8 h-8 text-zyra-cyan-blue" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Insights List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold text-white">Recent Insights</h3>
          <div className="space-y-3">
            {filteredInsights.map((insight, index) => {
              const CategoryIcon = categoryIcons[insight.category]
              const categoryColor = categoryColors[insight.category]
              const priorityColor = priorityColors[insight.priority]
              
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl bg-white/5`}>
                        <CategoryIcon className={`w-6 h-6 ${categoryColor}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-white">{insight.title}</h4>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor} bg-white/5`}>
                            {insight.priority}
                          </div>
                        </div>
                        
                        <p className="text-zyra-text-secondary text-sm mb-3">
                          {insight.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-2xl font-bold text-white">{insight.value}</span>
                            <div className={`flex items-center space-x-1 ${getTrendColor(insight.trend)}`}>
                              {getTrendIcon(insight.trend)}
                              <span className="text-sm font-medium">
                                {insight.change > 0 ? '+' : ''}{insight.change}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-zyra-text-secondary">{insight.timestamp}</span>
                            <motion.button
                              className="p-1 rounded text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="space-y-6">
          {/* Device Distribution */}
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Device Distribution</h3>
            <div className="space-y-3">
              {chartData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-white font-medium">{item.name}</span>
                  </div>
                  <span className="text-zyra-text-secondary">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-zyra-text-secondary">Page Load Time</span>
                <span className="text-white font-medium">1.2s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zyra-text-secondary">Bounce Rate</span>
                <span className="text-white font-medium">32%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zyra-text-secondary">Conversion Rate</span>
                <span className="text-white font-medium">2.4%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zyra-text-secondary">Session Duration</span>
                <span className="text-white font-medium">4m 32s</span>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">AI Recommendations</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-white">Optimize mobile experience</span>
                </div>
                <p className="text-xs text-zyra-text-secondary">
                  Mobile traffic increased by 25%. Consider mobile-first design improvements.
                </p>
              </div>
              
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-white">Review conversion funnel</span>
                </div>
                <p className="text-xs text-zyra-text-secondary">
                  Conversion rate dropped 3.2%. Analyze checkout process for friction points.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
