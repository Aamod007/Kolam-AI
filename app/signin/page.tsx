import { SignInForm } from '@/components/site/auth-modal';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <SignInForm />
      <div className="mt-4 text-center">
        <Link href="/signup" className="text-primary underline">Don&#39;t have an account? Sign Up</Link>
      </div>
    </div>
  );
}
