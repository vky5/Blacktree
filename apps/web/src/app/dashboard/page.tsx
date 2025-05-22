'use client';
import React from 'react'
import { useSyncUser } from '@/utils/clerk/userSync';
import { useUser } from '@clerk/nextjs';

export default function page() {
  useSyncUser();
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>
        Name: {user?.fullName || 'N/A'}
      </div>
      <div>
        Email: {user?.primaryEmailAddress?.emailAddress || 'N/A'}
      </div>
      <div>
        this is the dasboard
      </div>
    </div>
  )
}
