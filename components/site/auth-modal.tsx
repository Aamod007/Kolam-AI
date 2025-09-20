'use client'

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
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
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) setError(result.error.message);
    setLoading(false);
    if (result.data.session && onSuccess) onSuccess();
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/profile`
      }
    });
    if (error) setError(error.message);
    setLoading(false);
  }

  return (
    <Card className="w-full max-w-md p-8 shadow-xl rounded-2xl border bg-gradient-to-br from-cyan-100/80 via-white to-blue-100/80 text-gray-800 mx-auto mt-16 font-display">
      <h2 className="text-3xl font-bold font-serif mb-6 text-center text-cyan-700 drop-shadow">Sign In</h2>
      <form onSubmit={handleSignIn} className="space-y-5">
        <div>
          <Label htmlFor="email" className="text-gray-800">Email</Label>
          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 focus-visible:ring-2 focus-visible:ring-primary" />
        </div>
        <div>
          <Label htmlFor="password" className="text-gray-800">Password</Label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 focus-visible:ring-2 focus-visible:ring-primary" />
        </div>
        {error && <div className="text-destructive bg-destructive/10 border border-destructive rounded px-3 py-2 text-sm font-medium animate-pulse">{error}</div>}
        <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 text-white font-bold shadow-lg hover:from-blue-600 hover:to-cyan-500 transition-all duration-200 transform hover:scale-105 rounded-xl" disabled={loading}>
          {loading ? 'Loading...' : 'Sign In'}
        </Button>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        
        <Button
          type="button"
          className="button w-full mt-4"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <div className="wrap flex items-center justify-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <p>
              Continue with Google
            </p>
          </div>
        </Button>
      </div>
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
    const result = await supabase.auth.signUp({ email, password });
    // Create profile row after sign-up
    const user = result.data.user;
    if (user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        username: '',
        description: '',
        profile_image_url: '',
      });
    }
    if (result.error) setError(result.error.message);
    setLoading(false);
    if (result.data.session && onSuccess) onSuccess();
  }

  async function handleGoogleSignUp() {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/profile`
      }
    });
    if (error) setError(error.message);
    setLoading(false);
  }

  return (
    <Card className="w-full max-w-md p-8 shadow-xl rounded-2xl border bg-gradient-to-br from-cyan-100/80 via-white to-blue-100/80 text-gray-800 mx-auto mt-16 font-display">
      <h2 className="text-3xl font-bold font-serif mb-6 text-center text-cyan-700 drop-shadow">Sign Up</h2>
      <form onSubmit={handleSignUp} className="space-y-5">
        <div>
          <Label htmlFor="email" className="text-gray-800">Email</Label>
          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 focus-visible:ring-2 focus-visible:ring-primary" />
        </div>
        <div>
          <Label htmlFor="password" className="text-gray-800">Password</Label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 focus-visible:ring-2 focus-visible:ring-primary" />
        </div>
        {error && <div className="text-destructive bg-destructive/10 border border-destructive rounded px-3 py-2 text-sm font-medium animate-pulse">{error}</div>}
        <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 text-white font-bold shadow-lg hover:from-blue-600 hover:to-cyan-500 transition-all duration-200 transform hover:scale-105 rounded-xl" disabled={loading}>
          {loading ? 'Loading...' : 'Sign Up'}
        </Button>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        
        <Button
          type="button"
          className="button w-full mt-4"
          onClick={handleGoogleSignUp}
          disabled={loading}
        >
          <div className="wrap flex items-center justify-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <p>
              Continue with Google
            </p>
          </div>
        </Button>
      </div>
    </Card>
  );
}
