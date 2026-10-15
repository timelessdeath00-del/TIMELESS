'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const adminSession = localStorage.getItem('timeless_admin_session');
      if (adminSession) {
        router.replace('/profile/timelessdeath00');
        return;
      }

      const userJson = localStorage.getItem('timeless_user');
      if (userJson) {
        const user = JSON.parse(userJson);
        const targetId = user.username || user.profileId || user.email?.split('@')[0];
        if (targetId) {
          router.replace(`/profile/${targetId}`);
          return;
        }
      }
    } catch {}

    // Default to flagship Master Admin profile
    router.replace('/profile/timelessdeath00');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0F0F1A] flex flex-col items-center justify-center text-zinc-400 gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-[#7B3FF2] border-t-transparent animate-spin" />
      <span className="text-xs font-semibold text-zinc-400">Loading profile...</span>
    </div>
  );
}
