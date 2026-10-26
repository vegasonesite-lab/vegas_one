'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VaultPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect player securely to Game Accounts & Vault credentials hub
    router.replace('/accounts');
  }, [router]);

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
        Loading Player Vault...
      </h2>
      <p style={{ fontFamily: 'Lexend, sans-serif', fontSize: '12px', color: '#9A91A8', margin: '4px 0 0 0' }}>
        Redirecting to game accounts and credentials hub
      </p>
    </div>
  );
}
