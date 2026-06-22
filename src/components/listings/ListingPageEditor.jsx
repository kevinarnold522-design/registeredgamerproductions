import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, X, Save, ArrowUp, ArrowDown } from "lucide-react";
import { base44 } from "@/api/base44Client";

const LABELS = { media: "Media Gallery", details: "Listing Details", comments: "Comments" };

export default function ListingPageEditor({ listing, layout, user, onClose, onSaved }) {
  const [order, setOrder] = useState(layout?.section_order?.length ? layout.section_order : ["media", "details", "comments"]);
  const [saving, setSaving] = useState(false);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const next = [...order];
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    setOrder(next);
  };

  const moveSection = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  };

  const save = async () => {
    setSaving(true);
    const data = { listing_id: listing.id, section_order: order, updated_by: user?.email || "admin" };
    if (layout?.id) await base44.entities.ListingPageLayout.update(layout.id, data);
    else await base44.entities.ListingPageLayout.create(data);
    const rows = await base44.entities.ListingPageLayout.filter({ listing_id: listing.id });
    onSaved(rows[0] || data);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-cyan-500/40 bg-gray-950 p-5 shadow-[0_0_50px_rgba(34,211,238,.25)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-black text-lg">Page Editor</h3>
            <p className="text-gray-500 text-xs">Drag sections to decide where comments appear on this listing page.</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {order.map((section, index) => (
                  <Draggable key={section} draggableId={section} index={index}>
                    {(dragProvided) => (
                      <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-900 p-4 text-white">
                        <button {...dragProvided.dragHandleProps} className="theme-glow-action rounded-lg p-1" title="Drag section">
                          <GripVertical className="w-4 h-4 theme-glow-icon" />
                        </button>
                        <span className="font-bold text-sm flex-1">{LABELS[section]}</span>
                        <button onClick={() => moveSection(index, -1)} disabled={index === 0} className="theme-glow-action rounded-lg p-1 disabled:opacity-30" title="Move up">
                          <ArrowUp className="w-4 h-4 theme-glow-icon" />
                        </button>
                        <button onClick={() => moveSection(index, 1)} disabled={index === order.length - 1} className="theme-glow-action rounded-lg p-1 disabled:opacity-30" title="Move down">
                          <ArrowDown className="w-4 h-4 theme-glow-icon" />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <button onClick={save} disabled={saving} className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 text-white text-sm font-black disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Page Layout"}
        </button>
      </div>
    </div>
  );
}