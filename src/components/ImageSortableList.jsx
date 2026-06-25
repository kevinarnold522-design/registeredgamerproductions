import React, { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
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

function SortableImage({ id, url, isFirst, index, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-square overflow-hidden rounded-xl border ${
        isFirst ? 'border-purple-400 ring-2 ring-purple-400/40' : 'border-gray-700'
      } bg-gray-900 ${isDragging ? 'z-10 scale-105 shadow-2xl' : ''}`}
    >
      <img
        src={url}
        alt={`Listing image ${index + 1}`}
        className="h-full w-full object-cover"
      />
      {isFirst && (
        <div className="absolute left-0 top-0 rounded-br-lg bg-purple-600 px-2 py-1 text-[10px] font-bold text-white">
          COVER
        </div>
      )}
      <button
        type="button"
        onClick={() => onRemove?.(index)}
        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
        aria-label={`Remove image ${index + 1}`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[10px] font-semibold text-white touch-none"
        aria-label={`Drag image ${index + 1} to reorder`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3 w-3" />
        Drag
      </button>
      <div className="absolute bottom-1.5 right-1.5 rounded-md bg-black/60 px-2 py-1 text-[10px] font-semibold text-white">
        #{index + 1}
      </div>
    </div>
  );
}

export default function ImageSortableList({ images = [], onReorder, onRemove }) {
  const normalizedImages = useMemo(() => images.filter(Boolean), [images]);
  const [items, setItems] = useState(
    normalizedImages.map((img, idx) => ({ id: `${idx}-${img}`, url: img }))
  );

  useEffect(() => {
    setItems(normalizedImages.map((img, idx) => ({ id: `${idx}-${img}`, url: img })));
  }, [normalizedImages]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);

    setItems(newItems);
    onReorder?.(newItems.map((item) => item.url));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
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
    </DndContext>
  );
}
