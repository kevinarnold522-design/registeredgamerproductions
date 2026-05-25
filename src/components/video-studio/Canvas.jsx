import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

export default function Canvas({
  project,
  tracks,
  selectedElement,
  setSelectedElement,
  canvasSize,
  zoom,
  currentTime,
  isPlaying,
}) {
  const canvasRef = useRef(null);

  // Handle element selection
  const handleElementClick = (element, e) => {
    e.stopPropagation();
    setSelectedElement(element);
  };

  // Render elements based on current time
  const renderElements = () => {
    const visibleElements = [];
    
    tracks.forEach((track, trackIndex) => {
      if (!track.elements) return;
      
      track.elements.forEach((element, elementIndex) => {
        const startTime = element.start_time || 0;
        const endTime = element.end_time || startTime + element.duration || 10;
        
        // Only render if element is visible at current time
        if (currentTime >= startTime && currentTime <= endTime) {
          const elementTime = currentTime - startTime;
          
          visibleElements.push(
            <motion.div
              key={`${track.id}-${element.id}`}
              className="absolute cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
              style={{
                left: element.x || 0,
                top: element.y || 0,
                width: element.width || 200,
                height: element.height || 100,
                transform: `scale(${zoom})`,
                zIndex: trackIndex + 1,
                border: selectedElement?.id === element.id ? "2px solid #a855f7" : "none",
              }}
              onClick={(e) => handleElementClick(element, e)}
              initial={{ opacity: 0 }}
              animate={{ opacity: element.opacity || 1 }}
            >
              {element.type === "video" && (
                <video
                  src={element.src}
                  className="w-full h-full object-cover"
                  style={{ pointerEvents: "none" }}
                />
              )}
              {element.type === "image" && (
                <img
                  src={element.src}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ pointerEvents: "none" }}
                />
              )}
              {element.type === "text" && (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    color: element.color || "#ffffff",
                    fontSize: element.fontSize || 24,
                    fontFamily: element.fontFamily || "Arial",
                    fontWeight: element.fontWeight || "normal",
                    textAlign: element.textAlign || "center",
                  }}
                >
                  {element.text}
                </div>
              )}
              {element.type === "shape" && (
                <div
                  className="w-full h-full"
                  style={{
                    backgroundColor: element.color || "#a855f7",
                    borderRadius: element.borderRadius || 0,
                  }}
                />
              )}
            </motion.div>
          );
        }
      });
    });

    return visibleElements;
  };

  return (
    <div
      ref={canvasRef}
      className="relative bg-black rounded-lg overflow-hidden shadow-2xl"
      style={{
        width: canvasSize.width * zoom,
        height: canvasSize.height * zoom,
        aspectRatio: `${canvasSize.width}/${canvasSize.height}`,
      }}
    >
      <div
        className="relative w-full h-full"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
        }}
      >
        {renderElements()}
      </div>
    </div>
  );
}