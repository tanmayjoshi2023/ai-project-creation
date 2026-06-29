import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-helpers'
import { AuthForm } from '@/components/auth-form'

export const metadata = {
  title: 'Sign In - InvestIQ',
  description: 'Sign in to your InvestIQ account',
}

export default async function SignInPage() {
  const session = await getSession()
  if (session?.user) {
    redirect('/')
  }

  return <AuthForm mode="sign-in" />
}
