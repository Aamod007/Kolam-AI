
import { SignInForm } from '@/components/site/auth-modal';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 font-display px-2 sm:px-0">
      <div className="w-full max-w-lg mx-auto sm:p-0 p-2">
        <div className="mb-8 text-left md:text-center">
              <h1 className="text-3xl sm:text-4xl font-bold font-serif text-cyan-700 drop-shadow-xl mb-2 tracking-tight leading-tight">
                <span className="whitespace-nowrap">Welcome Back to Kolam&nbsp;AI!</span>
              </h1>
          <p className="text-base sm:text-lg text-white/80 font-display mb-2 drop-shadow">Sign in to explore, create, and share beautiful Kolam patterns.</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-100/80 via-white to-blue-100/80 border border-cyan-300 p-4 sm:p-8 rounded-2xl shadow-xl">
          <SignInForm />
        </div>
        <div className="mt-6 text-center text-sm sm:text-base">
          <span className="text-muted-foreground">Don&#39;t have an account?</span>
          <Link href="/signup" className="ml-2 text-cyan-700 font-semibold underline hover:text-blue-600 transition">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}