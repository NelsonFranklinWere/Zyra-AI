'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  Instagram, 
  Twitter, 
  Facebook, 
  Linkedin,
  Hash,
  AtSign,
  Image,
  Video,
  Music,
  Sparkles,
  Copy,
  Download,
  Share,
  RefreshCw,
  Settings,
  Target,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Share2,
  X
} from 'lucide-react'

interface SocialPost {
  id: string
  platform: 'instagram' | 'twitter' | 'facebook' | 'linkedin'
  content: string
  hashtags: string[]
  mentions: string[]
  mediaType: 'text' | 'image' | 'video'
  engagement: {
    likes: number
    comments: number
    shares: number
  }
  timestamp: string
}

interface PostTemplate {
  id: string
  name: string
  description: string
  platform: string
  content: string
  hashtags: string[]
  icon: React.ComponentType<any>
  color: string
  bgColor: string
}

const mockPosts: SocialPost[] = [
  {
    id: '1',
    platform: 'instagram',
    content: 'Just launched our new AI-powered automation platform! 🚀 Excited to see how it transforms workflows and boosts productivity. #AI #Automation #Productivity',
    hashtags: ['#AI', '#Automation', '#Productivity'],
    mentions: [],
    mediaType: 'image',
    engagement: { likes: 42, comments: 8, shares: 12 },
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    platform: 'twitter',
    content: 'The future of work is here! Our new AI assistant can handle complex tasks, freeing up time for creative work. What would you automate first?',
    hashtags: ['#FutureOfWork', '#AI', '#Productivity'],
    mentions: [],
    mediaType: 'text',
    engagement: { likes: 28, comments: 15, shares: 7 },
    timestamp: '4 hours ago'
  },
  {
    id: '3',
    platform: 'linkedin',
    content: 'Thrilled to announce our Series A funding round! 🎉 This milestone will help us scale our AI automation platform and reach more businesses worldwide.',
    hashtags: ['#Funding', '#AI', '#Startup', '#Innovation'],
    mentions: [],
    mediaType: 'text',
    engagement: { likes: 156, comments: 23, shares: 45 },
    timestamp: '1 day ago'
  }
]

const postTemplates: PostTemplate[] = [
  {
    id: '1',
    name: 'Product Launch',
    description: 'Announce new products or features',
    platform: 'All Platforms',
    content: '🚀 Excited to announce [PRODUCT_NAME]! [DESCRIPTION]. Available now at [LINK]. #ProductLaunch #Innovation',
    hashtags: ['#ProductLaunch', '#Innovation'],
    icon: Sparkles,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10'
  },
  {
    id: '2',
    name: 'Behind the Scenes',
    description: 'Show your team and process',
    platform: 'Instagram, LinkedIn',
    content: 'Behind the scenes at [COMPANY_NAME]! Our team is working hard on [PROJECT]. Here\'s a glimpse of our creative process. #BehindTheScenes #Team',
    hashtags: ['#BehindTheScenes', '#Team'],
    icon: Users,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10'
  },
  {
    id: '3',
    name: 'Industry Insights',
    description: 'Share knowledge and expertise',
    platform: 'LinkedIn, Twitter',
    content: '💡 Industry insight: [INSIGHT]. This trend is shaping the future of [INDUSTRY]. What are your thoughts? #IndustryInsights #Expertise',
    hashtags: ['#IndustryInsights', '#Expertise'],
    icon: TrendingUp,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10'
  },
  {
    id: '4',
    name: 'Customer Success',
    description: 'Highlight customer achievements',
    platform: 'All Platforms',
    content: '🎉 Success story: [CUSTOMER] achieved [RESULT] using our [PRODUCT/SERVICE]. Proud to be part of their journey! #CustomerSuccess #CaseStudy',
    hashtags: ['#CustomerSuccess', '#CaseStudy'],
    icon: Target,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10'
  }
]

const platformIcons = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin
}

const platformColors = {
  instagram: 'text-pink-400',
  twitter: 'text-blue-400',
  facebook: 'text-blue-600',
  linkedin: 'text-blue-700'
}

