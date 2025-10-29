'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const userParam = searchParams.get('user')
    const error = searchParams.get('error')

    if (error) {
      console.error('Auth error:', error)
      router.push('/?error=auth_failed')
      return
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam))
        
        // Store auth data in context
        login(token, user)
        
        // Redirect to dashboard
        router.push('/dashboard')
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/?error=invalid_data')
      }
    } else {
      // No auth data, redirect to home
      router.push('/')
    }
  }, [searchParams, login, router])

  return (
    <div className="min-h-screen bg-zyra-gradient flex items-center justify-center">
      <div className="glass-card p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zyra-cyan-blue mx-auto mb-4"></div>
        <h2 className="text-xl font-cyber font-bold gradient-text mb-2">
          Completing Authentication
        </h2>
        <p className="text-zyra-text-secondary">
          Please wait while we set up your account...
        </p>
      </div>
    </div>
  )
}

