'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  Calendar, 
  User, 
  Clock, 
  Tag,
  Search,
  Filter,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ArrowRight,
  Zap,
  Brain,
  Database,
  Globe,
  Code,
  BarChart3
} from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: {
    name: string
    avatar: string
    role: string
  }
  publishedAt: string
  readTime: string
  category: string
  tags: string[]
  image: string
  views: number
  likes: number
  comments: number
  featured: boolean
}

const mockPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Future of AI Automation: Trends to Watch in 2025',
    excerpt: 'Explore the latest trends in AI automation and how they\'re reshaping business processes.',
    content: 'Full article content here...',
    author: {
      name: 'Sarah Chen',
      avatar: '/avatars/sarah.jpg',
      role: 'AI Research Lead'
    },
    publishedAt: '2025-01-15',
    readTime: '8 min',
    category: 'AI & Automation',
    tags: ['AI', 'Automation', 'Future Tech', 'Business'],
    image: '/blog/ai-automation.jpg',
    views: 2847,
    likes: 156,
    comments: 23,
    featured: true
  },
  {
    id: '2',
    title: 'Building Your First WhatsApp Bot with Zyra',
    excerpt: 'A step-by-step guide to creating intelligent WhatsApp bots for customer service.',
    content: 'Full article content here...',
    author: {
      name: 'Mike Rodriguez',
      avatar: '/avatars/mike.jpg',
      role: 'Developer Advocate'
    },
    publishedAt: '2025-01-12',
    readTime: '12 min',
    category: 'Tutorials',
    tags: ['WhatsApp', 'Bots', 'Tutorial', 'Customer Service'],
    image: '/blog/whatsapp-bot.jpg',
    views: 1923,
    likes: 89,
    comments: 15,
    featured: false
  },
  {
    id: '3',
    title: 'Data-Driven Insights: How AI Transforms Analytics',
    excerpt: 'Discover how artificial intelligence is revolutionizing data analysis and business intelligence.',
    content: 'Full article content here...',
    author: {
      name: 'Dr. Emily Watson',
      avatar: '/avatars/emily.jpg',
      role: 'Data Science Director'
    },
    publishedAt: '2025-01-10',
    readTime: '10 min',
    category: 'Data & Analytics',
    tags: ['Data Science', 'Analytics', 'AI', 'Business Intelligence'],
    image: '/blog/data-insights.jpg',
    views: 3456,
    likes: 203,
    comments: 31,
    featured: true
  },
  {
    id: '4',
    title: 'Email Automation Best Practices for 2025',
    excerpt: 'Learn the latest strategies for effective email automation that drives engagement.',
    content: 'Full article content here...',
    author: {
      name: 'Alex Thompson',
      avatar: '/avatars/alex.jpg',
      role: 'Marketing Automation Specialist'
    },
    publishedAt: '2025-01-08',
    readTime: '6 min',
    category: 'Marketing',
    tags: ['Email Marketing', 'Automation', 'Best Practices', 'Engagement'],
    image: '/blog/email-automation.jpg',
    views: 1678,
    likes: 94,
    comments: 12,
    featured: false
  },
  {
    id: '5',
    title: 'Integrating APIs: A Developer\'s Guide to Zyra',
    excerpt: 'Comprehensive guide to integrating with Zyra\'s API for custom automation solutions.',
    content: 'Full article content here...',
    author: {
      name: 'David Kim',
      avatar: '/avatars/david.jpg',
      role: 'Senior Developer'
    },
    publishedAt: '2025-01-05',
    readTime: '15 min',
    category: 'Development',
    tags: ['API', 'Integration', 'Development', 'Tutorial'],
    image: '/blog/api-integration.jpg',
    views: 2134,
    likes: 127,
    comments: 18,
    featured: false
  },
  {
    id: '6',
    title: 'The Psychology of Automation: Why Humans Trust AI',
    excerpt: 'Understanding the human factors that influence automation adoption and trust.',
    content: 'Full article content here...',
    author: {
      name: 'Dr. Lisa Park',
      avatar: '/avatars/lisa.jpg',
      role: 'UX Research Lead'
    },
    publishedAt: '2025-01-03',
    readTime: '9 min',
    category: 'Psychology & UX',
    tags: ['Psychology', 'UX', 'Trust', 'Human Factors'],
    image: '/blog/psychology-automation.jpg',
    views: 1892,
    likes: 78,
    comments: 9,
    featured: false
  }
]

const categories = [
  { id: 'all', name: 'All Posts', icon: BookOpen, count: 6 },
  { id: 'AI & Automation', name: 'AI & Automation', icon: Brain, count: 2 },
  { id: 'Tutorials', name: 'Tutorials', icon: Code, count: 2 },
  { id: 'Data & Analytics', name: 'Data & Analytics', icon: BarChart3, count: 1 },
  { id: 'Marketing', name: 'Marketing', icon: TrendingUp, count: 1 },
  { id: 'Development', name: 'Development', icon: Database, count: 1 },
  { id: 'Psychology & UX', name: 'Psychology & UX', icon: Globe, count: 1 }
]

const categoryIcons = {
  'AI & Automation': Brain,
  'Tutorials': Code,
  'Data & Analytics': BarChart3,
  'Marketing': TrendingUp,
  'Development': Database,
  'Psychology & UX': Globe
}