export default function SocialGeneratorPage() {
  const [posts] = useState<SocialPost[]>(mockPosts)
  const [selectedTemplate, setSelectedTemplate] = useState<PostTemplate | null>(null)
  const [generatedContent, setGeneratedContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'twitter'])
  const [showGenerator, setShowGenerator] = useState(false)
  const [prompt, setPrompt] = useState('')

  const handleGeneratePost = () => {
    if (prompt.trim()) {
      setGeneratedContent(`Generated content based on: "${prompt}"\n\nThis is a sample generated social media post that would be created using AI based on your input. The AI would analyze your prompt and create engaging, platform-optimized content with relevant hashtags and mentions.`)
      setShowGenerator(true)
    }
  }

  const handleUseTemplate = (template: PostTemplate) => {
    setSelectedTemplate(template)
    setGeneratedContent(template.content)
    setShowGenerator(true)
  }

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content)
    console.log('Content copied to clipboard')
  }

  const handleDownloadContent = (content: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'social-media-post.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-cyber font-bold gradient-text mb-2">
            Social Media Generator
          </h1>
          <p className="text-zyra-text-secondary">
            Create engaging social media content with AI
          </p>
        </div>
        
        <motion.button
          onClick={() => setShowGenerator(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 text-white rounded-xl font-medium transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Sparkles className="w-5 h-5" />
          <span>Generate Post</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zyra-text-secondary text-sm">Total Posts</p>
              <p className="text-2xl font-bold text-white">{posts.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-zyra-electric-violet" />
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
              <p className="text-zyra-text-secondary text-sm">Total Likes</p>
              <p className="text-2xl font-bold text-white">
                {posts.reduce((sum, post) => sum + post.engagement.likes, 0)}
              </p>
            </div>
            <Heart className="w-8 h-8 text-red-400" />
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
              <p className="text-zyra-text-secondary text-sm">Comments</p>
              <p className="text-2xl font-bold text-white">
                {posts.reduce((sum, post) => sum + post.engagement.comments, 0)}
              </p>
            </div>
            <MessageCircle className="w-8 h-8 text-blue-400" />
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
              <p className="text-zyra-text-secondary text-sm">Shares</p>
              <p className="text-2xl font-bold text-white">
                {posts.reduce((sum, post) => sum + post.engagement.shares, 0)}
              </p>
            </div>
            <Share2 className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Templates */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Content Templates</h3>
          <div className="space-y-3">
            {postTemplates.map((template, index) => {
              const Icon = template.icon
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleUseTemplate(template)}
                  className="p-4 glass-card rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${template.bgColor}`}>
                      <Icon className={`w-5 h-5 ${template.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{template.name}</div>
                      <div className="text-sm text-zyra-text-secondary">{template.description}</div>
                      <div className="text-xs text-zyra-text-secondary mt-1">{template.platform}</div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Recent Posts</h3>
          <div className="space-y-3">
            {posts.map((post, index) => {
              const PlatformIcon = platformIcons[post.platform]
              const platformColor = platformColors[post.platform]
              
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 glass-card rounded-xl"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg bg-white/5`}>
                      <PlatformIcon className={`w-5 h-5 ${platformColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white capitalize">{post.platform}</span>
                        <span className="text-xs text-zyra-text-secondary">{post.timestamp}</span>
                      </div>
                      <p className="text-sm text-zyra-text-secondary mb-3 line-clamp-2">{post.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-zyra-text-secondary">
                          <span className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{post.engagement.likes}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{post.engagement.comments}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Share2 className="w-3 h-3" />
                            <span>{post.engagement.shares}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <motion.button
                            onClick={() => handleCopyContent(post.content)}
                            className="p-1 rounded text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Copy className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDownloadContent(post.content)}
                            className="p-1 rounded text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Download className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Generator Modal */}
      {showGenerator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowGenerator(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card p-8 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-cyber font-bold gradient-text">
                Generate Social Media Content
              </h2>
              <button
                onClick={() => setShowGenerator(false)}
                className="p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Target Platforms
                </label>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(platformIcons).map(([platform, Icon]) => (
                    <button
                      key={platform}
                      onClick={() => togglePlatform(platform)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl border-2 transition-colors ${
                        selectedPlatforms.includes(platform)
                          ? 'border-zyra-cyan-blue bg-zyra-cyan-blue/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${platformColors[platform as keyof typeof platformColors]}`} />
                      <span className="text-white capitalize">{platform}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Prompt */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  What would you like to post about?
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your content idea, topic, or message..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white placeholder-zyra-text-secondary resize-none"
                />
              </div>

              {/* Generated Content */}
              {generatedContent && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Generated Content
                  </label>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <pre className="whitespace-pre-wrap text-white text-sm leading-relaxed">
                      {generatedContent}
                    </pre>
                  </div>
                  <div className="flex items-center justify-end space-x-2 mt-3">
                    <motion.button
                      onClick={() => handleCopyContent(generatedContent)}
                      className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </motion.button>
                    <motion.button
                      onClick={() => handleDownloadContent(generatedContent)}
                      className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setShowGenerator(false)}
                  className="px-6 py-3 text-zyra-text-secondary hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleGeneratePost}
                  className="flex items-center space-x-2 px-6 py-3 bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 text-white rounded-xl font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Content</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
