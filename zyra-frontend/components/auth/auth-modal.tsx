'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/contexts/auth-context'

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phoneNumber: z.string().optional()
})

const otpSchema = z.object({
  otpCode: z.string().length(6, 'OTP must be 6 digits')
})

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: 'login' | 'signup'
}

type AuthMode = 'login' | 'signup' | 'otp-email' | 'otp-sms'

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const { login } = useAuth()

  // Forms
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  })

  const signupForm = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', phoneNumber: '' }
  })

  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otpCode: '' }
  })

  // API calls
  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true)
    try {
      const result = await apiClient.login(data.email, data.password)
      
      if (result.success) {
        apiClient.setToken(result.data.token)
        login(result.data.token, result.data.user)
        toast.success('Login successful!')
        onClose()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (data: z.infer<typeof signupSchema>) => {
    setIsLoading(true)
    try {
      const result = await apiClient.register(data)
      
      if (result.success) {
        setUserEmail(data.email)
        setUserPhone(data.phoneNumber || '')
        toast.success('Account created! Please verify your email.')
        setMode('otp-email')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = () => {
    window.location.href = apiClient.getGoogleAuthUrl()
  }

  const handleSendOTP = async (type: 'email' | 'sms') => {
    setIsLoading(true)
    try {
      const result = type === 'email' 
        ? await apiClient.sendEmailOTP(userEmail)
        : await apiClient.sendSMSOTP(userPhone)
      
      if (result.success) {
        toast.success(`OTP sent to your ${type}`)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error(`Failed to send OTP to ${type}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (data: z.infer<typeof otpSchema>) => {
    setIsLoading(true)
    try {
      const result = await apiClient.verifyOTP(
        data.otpCode,
        mode === 'otp-email' ? 'email' : 'sms',
        mode === 'otp-email' ? userEmail : undefined,
        mode === 'otp-sms' ? userPhone : undefined
      )
      
      if (result.success) {
        apiClient.setToken(result.data.token)
        login(result.data.token, result.data.user)
        toast.success('Verification successful!')
        onClose()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetMode = () => {
    setMode(defaultMode)
    setUserEmail('')
    setUserPhone('')
    loginForm.reset()
    signupForm.reset()
    otpForm.reset()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 min-h-screen"
          style={{ paddingTop: '10vh' }}
        >
          {/* Backdrop with enhanced fade effect */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute inset-0 bg-black/80 backdrop-blur-lg"
            onClick={onClose}
          />

          {/* Modal with enhanced centering and animations */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.25, 0.46, 0.45, 0.94],
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
            className="relative w-full max-w-md glass-card p-8 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl bg-gradient-to-br from-white/20 to-white/10 mx-auto my-auto max-h-[85vh] overflow-y-auto ring-2 ring-white/10 shadow-[0_0_50px_rgba(139,92,246,0.3)]"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110"
            >
              <X className="w-5 h-5 text-zyra-text-secondary hover:text-zyra-text" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-cyber font-bold gradient-text mb-2">
                {mode === 'login' && 'Welcome Back'}
                {mode === 'signup' && 'Join Zyra'}
                {mode === 'otp-email' && 'Verify Email'}
                {mode === 'otp-sms' && 'Verify Phone'}
              </h2>
              <p className="text-zyra-text-secondary">
                {mode === 'login' && 'Sign in to your account'}
                {mode === 'signup' && 'Create your account to get started'}
                {mode === 'otp-email' && 'Enter the code sent to your email'}
                {mode === 'otp-sms' && 'Enter the code sent to your phone'}
              </p>
            </div>

            {/* Login Form */}
            {mode === 'login' && (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zyra-text mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary" />
                    <input
                      {...loginForm.register('email')}
                      type="email"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-red-400 text-sm mt-1">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zyra-text mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary" />
                    <input
                      {...loginForm.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zyra-text-secondary hover:text-zyra-text transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-red-400 text-sm mt-1">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full neon-button py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-zyra-cyan-blue hover:text-zyra-electric-violet transition-colors"
                  >
                    Don't have an account? Sign up
                  </button>
                </div>
              </form>
            )}

            {/* Signup Form */}
            {mode === 'signup' && (
              <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zyra-text mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary" />
                      <input
                        {...signupForm.register('firstName')}
                        type="text"
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors"
                        placeholder="First name"
                      />
                    </div>
                    {signupForm.formState.errors.firstName && (
                      <p className="text-red-400 text-sm mt-1">
                        {signupForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zyra-text mb-2">
                      Last Name
                    </label>
                    <input
                      {...signupForm.register('lastName')}
                      type="text"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors"
                      placeholder="Last name"
                    />
                    {signupForm.formState.errors.lastName && (
                      <p className="text-red-400 text-sm mt-1">
                        {signupForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zyra-text mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary" />
                    <input
                      {...signupForm.register('email')}
                      type="email"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                  {signupForm.formState.errors.email && (
                    <p className="text-red-400 text-sm mt-1">
                      {signupForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zyra-text mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary" />
                    <input
                      {...signupForm.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zyra-text-secondary hover:text-zyra-text transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {signupForm.formState.errors.password && (
                    <p className="text-red-400 text-sm mt-1">
                      {signupForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zyra-text mb-2">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary" />
                    <input
                      {...signupForm.register('phoneNumber')}
                      type="tel"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full neon-button py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-zyra-cyan-blue hover:text-zyra-electric-violet transition-colors"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </form>
            )}

            {/* OTP Verification Forms */}
            {(mode === 'otp-email' || mode === 'otp-sms') && (
              <form onSubmit={otpForm.handleSubmit(handleVerifyOTP)} className="space-y-6">
                <div className="text-center mb-6">
                  <p className="text-zyra-text-secondary">
                    We sent a 6-digit code to{' '}
                    <span className="text-zyra-cyan-blue font-medium">
                      {mode === 'otp-email' ? userEmail : userPhone}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zyra-text mb-2">
                    Verification Code
                  </label>
                  <input
                    {...otpForm.register('otpCode')}
                    type="text"
                    maxLength={6}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-center text-2xl tracking-widest"
                    placeholder="000000"
                  />
                  {otpForm.formState.errors.otpCode && (
                    <p className="text-red-400 text-sm mt-1">
                      {otpForm.formState.errors.otpCode.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full neon-button py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>

                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={() => handleSendOTP(mode === 'otp-email' ? 'email' : 'sms')}
                    className="text-zyra-cyan-blue hover:text-zyra-electric-violet transition-colors"
                  >
                    Resend Code
                  </button>
                  <div>
                    <button
                      type="button"
                      onClick={resetMode}
                      className="text-zyra-text-secondary hover:text-zyra-text transition-colors"
                    >
                      Back to {defaultMode === 'login' ? 'Sign In' : 'Sign Up'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Google Auth Button */}
            {mode === 'login' && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-zyra-bg text-zyra-text-secondary">Or continue with</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleAuth}
                  className="w-full mt-4 flex items-center justify-center space-x-2 py-3 px-4 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
