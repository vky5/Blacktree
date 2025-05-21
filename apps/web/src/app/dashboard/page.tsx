'use client';
import React, { useEffect } from 'react'
import { useSyncUser } from '@/utils/clerk/userSync';

export default function page() {
  useSyncUser();


  return (
    <div>
      this is the dasboard
    </div>
  )
}
