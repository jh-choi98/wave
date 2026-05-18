'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const TAB_BAR_HEIGHT = 'h-16'

const tabs = [
  { href: '/', label: '홈', icon: Home },
  { href: '/records', label: '기록', icon: BookOpen },
] as const

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-[100dvh] pb-16">
      {children}
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 flex border-t bg-background',
          TAB_BAR_HEIGHT
        )}
      >
        {tabs.map((tab) => {
          const active =
            tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 text-xs',
                active ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
