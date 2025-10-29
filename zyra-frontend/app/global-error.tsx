'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error)
  }, [error])

  return (
    <html>
      <body>
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
                className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </motion.div>
              
              <h1 className="text-2xl font-cyber font-bold text-white mb-4">
                Application Error
              </h1>
              
              <p className="text-zyra-text-secondary mb-6">
                A critical error occurred in the application. Please try refreshing the page.
              </p>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-6 text-left">
                  <p className="text-sm text-red-400 font-mono">
                    {error.message}
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={reset}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 text-white rounded-xl font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Try again</span>
                </motion.button>
                
                <Link href="/">
                  <motion.button
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Home className="w-5 h-5" />
                    <span>Go home</span>
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </body>
    </html>
  )
}
