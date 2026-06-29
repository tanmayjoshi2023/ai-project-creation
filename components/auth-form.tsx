'use client'

import { useState } from 'react'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

interface AuthFormProps {
  mode: 'sign-in' | 'sign-up'
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result =
        mode === 'sign-up'
          ? await authClient.signUp.email({
              email,
              password,
              name: name || email.split('@')[0],
            })
          : await authClient.signIn.email({
              email,
              password,
            })

      if (result.error) {
        throw new Error(result.error.message || 'Authentication failed')
      }

      setSuccess(true)

      // Wait until the browser has a valid session cookie before redirecting
      for (let attempt = 0; attempt < 15; attempt++) {
        const session = await authClient.getSession()
        if (session.data?.user) {
          window.location.href = '/'
          return
        }
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      throw new Error('Session could not be established. Please try signing in again.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="w-full max-w-md space-y-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to home
        </Link>
      <Card className="w-full shadow-xl">
        <CardHeader className="space-y-3 pb-6">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              InvestIQ
            </CardTitle>
            <h2 className="text-xl font-semibold text-foreground">
              {mode === 'sign-in' ? 'Welcome Back' : 'Start Investing Smarter'}
            </h2>
          </div>
          <CardDescription className="text-base">
            {mode === 'sign-in'
              ? 'Sign in to access your investment analysis dashboard'
              : 'Create an account to get AI-powered investment research'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'sign-up' && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="h-10 rounded-lg"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="h-10 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="h-10 rounded-lg"
              />
            </div>

            {error && (
              <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="text-sm text-destructive font-medium">{error}</div>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-600 font-medium">
                  {mode === 'sign-up' ? 'Account created! Redirecting...' : 'Signed in successfully! Redirecting...'}
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 rounded-lg font-semibold text-base transition-all hover:shadow-lg"
              disabled={isLoading || success}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {success ? 'Redirecting...' : mode === 'sign-in' ? 'Sign In' : 'Create Account'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {mode === 'sign-in' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <Link href="/sign-up" className="text-primary font-semibold hover:underline transition-colors">
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Link href="/sign-in" className="text-primary font-semibold hover:underline transition-colors">
                    Sign in
                  </Link>
                </>
              )}
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                {mode === 'sign-up'
                  ? 'By signing up, you agree to our Terms of Service and Privacy Policy'
                  : 'Secure authentication powered by Better Auth'}
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
