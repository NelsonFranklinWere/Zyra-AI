"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Send, 
  Upload, 
  Download, 
  ThumbsUp, 
  ThumbsDown,
  Bot,
  User,
  FileText,
  Image,
  Database,
  Sparkles,
  Copy,
  Share2
} from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'file' | 'dataset';
  metadata?: any;
  feedback?: 'positive' | 'negative' | null;
}

interface ChatContext {
  tenantId?: string;
  dataset?: string;
  product?: string;
  mode?: 'general' | 'cv' | 'social' | 'analysis';
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<ChatContext>({});
  const [selectedMode, setSelectedMode] = useState<'general' | 'cv' | 'social' | 'analysis'>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context,
          mode: selectedMode
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response.content,
          timestamp: new Date(),
          type: data.response.type,
          metadata: data.response.metadata
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', JSON.stringify(context));

    try {
      const response = await fetch('/api/ai/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        const fileMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: `Uploaded file: ${file.name}`,
          timestamp: new Date(),
          type: 'file',
          metadata: { fileName: file.name, fileSize: file.size }
        };

        setMessages(prev => [...prev, fileMessage]);

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.analysis,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleFeedback = async (messageId: string, feedback: 'positive' | 'negative') => {
    try {
      await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, feedback })
      });

      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, feedback } : msg
      ));
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleDownloadResponse = async (messageId: string) => {
    try {
      const response = await fetch(`/api/ai/download/${messageId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zyra-response-${messageId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading response:', error);
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'cv': return <FileText className="w-4 h-4" />;
      case 'social': return <Share2 className="w-4 h-4" />;
      case 'analysis': return <Database className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getModeDescription = (mode: string) => {
    switch (mode) {
      case 'cv': return 'CV Builder & Career Advice';
      case 'social': return 'Social Media Content';
      case 'analysis': return 'Data Analysis';
      default: return 'General AI Assistant';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zyra-cyan-blue mb-2">AI Chat Assistant</h1>
        <p className="text-zyra-text-secondary">
          Chat with Zyra's AI to get insights, generate content, and analyze your data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="glass-card h-[600px] flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-zyra-cyan-blue flex items-center">
                  <Bot className="w-5 h-5 mr-2" />
                  Zyra AI Assistant
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-green-500">
                    Online
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className={`flex items-start space-x-2 ${
                          message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.role === 'user' 
                              ? 'bg-zyra-cyan-blue text-white' 
                              : 'bg-zyra-electric-violet text-white'
                          }`}>
                            {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          </div>
                          <div className={`rounded-lg p-4 ${
                            message.role === 'user'
                              ? 'bg-zyra-cyan-blue text-white'
                              : 'bg-zyra-glass border border-zyra-glass-border'
                          }`}>
                            <div className="whitespace-pre-wrap">{message.content}</div>
                            <div className={`text-xs mt-2 ${
                              message.role === 'user' ? 'text-blue-100' : 'text-zyra-text-secondary'
                            }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        
                        {/* Message Actions */}
                        {message.role === 'assistant' && (
                          <div className="flex items-center space-x-2 mt-2 ml-10">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopyMessage(message.content)}
                              className="text-zyra-text-secondary hover:text-zyra-cyan-blue"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownloadResponse(message.id)}
                              className="text-zyra-text-secondary hover:text-zyra-cyan-blue"
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                            <div className="flex items-center space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleFeedback(message.id, 'positive')}
                                className={`text-zyra-text-secondary hover:text-green-500 ${
                                  message.feedback === 'positive' ? 'text-green-500' : ''
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleFeedback(message.id, 'negative')}
                                className={`text-zyra-text-secondary hover:text-red-500 ${
                                  message.feedback === 'negative' ? 'text-red-500' : ''
                                }`}
                              >
                                <ThumbsDown className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-full bg-zyra-electric-violet text-white flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="bg-zyra-glass border border-zyra-glass-border rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-zyra-cyan-blue rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-zyra-cyan-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-zyra-cyan-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-zyra-glass-border p-4">
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything... I can help with CV generation, social media content, data analysis, and more!"
                      className="min-h-[60px] max-h-[120px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
                    />
                    <label htmlFor="file-upload">
                      <Button size="sm" variant="outline" className="cursor-pointer">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </label>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!input.trim() || loading}
                      className="neon-button"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Chat Modes */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg text-zyra-cyan-blue">Chat Modes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(['general', 'cv', 'social', 'analysis'] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={selectedMode === mode ? 'default' : 'outline'}
                  className={`w-full justify-start ${
                    selectedMode === mode 
                      ? 'bg-zyra-cyan-blue text-white' 
                      : 'text-zyra-text-secondary hover:text-zyra-cyan-blue'
                  }`}
                  onClick={() => setSelectedMode(mode)}
                >
                  {getModeIcon(mode)}
                  <span className="ml-2">{getModeDescription(mode)}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Context Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg text-zyra-cyan-blue">Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zyra-text-secondary">Active Dataset</label>
                <select 
                  className="w-full mt-1 p-2 border border-zyra-glass-border rounded-lg bg-zyra-glass text-zyra-text-primary"
                  value={context.dataset || ''}
                  onChange={(e) => setContext({ ...context, dataset: e.target.value })}
                >
                  <option value="">Select dataset...</option>
                  <option value="customers">Customer Data</option>
                  <option value="sales">Sales Data</option>
                  <option value="marketing">Marketing Data</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-zyra-text-secondary">Product Focus</label>
                <select 
                  className="w-full mt-1 p-2 border border-zyra-glass-border rounded-lg bg-zyra-glass text-zyra-text-primary"
                  value={context.product || ''}
                  onChange={(e) => setContext({ ...context, product: e.target.value })}
                >
                  <option value="">Select product...</option>
                  <option value="saas">SaaS Platform</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="consulting">Consulting</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg text-zyra-cyan-blue">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start text-zyra-text-secondary hover:text-zyra-cyan-blue"
                onClick={() => setInput("Generate a professional CV for a software engineer")}
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate CV
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-zyra-text-secondary hover:text-zyra-cyan-blue"
                onClick={() => setInput("Create social media content for a tech startup")}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Social Content
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-zyra-text-secondary hover:text-zyra-cyan-blue"
                onClick={() => setInput("Analyze my customer data and provide insights")}
              >
                <Database className="w-4 h-4 mr-2" />
                Data Analysis
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
