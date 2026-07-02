import React, { useEffect, useMemo, useState } from "react";
import { buildListingFallbackImage } from "@/lib/listingImageFallback";

export default function ListingImageFrame({
  src,
  alt = "",
  fallbackSrc,
  fallbackCategory = "Listing",
  className = "w-full h-full",
  foregroundClassName = "w-full h-full object-contain p-2",
  backgroundClassName = "w-full h-full object-cover scale-110 blur-xl opacity-30",
}) {
  const permanentFallback = useMemo(
    () => fallbackSrc || buildListingFallbackImage({ title: alt || "Listing", category: fallbackCategory }),
    [alt, fallbackCategory, fallbackSrc]
  );
  const [activeSrc, setActiveSrc] = useState(src || permanentFallback);

  useEffect(() => {
    setActiveSrc(src || permanentFallback);
  }, [src, permanentFallback]);

  return (
    <div className={`relative overflow-hidden bg-gray-800 ${className}`}>
      <img src={activeSrc} alt="" aria-hidden="true" className={`absolute inset-0 ${backgroundClassName}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20 pointer-events-none" />
      <img
        src={activeSrc}
        alt={alt}
        className={`relative ${foregroundClassName}`}
        onError={() => {
          if (activeSrc !== permanentFallback) setActiveSrc(permanentFallback);
        }}
      />
    </div>
  );
}
