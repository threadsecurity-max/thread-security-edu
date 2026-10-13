'use client';

import { useState, useEffect, useRef } from 'react';
import {
  User,
  Linkedin,
  Globe,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AuthorProfile {
  id?: string;
  name?: string;
  avatarUrl?: string | null;
  title?: string;
  company?: string;
  bio?: string;
  expertise?: string;
  linkedinUrl?: string | null;
  mediumUrl?: string | null;
  twitterUrl?: string | null;
  githubUrl?: string | null;
}

interface AuthorCredentialsCardProps {
  onProfileUpdated?: (profile: AuthorProfile) => void;
}

export function AuthorCredentialsCard({ onProfileUpdated }: AuthorCredentialsCardProps) {
  const [profile, setProfile] = useState<AuthorProfile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch author profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await fetch('/api/mentor/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfile(data.profile);
            if (onProfileUpdated) onProfileUpdated(data.profile);
          }
        }
      } catch (err: any) {
        console.error('Failed to load mentor profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // Save profile changes
  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/mentor/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update author credentials.');
      }

      setSuccess('Author profile & social links saved successfully!');
      if (onProfileUpdated) onProfileUpdated(profile);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      console.error('Error saving author profile:', err);
      setError(err.message || 'Failed to update author profile.');
    } finally {
      setSaving(false);
    }
  };

  // Upload Avatar to Cloudinary via direct URL prompt or file select
  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setError(null);

    try {
      // Use existing Cloudinary media upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', `${profile.name || 'Author'} Profile Photo`);

      // Upload via mentor media route or convert to data URL/mirror
      const res = await fetch('/api/mentor/blogs/temp/media', {
        method: 'POST',
        body: formData,
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        if (data.media?.url) {
          setProfile((prev) => ({ ...prev, avatarUrl: data.media.url }));
          setAvatarUploading(false);
          return;
        }
      }

      // If temp route not available, read as data URL for quick local preview / prompt
      const reader = new FileReader();
      reader.onload = async (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        setProfile((prev) => ({ ...prev, avatarUrl: base64 }));
        setAvatarUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      setError('Could not process avatar image.');
      setAvatarUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-[#0e0e0e] border border-white/10 text-white font-mono text-xs flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-[#C6FF34]" />
        <span>Loading Author Credentials...</span>
      </div>
    );
  }

  const isMissingAvatar = !profile.avatarUrl;
  const isMissingLinkedIn = !profile.linkedinUrl;

  return (
    <div className="p-6 rounded-2xl bg-[#0e0e0e] border border-white/10 text-white font-mono space-y-5 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <User className="w-4 h-4 text-[#C6FF34]" /> AUTHOR PROFILE & CREDENTIALS
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Published at the bottom of your research articles for Google E-E-A-T indexing and reader trust.
          </p>
        </div>
        <span className="text-[10px] bg-[#C6FF34]/15 border border-[#C6FF34]/30 text-[#C6FF34] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> VERIFIED FACULTY
        </span>
      </div>

      {/* Profile Image & Avatar Selection */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative group shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-[#181818] border-2 border-dashed border-white/20 group-hover:border-[#C6FF34] overflow-hidden flex items-center justify-center text-xl font-bold transition-all shadow-lg">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name || 'Author Avatar'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-slate-400">{profile.name?.[0] || 'M'}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-full bg-[#C6FF34] text-black shadow-md hover:scale-110 transition-transform"
            title="Upload Profile Photo"
          >
            {avatarUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <div className="flex-1 space-y-1.5 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-bold text-white">Author Headshot / Avatar</span>
            {isMissingAvatar && (
              <span className="text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.2 rounded">
                Recommended for SEO
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Add a clear photo of yourself to appear in the article byline and author bio card.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-white/20 text-white hover:bg-white/10 font-mono text-[11px] h-7"
            >
              Choose Photo
            </Button>
            {profile.avatarUrl && (
              <button
                type="button"
                onClick={() => setProfile((p) => ({ ...p, avatarUrl: null }))}
                className="text-[10px] text-rose-400 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFileSelect}
        className="hidden"
      />

      {/* Or Direct Avatar URL */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase text-slate-300">
          Avatar Image Direct URL (Optional)
        </label>
        <Input
          value={profile.avatarUrl || ''}
          onChange={(e) => setProfile((p) => ({ ...p, avatarUrl: e.target.value }))}
          placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
          className="bg-[#141414] border-white/10 text-white text-xs h-9"
        />
      </div>

      {/* Name & Academic Title */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-slate-300">
            Display Author Name *
          </label>
          <Input
            value={profile.name || ''}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Shailja Tarungal"
            className="bg-[#141414] border-white/10 text-white text-xs h-9"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-slate-300">
            Academic / Research Title *
          </label>
          <Input
            value={profile.title || ''}
            onChange={(e) => setProfile((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Senior Cybersecurity Mentor"
            className="bg-[#141414] border-white/10 text-white text-xs h-9"
          />
        </div>
      </div>

      {/* Professional Bio */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase text-slate-300">
            Author Bio (Shown on Published Articles)
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {profile.bio?.length || 0} chars
          </span>
        </div>
        <textarea
          value={profile.bio || ''}
          onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
          rows={3}
          placeholder="e.g. Faculty mentor and cybersecurity researcher guiding students through enterprise SOC engineering, threat defense, and real-world adversary emulation."
          className="w-full p-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:border-[#C6FF34] focus:outline-none resize-none font-sans"
        />
      </div>

      {/* Social Profiles & Contact Links */}
      <div className="space-y-3 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase text-slate-200 flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-[#C6FF34]" /> SOCIAL PROFILE & CONTACT CREDENTIALS
          </span>
          {isMissingLinkedIn && (
            <span className="text-[10px] text-amber-400">Add LinkedIn for reader contact</span>
          )}
        </div>

        {/* LinkedIn Link */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-slate-300 flex items-center gap-1.5">
            <Linkedin className="w-3.5 h-3.5 text-[#0077b5]" /> LinkedIn Profile URL *
          </label>
          <Input
            value={profile.linkedinUrl || ''}
            onChange={(e) => setProfile((p) => ({ ...p, linkedinUrl: e.target.value }))}
            placeholder="https://www.linkedin.com/in/your-profile"
            className="bg-[#141414] border-white/10 text-white text-xs h-9 focus:border-[#0077b5]"
          />
          <p className="text-[10px] text-slate-500">
            Allows students, peers, and enterprise recruiters to connect directly from your blog.
          </p>
        </div>

        {/* Medium Link */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-slate-300 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" /> Medium Profile URL
          </label>
          <Input
            value={profile.mediumUrl || ''}
            onChange={(e) => setProfile((p) => ({ ...p, mediumUrl: e.target.value }))}
            placeholder="https://medium.com/@your-handle"
            className="bg-[#141414] border-white/10 text-white text-xs h-9 focus:border-emerald-400"
          />
        </div>

        {/* Twitter / X and GitHub in 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-300">
              Twitter / X URL
            </label>
            <Input
              value={profile.twitterUrl || ''}
              onChange={(e) => setProfile((p) => ({ ...p, twitterUrl: e.target.value }))}
              placeholder="https://x.com/your-handle"
              className="bg-[#141414] border-white/10 text-white text-xs h-9"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-300">
              GitHub Profile URL
            </label>
            <Input
              value={profile.githubUrl || ''}
              onChange={(e) => setProfile((p) => ({ ...p, githubUrl: e.target.value }))}
              placeholder="https://github.com/your-handle"
              className="bg-[#141414] border-white/10 text-white text-xs h-9"
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#C6FF34]" />
          <span>{success}</span>
        </div>
      )}

      {/* Save Button */}
      <Button
        type="button"
        onClick={handleSaveProfile}
        disabled={saving}
        className="w-full bg-[#C6FF34] text-black hover:bg-[#b2eb2a] font-bold text-xs h-9 rounded-xl shadow-lg shadow-[#C6FF34]/10 cursor-pointer"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Saving Author Profile...
          </>
        ) : (
          'Update & Save Author Credentials'
        )}
      </Button>
    </div>
  );
}
