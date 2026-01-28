import { useState, useEffect } from "react";
import type { FieldAnnotation, ResolvedFieldValue } from "../types";

interface AnnotationEditorProps {
  annotation: FieldAnnotation | null;
  resolved: ResolvedFieldValue | null;
  mode: "view" | "edit";
  onUpdate: (id: string, changes: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onUpdateValue?: (key: string, value: string) => void;
}

export function AnnotationEditor({
  annotation,
  resolved,
  mode,
  onUpdate,
  onDelete,
  onUpdateValue,
}: AnnotationEditorProps) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [currentValue, setCurrentValue] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);
  const [isValueDirty, setIsValueDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<"value" | "properties">("value");

  useEffect(() => {
    if (annotation) {
      setForm({
        field_key: annotation.field_key,
        label: annotation.label || "",
        field_type: annotation.field_type,
        group_name: annotation.group_name || "",
        page_number: String(annotation.page_number),
        sort_order: String(annotation.sort_order),
        x: String(annotation.x),
        y: String(annotation.y),
        width: String(annotation.width),
        height: String(annotation.height),
        data_binding: annotation.data_binding,
        font_family: annotation.format.font_family,
        font_size: String(annotation.format.font_size),
        font_weight: annotation.format.font_weight,
        text_align: annotation.format.text_align,
        color: annotation.format.color,
        compute_expression: annotation.compute_expression || "",
      });
      setIsDirty(false);
    }
  }, [annotation]);

  useEffect(() => {
    if (resolved) {
      setCurrentValue(resolved.display_value || "");
      setIsValueDirty(false);
    }
  }, [resolved]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleValueChange = (val: string) => {
    setCurrentValue(val);
    setIsValueDirty(true);
  };

  const handleSaveValue = async () => {
    if (onUpdateValue && annotation) {
      await onUpdateValue(annotation.field_key, currentValue);
      setIsValueDirty(false);
    }
  };

  const handleSave = async () => {
    if (!annotation) return;

    const changes: Record<string, unknown> = {
      field_key: form.field_key,
      label: form.label || undefined,
      field_type: form.field_type,
      group_name: form.group_name || undefined,
      page_number: parseInt(form.page_number),
      sort_order: parseInt(form.sort_order),
      x: parseFloat(form.x),
      y: parseFloat(form.y),
      width: parseFloat(form.width),
      height: parseFloat(form.height),
      data_binding: form.data_binding,
      format: {
        font_family: form.font_family,
        font_size: parseFloat(form.font_size),
        font_weight: form.font_weight,
        text_align: form.text_align,
        color: form.color,
      },
    };

    if (form.compute_expression) {
      changes.is_computed = true;
      changes.compute_expression = form.compute_expression;
    }

    await onUpdate(annotation.id, changes);
    setIsDirty(false);
  };

  const isEditing = mode === "edit";

  if (!annotation) {
    return (
      <div style={containerStyle}>
        <style>{editorStyles}</style>
        <div className="editor-header">
          <h2 className="editor-title">Properties</h2>
        </div>
        <div className="empty-editor">
          <span className="empty-icon">^</span>
          <span className="empty-text">
            Select a field to {mode === "edit" ? "edit" : "view"} its properties
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <style>{editorStyles}</style>

      {}
      <div className="editor-header">
        <h2 className="editor-title">Properties</h2>
        <span
          className="type-badge"
          style={{
            background: getTypeColor(annotation.field_type),
          }}
        >
          {annotation.field_type}
        </span>
      </div>

      {}
      {isEditing && (
        <div className="mode-banner">
          <span className="pulse-dot" />
          <span className="mode-text">Editing Mode</span>
        </div>
      )}

      {}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "value" ? "active" : ""}`}
          onClick={() => setActiveTab("value")}
        >
          Value
        </button>
        <button
          className={`tab ${activeTab === "properties" ? "active" : ""}`}
          onClick={() => setActiveTab("properties")}
        >
          Properties
        </button>
      </div>

      {}
      <div className="editor-content">
        {activeTab === "value" ? (
          <>
            {}
            <Section title="Field Value">
              <div className="value-editor">
                {annotation.is_computed ? (
                  <div className="computed-value">
                    <div className="computed-label">Computed Value</div>
                    <div className="computed-display">
                      {resolved?.display_value || "(calculating...)"}
                    </div>
                    <div className="computed-hint">
                      This value is calculated automatically
                    </div>
                  </div>
                ) : isEditing && onUpdateValue ? (
                  <>
                    <label className="input-label">Enter Value</label>
                    <input
                      type="text"
                      className="input-field value-input"
                      value={currentValue}
                      onChange={(e) => handleValueChange(e.target.value)}
                      placeholder="Type value here..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && isValueDirty) {
                          handleSaveValue();
                        }
                      }}
                    />
                    <button
                      onClick={handleSaveValue}
                      className={`btn btn-primary btn-full ${!isValueDirty ? "btn-disabled" : ""}`}
                      disabled={!isValueDirty}
                    >
                      {isValueDirty ? "Save Value" : "No Changes"}
                    </button>
                  </>
                ) : (
                  <div className="read-only-value">
                    {resolved?.display_value || (
                      <em className="empty-value">No value</em>
                    )}
                  </div>
                )}
              </div>
            </Section>

            {}
            <Section title="Quick Info">
              <InfoRow
                label="Label"
                value={annotation.label || annotation.field_key}
              />
              <InfoRow label="Type" value={annotation.field_type} />
              <InfoRow label="Page" value={`Page ${annotation.page_number}`} />
              {annotation.is_computed && (
                <div className="computed-notice">
                  <span>fx</span>
                  This field is computed automatically
                </div>
              )}
            </Section>
          </>
        ) : (
          <>
            {}
            <Section title="Identity">
              <InputField
                label="Field Key"
                value={form.field_key}
                onChange={(v) => handleChange("field_key", v)}
                editable={isEditing}
                mono
              />
              <InputField
                label="Label"
                value={form.label}
                onChange={(v) => handleChange("label", v)}
                editable={isEditing}
                placeholder="Display name"
              />
              <InputField
                label="Group"
                value={form.group_name}
                onChange={(v) => handleChange("group_name", v)}
                editable={isEditing}
                placeholder="Section name"
              />
              <div className="row">
                <InputField
                  label="Page"
                  value={form.page_number}
                  onChange={(v) => handleChange("page_number", v)}
                  editable={isEditing}
                  type="number"
                />
                <InputField
                  label="Order"
                  value={form.sort_order}
                  onChange={(v) => handleChange("sort_order", v)}
                  editable={isEditing}
                  type="number"
                />
              </div>
            </Section>

            {}
            <Section title="Position & Size">
              <div className="row">
                <InputField
                  label="X"
                  value={form.x}
                  onChange={(v) => handleChange("x", v)}
                  editable={isEditing}
                  type="number"
                />
                <InputField
                  label="Y"
                  value={form.y}
                  onChange={(v) => handleChange("y", v)}
                  editable={isEditing}
                  type="number"
                />
              </div>
              <div className="row">
                <InputField
                  label="Width"
                  value={form.width}
                  onChange={(v) => handleChange("width", v)}
                  editable={isEditing}
                  type="number"
                />
                <InputField
                  label="Height"
                  value={form.height}
                  onChange={(v) => handleChange("height", v)}
                  editable={isEditing}
                  type="number"
                />
              </div>
            </Section>

            {}
            <Section title="Data Binding">
              {isEditing ? (
                <textarea
                  value={form.data_binding}
                  onChange={(e) => handleChange("data_binding", e.target.value)}
                  placeholder="$.path.to.data"
                  rows={2}
                  className="text-area"
                />
              ) : (
                <code className="code-block">
                  {annotation.data_binding || "(none)"}
                </code>
              )}
            </Section>

            {}
            <Section title="Formatting">
              <InputField
                label="Font Family"
                value={form.font_family}
                onChange={(v) => handleChange("font_family", v)}
                editable={isEditing}
              />
              <div className="row">
                <InputField
                  label="Size"
                  value={form.font_size}
                  onChange={(v) => handleChange("font_size", v)}
                  editable={isEditing}
                  type="number"
                />
                <SelectField
                  label="Weight"
                  value={form.font_weight}
                  onChange={(v) => handleChange("font_weight", v)}
                  options={["normal", "bold"]}
                  editable={isEditing}
                />
              </div>
              <div className="row">
                <SelectField
                  label="Align"
                  value={form.text_align}
                  onChange={(v) => handleChange("text_align", v)}
                  options={["left", "center", "right"]}
                  editable={isEditing}
                />
                <InputField
                  label="Color"
                  value={form.color}
                  onChange={(v) => handleChange("color", v)}
                  editable={isEditing}
                  type="color"
                />
              </div>
            </Section>
          </>
        )}
      </div>

      {}
      {isEditing && (
        <div className="editor-actions">
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!isDirty}
            style={{ opacity: isDirty ? 1 : 0.5 }}
          >
            Save Changes
          </button>
          <button
            className="btn btn-danger"
            onClick={() => onDelete(annotation.id)}
            title="Delete field"
          >
            {}
            Delete
          </button>
        </div>
      )}
    </div>
  );
}


function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="section">
      <div className="section-header">
        <span className="section-title">{title}</span>
      </div>
      <div className="section-content">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  editable,
  type = "text",
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  editable: boolean;
  type?: string;
  placeholder?: string;
  mono?: boolean;
}) {
  if (!editable) {
    return (
      <div className="field-group">
        <label className="input-label">{label}</label>
        <div className={`read-only-field ${mono ? "mono" : ""}`}>
          {value || "—"}
        </div>
      </div>
    );
  }

  return (
    <div className="field-group">
      <label className="input-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`input-field ${mono ? "mono" : ""}`}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  editable,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  editable: boolean;
}) {
  if (!editable) {
    return (
      <div className="field-group">
        <label className="input-label">{label}</label>
        <div className="read-only-field">{value}</div>
      </div>
    );
  }

  return (
    <div className="field-group">
      <label className="input-label">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select-field"
      >
        {options.map((o: string) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    text: "#3b82f6",
    number: "#8b5cf6",
    currency: "#10b981",
    checkbox: "#f59e0b",
    date: "#ec4899",
    ssn: "#ef4444",
    phone: "#06b6d4",
    percentage: "#84cc16",
  };
  return colors[type] || "#6b7280";
}

const containerStyle: React.CSSProperties = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  background: "var(--white)",
};

const editorStyles = `
  .editor-header {
    padding: 20px;
    border-bottom: 1px solid var(--gray-100);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(135deg, var(--primary-50) 0%, var(--white) 100%);
  }

  .editor-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--gray-900);
  }

  .type-badge {
    font-size: 11px;
    font-weight: 700;
    color: white;
    padding: 5px 12px;
    border-radius: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .mode-banner {
    margin: 16px;
    padding: 12px 16px;
    background: linear-gradient(90deg, var(--primary-50) 0%, var(--white) 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid var(--primary-100);
  }

  .pulse-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--primary);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .mode-text {
    font-size: 13px;
    color: var(--primary-dark);
    font-weight: 600;
  }

  .tabs {
    display: flex;
    border-bottom: 2px solid var(--gray-100);
    padding: 0 20px;
    gap: 4px;
  }

  .tab {
    flex: 1;
    padding: 12px 16px;
    border: none;
    background: transparent;
    font-size: 13px;
    font-weight: 600;
    color: var(--gray-500);
    cursor: pointer;
    transition: all var(--transition-fast);
    border-bottom: 3px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-family: var(--font-primary);
  }

  .tab:hover {
    color: var(--primary);
    background: var(--primary-50);
  }

  .tab.active {
    color: var(--primary);
    border-bottom-color: var(--primary);
  }

  .editor-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .editor-content::-webkit-scrollbar {
    width: 8px;
  }

  .editor-content::-webkit-scrollbar-track {
    background: var(--gray-50);
  }

  .editor-content::-webkit-scrollbar-thumb {
    background: var(--gray-300);
    border-radius: 4px;
  }

  .section {
    padding: 20px;
    border-bottom: 1px solid var(--gray-100);
  }

  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--gray-600);
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  .section-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .input-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--gray-600);
  }

  .input-field,
  .select-field,
  .text-area {
    padding: 10px 12px;
    font-size: 13px;
    border: 2px solid var(--gray-200);
    border-radius: 8px;
    background: var(--white);
    transition: all var(--transition-fast);
    font-family: var(--font-primary);
    width: 100%;
  }

  .input-field:focus,
  .select-field:focus,
  .text-area:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-50);
  }

  .input-field.mono,
  .read-only-field.mono {
    font-family: var(--font-mono);
  }

  .text-area {
    resize: vertical;
    min-height: 60px;
  }

  .read-only-field {
    padding: 10px 12px;
    font-size: 13px;
    color: var(--gray-700);
    background: var(--gray-50);
    border-radius: 8px;
    border: 1px solid var(--gray-200);
  }

  .code-block {
    display: block;
    padding: 12px;
    background: var(--gray-50);
    border-radius: 8px;
    font-size: 12px;
    font-family: var(--font-mono);
    color: var(--gray-700);
    word-break: break-all;
    border: 1px solid var(--gray-200);
  }

  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .value-editor {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .read-only-value {
    padding: 16px;
    background: var(--gray-50);
    border-radius: 10px;
    font-size: 14px;
    color: var(--gray-800);
    border: 2px solid var(--gray-200);
    min-height: 60px;
  }

  .empty-value {
    color: var(--gray-400);
    font-style: italic;
  }

  .value-input {
    font-size: 16px;
    padding: 14px 16px;
    border: 2px solid var(--gray-300);
    font-family: "Courier New", monospace;
  }

  .value-input:focus {
    border-color: var(--primary);
  }

  .computed-value {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border: 1px solid #bae6fd;
    border-radius: 10px;
    padding: 16px;
  }

  .computed-label {
    font-size: 11px;
    font-weight: 700;
    color: #0369a1;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .computed-display {
    font-size: 18px;
    font-weight: 600;
    color: #0c4a6e;
    font-family: "Courier New", monospace;
    margin-bottom: 8px;
  }

  .computed-hint {
    font-size: 12px;
    color: #0284c7;
  }

  .btn-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: var(--gray-50);
    border-radius: 8px;
  }

  .info-label {
    font-size: 12px;
    color: var(--gray-500);
    font-weight: 600;
  }

  .info-value {
    font-size: 13px;
    color: var(--gray-800);
    font-weight: 500;
  }

  .computed-notice {
    padding: 12px;
    background: linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%);
    border-radius: 8px;
    border-left: 3px solid var(--accent);
    font-size: 12px;
    color: var(--accent);
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .editor-actions {
    padding: 20px;
    border-top: 1px solid var(--gray-200);
    display: flex;
    gap: 12px;
    background: var(--gray-50);
  }

  .btn {
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 600;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: var(--font-primary);
  }

  .btn-primary {
    flex: 1;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
  }

  .btn-primary:disabled {
    cursor: not-allowed;
  }

  .btn-danger {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #f17a7aff;
    // width: 44px;
    // height: 44px;
  }

  .btn-danger:hover {
    background: #fee2e2;
    border-color: #fca5a5;
    transform: translateY(-1px);
  }

  .btn-full {
    width: 100%;
  }

  .empty-editor {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 20px;
    gap: 16px;
  }

  .empty-icon {
    font-size: 32px;
    font-weight: 600;
    color: var(--gray-400);
  }

  .empty-text {
    font-size: 14px;
    color: var(--gray-500);
    text-align: center;
  }
`;
