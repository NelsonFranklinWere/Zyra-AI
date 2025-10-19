"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Brain, Sparkles, Loader2 } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  type?: 'text' | 'insight' | 'suggestion'
}

interface AIChatProps {
  onInsightGenerated?: (insight: string) => void
}

export const AIChat = ({ onInsightGenerated }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Yo 👋 I'm Zyra, your AI marketing intelligence system! I can help you create buyer personas, generate Gen Z content, and automate your marketing campaigns. What's your business goal today?",
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(input),
        sender: 'ai',
        timestamp: new Date(),
        type: Math.random() > 0.7 ? 'insight' : 'text'
      }

      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)

      if (aiResponse.type === 'insight') {
        onInsightGenerated?.(aiResponse.content)
      }
    }, 1500)
  }

  const generateAIResponse = (userInput: string): string => {
    const responses = [
      "Perfect! I've analyzed your customer data and identified 4 key personas: Young Professionals (35%), Family Shoppers (30%), Tech Enthusiasts (20%), and Value Seekers (15%). The Young Professionals group has the highest conversion rate at 89.2%. Want me to create targeted campaigns for them? 🚀",
      "I've generated 12 diverse captions for your Instagram posts! Here's a sample: 'Quality meets style for the modern lifestyle ✨ Perfect for busy professionals and families alike. #Quality #Lifestyle #Modern'. Should I schedule these for optimal engagement times? 📱",
      "Based on your audience data, I recommend Instagram (35% engagement), WhatsApp (25%), and Facebook (20%) for your diverse audience. Instagram works great for visual content, while WhatsApp is perfect for direct family communication. Want me to create platform-specific strategies? 🎯",
      "I've detected some high-conversion customers in your data! 15.7K users show strong purchase intent across different age groups. Should I create personalized campaigns to target them specifically? 💰",
      "Your product collection data shows amazing potential! I can create a Friday evening release strategy targeting diverse audiences in Nairobi with 10% profit margin. Ready to boost sales? 👟",
      "I've analyzed the trending keywords and your product descriptions. The emotional tone resonates well across demographics - authentic and relatable. Want me to generate some engaging content? 🔥",
      "Your customer journey data reveals some interesting patterns. I can optimize your funnel to increase conversions by 340%. Should I create a detailed strategy? 📈",
      "I've identified the best posting times for your audience: Friday 6PM for WhatsApp, 7PM for Instagram, and 8PM for Facebook. Want me to schedule your campaigns automatically? ⏰"
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl border border-soft-silver/10 overflow-hidden"
      >
        {/* Chat Header */}
        <div className="bg-deep-space-light/50 p-4 border-b border-soft-silver/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-neon-coral to-pink-500 rounded-xl flex items-center justify-center coral-glow">
              <Brain className="w-5 h-5 text-deep-space" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-soft-silver">Zyra AI Assistant</h3>
              <p className="text-sm text-soft-silver-dark">Marketing Intelligence for Gen Z</p>
            </div>
            <div className="ml-auto flex items-center space-x-2">
              <div className="w-2 h-2 bg-electric-teal rounded-full animate-pulse"></div>
              <span className="text-xs text-electric-teal font-medium">Online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'bg-electric-gradient' 
                      : 'bg-gradient-to-r from-neon-coral to-pink-500'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4 text-deep-space" />
                    ) : (
                      <Bot className="w-4 h-4 text-deep-space" />
                    )}
                  </div>
                  
                  <div className={`rounded-2xl p-4 ${
                    message.sender === 'user'
                      ? 'bg-electric-gradient text-deep-space'
                      : message.type === 'insight'
                      ? 'bg-gradient-to-r from-neon-coral/20 to-pink-500/20 border border-neon-coral/30'
                      : 'bg-deep-space-light/50 text-soft-silver'
                  }`}>
                    {message.type === 'insight' && (
                      <div className="flex items-center space-x-2 mb-2">
                        <Sparkles className="w-4 h-4 text-neon-coral" />
                        <span className="text-xs font-medium text-neon-coral">AI Insight</span>
                      </div>
                    )}
                    
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    
                    <p className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-deep-space/70' : 'text-soft-silver-dark'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-neon-coral to-pink-500 rounded-xl flex items-center justify-center">
                  <Bot className="w-4 h-4 text-deep-space" />
                </div>
                <div className="bg-deep-space-light/50 rounded-2xl p-4">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 text-neon-coral animate-spin" />
                    <span className="text-sm text-soft-silver">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-soft-silver/10">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Zyra about personas, content, or campaigns..."
                className="w-full bg-deep-space-light/50 border border-soft-silver/20 rounded-xl p-3 text-soft-silver placeholder-soft-silver-dark focus:outline-none focus:border-electric-teal/50 focus:ring-1 focus:ring-electric-teal/20 resize-none"
                rows={2}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-12 h-12 bg-electric-gradient hover:scale-105 transition-all duration-300 neon-glow rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5 text-deep-space" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
