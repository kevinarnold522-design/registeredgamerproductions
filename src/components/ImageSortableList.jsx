import React, { useEffect, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';

// Stable ID: use the URL itself so IDs never change when order changes
const toItems = (imgs) => imgs.filter(Boolean).map((img) => ({ id: img, url: img }));

function SortableImage({ id, url, isFirst, index, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1, // hide source; DragOverlay shows the ghost
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      // Listeners on the whole tile so you can drag from anywhere on the image
      {...attributes}
      {...listeners}
      className={`relative aspect-square overflow-hidden rounded-xl border cursor-grab active:cursor-grabbing ${
        isFirst ? 'border-purple-400 ring-2 ring-purple-400/40' : 'border-gray-700'
      } bg-gray-900`}
    >
      <img
        src={url}
        alt={`Listing image ${index + 1}`}
        className="h-full w-full object-cover pointer-events-none select-none"
        draggable={false}
      />
      {isFirst && (
        <div className="absolute left-0 top-0 rounded-br-lg bg-purple-600 px-2 py-1 text-[10px] font-bold text-white pointer-events-none">
          COVER
        </div>
      )}
      {/* Remove button — stop propagation so click doesn't fire drag listeners */}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onRemove?.(index); }}
        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 z-10"
        aria-label={`Remove image ${index + 1}`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
      {/* Visual drag-hint badge */}
      <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[10px] font-semibold text-white pointer-events-none">
        <GripVertical className="h-3 w-3" />
        #{index + 1}
      </div>
    </div>
  );
}

// Ghost tile shown under cursor while dragging
function DragGhost({ url }) {
  return (
    <div className="aspect-square w-28 overflow-hidden rounded-xl border-2 border-purple-400 shadow-2xl opacity-90 rotate-2 scale-105">
      <img src={url} alt="dragging" className="h-full w-full object-cover" draggable={false} />
    </div>
  );
}

export default function ImageSortableList({ images = [], onReorder, onRemove }) {
  const [items, setItems] = useState(() => toItems(images));
  const [activeItem, setActiveItem] = useState(null);

  // Sync when images are added or removed from outside (not just reordered)
  const prevUrlsRef = useRef(new Set(images.filter(Boolean)));
  useEffect(() => {
    const newUrls = images.filter(Boolean);
    const newSet = new Set(newUrls);
    const prev = prevUrlsRef.current;
    const contentChanged =
      newUrls.length !== prev.size ||
      newUrls.some((u) => !prev.has(u));

    if (contentChanged) {
      prevUrlsRef.current = newSet;
      // Preserve existing order for URLs that are still present; append new ones
      setItems((old) => {
        const kept = old.filter((item) => newSet.has(item.url));
        const existing = new Set(kept.map((i) => i.url));
        const added = newUrls.filter((u) => !existing.has(u)).map((u) => ({ id: u, url: u }));
        return [...kept, ...added];
      });
    }
  }, [images]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = ({ active }) => {
    setActiveItem(items.find((i) => i.id === active.id) ?? null);
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveItem(null);
    if (!over || active.id === over.id) return;

    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
      const next = arrayMove(prev, oldIndex, newIndex);
      onReorder?.(next.map((i) => i.url));
      return next;
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <div className="grid min-h-[120px] grid-cols-3 gap-3 sm:grid-cols-4">
          {items.map((item, index) => (
            <SortableImage
              key={item.id}
              id={item.id}
              url={item.url}
              isFirst={index === 0}
              index={index}
              onRemove={onRemove}
            />
          ))}
          {items.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-gray-700 py-8 text-center text-gray-400">
              No images uploaded yet.
            </div>
          )}
        </div>
      </SortableContext>

      {/* Portal'd overlay — not clipped by any parent overflow:hidden */}
      <DragOverlay dropAnimation={null}>
        {activeItem ? <DragGhost url={activeItem.url} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
