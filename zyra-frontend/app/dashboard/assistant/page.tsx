'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Settings, 
  Sparkles,
  Brain,
  Zap,
  MessageSquare,
  FileText,
  Image,
  Code,
  BarChart3,
  Calendar,
  Mail,
  Phone
} from 'lucide-react'

interface ChatMessage {
  id: string
  content: string
  timestamp: string
  isFromUser: boolean
  type: 'text' | 'code' | 'image' | 'chart'
  actions?: string[]
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
}

const quickActions: QuickAction[] = [
  {
    id: '1',
    title: 'Generate Content',
    description: 'Create social media posts, emails, or articles',
    icon: FileText,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10'
  },
  {
    id: '2',
    title: 'Data Analysis',
    description: 'Analyze your data and generate insights',
    icon: BarChart3,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10'
  },
  {
    id: '3',
    title: 'Code Assistant',
    description: 'Help with programming and debugging',
    icon: Code,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10'
  },
  {
    id: '4',
    title: 'Schedule Meeting',
    description: 'Find time slots and send invitations',
    icon: Calendar,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10'
  },
  {
    id: '5',
    title: 'Email Automation',
    description: 'Create and send automated emails',
    icon: Mail,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10'
  },
  {
    id: '6',
    title: 'WhatsApp Bot',
    description: 'Set up automated WhatsApp responses',
    icon: MessageSquare,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10'
  }
]

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    content: 'Hello! I\'m Zyra, your AI assistant. I can help you with content creation, data analysis, automation, and much more. What would you like to work on today?',
    timestamp: '10:30 AM',
    isFromUser: false,
    type: 'text'
  },
  {
    id: '2',
    content: 'I need help creating a social media post for our new product launch',
    timestamp: '10:32 AM',
    isFromUser: true,
    type: 'text'
  },
  {
    id: '3',
    content: 'I\'d be happy to help you create a compelling social media post! To get started, could you tell me:\n\n1. What is the name of your product?\n2. What are the key features or benefits?\n3. Who is your target audience?\n4. What tone would you like (professional, casual, exciting)?\n\nOnce I have this information, I can craft an engaging post that will resonate with your audience.',
    timestamp: '10:33 AM',
    isFromUser: false,
    type: 'text',
    actions: ['Generate Post', 'Create Multiple Variations', 'Add Hashtags']
  }
]

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages)
  const [inputMessage, setInputMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        content: inputMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFromUser: true,
        type: 'text'
      }
      
      setMessages(prev => [...prev, newMessage])
      setInputMessage('')
      setIsTyping(true)
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: 'I understand you need help with that. Let me assist you with your request. This is a simulated response from the AI assistant.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isFromUser: false,
          type: 'text',
          actions: ['Generate Solution', 'Provide Examples', 'Create Template']
        }
        setMessages(prev => [...prev, aiResponse])
        setIsTyping(false)
      }, 2000)
    }
  }

  const handleQuickAction = (action: QuickAction) => {
    const message = `I'd like to use the ${action.title.toLowerCase()} feature. ${action.description}`
    setInputMessage(message)
  }

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording)
    // Voice recording logic would go here
  }

  const handleActionClick = (action: string) => {
    console.log('Action clicked:', action)
    // Handle action execution
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-zyra-glass-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-zyra-electric-violet/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-zyra-electric-violet" />
            </div>
            <div>
              <h1 className="text-2xl font-cyber font-bold gradient-text">
                Zyra AI Assistant
              </h1>
              <p className="text-zyra-text-secondary">
                Your intelligent automation companion
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-zyra-cyan-blue/10 border border-zyra-cyan-blue/20">
              <div className="w-2 h-2 bg-zyra-cyan-blue rounded-full animate-pulse" />
              <span className="text-sm text-zyra-text-secondary">AI Active</span>
            </div>
            
            <motion.button
              className="p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Quick Actions Sidebar */}
        <div className="w-80 glass-sidebar border-r border-zyra-glass-border p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleQuickAction(action)}
                  className="w-full p-4 rounded-xl border border-white/10 hover:border-zyra-cyan-blue/50 hover:bg-white/5 transition-colors text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.bgColor}`}>
                      <Icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <div>
                      <div className="font-medium text-white">{action.title}</div>
                      <div className="text-sm text-zyra-text-secondary">{action.description}</div>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${message.isFromUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-2xl ${
                  message.isFromUser 
                    ? 'bg-zyra-electric-violet text-white' 
                    : 'bg-white/5 text-white'
                } rounded-2xl p-4`}>
                  <div className="flex items-start space-x-3">
                    {!message.isFromUser && (
                      <div className="w-8 h-8 rounded-full bg-zyra-cyan-blue/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-zyra-cyan-blue" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs text-zyra-text-secondary">{message.timestamp}</span>
                        {!message.isFromUser && (
                          <div className="flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-zyra-cyan-blue" />
                            <span className="text-xs text-zyra-cyan-blue">AI</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      
                      {message.actions && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.actions.map((action, actionIndex) => (
                            <motion.button
                              key={actionIndex}
                              onClick={() => handleActionClick(action)}
                              className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {action}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white/5 rounded-2xl p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-zyra-cyan-blue/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-zyra-cyan-blue" />
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-zyra-cyan-blue rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-zyra-cyan-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-zyra-cyan-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-zyra-glass-border">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask Zyra anything..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white placeholder-zyra-text-secondary"
                />
              </div>
              
              <motion.button
                onClick={handleVoiceToggle}
                className={`p-3 rounded-xl transition-colors ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'text-zyra-text-secondary hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </motion.button>
              
              <motion.button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="p-3 bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
