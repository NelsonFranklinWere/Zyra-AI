'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  Plus, 
  Send, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Settings,
  Bot,
  Phone,
  Calendar,
  FileText,
  Image,
  Video,
  Music
} from 'lucide-react'

interface WhatsAppMessage {
  id: string
  type: 'text' | 'image' | 'video' | 'audio' | 'document'
  content: string
  timestamp: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  isFromBot: boolean
}

interface WhatsAppContact {
  id: string
  name: string
  phone: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  isOnline: boolean
}

const mockMessages: WhatsAppMessage[] = [
  {
    id: '1',
    type: 'text',
    content: 'Hello! Welcome to our automated WhatsApp service. How can I help you today?',
    timestamp: '10:30 AM',
    status: 'read',
    isFromBot: true
  },
  {
    id: '2',
    type: 'text',
    content: 'Hi, I need help with my order',
    timestamp: '10:32 AM',
    status: 'read',
    isFromBot: false
  },
  {
    id: '3',
    type: 'text',
    content: 'I\'d be happy to help you with your order. Could you please provide your order number?',
    timestamp: '10:33 AM',
    status: 'read',
    isFromBot: true
  }
]

const mockContacts: WhatsAppContact[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+1234567890',
    lastMessage: 'Thanks for the help!',
    timestamp: '2 min ago',
    unreadCount: 0,
    isOnline: true
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    phone: '+1234567891',
    lastMessage: 'Can you send me the invoice?',
    timestamp: '5 min ago',
    unreadCount: 2,
    isOnline: false
  },
  {
    id: '3',
    name: 'Mike Johnson',
    phone: '+1234567892',
    lastMessage: 'Perfect, I\'ll take it!',
    timestamp: '1 hour ago',
    unreadCount: 0,
    isOnline: true
  }
]

const messageTypes = {
  text: { icon: FileText, color: 'text-blue-400' },
  image: { icon: Image, color: 'text-green-400' },
  video: { icon: Video, color: 'text-purple-400' },
  audio: { icon: Music, color: 'text-orange-400' },
  document: { icon: FileText, color: 'text-cyan-400' }
}

const statusConfig = {
  sent: { icon: CheckCircle, color: 'text-gray-400' },
  delivered: { icon: CheckCircle, color: 'text-blue-400' },
  read: { icon: CheckCircle, color: 'text-green-400' },
  failed: { icon: AlertCircle, color: 'text-red-400' }
}

export default function WhatsAppPage() {
  const [messages] = useState<WhatsAppMessage[]>(mockMessages)
  const [contacts] = useState<WhatsAppContact[]>(mockContacts)
  const [selectedContact, setSelectedContact] = useState<WhatsAppContact | null>(contacts[0])
  const [newMessage, setNewMessage] = useState('')
  const [showCreateBot, setShowCreateBot] = useState(false)

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage)
      setNewMessage('')
    }
  }

  const handleCreateBot = () => {
    setShowCreateBot(true)
  }

  return (
    <div className="h-full flex">
      {/* Sidebar - Contacts */}
      <div className="w-80 glass-sidebar border-r border-zyra-glass-border flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zyra-glass-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-cyber font-bold gradient-text">
              WhatsApp Automation
            </h2>
            <motion.button
              onClick={handleCreateBot}
              className="p-2 rounded-lg bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white placeholder-zyra-text-secondary"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-zyra-glass-border">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{contacts.length}</div>
              <div className="text-xs text-zyra-text-secondary">Active Chats</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {contacts.filter(c => c.isOnline).length}
              </div>
              <div className="text-xs text-zyra-text-secondary">Online</div>
            </div>
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {contacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedContact(contact)}
              className={`p-4 border-b border-zyra-glass-border cursor-pointer hover:bg-white/5 transition-colors ${
                selectedContact?.id === contact.id ? 'bg-zyra-electric-violet/10' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-zyra-electric-violet/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-zyra-electric-violet" />
                  </div>
                  {contact.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-zyra-bg" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white truncate">{contact.name}</h3>
                    <span className="text-xs text-zyra-text-secondary">{contact.timestamp}</span>
                  </div>
                  <p className="text-sm text-zyra-text-secondary truncate">{contact.lastMessage}</p>
                  {contact.unreadCount > 0 && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-zyra-text-secondary">{contact.phone}</span>
                      <div className="w-5 h-5 bg-zyra-electric-violet rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">{contact.unreadCount}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-zyra-glass-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-zyra-electric-violet/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-zyra-electric-violet" />
                    </div>
                    {selectedContact.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-zyra-bg" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{selectedContact.name}</h3>
                    <p className="text-sm text-zyra-text-secondary">{selectedContact.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <motion.button
                    className="p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Phone className="w-5 h-5" />
                  </motion.button>
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => {
                const typeConfig = messageTypes[message.type]
                const statusInfo = statusConfig[message.status]
                const TypeIcon = typeConfig.icon
                const StatusIcon = statusInfo.icon

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${message.isFromBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${
                      message.isFromBot 
                        ? 'bg-white/5' 
                        : 'bg-zyra-electric-violet text-white'
                    } rounded-2xl p-4`}>
                      <div className="flex items-start space-x-2">
                        {message.isFromBot && (
                          <div className="w-6 h-6 rounded-full bg-zyra-cyan-blue/20 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-zyra-cyan-blue" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <TypeIcon className={`w-4 h-4 ${typeConfig.color}`} />
                            <span className="text-xs text-zyra-text-secondary">{message.timestamp}</span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                          {!message.isFromBot && (
                            <div className="flex items-center justify-end mt-2">
                              <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-zyra-glass-border">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white placeholder-zyra-text-secondary"
                  />
                </div>
                
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-zyra-text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">Select a conversation</h3>
              <p className="text-zyra-text-secondary">Choose a contact to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Bot Modal */}
      {showCreateBot && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateBot(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card p-8 rounded-2xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-cyber font-bold gradient-text mb-6">
              Create WhatsApp Bot
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Bot Name
                </label>
                <input
                  type="text"
                  placeholder="Enter bot name"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white placeholder-zyra-text-secondary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Welcome Message
                </label>
                <textarea
                  placeholder="Enter the welcome message for new users"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white placeholder-zyra-text-secondary resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Bot Personality
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 rounded-xl border-2 border-zyra-cyan-blue/50 hover:border-zyra-cyan-blue transition-colors text-left">
                    <div className="flex items-center space-x-3">
                      <Bot className="w-5 h-5 text-zyra-cyan-blue" />
                      <span className="text-white font-medium">Professional</span>
                    </div>
                  </button>
                  <button className="p-4 rounded-xl border-2 border-transparent hover:border-zyra-cyan-blue/50 transition-colors text-left">
                    <div className="flex items-center space-x-3">
                      <Bot className="w-5 h-5 text-zyra-electric-violet" />
                      <span className="text-white font-medium">Friendly</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowCreateBot(false)}
                className="px-6 py-3 text-zyra-text-secondary hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateBot(false)}
                className="px-6 py-3 bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 text-white rounded-xl font-medium transition-colors"
              >
                Create Bot
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
