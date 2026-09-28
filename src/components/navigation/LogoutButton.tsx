'use client';

import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';

interface LogoutButtonProps {
  className?: string;
  showText?: boolean;
}

export function LogoutButton({ className, showText = false }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      // Force reliable reload to reset session state across all layouts
      window.location.replace('/');
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      title="Sign Out"
      className={
        className ||
        'landing-btn-outline px-2.5 py-1.5 inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-red-600 hover:border-red-300 transition-colors cursor-pointer'
      }
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      {showText && <span>Sign Out</span>}
    </button>
  );
}
