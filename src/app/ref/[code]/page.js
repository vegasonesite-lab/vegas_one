'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function AffiliateRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (params?.code) {
      localStorage.setItem('vegas_ref_code', params.code);
    }
    router.replace('/?action=register');
  }, [params, router]);

  return (
    <div className="min-h-screen bg-[#06070c] flex items-center justify-center text-white font-bold">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-300">Applying Vegas One VIP Referral Bonus...</p>
      </div>
    </div>
  );
}
