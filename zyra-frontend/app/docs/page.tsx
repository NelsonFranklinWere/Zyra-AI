'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  Code, 
  Zap, 
  Database, 
  Shield, 
  Settings,
  Play,
  Copy,
  ExternalLink,
  ChevronRight,
  Search,
  Filter,
  Download,
  Book,
  FileText,
  Video,
  Users,
  Star
} from 'lucide-react'

interface DocSection {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  articles: {
    title: string
    description: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    readTime: string
    tags: string[]
  }[]
}

const docSections: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of Zyra and set up your first automation',
    icon: Play,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    articles: [
      {
        title: 'Quick Start Guide',
        description: 'Get up and running with Zyra in 5 minutes',
        difficulty: 'beginner',
        readTime: '5 min',
        tags: ['setup', 'basics']
      },
      {
        title: 'Creating Your First Automation',
        description: 'Build your first workflow step by step',
        difficulty: 'beginner',
        readTime: '10 min',
        tags: ['automation', 'tutorial']
      },
      {
        title: 'Understanding the Dashboard',
        description: 'Navigate and use the Zyra interface effectively',
        difficulty: 'beginner',
        readTime: '8 min',
        tags: ['interface', 'navigation']
      }
    ]
  },
  {
    id: 'automations',
    title: 'Automations',
    description: 'Build and manage intelligent workflows',
    icon: Zap,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    articles: [
      {
        title: 'Automation Builder Guide',
        description: 'Create complex workflows with our visual builder',
        difficulty: 'intermediate',
        readTime: '15 min',
        tags: ['workflows', 'builder']
      },
      {
        title: 'Trigger Configuration',
        description: 'Set up triggers for your automations',
        difficulty: 'intermediate',
        readTime: '12 min',
        tags: ['triggers', 'events']
      },
      {
        title: 'Action Templates',
        description: 'Use pre-built actions for common tasks',
        difficulty: 'beginner',
        readTime: '10 min',
        tags: ['actions', 'templates']
      }
    ]
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect with your favorite tools and services',
    icon: Database,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    articles: [
      {
        title: 'WhatsApp Business Integration',
        description: 'Set up WhatsApp automation for your business',
        difficulty: 'intermediate',
        readTime: '20 min',
        tags: ['whatsapp', 'messaging']
      },
      {
        title: 'Email Service Setup',
        description: 'Configure email automation with popular providers',
        difficulty: 'intermediate',
        readTime: '15 min',
        tags: ['email', 'smtp']
      },
      {
        title: 'API Integrations',
        description: 'Connect to external APIs and webhooks',
        difficulty: 'advanced',
        readTime: '25 min',
        tags: ['api', 'webhooks']
      }
    ]
  },
  {
    id: 'ai-features',
    title: 'AI Features',
    description: 'Leverage artificial intelligence in your workflows',
    icon: Shield,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    articles: [
      {
        title: 'AI Assistant Guide',
        description: 'Use the AI assistant for content generation and analysis',
        difficulty: 'beginner',
        readTime: '12 min',
        tags: ['ai', 'assistant']
      },
      {
        title: 'Content Generation',
        description: 'Create social media posts, emails, and documents with AI',
        difficulty: 'intermediate',
        readTime: '18 min',
        tags: ['content', 'generation']
      },
      {
        title: 'Data Analysis & Insights',
        description: 'Extract insights from your data using AI',
        difficulty: 'advanced',
        readTime: '22 min',
        tags: ['analytics', 'insights']
      }
    ]
  }
]

const quickLinks = [
  { title: 'API Reference', href: '/docs/api', icon: Code },
  { title: 'SDK Downloads', href: '/docs/sdk', icon: Download },
  { title: 'Video Tutorials', href: '/docs/videos', icon: Video },
  { title: 'Community Forum', href: '/docs/community', icon: Users },
  { title: 'Release Notes', href: '/docs/releases', icon: FileText }
]

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedSection, setSelectedSection] = useState<string>('all')

  const filteredSections = docSections.filter(section => 
    selectedSection === 'all' || section.id === selectedSection
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-500/10'
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/10'
      case 'advanced': return 'text-red-400 bg-red-500/10'
      default: return 'text-gray-400 bg-gray-500/10'
    }
  }

  return (
    <div className="min-h-screen bg-zyra-gradient cyber-grid">
      <div className="container mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-zyra-cyan-blue mb-4">
              Documentation
            </h1>
            <p className="text-zyra-text-secondary text-lg mb-8">
              Everything you need to know about Zyra's AI automation platform
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white placeholder-zyra-text-secondary"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
            {quickLinks.map((link, index) => {
              const Icon = link.icon
              return (
                <motion.a
                  key={link.title}
                  href={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-4 glass-card rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <Icon className="w-5 h-5 text-zyra-cyan-blue group-hover:text-zyra-cyan-blue/80" />
                  <span className="text-white group-hover:text-zyra-cyan-blue transition-colors">
                    {link.title}
                  </span>
                  <ExternalLink className="w-4 h-4 text-zyra-text-secondary group-hover:text-zyra-cyan-blue transition-colors" />
                </motion.a>
              )
            })}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-zyra-text-secondary" />
              <span className="text-sm text-zyra-text-secondary">Filter by:</span>
            </div>
            
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white"
            >
              <option value="all">All Sections</option>
              {docSections.map(section => (
                <option key={section.id} value={section.id}>{section.title}</option>
              ))}
            </select>
            
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Documentation Sections */}
          <div className="space-y-8">
            {filteredSections.map((section, sectionIndex) => {
              const Icon = section.icon
              
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.1 }}
                >
                  <Card className="glass-card">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${section.bgColor}`}>
                          <Icon className={`w-6 h-6 ${section.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-2xl text-white">{section.title}</CardTitle>
                          <p className="text-zyra-text-secondary">{section.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {section.articles.map((article, articleIndex) => (
                          <motion.div
                            key={articleIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: (sectionIndex * 0.1) + (articleIndex * 0.05) }}
                            className="p-4 border border-white/10 rounded-xl hover:border-zyra-cyan-blue/50 hover:bg-white/5 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-semibold text-white group-hover:text-zyra-cyan-blue transition-colors">
                                {article.title}
                              </h4>
                              <ChevronRight className="w-4 h-4 text-zyra-text-secondary group-hover:text-zyra-cyan-blue transition-colors" />
                            </div>
                            
                            <p className="text-sm text-zyra-text-secondary mb-3">
                              {article.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getDifficultyColor(article.difficulty)}`}
                                >
                                  {article.difficulty}
                                </Badge>
                                <span className="text-xs text-zyra-text-secondary">
                                  {article.readTime}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 text-yellow-400" />
                                <span className="text-xs text-zyra-text-secondary">4.8</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mt-3">
                              {article.tags.map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="px-2 py-1 text-xs bg-white/5 rounded text-zyra-text-secondary"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Additional Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Additional Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-zyra-cyan-blue/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Book className="w-6 h-6 text-zyra-cyan-blue" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">Guides</h4>
                    <p className="text-sm text-zyra-text-secondary">
                      Step-by-step tutorials for common tasks
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-zyra-electric-violet/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Code className="w-6 h-6 text-zyra-electric-violet" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">API Reference</h4>
                    <p className="text-sm text-zyra-text-secondary">
                      Complete API documentation and examples
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-green-400" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">Community</h4>
                    <p className="text-sm text-zyra-text-secondary">
                      Connect with other users and get help
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Video className="w-6 h-6 text-orange-400" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">Video Tutorials</h4>
                    <p className="text-sm text-zyra-text-secondary">
                      Watch and learn with video guides
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
