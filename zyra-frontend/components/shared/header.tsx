"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { 
  Brain, 
  Zap, 
  Sparkles, 
  BarChart3, 
  Workflow, 
  MessageSquare,
  Bot,
  Menu,
  X,
  User,
  LogOut
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import AuthModal from "@/components/auth/auth-modal"

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { user, logout } = useAuth();

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-nav sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div 
              className="relative w-10 h-10 rounded-xl overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-neon-gradient opacity-90" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-2xl font-cyber font-bold gradient-text">
                Zyra
              </span>
              <span className="text-xs text-zyra-text-secondary font-medium tracking-wider">
                AI AUTOMATION
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300 group"
            >
              <BarChart3 className="w-4 h-4 group-hover:animate-pulse" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link 
              href="/automation" 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300 group"
            >
              <Workflow className="w-4 h-4 group-hover:animate-pulse" />
              <span className="font-medium">Automation</span>
            </Link>
            <Link 
              href="/insights" 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300 group"
            >
              <Brain className="w-4 h-4 group-hover:animate-pulse" />
              <span className="font-medium">Insights</span>
            </Link>
            <Link 
              href="/chat" 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300 group"
            >
              <MessageSquare className="w-4 h-4 group-hover:animate-pulse" />
              <span className="font-medium">AI Chat</span>
            </Link>
          </nav>
          
          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-zyra-text-secondary">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{user.firstName} {user.lastName}</span>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={logout}
                  className="text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  className="text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300"
                >
                  Sign In
                </Button>
                <motion.button 
                  onClick={() => {
                    setAuthMode('signup');
                    setShowAuthModal(true);
                  }}
                  className="neon-button flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Get Started</span>
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300"
            whileTap={{ scale: 0.95 }}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isMenuOpen ? 1 : 0, 
            height: isMenuOpen ? 'auto' : 0 
          }}
          transition={{ duration: 0.3 }}
          className="lg:hidden overflow-hidden"
        >
          <div className="py-4 border-t border-zyra-glass-border">
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/dashboard" 
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart3 className="w-5 h-5 group-hover:animate-pulse" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link 
                href="/automation" 
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <Workflow className="w-5 h-5 group-hover:animate-pulse" />
                <span className="font-medium">Automation</span>
              </Link>
              <Link 
                href="/insights" 
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <Brain className="w-5 h-5 group-hover:animate-pulse" />
                <span className="font-medium">Insights</span>
              </Link>
              <Link 
                href="/chat" 
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <MessageSquare className="w-5 h-5 group-hover:animate-pulse" />
                <span className="font-medium">AI Chat</span>
              </Link>
              <div className="flex flex-col space-y-2 mt-4 pt-4 border-t border-zyra-glass-border">
                {user ? (
                  <>
                    <div className="flex items-center space-x-2 text-zyra-text-secondary px-4 py-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{user.firstName} {user.lastName}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300 justify-start"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        setAuthMode('login');
                        setShowAuthModal(true);
                        setIsMenuOpen(false);
                      }}
                      className="text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300 justify-start"
                    >
                      Sign In
                    </Button>
                    <motion.button 
                      onClick={() => {
                        setAuthMode('signup');
                        setShowAuthModal(true);
                        setIsMenuOpen(false);
                      }}
                      className="neon-button flex items-center justify-center space-x-2"
                      whileTap={{ scale: 0.95 }}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Get Started</span>
                    </motion.button>
                  </>
                )}
              </div>
            </nav>
          </div>
        </motion.div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </motion.header>
  )
}
