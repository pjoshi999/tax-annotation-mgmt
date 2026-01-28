import { useState } from "react";
import { FieldOverlay } from "./FieldOverlay";
import { FormBackground } from "./FormBackground";
import type { ResolvedFieldValue, FieldAnnotation } from "../types";

interface PageCanvasProps {
  pageNumber: number;
  pageWidth: number;
  pageHeight: number;
  scale: number;
  formCode: string;
  resolvedFields: ResolvedFieldValue[];
  annotations: FieldAnnotation[];
  selectedFieldKey: string | null;
  onSelectField: (key: string | null) => void;
  onUpdateAnnotation?: (id: string, changes: Record<string, unknown>) => void;
  onValueChange?: (fieldKey: string, value: string) => void;
  showOutlines: boolean;
  mode: "view" | "edit";
  isAddingAnnotation?: boolean;
  onAddAnnotation?: (pageNumber: number, x: number, y: number) => void;
}

export function PageCanvas({
  pageNumber,
  pageWidth,
  pageHeight,
  scale,
  formCode,
  resolvedFields,
  annotations,
  selectedFieldKey,
  onSelectField,
  onUpdateAnnotation,
  onValueChange,
  showOutlines,
  mode,
  isAddingAnnotation,
  onAddAnnotation,
}: PageCanvasProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  
  const [dragState, setDragState] = useState<{
    key: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  
  const [localPositions, setLocalPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});

  const pageFields = resolvedFields.filter((f) => f.page_number === pageNumber);
  const pageAnnotations = annotations.filter(
    (a) => a.page_number === pageNumber,
  );

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isAddingAnnotation && onAddAnnotation) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      onAddAnnotation(pageNumber, Math.round(x), Math.round(y));
      e.stopPropagation();
    } else if (e.target === e.currentTarget) {
      
      onSelectField(null);
    }
  };

  const handleMouseDown = (
    e: React.MouseEvent,
    key: string,
    currentX: number,
    currentY: number,
  ) => {
    if (mode !== "edit" || isAddingAnnotation) return;

    e.stopPropagation();
    onSelectField(key);

    setDragState({
      key,
      startX: e.clientX,
      startY: e.clientY,
      origX: currentX,
      origY: currentY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState) return;

    const deltaX = (e.clientX - dragState.startX) / scale;
    const deltaY = (e.clientY - dragState.startY) / scale;

    const newX = Math.max(0, Math.round(dragState.origX + deltaX));
    const newY = Math.max(0, Math.round(dragState.origY + deltaY));

    setLocalPositions({
      ...localPositions,
      [dragState.key]: { x: newX, y: newY },
    });
  };

  const handleMouseUp = () => {
    if (!dragState) return;

    if (onUpdateAnnotation) {
      const finalPos = localPositions[dragState.key];
      if (finalPos) {
        const ann = pageAnnotations.find((a) => a.field_key === dragState.key);
        if (ann) {
          onUpdateAnnotation(ann.id, { x: finalPos.x, y: finalPos.y });
        }
      }
    }
    setDragState(null);
    setLocalPositions({});
  };

  return (
    <div style={pageContainerStyle}>
      <style>{`
        .page-canvas {
          position: relative;
          background: #fff;
          border-radius: 8px;
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 0 0 1px rgba(0, 0, 0, 0.05);
          margin: 0 auto 32px;
          overflow: hidden;
          transition: all var(--transition-base);
        }

        .page-canvas:hover {
          box-shadow: 
            0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05),
            0 0 0 1px rgba(0, 0, 0, 0.1);
        }

        .page-canvas.adding-mode {
          cursor: crosshair;
          box-shadow: 
            0 0 0 3px var(--accent),
            0 10px 20px rgba(139, 92, 246, 0.3);
        }

        .page-number-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 20;
          font-size: 11px;
          font-weight: 700;
          color: var(--gray-500);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          padding: 6px 12px;
          border-radius: 8px;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--gray-200);
          font-family: var(--font-mono);
        }

        @media print {
          .page-canvas {
            box-shadow: none;
            margin-bottom: 0;
            page-break-after: always;
            page-break-inside: avoid;
            break-after: page;
            break-inside: avoid;
          }
          .page-canvas:last-child {
            page-break-after: auto;
            break-after: auto;
          }
          .page-number-badge {
            display: none;
          }
        }
      `}</style>

      <div
        className={`page-canvas ${isAddingAnnotation ? "adding-mode" : ""}`}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: pageWidth * scale,
          height: pageHeight * scale,
          userSelect: dragState ? "none" : "auto",
        }}
      >
        <FormBackground
          pageNumber={pageNumber}
          scale={scale}
          pageWidth={pageWidth}
          pageHeight={pageHeight}
          formCode={formCode}
        />

        <div className="page-number-badge">Page {pageNumber}</div>

        {pageFields.map((field) => {
          const ann = pageAnnotations.find(
            (a) => a.field_key === field.field_key,
          );
          const localPos = localPositions[field.field_key];

          const displayX = localPos ? localPos.x : field.x;
          const displayY = localPos ? localPos.y : field.y;

          const displayField = { ...field, x: displayX, y: displayY };

          return (
            <FieldOverlay
              key={field.field_key}
              field={displayField}
              scale={scale}
              annotation={ann}
              selected={selectedFieldKey === field.field_key}
              hovered={hoveredKey === field.field_key}
              dragging={dragState?.key === field.field_key}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onSelectField(field.field_key);
              }}
              onMouseDown={(e: React.MouseEvent) =>
                handleMouseDown(e, field.field_key, field.x, field.y)
              }
              onMouseEnter={() => setHoveredKey(field.field_key)}
              onMouseLeave={() => setHoveredKey(null)}
              showOutline={showOutlines}
              mode={mode}
              onValueChange={onValueChange}
            />
          );
        })}
      </div>
    </div>
  );
}

const pageContainerStyle: React.CSSProperties = {
  animation: "pageSlideIn 0.4s ease-out",
};
