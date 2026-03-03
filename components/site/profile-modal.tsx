import { useState, useEffect } from 'react';

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

import { useAuth } from './auth-context';

export function ProfileModal({ onClose }: { onClose: () => void }) {
  const auth = useAuth();
  const user = auth?.user;
  const [username, setUsername] = useState('');
  const [description, setDescription] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then((data) => {
          if (data) {
            setUsername(data.username || '');
            setDescription(data.description || '');
            setProfileImageUrl(data.profile_image_url || '');
          }
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          description,
          profile_image_url: profileImageUrl
        })
      });
      if (!res.ok) {
        throw new Error('Failed to update profile');
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <Card className="w-full max-w-md p-8 shadow-lg rounded-xl bg-white dark:bg-gray-900">
        <h2 className="text-2xl font-bold mb-4 text-center text-primary">Edit Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="profileImageUrl">Profile Image URL</Label>
            <Input id="profileImageUrl" value={profileImageUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileImageUrl(e.target.value)} />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </form>
        <Button variant="ghost" className="absolute top-2 right-2" onClick={onClose}>
          ×
        </Button>
      </Card>
    </div>
  );
}
