'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Mic, 
  MicOff,
  Paperclip,
  X,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Download,
  Settings,
  Zap,
  Brain,
  Target,
  MessageSquare,
  TrendingUp
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  suggestions?: string[];
  metadata?: {
    model?: string;
    confidence?: number;
    processing_time?: number;
  };
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  created_at: Date;
  updated_at: Date;
}

const AIChatEnhanced: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm Zyra, your AI automation and marketing intelligence assistant. I can help you with:\n\n• Generate professional resumes and CVs\n• Create viral social media content\n• Analyze customer data for insights\n• Build automation workflows\n• Optimize marketing strategies\n\nWhat would you like to work on today?",
      timestamp: new Date(),
      suggestions: [
        "Generate a resume for a software engineer",
        "Create Instagram content for my brand",
        "Analyze my customer data",
        "Build a WhatsApp automation"
      ],
      metadata: {
        model: 'gpt-4',
        confidence: 0.95
      }
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'general' | 'resume' | 'social' | 'analytics' | 'automation'>('general');
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: getAIResponse(inputValue, selectedMode),
        timestamp: new Date(),
        suggestions: getSuggestions(selectedMode),
        metadata: {
          model: 'gpt-4',
          confidence: 0.89,
          processing_time: 1.2
        }
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (input: string, mode: string): string => {
    // Mock AI responses based on mode and input
    const responses = {
      general: "I understand you're looking for help with that. Let me provide you with some insights and actionable recommendations.",
      resume: "I'll help you create a professional, ATS-optimized resume. Based on your requirements, here's what I recommend...",
      social: "Perfect! I'll generate viral, Gen Z-optimized content for your social media platforms. Let me create engaging posts that will drive real engagement.",
      analytics: "I'll analyze your data and provide actionable insights. Here are the key patterns I've identified...",
      automation: "Great choice! I'll help you build an efficient automation workflow. Let me design a solution that will streamline your processes."
    };

    return responses[mode as keyof typeof responses] || responses.general;
  };

  const getSuggestions = (mode: string): string[] => {
    const suggestions = {
      general: [
        "Show me my dashboard analytics",
        "Help me optimize my marketing strategy",
        "Create a new automation workflow"
      ],
      resume: [
        "Add more quantified achievements",
        "Optimize for ATS systems",
        "Generate a cover letter"
      ],
      social: [
        "Create Instagram Reels content",
        "Generate TikTok captions",
        "Design a content calendar"
      ],
      analytics: [
        "Identify top-performing channels",
        "Analyze customer behavior patterns",
        "Predict conversion trends"
      ],
      automation: [
        "Set up WhatsApp auto-replies",
        "Create lead nurturing sequences",
        "Build email marketing automation"
      ]
    };

    return suggestions[mode as keyof typeof suggestions] || suggestions.general;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    textareaRef.current?.focus();
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      type: 'ai',
      content: "Chat cleared! How can I help you today?",
      timestamp: new Date(),
      suggestions: getSuggestions(selectedMode)
    }]);
  };

  const modes = [
    { id: 'general', label: 'General', icon: MessageSquare, color: 'from-zyra-electric-violet to-zyra-cyan-blue' },
    { id: 'resume', label: 'Resume AI', icon: Bot, color: 'from-blue-500 to-cyan-500' },
    { id: 'social', label: 'Social AI', icon: TrendingUp, color: 'from-pink-500 to-purple-500' },
    { id: 'analytics', label: 'Analytics', icon: Brain, color: 'from-green-500 to-emerald-500' },
    { id: 'automation', label: 'Automation', icon: Zap, color: 'from-orange-500 to-red-500' }
  ];

  return (
    <div className="h-screen bg-zyra-gradient flex flex-col">
      {/* Header */}
      <div className="glass-nav border-b border-zyra-glass-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-neon-gradient flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-zyra-deep-navy animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-cyber font-bold gradient-text">Zyra AI Assistant</h1>
                <p className="text-sm text-zyra-text-secondary">Your intelligent automation partner</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <motion.button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id as any)}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        selectedMode === mode.id
                          ? `bg-gradient-to-r ${mode.color} text-white shadow-neon`
                          : 'text-zyra-text-secondary hover:text-white hover:bg-white/5'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={clearChat}
                  className="p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center space-x-2 mt-4">
            <span className="text-sm text-zyra-text-secondary">Mode:</span>
            {modes.map((mode) => {
              const Icon = mode.icon;
              return (
                <motion.button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id as any)}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedMode === mode.id
                      ? `bg-gradient-to-r ${mode.color} text-white`
                      : 'text-zyra-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-3 h-3" />
                  <span>{mode.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="container mx-auto max-w-4xl">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-6`}
              >
                <div className={`flex items-start space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-zyra-cyan-blue to-zyra-electric-violet' 
                      : 'bg-gradient-to-r from-zyra-electric-violet to-zyra-cyan-blue'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  <div className={`glass-card p-4 ${message.type === 'user' ? 'ml-12' : 'mr-12'}`}>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-white whitespace-pre-wrap">{message.content}</p>
                    </div>
                    
                    {message.metadata && (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zyra-glass-border">
                        <div className="flex items-center space-x-4 text-xs text-zyra-text-secondary">
                          <span>Model: {message.metadata.model}</span>
                          {message.metadata.confidence && (
                            <span>Confidence: {Math.round(message.metadata.confidence * 100)}%</span>
                          )}
                          {message.metadata.processing_time && (
                            <span>Time: {message.metadata.processing_time}s</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <motion.button
                            onClick={() => copyMessage(message.content)}
                            className="p-1 rounded text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Copy className="w-3 h-3" />
                          </motion.button>
                          {message.type === 'ai' && (
                            <>
                              <motion.button
                                className="p-1 rounded text-zyra-text-secondary hover:text-green-400 hover:bg-white/5 transition-all"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </motion.button>
                              <motion.button
                                className="p-1 rounded text-zyra-text-secondary hover:text-red-400 hover:bg-white/5 transition-all"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <ThumbsDown className="w-3 h-3" />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start mb-6"
            >
              <div className="flex items-start space-x-3 max-w-3xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-zyra-electric-violet to-zyra-cyan-blue flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="glass-card p-4 mr-12">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-zyra-cyan-blue rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-zyra-cyan-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-zyra-cyan-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-zyra-text-secondary">Zyra is thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Suggestions */}
          {messages.length > 0 && messages[messages.length - 1].suggestions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <div className="flex flex-wrap gap-2 justify-center">
                {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 glass-card text-sm text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="glass-nav border-t border-zyra-glass-border">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-4">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask Zyra anything about ${selectedMode === 'general' ? 'automation and marketing' : selectedMode}...`}
                  className="w-full glass-card p-4 pr-12 text-white placeholder-zyra-text-secondary resize-none rounded-xl focus:outline-none focus:ring-2 focus:ring-zyra-electric-violet/50 min-h-[60px] max-h-[120px]"
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '60px'
                  }}
                />
                <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                  <motion.button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      isRecording 
                        ? 'text-red-400 bg-red-400/10' 
                        : 'text-zyra-text-secondary hover:text-white hover:bg-white/5'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </motion.button>
                  <motion.button
                    className="p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Paperclip className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              
              <motion.button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="neon-button flex items-center space-x-2 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: inputValue.trim() && !isTyping ? 1.05 : 1 }}
                whileTap={{ scale: inputValue.trim() && !isTyping ? 0.95 : 1 }}
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 h-full w-80 glass-card border-l border-zyra-glass-border z-50"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-cyber font-bold text-white">Chat Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zyra-text-secondary mb-2">
                    AI Model
                  </label>
                  <select className="w-full glass-card p-3 text-white rounded-lg bg-transparent border border-zyra-glass-border">
                    <option value="gpt-4">GPT-4 (Recommended)</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="claude-3">Claude 3</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zyra-text-secondary mb-2">
                    Response Style
                  </label>
                  <select className="w-full glass-card p-3 text-white rounded-lg bg-transparent border border-zyra-glass-border">
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="technical">Technical</option>
                    <option value="creative">Creative</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zyra-text-secondary mb-2">
                    Max Response Length
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    defaultValue="500"
                    className="w-full"
                  />
                  <div className="text-xs text-zyra-text-secondary mt-1">500 tokens</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatEnhanced;
