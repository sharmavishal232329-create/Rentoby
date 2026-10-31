import React, { Suspense } from 'react';
import RentalsBrowseView from '@/components/rentals/RentalsBrowseView';
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { categorySlug: string[] };
}): Promise<Metadata> {
  const [category, subcategory] = params.categorySlug;
  const formattedCategory = category ? category.replace('-', ' ') : 'Rentals';
  const formattedSub = subcategory ? ` - ${subcategory.replace('-', ' ')}` : '';

  return {
    title: `${formattedCategory}${formattedSub} Rentals | Rentoby`,
    description: `Rent verified ${formattedCategory} equipment and machinery nearby on Rentoby.`,
  };
}

export default function CategoryRentalsPage({
  params,
}: {
  params: { categorySlug: string[] };
}) {
  const [category, subcategory] = params.categorySlug;

  return (
    <Suspense fallback={<div className="p-16 text-center text-slate-500">Loading rentals...</div>}>
      <RentalsBrowseView
        initialCategorySlug={category}
        initialSubcategorySlug={subcategory}
      />
    </Suspense>
  );
}
