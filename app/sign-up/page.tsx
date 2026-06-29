import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-helpers'
import { AuthForm } from '@/components/auth-form'

export const metadata = {
  title: 'Sign Up - InvestIQ',
  description: 'Create your InvestIQ account',
}

export default async function SignUpPage() {
  const session = await getSession()
  if (session?.user) {
    redirect('/')
  }

  return <AuthForm mode="sign-up" />
}
