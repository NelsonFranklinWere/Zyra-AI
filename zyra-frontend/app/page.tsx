"use client"

import { Hero } from "@/components/sections/hero"
import { Features } from "@/components/sections/features"
import { Dashboard } from "@/components/sections/dashboard"
import { Automation } from "@/components/sections/automation"
import { DataUpload } from "@/components/ui/data-upload"
import AIChatEnhanced from "@/components/ui/ai-chat-enhanced"
import { Footer } from "@/components/shared/footer"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

export default function Home() {
  const [showDataUpload, setShowDataUpload] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      setAuthError(error)
      // Clear the error from URL after 5 seconds
      setTimeout(() => {
        setAuthError(null)
        // Remove error from URL
        const url = new URL(window.location.href)
        url.searchParams.delete('error')
        window.history.replaceState({}, '', url.toString())
      }, 5000)
    }
  }, [searchParams])

  // If showing AI chat, render the full-screen chat interface
  if (showAIChat) {
    return <AIChatEnhanced />
  }

  return (
    <div className="min-h-screen bg-zyra-gradient cyber-grid">
      {/* Error Display */}
      {authError && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-red-500/90 backdrop-blur-sm border border-red-400/50 rounded-lg px-6 py-3 text-white text-center max-w-md">
            <p className="font-medium">
              {authError === 'auth_failed' && 'Authentication failed. Please try again.'}
              {authError === 'invalid_data' && 'Invalid authentication data. Please try again.'}
              {authError === 'server_error' && 'Server error during authentication. Please try again.'}
            </p>
          </div>
        </motion.div>
      )}
      
      <main>
        <Hero />
        <Features />
        <Dashboard />
        <Automation />
        
        {/* Interactive Demo Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="py-32 px-4"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center space-x-2 bg-zyra-cyan-blue/10 border border-zyra-cyan-blue/20 rounded-full px-4 py-2 mb-8">
                <span className="text-sm text-zyra-cyan-blue font-medium">Try It Now</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-cyber font-bold mb-8">
                <span className="gradient-text">
                  Experience Zyra
                </span>
              </h2>
              
              <p className="text-xl text-zyra-text-secondary max-w-3xl mx-auto">
                Upload your data and chat with our AI to see the power of intelligent automation
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Data Upload Demo */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div className="glass-card p-8 text-center">
                  <h3 className="text-2xl font-cyber font-bold text-zyra-cyan-blue mb-4">Upload Your Data</h3>
                  <p className="text-zyra-text-secondary mb-6">
                    Try our AI-powered data analysis with your own files
                  </p>
                  
                  {showDataUpload ? (
                    <DataUpload onUploadComplete={(file) => {
                      console.log('File uploaded:', file.name)
                      setShowAIChat(true)
                    }} />
                  ) : (
                    <motion.button
                      onClick={() => setShowDataUpload(true)}
                      className="neon-button text-lg px-8 py-4 rounded-xl font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Try Data Upload
                    </motion.button>
                  )}
                </div>
              </motion.div>

              {/* AI Chat Demo */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div className="glass-card p-8 text-center">
                  <h3 className="text-2xl font-cyber font-bold text-zyra-electric-violet mb-4">Chat with Zyra AI</h3>
                  <p className="text-zyra-text-secondary mb-6">
                    Ask questions and get intelligent insights about your data
                  </p>
                  
                  <motion.button
                    onClick={() => setShowAIChat(true)}
                    className="cyber-button text-lg px-8 py-4 rounded-xl font-semibold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start AI Chat
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="py-24 px-4"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="glass-card p-12"
            >
              <h2 className="text-4xl md:text-5xl font-cyber font-bold gradient-text mb-6">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl text-zyra-text-secondary mb-8 max-w-2xl mx-auto">
                Join thousands of businesses already using Zyra to automate, optimize, and scale their operations with AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  className="neon-button text-lg px-8 py-4 rounded-xl font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Free Trial
                </motion.button>
                <motion.button
                  className="cyber-button text-lg px-8 py-4 rounded-xl font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Schedule Demo
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  )
}
