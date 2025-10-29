'use client'

import { motion } from 'framer-motion'
import { FileX, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zyra-gradient cyber-grid flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="glass-card p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-zyra-cyan-blue/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FileX className="w-8 h-8 text-zyra-cyan-blue" />
          </motion.div>
          
          <h1 className="text-4xl font-cyber font-bold gradient-text mb-4">
            404
          </h1>
          
          <h2 className="text-2xl font-semibold text-white mb-4">
            Page Not Found
          </h2>
          
          <p className="text-zyra-text-secondary mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/">
              <motion.button
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 text-white rounded-xl font-medium transition-colors w-full sm:w-auto"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Home className="w-5 h-5" />
                <span>Go Home</span>
              </motion.button>
            </Link>
            
            <motion.button
              onClick={() => window.history.back()}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-colors w-full sm:w-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
