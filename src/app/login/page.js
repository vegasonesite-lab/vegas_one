'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0E0816] flex items-center justify-center p-4">
      <AuthModal
        isOpen={true}
        initialTab="login"
        onClose={() => router.push('/')}
        onAuthSuccess={() => router.push('/')}
      />
    </div>
  );
}
