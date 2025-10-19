"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, File, X, CheckCircle, AlertCircle, Brain, BarChart3 } from "lucide-react"

interface DataUploadProps {
  onUploadComplete?: (file: File) => void
}

export const DataUpload = ({ onUploadComplete }: DataUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle')
  const [progress, setProgress] = useState(0)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [])

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file)
    setUploadStatus('uploading')
    setProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploadStatus('processing')
          
          // Simulate AI processing
          setTimeout(() => {
            setUploadStatus('completed')
            onUploadComplete?.(file)
          }, 2000)
          
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const resetUpload = () => {
    setUploadedFile(null)
    setUploadStatus('idle')
    setProgress(0)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-8 border border-soft-silver/10"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-electric-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 neon-glow">
            <Upload className="w-8 h-8 text-deep-space" />
          </div>
          <h3 className="text-2xl font-semibold text-electric-teal mb-2">Upload Your Data</h3>
          <p className="text-soft-silver-dark">
            Upload CSV, Excel, or JSON files for AI analysis and insights
          </p>
        </div>

        <AnimatePresence mode="wait">
          {uploadStatus === 'idle' && (
            <motion.div
              key="upload-area"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                isDragOver 
                  ? 'border-electric-teal bg-electric-teal/10' 
                  : 'border-soft-silver/30 hover:border-electric-teal/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="w-20 h-20 bg-electric-teal/10 rounded-2xl flex items-center justify-center mx-auto">
                  <File className="w-10 h-10 text-electric-teal" />
                </div>
                <div>
                  <p className="text-lg font-medium text-soft-silver mb-2">
                    Drag and drop your file here
                  </p>
                  <p className="text-soft-silver-dark text-sm mb-4">
                    or click to browse files
                  </p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,.json"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-6 py-3 bg-electric-gradient hover:scale-105 transition-all duration-300 neon-glow text-deep-space font-semibold rounded-xl cursor-pointer"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Choose File
                  </label>
                </div>
                <p className="text-xs text-soft-silver-dark">
                  Supports CSV, Excel (.xlsx, .xls), and JSON files up to 10MB
                </p>
              </div>
            </motion.div>
          )}

          {uploadStatus === 'uploading' && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 bg-aurora-gradient rounded-2xl flex items-center justify-center mx-auto aurora-glow">
                <Upload className="w-8 h-8 text-deep-space animate-pulse" />
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-aurora-purple mb-2">Uploading...</h4>
                <p className="text-soft-silver-dark text-sm mb-4">
                  {uploadedFile?.name}
                </p>
                
                <div className="w-full bg-deep-space-light rounded-full h-2 mb-2">
                  <motion.div
                    className="h-2 bg-aurora-gradient rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-sm text-soft-silver">{progress}% complete</p>
              </div>
            </motion.div>
          )}

          {uploadStatus === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-neon-coral to-pink-500 rounded-2xl flex items-center justify-center mx-auto coral-glow">
                <Brain className="w-8 h-8 text-deep-space animate-pulse" />
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-neon-coral mb-2">AI Processing...</h4>
                <p className="text-soft-silver-dark text-sm mb-4">
                  Analyzing your data with advanced AI algorithms
                </p>
                
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-neon-coral rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-neon-coral rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-neon-coral rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </motion.div>
          )}

          {uploadStatus === 'completed' && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 bg-electric-gradient rounded-2xl flex items-center justify-center mx-auto neon-glow">
                <CheckCircle className="w-8 h-8 text-deep-space" />
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-electric-teal mb-2">Upload Complete!</h4>
                <p className="text-soft-silver-dark text-sm mb-4">
                  Your data has been processed and is ready for analysis
                </p>
                
                <div className="flex items-center justify-center space-x-4">
                  <button className="px-6 py-3 bg-electric-gradient hover:scale-105 transition-all duration-300 neon-glow text-deep-space font-semibold rounded-xl flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>View Analysis</span>
                  </button>
                  <button 
                    onClick={resetUpload}
                    className="px-6 py-3 glass-effect border border-soft-silver/30 text-soft-silver hover:text-electric-teal hover:border-electric-teal/50 transition-all duration-300 font-semibold rounded-xl flex items-center space-x-2"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload Another</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

