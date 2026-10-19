'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function WalletContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  useEffect(() => {
    if (tabParam === 'redeem' || tabParam === 'withdraw') {
      router.replace('/cashout');
    } else if (tabParam === 'history') {
      router.replace('/history');
    } else {
      router.replace('/deposit');
    }
  }, [tabParam, router]);

  return (
    <div className="min-h-screen bg-[#070514] flex flex-col items-center justify-center p-6 text-center">
      <div
        style={{
          width: '38px',
          height: '38px',
          border: '3px solid rgba(0, 240, 255, 0.2)',
          borderTopColor: '#00F0FF',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '16px',
        }}
      />
      <h2 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
        Loading Cashier...
      </h2>
      <p style={{ fontFamily: 'Lexend, sans-serif', fontSize: '12px', color: '#9A91A8', margin: '4px 0 0 0' }}>
        Redirecting to secure cashier desk
      </p>
    </div>
  );
}

export default function WalletPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#070514] flex items-center justify-center">
          <div
            style={{
              width: '36px',
              height: '36px',
              border: '3px solid rgba(0, 240, 255, 0.2)',
              borderTopColor: '#00F0FF',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        </div>
      }
    >
      <WalletContent />
    </React.Suspense>
  );
}
