import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableImage({ id, url, isFirst }) {
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
      {...attributes}
      {...listeners}
      className={`relative h-24 w-24 overflow-hidden rounded-lg border-2 ${
        isFirst ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'
      } ${isDragging ? 'scale-105 shadow-2xl' : ''}`}
    >
      <img
        src={url}
        alt={`Listing image ${id}`}
        className="h-full w-full object-cover"
      />
      {isFirst && (
        <div className="absolute left-0 top-0 rounded-br-lg bg-blue-500 px-2 py-1 text-xs font-bold text-white">
          COVER
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 py-1 text-center text-xs text-white">
        #{id + 1}
      </div>
    </div>
  );
}

export default function ImageSortableList({ images = [], onReorder }) {
  const [items, setItems] = useState(images.map((img, idx) => ({ id: idx, url: img })));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
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
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-[120px] flex-wrap gap-3 rounded-lg bg-gray-50 p-4">
          {items.map((item, index) => (
            <SortableImage
              key={item.id}
              id={item.id}
              url={item.url}
              isFirst={index === 0}
            />
          ))}
          {items.length === 0 && (
            <div className="w-full py-8 text-center text-gray-400">
              No images uploaded yet.
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
