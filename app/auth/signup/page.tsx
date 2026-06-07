import { SignupForm } from '@/components/auth/signup-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SignupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/account')

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <a href="/" className="inline-block mb-10">
          <span className="font-space text-2xl font-bold tracking-tight text-black">
            NEPASET<span className="inline-block w-2 h-2 bg-black rounded-full ml-0.5 mb-0.5 align-middle" />
          </span>
        </a>
        <h1 className="font-space text-2xl font-semibold tracking-tight text-black mb-1">
          Create account
        </h1>
        <p className="text-sm text-neutral-500 mb-8 font-inter">
          Join the community
        </p>
        <SignupForm />
        <p className="text-xs text-neutral-400 text-center mt-6 font-inter">
          Already have an account?{' '}
          <a href="/auth/login" className="text-black font-medium hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}