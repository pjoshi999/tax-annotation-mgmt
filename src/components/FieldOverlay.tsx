import { memo, useState, useRef, useEffect } from "react";
import type { ResolvedFieldValue, FieldAnnotation } from "../types";

interface FieldOverlayProps {
  field: ResolvedFieldValue;
  scale: number;
  annotation?: FieldAnnotation;
  selected?: boolean;
  hovered?: boolean;
  dragging?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  showOutline: boolean;
  mode: "view" | "edit";
  onValueChange?: (fieldKey: string, value: string) => void;
}

const FieldOverlayComponent = ({
  field,
  scale,
  annotation,
  selected,
  hovered,
  dragging,
  onClick,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  showOutline,
  mode,
  onValueChange,
}: FieldOverlayProps) => {
  const fmt = field.format;
  const hasCharBoxes = field.char_boxes && field.char_boxes.count > 0;
  const [localValue, setLocalValue] = useState(field.display_value || "");
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(field.display_value || "");
  }, [field.display_value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const baseFontSize = Math.max(10, (fmt.font_size || 12) * scale);
  const containerWidth = field.width * scale;
  const containerHeight = field.height * scale;

  
  const containerStyle: React.CSSProperties = {
    position: "absolute",
    left: field.x * scale,
    top: field.y * scale,
    width: containerWidth,
    height: containerHeight,
    cursor: mode === "edit" ? "move" : "default",
    zIndex: dragging ? 100 : selected ? 10 : hovered ? 5 : 1,
    transition: dragging ? "none" : "all 0.15s ease",
    display: "flex",
    alignItems: "center",
    justifyContent:
      fmt.text_align === "right"
        ? "flex-end"
        : fmt.text_align === "center"
          ? "center"
          : "flex-start",
    background: "transparent",
    boxSizing: "border-box",
  };

  
  if (selected || dragging) {
    containerStyle.background = "rgba(59, 130, 246, 0.12)";
  } else if (hovered && mode === "edit") {
    containerStyle.background = "rgba(59, 130, 246, 0.06)";
  }

  
  const valueStyle: React.CSSProperties = {
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: baseFontSize,
    fontWeight: fmt.font_weight === "bold" ? 600 : 400,
    color: "#000",
    width: "100%",
    textAlign:
      fmt.text_align === "right"
        ? "right"
        : fmt.text_align === "center"
          ? "center"
          : "left",
    paddingLeft: 2,
    paddingRight: 2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  
  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    border: "none",
    outline: "none",
    background: "rgba(255, 255, 255, 0.9)",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: baseFontSize,
    fontWeight: fmt.font_weight === "bold" ? 600 : 400,
    color: "#000",
    textAlign:
      fmt.text_align === "right"
        ? "right"
        : fmt.text_align === "center"
          ? "center"
          : "left",
    paddingLeft: 2,
    paddingRight: 2,
    boxSizing: "border-box",
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && onMouseDown) {
      onMouseDown(e);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === "edit" && !hasCharBoxes && !annotation?.is_computed) {
      setIsEditing(true);
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    if (localValue !== field.display_value && onValueChange) {
      onValueChange(field.field_key, localValue);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleInputBlur();
    } else if (e.key === "Escape") {
      setLocalValue(field.display_value || "");
      setIsEditing(false);
    }
  };

  
  if (hasCharBoxes && field.char_boxes) {
    const chars = (field.display_value || "").split("");
    const { count, gap } = field.char_boxes;
    const gapPx = (gap || 1) * scale;
    const totalGaps = (count - 1) * gapPx;
    const paddingX = 2 * scale;
    const availableWidth = containerWidth - paddingX * 2;
    const boxWidth = Math.floor((availableWidth - totalGaps) / count);
    const boxHeight = Math.min(containerHeight - 2, boxWidth * 1.2);

    return (
      <div
        style={{
          ...containerStyle,
          justifyContent: "center",
          gap: gapPx,
          padding: `0 ${paddingX}px`,
        }}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{
              width: boxWidth,
              height: boxHeight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: Math.min(boxWidth * 0.7, baseFontSize),
              fontWeight: 500,
              color: "#000",
              background: chars[i] ? "rgba(240, 240, 240, 0.5)" : "transparent",
            }}
          >
            {chars[i] || ""}
          </div>
        ))}
      </div>
    );
  }

  
  const hasValue = field.display_value && field.display_value.trim() !== "";
  const isComputed = annotation?.is_computed;

  return (
    <div
      style={containerStyle}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          style={inputStyle}
        />
      ) : hasValue ? (
        <span style={valueStyle}>{field.display_value}</span>
      ) : mode === "edit" && !isComputed ? (
        <span
          style={{
            ...valueStyle,
            color: "#999",
            fontStyle: "italic",
            fontSize: baseFontSize * 0.85,
          }}
        >
          Edit
        </span>
      ) : null}
    </div>
  );
};

export const FieldOverlay = memo(FieldOverlayComponent, (prev, next) => {
  return (
    prev.field.field_key === next.field.field_key &&
    prev.field.x === next.field.x &&
    prev.field.y === next.field.y &&
    prev.field.display_value === next.field.display_value &&
    prev.selected === next.selected &&
    prev.hovered === next.hovered &&
    prev.dragging === next.dragging &&
    prev.scale === next.scale &&
    prev.showOutline === next.showOutline &&
    prev.mode === next.mode
  );
});
