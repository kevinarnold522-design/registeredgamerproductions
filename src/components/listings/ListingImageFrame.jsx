import React from "react";

export default function ListingImageFrame({
  src,
  alt = "",
  className = "w-full h-full",
  foregroundClassName = "w-full h-full object-contain p-2",
  backgroundClassName = "w-full h-full object-cover scale-110 blur-xl opacity-30",
}) {
  if (!src) return null;

  return (
    <div className={`relative overflow-hidden bg-gray-800 ${className}`}>
      <img src={src} alt="" aria-hidden="true" className={`absolute inset-0 ${backgroundClassName}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20 pointer-events-none" />
      <img src={src} alt={alt} className={`relative ${foregroundClassName}`} />
    </div>
  );
}
