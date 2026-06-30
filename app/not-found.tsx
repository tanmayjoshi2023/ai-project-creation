import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TrendingUp, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-linear-to-br from-primary to-primary/70 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">InvestIQ</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <p className="text-7xl font-bold text-muted-foreground/30">404</p>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Page not found</h1>
            <p className="text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t exist or may have been moved.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="gap-2" nativeButton={false} render={
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            } />
            <Button variant="outline" nativeButton={false} render={
              <Link href="/sign-in">Sign In</Link>
            } />
          </div>
        </div>
      </main>
    </div>
  )
}
