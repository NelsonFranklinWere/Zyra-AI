'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Zap, 
  Brain, 
  BarChart3,
  PieChart,
  Activity,
  Target,
  DollarSign,
  Clock,
  Star,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Heart,
  Share2,
  X
} from 'lucide-react';

interface InsightData {
  id: string;
  type: string;
  title: string;
  description: string;
  confidence_score: number;
  generated_at: string;
  tags: string[];
  is_favorite: boolean;
  insight_data: any;
}

interface AnalyticsData {
  totalInsights: number;
  activeAutomations: number;
  messagesProcessed: number;
  conversionRate: number;
  topPerformingChannel: string;
  avgResponseTime: number;
}

const InsightsDashboard: React.FC = () => {
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<InsightData | null>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAnalytics({
        totalInsights: 156,
        activeAutomations: 12,
        messagesProcessed: 2847,
        conversionRate: 23.4,
        topPerformingChannel: 'WhatsApp',
        avgResponseTime: 1.2
      });

      setInsights([
        {
          id: '1',
          type: 'persona',
          title: 'Gen Z Fashion Enthusiasts',
          description: 'High-engagement persona identified through social media analysis',
          confidence_score: 0.92,
          generated_at: '2024-01-15T10:30:00Z',
          tags: ['persona', 'genz', 'fashion', 'social'],
          is_favorite: true,
          insight_data: {
            demographics: { age: '18-24', gender: 'Mixed', location: 'Urban' },
            behavior: { engagement_rate: 0.89, purchase_intent: 0.76 },
            preferences: ['Instagram', 'TikTok', 'WhatsApp']
          }
        },
        {
          id: '2',
          type: 'campaign_composition',
          title: 'Summer Sale Campaign',
          description: 'AI-generated campaign with 3 variants for maximum engagement',
          confidence_score: 0.87,
          generated_at: '2024-01-14T15:45:00Z',
          tags: ['campaign', 'summer', 'sale', 'content'],
          is_favorite: false,
          insight_data: {
            variants: 3,
            expected_reach: 15000,
            conversion_prediction: 0.15
          }
        },
        {
          id: '3',
          type: 'channel_matching',
          title: 'Optimal Channel Strategy',
          description: 'WhatsApp and Instagram identified as top-performing channels',
          confidence_score: 0.91,
          generated_at: '2024-01-13T09:20:00Z',
          tags: ['channels', 'strategy', 'whatsapp', 'instagram'],
          is_favorite: true,
          insight_data: {
            top_channels: ['WhatsApp', 'Instagram', 'TikTok'],
            performance_scores: { whatsapp: 0.94, instagram: 0.87, tiktok: 0.72 }
          }
        }
      ]);
      
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const filteredInsights = selectedFilter === 'all' 
    ? insights 
    : insights.filter(insight => insight.tags.includes(selectedFilter));

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'persona': return <Users className="w-5 h-5" />;
      case 'campaign_composition': return <Target className="w-5 h-5" />;
      case 'channel_matching': return <BarChart3 className="w-5 h-5" />;
      case 'mood_content': return <Heart className="w-5 h-5" />;
      case 'predictive_targeting': return <TrendingUp className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'persona': return 'from-zyra-electric-violet to-zyra-cyan-blue';
      case 'campaign_composition': return 'from-zyra-cyan-blue to-zyra-electric-violet';
      case 'channel_matching': return 'from-purple-500 to-pink-500';
      case 'mood_content': return 'from-pink-500 to-rose-500';
      case 'predictive_targeting': return 'from-green-500 to-emerald-500';
      default: return 'from-zyra-electric-violet to-zyra-cyan-blue';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zyra-gradient flex items-center justify-center">
        <div className="cyber-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zyra-gradient cyber-grid">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
          >
            <div>
              <h1 className="text-4xl lg:text-5xl font-cyber font-bold gradient-text mb-2">
                AI Insights Dashboard
              </h1>
              <p className="text-zyra-text-secondary text-lg">
                Discover patterns, optimize strategies, and scale your automation
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                className="cyber-button flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </motion.button>
              <motion.button
                className="neon-button flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Analytics Overview */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="glass-card p-6 card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-zyra-electric-violet to-zyra-cyan-blue">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">{analytics.totalInsights}</span>
              </div>
              <h3 className="text-zyra-text-secondary font-medium">Total Insights</h3>
              <p className="text-sm text-zyra-text-secondary mt-1">Generated this month</p>
            </div>

            <div className="glass-card p-6 card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">{analytics.activeAutomations}</span>
              </div>
              <h3 className="text-zyra-text-secondary font-medium">Active Automations</h3>
              <p className="text-sm text-zyra-text-secondary mt-1">Running workflows</p>
            </div>

            <div className="glass-card p-6 card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">{analytics.messagesProcessed.toLocaleString()}</span>
              </div>
              <h3 className="text-zyra-text-secondary font-medium">Messages Processed</h3>
              <p className="text-sm text-zyra-text-secondary mt-1">This month</p>
            </div>

            <div className="glass-card p-6 card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">{analytics.conversionRate}%</span>
              </div>
              <h3 className="text-zyra-text-secondary font-medium">Conversion Rate</h3>
              <p className="text-sm text-zyra-text-secondary mt-1">Average across channels</p>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-zyra-text-secondary" />
              <span className="text-zyra-text-secondary font-medium">Filter by:</span>
            </div>
            {['all', 'persona', 'campaign', 'channels', 'content', 'prediction'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  selectedFilter === filter
                    ? 'bg-zyra-electric-violet text-white shadow-neon'
                    : 'text-zyra-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Insights Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredInsights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="glass-card p-6 card-hover cursor-pointer"
              onClick={() => setSelectedInsight(insight)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${getInsightColor(insight.type)}`}>
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex items-center space-x-2">
                  {insight.is_favorite && (
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  )}
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4 text-zyra-text-secondary" />
                    <span className="text-sm text-zyra-text-secondary">
                      {Math.round(insight.confidence_score * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-white mb-2">
                {insight.title}
              </h3>
              <p className="text-zyra-text-secondary mb-4 line-clamp-2">
                {insight.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {insight.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-white/10 text-zyra-text-secondary rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-zyra-text-secondary">
                <span>{new Date(insight.generated_at).toLocaleDateString()}</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Active</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-cyber font-bold text-white">Performance Overview</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-zyra-cyan-blue rounded-full"></div>
                  <span className="text-zyra-text-secondary text-sm">WhatsApp</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-zyra-electric-violet rounded-full"></div>
                  <span className="text-zyra-text-secondary text-sm">Instagram</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-zyra-text-secondary text-sm">TikTok</span>
                </div>
              </div>
            </div>
            
            <div className="h-64 flex items-end justify-between space-x-4">
              {[65, 78, 82, 75, 88, 92, 85].map((height, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                  className="flex-1 bg-gradient-to-t from-zyra-electric-violet to-zyra-cyan-blue rounded-t-lg opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                />
              ))}
            </div>
            
            <div className="flex justify-between mt-4 text-sm text-zyra-text-secondary">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Insight Detail Modal */}
      {selectedInsight && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedInsight(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`p-4 rounded-xl bg-gradient-to-r ${getInsightColor(selectedInsight.type)}`}>
                  {getInsightIcon(selectedInsight.type)}
                </div>
                <div>
                  <h2 className="text-3xl font-cyber font-bold text-white">
                    {selectedInsight.title}
                  </h2>
                  <p className="text-zyra-text-secondary">
                    Generated {new Date(selectedInsight.generated_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInsight(null)}
                className="p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Description</h3>
                <p className="text-zyra-text-secondary">{selectedInsight.description}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Key Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass-card p-4">
                    <div className="text-2xl font-bold text-white mb-1">
                      {Math.round(selectedInsight.confidence_score * 100)}%
                    </div>
                    <div className="text-sm text-zyra-text-secondary">Confidence Score</div>
                  </div>
                  <div className="glass-card p-4">
                    <div className="text-2xl font-bold text-white mb-1">
                      {selectedInsight.tags.length}
                    </div>
                    <div className="text-sm text-zyra-text-secondary">Categories</div>
                  </div>
                  <div className="glass-card p-4">
                    <div className="text-2xl font-bold text-white mb-1">
                      {selectedInsight.is_favorite ? 'Yes' : 'No'}
                    </div>
                    <div className="text-sm text-zyra-text-secondary">Favorited</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Insight Data</h3>
                <div className="glass-card p-4">
                  <pre className="text-zyra-text-secondary text-sm overflow-x-auto">
                    {JSON.stringify(selectedInsight.insight_data, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-zyra-glass-border">
                <div className="flex flex-wrap gap-2">
                  {selectedInsight.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm bg-white/10 text-zyra-text-secondary rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-4">
                  <motion.button
                    className="cyber-button flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </motion.button>
                  <motion.button
                    className="neon-button flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Star className="w-4 h-4" />
                    <span>Favorite</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default InsightsDashboard;
