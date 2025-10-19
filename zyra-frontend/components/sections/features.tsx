"use client"

import { motion } from "framer-motion"
import { 
  Brain, 
  Zap, 
  BarChart3, 
  Workflow, 
  Database, 
  Shield, 
  Clock, 
  Users,
  ArrowRight,
  Sparkles
} from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI Persona Engine",
    description: "Analyze customer data to create detailed buyer personas like 'Tech-Savvy Parents', 'Young Professionals', and 'Family Shoppers' with conversion probability scores.",
    color: "electric-teal",
    gradient: "electric-gradient"
  },
  {
    icon: Zap,
    title: "Smart Channel Matching",
    description: "Automatically identify optimal platforms (TikTok, Instagram, WhatsApp) for each persona and generate platform-specific content strategies.",
    color: "aurora-purple",
    gradient: "aurora-gradient"
  },
  {
    icon: BarChart3,
    title: "Intent-Based Marketing",
    description: "Analyze trending keywords and emotional tone to generate content that resonates with diverse audience preferences and current online conversations.",
    color: "neon-coral",
    gradient: "coral-gradient"
  },
  {
    icon: Users,
    title: "Predictive Targeting",
    description: "Use AI to identify high-conversion customers based on behavior patterns, location, and interest similarity for maximum ROI.",
    color: "electric-teal",
    gradient: "electric-gradient"
  },
  {
    icon: Workflow,
    title: "AI Campaign Composer",
    description: "Generate authentic content tailored to different demographics with multiple variants for A/B testing, including captions, hashtags, and posting schedules.",
    color: "aurora-purple",
    gradient: "aurora-gradient"
  },
  {
    icon: Shield,
    title: "Trust & Lead Verification",
    description: "Score customers by engagement and purchase behavior to filter out bots, spam, and low-quality prospects automatically.",
    color: "neon-coral",
    gradient: "coral-gradient"
  }
]

export const Features = () => {
  return (
    <section className="py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center space-x-2 bg-electric-teal/10 border border-electric-teal/20 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-electric-teal" />
            <span className="text-sm text-electric-teal font-medium">AI Marketing Intelligence</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-8">
            <span className="bg-electric-gradient bg-clip-text text-transparent glow-text">
              Core Capabilities
            </span>
          </h2>
          
          <p className="text-xl text-soft-silver max-w-3xl mx-auto">
            Zyra combines AI-driven personalization, automation intelligence, and real-time learning to make every product reach the right person at the right time
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-effect rounded-2xl p-8 border border-soft-silver/10 hover:border-electric-teal/30 transition-all duration-300 group"
            >
              <div className={`w-16 h-16 bg-${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-deep-space" />
              </div>
              
              <h3 className={`text-2xl font-semibold text-${feature.color} mb-4`}>
                {feature.title}
              </h3>
              
              <p className="text-soft-silver-dark mb-6 leading-relaxed">
                {feature.description}
              </p>
              
              <div className="flex items-center text-electric-teal group-hover:text-electric-teal-dark transition-colors duration-300">
                <span className="text-sm font-medium">Learn more</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="glass-effect rounded-2xl p-12 border border-electric-teal/20 max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-electric-gradient rounded-3xl flex items-center justify-center mb-8 mx-auto neon-glow">
              <Users className="w-10 h-10 text-deep-space" />
            </div>
            
            <h3 className="text-3xl font-display font-bold text-electric-teal mb-4">
              Ready to boost your sales with AI?
            </h3>
            
            <p className="text-lg text-soft-silver mb-8 max-w-2xl mx-auto">
              Join thousands of businesses who are already using Zyra to automate their marketing and reach Gen Z audiences with precision targeting.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-electric-gradient hover:scale-105 transition-all duration-300 neon-glow text-lg px-8 py-4 rounded-xl font-semibold">
                Start Free Trial
              </button>
              <button className="glass-effect border border-electric-teal/30 text-electric-teal hover:bg-electric-teal/10 text-lg px-8 py-4 rounded-xl font-semibold">
                Schedule Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
