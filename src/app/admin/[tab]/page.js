'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import AdminPortal from '../page';

export default function AdminTabPage() {
  const params = useParams();
  const tab = params?.tab || 'overview';
  return <AdminPortal initialTab={tab} />;
}
