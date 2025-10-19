'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bot, 
  X, 
  Send, 
  Sparkles,
  Zap,
  Brain,
  MessageSquare
} from 'lucide-react'

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I\'m Zyra, your AI assistant. How can I help you automate your workflow today?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'I understand you want to automate your workflow. Let me help you create an intelligent automation that can handle your tasks efficiently.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const quickActions = [
    { icon: Zap, label: 'Create Automation', action: 'Create a new automation workflow' },
    { icon: Brain, label: 'AI Insights', action: 'Generate insights from your data' },
    { icon: MessageSquare, label: 'WhatsApp Bot', action: 'Set up WhatsApp automation' }
  ]

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-zyra-electric-violet rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-zyra-electric-violet/90 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          boxShadow: [
            '0 0 0 0 rgba(139, 92, 246, 0.4)',
            '0 0 0 10px rgba(139, 92, 246, 0)',
            '0 0 0 0 rgba(139, 92, 246, 0)'
          ]
        }}
        transition={{ 
          boxShadow: { 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Bot className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 z-40 w-96 h-[500px] glass-card rounded-2xl border border-zyra-glass-border overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zyra-glass-border bg-zyra-electric-violet/10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-zyra-electric-violet/20 border border-zyra-electric-violet/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-zyra-electric-violet" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Zyra Assistant</h3>
                  <p className="text-xs text-zyra-text-secondary">AI-powered automation</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-zyra-cyan-blue rounded-full animate-pulse" />
                <span className="text-xs text-zyra-text-secondary">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-xl ${
                    message.type === 'user'
                      ? 'bg-zyra-electric-violet/20 border border-zyra-electric-violet/30'
                      : 'bg-white/5 border border-white/10'
                  }`}>
                    <p className="text-sm text-white">{message.content}</p>
                    <p className="text-xs text-zyra-text-secondary mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-zyra-cyan-blue rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-zyra-cyan-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-zyra-cyan-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                      <span className="text-xs text-zyra-text-secondary">Zyra is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-zyra-glass-border">
              <div className="grid grid-cols-3 gap-2 mb-4">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setInputValue(action.action)}
                    className="flex flex-col items-center p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <action.icon className="w-4 h-4 text-zyra-cyan-blue mb-1" />
                    <span className="text-xs text-zyra-text-secondary">{action.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Input */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask Zyra anything..."
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white placeholder-zyra-text-secondary"
                />
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="p-2 bg-zyra-electric-violet rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zyra-electric-violet/90 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
