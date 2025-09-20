"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/site/auth-context";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Camera, User, Mail, Edit3, Save, X, Upload, LogOut, ArrowLeft, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [preferGemini, setPreferGemini] = useState<boolean>(true)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
    .select("username, description, profile_image_url, prefer_gemini")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setUsername(data.username || "");
            setDescription(data.description || "");
            setProfileImageUrl(data.profile_image_url || "");
      if (typeof data.prefer_gemini === 'boolean') setPreferGemini(Boolean(data.prefer_gemini))
          }
        });
    }
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError("");
    setSuccess("");
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        username,
        description,
        profile_image_url: profileImageUrl,
  prefer_gemini: preferGemini,
      });
    if (error) setError(error.message);
    else {
      setSuccess("Profile updated successfully!");
      setEditMode(false);
    }
    setLoading(false);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUploadError("");
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Only image files are allowed.");
      return;
    }
    setUploading(true);
    
    // Use consistent filename based on user ID to always update the same file
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `avatars/${user.id}.${fileExt}`;
    
    try {
      // First, list existing files for this user to delete them
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list('avatars', {
          search: user.id
        });
      
      // Delete all existing avatar files for this user
      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `avatars/${f.name}`);
        await supabase.storage.from('avatars').remove(filesToDelete);
      }
      
      // Upload the new file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true // This should overwrite if file exists
        });
        
      if (uploadError) {
        setUploadError(uploadError.message);
        setUploading(false);
        return;
      }
      
      // Get the public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      if (data?.publicUrl) {
        setProfileImageUrl(data.publicUrl);
      } else {
        setUploadError("Failed to get public URL.");
      }
    } catch (error) {
      setUploadError("Failed to update avatar. Please try again.");
      console.error('Avatar upload error:', error);
    }
    
    setUploading(false);
  }

  function triggerFileInput() {
    if (fileInputRef.current) fileInputRef.current.click();
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    // Redirect to home page after sign out
    window.location.href = '/';
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 font-display">
        <Card className="w-full max-w-md p-8 shadow-2xl rounded-2xl border bg-gradient-to-br from-cyan-100/80 via-white to-blue-100/80 backdrop-blur text-card-foreground mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-cyan-200/40 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-cyan-700" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-cyan-700 font-serif drop-shadow">Not signed in</h2>
          <p className="mb-6 text-white/80 font-display drop-shadow">You must be signed in to view your profile.</p>
          <Link href="/signin">
            <Button className="w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 text-white font-bold shadow-lg hover:from-blue-600 hover:to-cyan-500 transition-all duration-200 transform hover:scale-105 rounded-xl">
              Go to Sign In
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 font-display p-4">
      <Card className="w-full max-w-lg p-8 shadow-2xl rounded-2xl border bg-gradient-to-br from-cyan-100/80 via-white to-blue-100/80 backdrop-blur text-card-foreground mx-auto relative">
        {/* Back button */}
        <button
          className="absolute top-4 left-4 flex items-center gap-2 text-muted-foreground hover:text-cyan-700 transition-colors z-10 bg-white/80 dark:bg-gray-900/80 rounded-full p-2 shadow"
          onClick={() => router.push("/")}
          aria-label="Go home"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline text-base font-medium">Home</span>
        </button>
        {!editMode ? (
          <div className="flex flex-col items-center gap-6">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-cyan-300 bg-gradient-to-br from-cyan-100/80 to-blue-100/80 flex items-center justify-center shadow-lg">
                {profileImageUrl ? (
                  <Image src={profileImageUrl} alt="Profile" width={128} height={128} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl text-cyan-700 font-bold">
                    {username ? username[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : '-')}
                  </span>
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-bold text-cyan-700 font-serif drop-shadow">
                {username || <span className="italic text-muted-foreground">No username</span>}
              </h1>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{user.email ?? '-'}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Preference: <span className="font-medium">{preferGemini ? 'Gemini-first' : 'Dataset-first'}</span>
              </div>
              <div className="text-base text-muted-foreground max-w-sm">
                {description || <span className="italic">No description</span>}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-3">
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 text-white font-bold shadow-lg hover:from-blue-600 hover:to-cyan-500 transition-all duration-200 transform hover:scale-105 rounded-xl" 
                onClick={() => setEditMode(true)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-2 border-cyan-300 text-cyan-700 font-semibold hover:bg-cyan-100 hover:text-cyan-900 hover:border-cyan-400 transition-all duration-200" 
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>

            {/* Success Message */}
            {success && (
              <div className="w-full bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-600 text-sm font-medium animate-in slide-in-from-top-2 duration-300">
                {success}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-cyan-700 font-serif drop-shadow mb-2">Edit Profile</h2>
              <p className="text-muted-foreground">Update your profile information</p>
            </div>

            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center gap-4">
              <div
                className={`relative group cursor-pointer transition-all duration-200 ${uploading ? 'opacity-60 pointer-events-none' : 'hover:scale-105'}`}
                onClick={triggerFileInput}
              >
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-cyan-300 bg-gradient-to-br from-cyan-100/80 to-blue-100/80 flex items-center justify-center shadow-lg">
                  {profileImageUrl ? (
                    <Image src={profileImageUrl} alt="Profile" width={96} height={96} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl text-cyan-700 font-bold">
                      {username ? username[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : '-')}
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                {uploading && (
                  <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground text-center">Click to change profile image</p>
              {uploadError && (
                <div className="w-full bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-600 text-xs font-medium">
                  {uploadError}
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-sm font-medium text-gray-800 mb-2 block">
                  Username
                </Label>
                <Input 
                  id="username" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  required 
                  className="h-12 rounded-xl border-2 focus:border-primary transition-colors duration-200 text-gray-800 bg-white" 
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-800 mb-2 block">
                  Description
                </Label>
                <Input 
                  id="description" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  className="h-12 rounded-xl border-2 focus:border-primary transition-colors duration-200 text-gray-800 bg-white" 
                  placeholder="Tell us about yourself"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="preferGemini"
                  type="checkbox"
                  checked={preferGemini}
                  onChange={(e) => setPreferGemini(e.target.checked)}
                  className="h-5 w-5 rounded"
                />
                <Label htmlFor="preferGemini" className="text-sm font-medium text-gray-800 block">Prefer Gemini-first</Label>
                <button type="button" aria-label="Preference help" className="ml-1 text-muted-foreground" title="Gemini-first: run Gemini model first and store its answer; Dataset-first: run local dataset heuristics first. Note: our dataset is currently being expanded and trained using user contributions; dataset results may be less accurate until training completes.">
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <div>
                <Label htmlFor="profileImageUrl" className="text-sm font-medium text-gray-800 mb-2 block">
                  Profile Image URL
                </Label>
                <Input 
                  id="profileImageUrl" 
                  value={profileImageUrl} 
                  onChange={e => setProfileImageUrl(e.target.value)} 
                  className="h-12 rounded-xl border-2 focus:border-primary transition-colors duration-200 text-gray-800 bg-white" 
                  placeholder="Or paste an image URL"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button 
                type="submit" 
                className="flex-1 h-12 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 text-white font-bold shadow-lg hover:from-blue-600 hover:to-cyan-500 transition-all duration-200 transform hover:scale-105 rounded-xl" 
                disabled={loading || uploading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 h-12 border-2 border-cyan-300 text-cyan-700 font-semibold hover:bg-cyan-100 hover:text-cyan-900 hover:border-cyan-400 transition-all duration-200" 
                onClick={() => setEditMode(false)} 
                disabled={loading || uploading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}