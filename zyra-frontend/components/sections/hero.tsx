"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Brain, Zap, Sparkles, ArrowRight, Play } from "lucide-react"

export const Hero = () => {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-electric-teal/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-aurora-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-neon-coral/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center space-x-2 bg-electric-teal/10 border border-electric-teal/20 rounded-full px-4 py-2 mb-8">
            <Brain className="w-4 h-4 text-electric-teal" />
            <span className="text-sm text-electric-teal font-medium">AI Marketing Intelligence System</span>
          </div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl font-display font-bold mb-8"
        >
          <span className="bg-electric-gradient bg-clip-text text-transparent glow-text">
            Zyra
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-soft-silver mb-4 max-w-4xl mx-auto leading-relaxed"
        >
          Automate communication, marketing, and audience targeting for businesses
        </motion.p>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg text-soft-silver-dark mb-12 max-w-3xl mx-auto"
        >
          Using AI-driven data processing, language intelligence, and cross-platform distribution to make every product reach the right person at the right time — targeting diverse audiences including kids, youth, millennials, parents, and all demographics.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Button 
            size="lg" 
            className="bg-electric-gradient hover:scale-105 transition-all duration-300 neon-glow text-lg px-8 py-4"
          >
            <Zap className="w-5 h-5 mr-2" />
            Start Automating
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="glass-effect border-electric-teal/30 text-electric-teal hover:bg-electric-teal/10 text-lg px-8 py-4"
          >
            <Play className="w-5 h-5 mr-2" />
            Watch Demo
          </Button>
        </motion.div>

        {/* Feature highlights */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20"
        >
          <div className="glass-effect rounded-2xl p-6 border border-electric-teal/20 hover:border-electric-teal/40 transition-all duration-300">
            <div className="w-12 h-12 bg-electric-gradient rounded-xl flex items-center justify-center mb-4 mx-auto neon-glow">
              <Brain className="w-6 h-6 text-deep-space" />
            </div>
            <h3 className="text-xl font-semibold text-electric-teal mb-2">AI Persona Engine</h3>
            <p className="text-soft-silver-dark">Analyze customer data to create detailed buyer personas and identify high-conversion targets</p>
          </div>

          <div className="glass-effect rounded-2xl p-6 border border-aurora-purple/20 hover:border-aurora-purple/40 transition-all duration-300">
            <div className="w-12 h-12 bg-aurora-gradient rounded-xl flex items-center justify-center mb-4 mx-auto aurora-glow">
              <Sparkles className="w-6 h-6 text-deep-space" />
            </div>
            <h3 className="text-xl font-semibold text-aurora-purple mb-2">Smart Channel Matching</h3>
            <p className="text-soft-silver-dark">Automatically identify optimal platforms and generate Gen Z-friendly content</p>
          </div>

          <div className="glass-effect rounded-2xl p-6 border border-neon-coral/20 hover:border-neon-coral/40 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-neon-coral to-pink-500 rounded-xl flex items-center justify-center mb-4 mx-auto coral-glow">
              <Zap className="w-6 h-6 text-deep-space" />
            </div>
            <h3 className="text-xl font-semibold text-neon-coral mb-2">Predictive Targeting</h3>
            <p className="text-soft-silver-dark">Use AI to predict customer behavior and optimize marketing strategies for Gen Z audiences</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
