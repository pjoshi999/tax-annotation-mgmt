import { useMemo, useState } from "react";
import type { FieldAnnotation, ResolvedFieldValue } from "../types";

interface AnnotationListProps {
  annotations: FieldAnnotation[];
  resolvedFields: ResolvedFieldValue[];
  selectedFieldKey: string | null;
  onSelectField: (key: string) => void;
  mode: "view" | "edit";
}

const TYPE_ICONS: Record<string, string> = {
  text: "T",
  number: "#",
  currency: "$",
  checkbox: "X",
  date: "D",
  ssn: "SS",
  phone: "Ph",
  percentage: "%",
};

export function AnnotationList({
  annotations,
  resolvedFields,
  selectedFieldKey,
  onSelectField,
  mode,
}: AnnotationListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  
  const groups = useMemo(() => {
    const map = new Map<string, FieldAnnotation[]>();
    for (const ann of annotations) {
      const group = ann.group_name || "Other";
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(ann);
    }
    return map;
  }, [annotations]);

  
  const resolvedMap = useMemo(() => {
    const map = new Map<string, ResolvedFieldValue>();
    for (const r of resolvedFields) map.set(r.field_key, r);
    return map;
  }, [resolvedFields]);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--gray-100)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-900)" }}>
          Fields
        </h2>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--gray-500)",
            background: "var(--gray-100)",
            padding: "3px 8px",
            borderRadius: 10,
          }}
        >
          {annotations.length}
        </span>
      </div>

      {}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {annotations.length === 0 ? (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              color: "var(--gray-400)",
              fontSize: 13,
            }}
          >
            <span
              style={{
                fontSize: 16,
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              --
            </span>
            No fields defined
          </div>
        ) : (
          Array.from(groups.entries()).map(([groupName, fields]) => {
            const isCollapsed = expandedGroups.has(groupName);

            return (
              <div key={groupName}>
                {}
                <button
                  onClick={() => toggleGroup(groupName)}
                  style={{
                    width: "100%",
                    padding: "10px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "var(--gray-50)",
                    border: "none",
                    borderBottom: "1px solid var(--gray-100)",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--gray-500)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {groupName.replace(/_/g, " ")}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--gray-400)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>{fields.length}</span>
                    <span
                      style={{
                        transform: isCollapsed ? "rotate(-90deg)" : "rotate(0)",
                        transition: "transform 0.2s",
                      }}
                    >
                      ▼
                    </span>
                  </span>
                </button>

                {}
                {!isCollapsed &&
                  fields.map((ann) => {
                    const resolved = resolvedMap.get(ann.field_key);
                    const isSelected = ann.field_key === selectedFieldKey;
                    const typeIcon = TYPE_ICONS[ann.field_type] || "?";

                    return (
                      <div
                        key={ann.id}
                        onClick={() => onSelectField(ann.field_key)}
                        style={{
                          padding: "12px 20px",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          cursor: "pointer",
                          background: isSelected
                            ? "linear-gradient(90deg, var(--primary-50) 0%, var(--white) 100%)"
                            : "var(--white)",
                          borderLeft: isSelected
                            ? "3px solid var(--primary)"
                            : "3px solid transparent",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "var(--gray-50)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "var(--white)";
                        }}
                      >
                        {}
                        <span
                          style={{
                            width: 26,
                            height: 26,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 6,
                            background: isSelected
                              ? "var(--primary)"
                              : "var(--gray-100)",
                            color: isSelected
                              ? "var(--white)"
                              : "var(--gray-500)",
                            fontSize: 10,
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {typeIcon}
                        </span>

                        {}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {}
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: isSelected ? 600 : 400,
                              color: isSelected
                                ? "var(--primary-dark)"
                                : "var(--gray-800)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={ann.label || ann.field_key}
                          >
                            {ann.label || ann.field_key}
                          </div>

                          {}
                          {mode === "view" && resolved?.display_value && (
                            <div
                              style={{
                                fontSize: 11,
                                color: "var(--gray-400)",
                                marginTop: 2,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {resolved.display_value}
                            </div>
                          )}

                          {}
                          {mode === "edit" && (
                            <div
                              style={{
                                fontSize: 10,
                                color: "var(--gray-400)",
                                marginTop: 2,
                              }}
                            >
                              Page {ann.page_number} • {ann.field_type}
                            </div>
                          )}
                        </div>

                        {}
                        {ann.is_computed && (
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              color: "var(--primary)",
                              background: "var(--primary-50)",
                              padding: "2px 5px",
                              borderRadius: 4,
                            }}
                          >
                            ƒx
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
