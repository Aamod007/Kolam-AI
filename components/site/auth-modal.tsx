'use client'

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Card } from '../ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function SignInForm({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
    } else if (result?.ok) {
      if (onSuccess) onSuccess();
      window.location.href = '/profile';
    }

    setLoading(false);
  }

  return (
    <Card className="w-full max-w-md p-8 shadow-2xl rounded-3xl border-4 border-[#a67c52] bg-gradient-to-br from-[#f9e7c2]/90 via-[#fff]/80 to-[#a67c52]/80 text-[#7b1f1f] mx-auto mt-16 font-display" style={{ boxShadow: '0 4px 32px #7b1f1f55, 0 0 0 8px #f9e7c2aa' }}>
      <h2 className="text-4xl font-bold font-serif mb-6 text-center text-[#7b1f1f] drop-shadow-xl" style={{ fontFamily: 'Georgia, Times, serif', textShadow: '0 2px 8px #f9e7c2, 0 0px 1px #a67c52' }}>
        Sign In
      </h2>
      <form onSubmit={handleSignIn} className="space-y-5">
        <div>
          <Label htmlFor="email" className="text-[#7b1f1f] font-semibold">Email</Label>
          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 focus-visible:ring-2 focus-visible:ring-[#a67c52] bg-[#f9e7c2]/60 text-[#7b1f1f] border-[#a67c52]" />
        </div>
        <div>
          <Label htmlFor="password" className="text-[#7b1f1f] font-semibold">Password</Label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 focus-visible:ring-2 focus-visible:ring-[#a67c52] bg-[#f9e7c2]/60 text-[#7b1f1f] border-[#a67c52]" />
        </div>
        {error && <div className="text-destructive bg-destructive/10 border border-destructive rounded px-3 py-2 text-sm font-medium animate-pulse">{error}</div>}
        <Button type="submit" className="w-full bg-gradient-to-r from-[#a67c52] via-[#f9e7c2] to-[#7b1f1f] text-[#7b1f1f] font-bold shadow-lg hover:from-[#7b1f1f] hover:to-[#a67c52] hover:text-[#fff] transition-all duration-200 transform hover:scale-105 rounded-2xl border-2 border-[#a67c52]" disabled={loading}>
          {loading ? 'Loading...' : 'Sign In'}
        </Button>
      </form>
    </Card>
  );
}

export function SignUpForm({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error occurred during registration');
      }

      // If successful, log them in via NextAuth
      const signInResult = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInResult?.error) {
        setError(signInResult.error);
      } else if (signInResult?.ok) {
        if (onSuccess) onSuccess();
        window.location.href = '/profile';
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md p-8 shadow-2xl rounded-3xl border-4 border-[#a67c52] bg-gradient-to-br from-[#f9e7c2]/90 via-[#fff]/80 to-[#a67c52]/80 text-[#7b1f1f] mx-auto mt-16 font-display" style={{ boxShadow: '0 4px 32px #7b1f1f55, 0 0 0 8px #f9e7c2aa' }}>
      <h2 className="text-4xl font-bold font-serif mb-6 text-center text-[#7b1f1f] drop-shadow-xl" style={{ fontFamily: 'Georgia, Times, serif', textShadow: '0 2px 8px #f9e7c2, 0 0px 1px #a67c52' }}>
        Sign Up
      </h2>
      <form onSubmit={handleSignUp} className="space-y-5">
        <div>
          <Label htmlFor="email" className="text-[#7b1f1f] font-semibold">Email</Label>
          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 focus-visible:ring-2 focus-visible:ring-[#a67c52] bg-[#f9e7c2]/60 text-[#7b1f1f] border-[#a67c52]" />
        </div>
        <div>
          <Label htmlFor="password" className="text-[#7b1f1f] font-semibold">Password</Label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 focus-visible:ring-2 focus-visible:ring-[#a67c52] bg-[#f9e7c2]/60 text-[#7b1f1f] border-[#a67c52]" />
        </div>
        {error && <div className="text-destructive bg-destructive/10 border border-destructive rounded px-3 py-2 text-sm font-medium animate-pulse">{error}</div>}
        <Button type="submit" className="w-full bg-gradient-to-r from-[#a67c52] via-[#f9e7c2] to-[#7b1f1f] text-[#7b1f1f] font-bold shadow-lg hover:from-[#7b1f1f] hover:to-[#a67c52] hover:text-[#fff] transition-all duration-200 transform hover:scale-105 rounded-2xl border-2 border-[#a67c52]" disabled={loading}>
          {loading ? 'Loading...' : 'Sign Up'}
        </Button>
      </form>
    </Card>
  );
}
