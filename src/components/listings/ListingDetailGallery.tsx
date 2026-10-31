'use client';

import React, { useState } from 'react';
import { ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ListingDetailGallery({
  images = [],
  title,
}: {
  images: string[];
  title: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const validImages = images.filter((img) => Boolean(img && img.trim()));

  const handleImageError = (index: number) => {
    setFailedImages((prev) => ({ ...prev, [index]: true }));
  };

  if (validImages.length === 0) {
    return (
      <div className="h-[340px] sm:h-[460px] rounded-3xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2 p-6 text-center">
        <ImageOff className="w-12 h-12 stroke-[1.5]" />
        <p className="text-sm font-semibold text-slate-600">No Photographs Provided</p>
        <p className="text-xs text-slate-400">The owner has not uploaded photos for this listing yet.</p>
      </div>
    );
  }

  const currentImage = validImages[activeIdx];
  const isCurrentFailed = failedImages[activeIdx];

  const handlePrev = () => {
    setActiveIdx((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-3">
      {/* Main Image Display Box */}
      <div className="relative h-[340px] sm:h-[460px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 shadow-md group">
        {isCurrentFailed ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-6 text-center space-y-2">
            <ImageOff className="w-10 h-10 text-rose-400" />
            <p className="text-xs font-bold text-slate-200">Image Could Not Be Loaded</p>
            <p className="text-[11px] text-slate-400 max-w-sm truncate font-mono bg-slate-800/80 px-2 py-1 rounded">
              {currentImage}
            </p>
            <p className="text-[10px] text-slate-500">
              The file may be corrupt, missing from storage, or temporarily unavailable.
            </p>
          </div>
        ) : (
          <img
            src={currentImage}
            alt={`${title} - Photo ${activeIdx + 1}`}
            onError={() => handleImageError(activeIdx)}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        )}

        {/* Counter Badge */}
        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold select-none shadow">
          {activeIdx + 1} / {validImages.length}
        </div>

        {/* Prev / Next Arrows if multiple images */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition shadow"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition shadow"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {validImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {validImages.map((img, i) => {
            const isThumbFailed = failedImages[i];
            const isActive = activeIdx === i;

            return (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIdx(i)}
                className={`relative w-20 h-16 rounded-2xl overflow-hidden shrink-0 border-2 transition ${
                  isActive
                    ? 'border-brand-600 ring-2 ring-brand-600/30'
                    : 'border-slate-200 opacity-70 hover:opacity-100'
                }`}
              >
                {isThumbFailed ? (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500">
                    <ImageOff className="w-4 h-4 text-rose-400" />
                  </div>
                ) : (
                  <img
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    onError={() => handleImageError(i)}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
