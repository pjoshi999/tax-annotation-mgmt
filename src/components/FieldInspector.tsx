import type { FieldAnnotation, ResolvedFieldValue } from "../types";

interface FieldInspectorProps {
  annotation: FieldAnnotation | null;
  resolved: ResolvedFieldValue | null;
}


export function FieldInspector({ annotation, resolved }: FieldInspectorProps) {
  if (!annotation) {
    return (
      <div style={panelStyle}>
        <h3 style={headingStyle}>Field Inspector</h3>
        <p style={{ color: "#64748b", fontSize: 13 }}>
          Click a field on the form to inspect its annotation details.
        </p>
      </div>
    );
  }

  const fmt = annotation.format;
  const val = annotation.validation;

  return (
    <div style={panelStyle}>
      <h3 style={headingStyle}>Field Inspector</h3>

      <Section title="Identity">
        <Row label="Key" value={annotation.field_key} />
        <Row label="Label" value={annotation.label || "—"} />
        <Row label="Type" value={annotation.field_type} />
        <Row label="Group" value={annotation.group_name || "—"} />
        <Row label="Page" value={String(annotation.page_number)} />
        <Row label="Sort" value={String(annotation.sort_order)} />
      </Section>

      <Section title="Position (points)">
        <Row label="x" value={String(annotation.x)} />
        <Row label="y" value={String(annotation.y)} />
        <Row label="width" value={String(annotation.width)} />
        <Row label="height" value={String(annotation.height)} />
      </Section>

      <Section title="Data Binding">
        <code style={codeStyle}>{annotation.data_binding || "(computed)"}</code>
        {annotation.is_computed && (
          <>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>Expression:</div>
            <code style={codeStyle}>{annotation.compute_expression}</code>
          </>
        )}
      </Section>

      <Section title="Format">
        <Row label="Font" value={`${fmt.font_family} ${fmt.font_size}pt ${fmt.font_weight}`} />
        <Row label="Align" value={`${fmt.text_align} / ${fmt.vertical_align}`} />
        <Row label="Color" value={fmt.color} />
        <Row label="Transform" value={fmt.text_transform} />
        <Row label="Overflow" value={fmt.overflow} />
        {fmt.decimal_places != null && <Row label="Decimals" value={String(fmt.decimal_places)} />}
        {fmt.prefix && <Row label="Prefix" value={fmt.prefix} />}
        {fmt.letter_spacing != null && <Row label="Letter gap" value={`${fmt.letter_spacing}px`} />}
      </Section>

      {annotation.char_boxes && (
        <Section title="Character Boxes">
          <Row label="Count" value={String(annotation.char_boxes.count)} />
          <Row label="Box width" value={`${annotation.char_boxes.box_width}pt`} />
          <Row label="Gap" value={`${annotation.char_boxes.gap}pt`} />
        </Section>
      )}

      <Section title="Validation">
        <Row label="Required" value={val.required ? "Yes" : "No"} />
        {val.pattern && <Row label="Pattern" value={val.pattern} />}
        {val.min_value != null && <Row label="Min" value={String(val.min_value)} />}
        {val.max_value != null && <Row label="Max" value={String(val.max_value)} />}
      </Section>

      {resolved && (
        <Section title="Resolved Value">
          <Row label="Raw" value={JSON.stringify(resolved.raw_value)} />
          <Row label="Display" value={resolved.display_value || "(empty)"} />
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "2px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ color: "#64748b" }}>{label}</span>
      <span style={{ color: "#0f172a", fontWeight: 500, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>{value}</span>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  width: 320,
  padding: 16,
  borderLeft: "1px solid #e2e8f0",
  overflowY: "auto",
  backgroundColor: "#fafafa",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const headingStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: 16,
  paddingBottom: 8,
  borderBottom: "2px solid #e2e8f0",
};

const codeStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontFamily: "monospace",
  backgroundColor: "#f1f5f9",
  padding: "6px 8px",
  borderRadius: 4,
  wordBreak: "break-all",
  color: "#334155",
};
