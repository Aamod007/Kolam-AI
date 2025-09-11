import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface CommunityPostModalProps {
  image: string; // base64 or url
  details: string;
  open: boolean;
  onClose: () => void;
  onPost: (description: string) => Promise<void>;
}

export function CommunityPostModal({ image, details, open, onClose, onPost }: CommunityPostModalProps) {
  const [description, setDescription] = useState(details);

  // Ensure Gemini details are filled in when modal opens
  useEffect(() => {
    setDescription(details);
  }, [details, open]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handlePost() {
    setLoading(true);
    setError(null);
    try {
      await onPost(description);
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to post");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-muted rounded-xl shadow-xl p-6 w-full max-w-md border">
        <h2 className="text-xl font-bold mb-2">Post Your Kolam Design</h2>
            <Image src={image} alt="Kolam" width={40} height={40} className="w-full max-h-48 object-contain rounded border mb-3" />
        <label className="block text-sm font-semibold mb-1">Description</label>
        <textarea
          className="w-full border rounded px-2 py-2 mb-2 text-gray-900 bg-white"
          rows={4}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <div className="flex gap-2 mt-2">
          <Button onClick={handlePost} disabled={loading} className="bg-teal-600 text-white">
            {loading ? "Posting…" : "Post to Community Hub"}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Skip</Button>
        </div>
      </div>
    </div>
  );
}
