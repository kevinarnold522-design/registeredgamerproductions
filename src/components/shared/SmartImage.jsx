import React, { useState } from "react";
import { ImageOff } from "lucide-react";

// Drop-in <img> replacement with a loading skeleton and a graceful
// placeholder when the image is missing or fails to load.
export default function SmartImage({ src, alt = "", className = "", imgClassName = "", ...rest }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-gray-800/60 ${className}`}>
        <ImageOff className="w-6 h-6 text-gray-600" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-gray-800/70" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"} ${imgClassName}`}
        {...rest}
      />
    </div>
  );
}