const categoryColors = {
  'AI & Automation': 'text-purple-400',
  'Tutorials': 'text-blue-400',
  'Data & Analytics': 'text-green-400',
  'Marketing': 'text-orange-400',
  'Development': 'text-cyan-400',
  'Psychology & UX': 'text-pink-400'
}

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const filteredPosts = mockPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      case 'oldest':
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
      case 'popular':
        return b.views - a.views
      case 'trending':
        return (b.likes + b.comments) - (a.likes + a.comments)
      default:
        return 0
    }
  })

  const featuredPosts = sortedPosts.filter(post => post.featured)
  const regularPosts = sortedPosts.filter(post => !post.featured)

  return (
    <div className="min-h-screen bg-zyra-gradient cyber-grid">
      <div className="container mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-zyra-cyan-blue mb-4">
              Blog & Resources
            </h1>
            <p className="text-zyra-text-secondary text-lg mb-8">
              Insights, tutorials, and best practices for AI automation
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white placeholder-zyra-text-secondary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Categories */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-white">Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {categories.map((category, index) => {
                      const Icon = category.icon
                      return (
                        <motion.button
                          key={category.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-zyra-cyan-blue/20 border border-zyra-cyan-blue/30'
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Icon className="w-4 h-4 text-zyra-cyan-blue" />
                              <span className="text-white">{category.name}</span>
                            </div>
                            <span className="text-xs text-zyra-text-secondary">
                              {category.count}
                            </span>
                          </div>
                        </motion.button>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Sort Options */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-white">Sort By</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="popular">Most Popular</option>
                      <option value="trending">Trending</option>
                    </select>
                  </CardContent>
                </Card>

                {/* Newsletter */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-white">Stay Updated</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-zyra-text-secondary mb-4">
                      Get the latest articles delivered to your inbox.
                    </p>
                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-zyra-text-secondary text-sm"
                      />
                      <Button className="w-full bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 text-white">
                        Subscribe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Featured Posts */}
              {featuredPosts.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-6">Featured Articles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featuredPosts.map((post, index) => {
                      const CategoryIcon = categoryIcons[post.category as keyof typeof categoryIcons]
                      const categoryColor = categoryColors[post.category as keyof typeof categoryColors]
                      
                      return (
                        <motion.article
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group"
                        >
                          <Card className="glass-card h-full hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="relative overflow-hidden rounded-t-xl">
                              <div className="aspect-video bg-gradient-to-br from-zyra-cyan-blue/20 to-zyra-electric-violet/20 flex items-center justify-center">
                                <CategoryIcon className="w-16 h-16 text-zyra-cyan-blue/50" />
                              </div>
                              <div className="absolute top-4 left-4">
                                <Badge className="bg-zyra-electric-violet text-white">
                                  Featured
                                </Badge>
                              </div>
                            </div>
                            
                            <CardContent className="p-6">
                              <div className="flex items-center space-x-2 mb-3">
                                <CategoryIcon className={`w-4 h-4 ${categoryColor}`} />
                                <span className="text-sm text-zyra-text-secondary">{post.category}</span>
                                <span className="text-sm text-zyra-text-secondary">•</span>
                                <span className="text-sm text-zyra-text-secondary">{post.readTime}</span>
                              </div>
                              
                              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-zyra-cyan-blue transition-colors">
                                {post.title}
                              </h3>
                              
                              <p className="text-zyra-text-secondary mb-4 line-clamp-3">
                                {post.excerpt}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-zyra-cyan-blue/20 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-zyra-cyan-blue" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-white">{post.author.name}</div>
                                    <div className="text-xs text-zyra-text-secondary">{post.author.role}</div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-4 text-sm text-zyra-text-secondary">
                                  <div className="flex items-center space-x-1">
                                    <Eye className="w-4 h-4" />
                                    <span>{post.views}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Heart className="w-4 h-4" />
                                    <span>{post.likes}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.article>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Regular Posts */}
              <div>
                <h2 className="text-2xl font-semibold text-white mb-6">Latest Articles</h2>
                <div className="space-y-6">
                  {regularPosts.map((post, index) => {
                    const CategoryIcon = categoryIcons[post.category as keyof typeof categoryIcons]
                    const categoryColor = categoryColors[post.category as keyof typeof categoryColors]
                    
                    return (
                      <motion.article
                        key={post.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group"
                      >
                        <Card className="glass-card hover:bg-white/5 transition-colors cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <div className="w-20 h-20 bg-gradient-to-br from-zyra-cyan-blue/20 to-zyra-electric-violet/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <CategoryIcon className={`w-8 h-8 ${categoryColor}`} />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                  <CategoryIcon className={`w-4 h-4 ${categoryColor}`} />
                                  <span className="text-sm text-zyra-text-secondary">{post.category}</span>
                                  <span className="text-sm text-zyra-text-secondary">•</span>
                                  <span className="text-sm text-zyra-text-secondary">{post.readTime}</span>
                                  <span className="text-sm text-zyra-text-secondary">•</span>
                                  <span className="text-sm text-zyra-text-secondary">{post.publishedAt}</span>
                                </div>
                                
                                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-zyra-cyan-blue transition-colors">
                                  {post.title}
                                </h3>
                                
                                <p className="text-zyra-text-secondary mb-4 line-clamp-2">
                                  {post.excerpt}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-zyra-cyan-blue/20 rounded-full flex items-center justify-center">
                                      <User className="w-4 h-4 text-zyra-cyan-blue" />
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-white">{post.author.name}</div>
                                      <div className="text-xs text-zyra-text-secondary">{post.author.role}</div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-4 text-sm text-zyra-text-secondary">
                                    <div className="flex items-center space-x-1">
                                      <Eye className="w-4 h-4" />
                                      <span>{post.views}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Heart className="w-4 h-4" />
                                      <span>{post.likes}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <MessageCircle className="w-4 h-4" />
                                      <span>{post.comments}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mt-4">
                                  {post.tags.map((tag, tagIndex) => (
                                    <span
                                      key={tagIndex}
                                      className="px-2 py-1 text-xs bg-white/5 rounded text-zyra-text-secondary"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.article>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
