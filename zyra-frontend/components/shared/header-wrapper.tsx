"use client"

import { usePathname } from 'next/navigation'
import { Header } from './header'

/**
 * HeaderWrapper - Conditionally renders Header on public pages
 * Excludes dashboard pages which have their own layout with Sidebar/TopBar
 */
export function HeaderWrapper() {
  const pathname = usePathname()
  
  // Don't show header on dashboard pages (they have their own layout)
  if (pathname?.startsWith('/dashboard')) {
    return null
  }
  
  // Show header on all other pages
  return <Header />
}
