'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { TrendingUp } from 'lucide-react'

interface User {
  id: string
  name?: string | null
  email: string
  image?: string | null
}

interface DashboardHeaderProps {
  user: User
}

const navLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/compare', label: 'Compare' },
  { href: '/research', label: 'Research' },
]

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await authClient.signOut()
      window.location.href = '/'
    } catch {
      window.location.href = '/'
    }
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold hidden sm:inline">InvestIQ</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Button
                  key={link.href}
                  variant={pathname === link.href ? 'secondary' : 'ghost'}
                  size="sm"
                  className="text-sm"
                  nativeButton={false}
                  render={<Link href={link.href}>{link.label}</Link>}
                />
              ))}
            </nav>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-semibold">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-sm max-w-[160px] truncate">
                    {user.name || user.email}
                  </span>
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                {user.email}
              </DropdownMenuItem>
              <DropdownMenuItem className="md:hidden" render={<Link href="/">Dashboard</Link>} />
              <DropdownMenuItem className="md:hidden" render={<Link href="/compare">Compare</Link>} />
              <DropdownMenuItem className="md:hidden" render={<Link href="/research">Research</Link>} />
              <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
