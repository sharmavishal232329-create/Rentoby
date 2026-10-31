import React, { Suspense } from 'react';
import RentalsBrowseView from '@/components/rentals/RentalsBrowseView';

export default function RentalsPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-slate-500">Loading rentals...</div>}>
      <RentalsBrowseView />
    </Suspense>
  );
}
