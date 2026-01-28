import { useState, useMemo, useCallback, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { api } from "../api/apiClient";
import { AnnotationList } from "../components/AnnotationList";
import { PageCanvas } from "../components/PageCanvas";
import { AnnotationEditor } from "../components/AnnotationEditor";
import { FieldInspector } from "../components/FieldInspector";
import type { FormTemplate, FormSubmission } from "../types";

export function FormViewer() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | null
  >(null);
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null);
  const [showOutlines, setShowOutlines] = useState(true);
  const [scale, setScale] = useState(1);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: templates, loading: loadingTemplates } = useApi(() =>
    api.getForms(),
  );

  const { data: submissions } = useApi(
    () =>
      selectedTemplateId
        ? api.getSubmissions(`form_template_id=${selectedTemplateId}`)
        : Promise.resolve([]),
    [selectedTemplateId],
  );

  const { data: annotations, refetch: refetchAnnotations } = useApi(
    () =>
      selectedTemplateId
        ? api.getAnnotations(selectedTemplateId)
        : Promise.resolve([]),
    [selectedTemplateId],
  );

  const {
    data: resolvedFields,
    loading: resolving,
    refetch: refetchResolved,
  } = useApi(
    () =>
      selectedSubmissionId
        ? api.resolveFields(selectedSubmissionId)
        : Promise.resolve([]),
    [selectedSubmissionId],
  );

  const selectedTemplate = useMemo(
    () =>
      templates?.find((t: FormTemplate) => t.id === selectedTemplateId) ?? null,
    [templates, selectedTemplateId],
  );

  const selectedAnnotation = useMemo(
    () => annotations?.find((a) => a.field_key === selectedFieldKey) ?? null,
    [annotations, selectedFieldKey],
  );

  const selectedResolved = useMemo(
    () => resolvedFields?.find((r) => r.field_key === selectedFieldKey) ?? null,
    [resolvedFields, selectedFieldKey],
  );

  const handleUpdateAnnotation = useCallback(
    async (id: string, changes: Record<string, unknown>) => {
      try {
        await api.updateAnnotation(id, changes);
        await refetchAnnotations();
        if (selectedSubmissionId) {
          await refetchResolved();
        }
      } catch (err) {
        console.error("Failed to update annotation:", err);
      }
    },
    [refetchAnnotations, refetchResolved, selectedSubmissionId],
  );

  const handleDeleteAnnotation = useCallback(async (id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirmId) return;
    try {
      await api.deleteAnnotation(deleteConfirmId);
      setSelectedFieldKey(null);
      setDeleteConfirmId(null);
      await refetchAnnotations();
      if (selectedSubmissionId) await refetchResolved();
    } catch (err) {
      console.error("Failed to delete annotation:", err);
      setDeleteConfirmId(null);
    }
  }, [
    deleteConfirmId,
    refetchAnnotations,
    refetchResolved,
    selectedSubmissionId,
  ]);

  const handleUpdateValue = useCallback(
    async (fieldKey: string, newValue: string) => {
      if (!selectedSubmissionId) return;

      
      const ann = annotations?.find((a) => a.field_key === fieldKey);
      const binding = ann?.data_binding || fieldKey;

      try {
        const sub = await api.getSubmission(selectedSubmissionId);
        const data = sub.taxpayer_data || {};

        const path = binding.replace(/^\$\./, "");
        const parts = path.split(".");
        let current = data as any;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) current[parts[i]] = {};
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = newValue;

        await api.updateSubmission(selectedSubmissionId, {
          taxpayer_data: data,
        });
        await refetchResolved();
      } catch (err) {
        console.error("Failed to update value:", err);
      }
    },
    [selectedSubmissionId, annotations, refetchResolved],
  );

  const handleAddAnnotation = useCallback(
    async (pageNumber: number, x: number, y: number) => {
      if (!selectedTemplateId) return;

      const fieldKey = `field_${Date.now()}`;
      const newAnnotation = {
        field_key: fieldKey,
        page_number: pageNumber,
        x,
        y,
        width: 160,
        height: 28,
        field_type: "text",
        data_binding: "",
        label: "New Field",
        group_name: "Custom",
        sort_order: (annotations?.length ?? 0) + 1,
        format: {
          font_family: "-apple-system, system-ui, sans-serif",
          font_size: 12,
          font_weight: "normal",
          text_align: "left",
          color: "#000000",
          padding_top: 6,
          padding_left: 8,
        },
        validation: { required: false },
      };

      try {
        await api.createAnnotation(selectedTemplateId, newAnnotation);
        await refetchAnnotations();
        setSelectedFieldKey(fieldKey);
        setIsAddingAnnotation(false);
        if (selectedSubmissionId) await refetchResolved();
      } catch (err) {
        console.error("Failed to create annotation:", err);
      }
    },
    [
      selectedTemplateId,
      annotations,
      refetchAnnotations,
      selectedSubmissionId,
      refetchResolved,
    ],
  );

  useEffect(() => {
    if (templates?.length && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId]);

  useEffect(() => {
    if (submissions?.length && !selectedSubmissionId && selectedTemplateId) {
      setSelectedSubmissionId(submissions[0].id);
    }
  }, [submissions, selectedSubmissionId, selectedTemplateId]);

  return (
    <div className="app-container">
      <style>{appStyles}</style>

      <nav className="top-nav no-print">
        <div className="nav-section">
          <div className="brand">
            <div className="brand-icon">I</div>
            <span className="brand-name">Instead</span>
          </div>

          <div className="divider" />

          <select
            className="select-input"
            value={selectedTemplateId ?? ""}
            onChange={(e) => {
              setSelectedTemplateId(e.target.value || null);
              setSelectedSubmissionId(null);
              setSelectedFieldKey(null);
            }}
          >
            <option value="">Select Form</option>
            {templates?.map((t: FormTemplate) => (
              <option key={t.id} value={t.id}>
                {t.form_code} ({t.tax_year})
              </option>
            ))}
          </select>

          <select
            className="select-input"
            value={selectedSubmissionId ?? ""}
            onChange={(e) => {
              setSelectedSubmissionId(e.target.value || null);
              setSelectedFieldKey(null);
            }}
            disabled={!selectedTemplateId}
          >
            <option value="">Select Submission</option>
            {submissions?.map((s: FormSubmission) => (
              <option key={s.id} value={s.id}>
                {s.status} — {new Date(s.created_at).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        <div className="nav-section">
          {}

          <div className="btn-group">
            <button
              className={`btn ${mode === "view" ? "btn-active" : ""}`}
              onClick={() => {
                setMode("view");
                setIsAddingAnnotation(false);
              }}
            >
              View
            </button>
            <button
              className={`btn ${mode === "edit" ? "btn-active" : ""}`}
              onClick={() => setMode("edit")}
            >
              Edit
            </button>
          </div>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={showOutlines}
              onChange={(e) => setShowOutlines(e.target.checked)}
            />
            <span>Outlines</span>
          </label>

          <div className="zoom">
            <button onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}>
              −
            </button>
            <span>{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale((s) => Math.min(2, s + 0.1))}>
              +
            </button>
          </div>

          <button className="btn btn-primary" onClick={() => window.print()}>
            Print
          </button>
        </div>
      </nav>

      {isAddingAnnotation && (
        <div className="notice">
          <span>Click on the form to add a new field</span>
          <button onClick={() => setIsAddingAnnotation(false)}>Cancel</button>
        </div>
      )}

      <div className="layout">
        <aside className="sidebar no-print">
          <AnnotationList
            annotations={annotations ?? []}
            resolvedFields={resolvedFields ?? []}
            selectedFieldKey={selectedFieldKey}
            onSelectField={setSelectedFieldKey}
            mode={mode}
          />
        </aside>

        <main className="main">
          {loadingTemplates && <EmptyState text="Loading..." />}
          {!selectedTemplateId && !loadingTemplates && (
            <EmptyState text="Select a form" />
          )}
          {selectedTemplateId && !selectedSubmissionId && (
            <EmptyState text="Select a submission" />
          )}
          {resolving && <EmptyState text="Loading..." />}

          {selectedTemplate && resolvedFields && !resolving && (
            <>
              {Array.from(
                { length: selectedTemplate.page_count },
                (_, i) => i + 1,
              ).map((pageNum) => (
                <PageCanvas
                  key={pageNum}
                  pageNumber={pageNum}
                  pageWidth={selectedTemplate.page_width}
                  pageHeight={selectedTemplate.page_height}
                  scale={scale}
                  formCode={selectedTemplate.form_code}
                  resolvedFields={resolvedFields}
                  annotations={annotations ?? []}
                  selectedFieldKey={selectedFieldKey}
                  onSelectField={setSelectedFieldKey}
                  onUpdateAnnotation={handleUpdateAnnotation}
                  onValueChange={handleUpdateValue}
                  showOutlines={showOutlines}
                  mode={mode}
                  isAddingAnnotation={isAddingAnnotation}
                  onAddAnnotation={handleAddAnnotation}
                />
              ))}
            </>
          )}
        </main>

        <aside className="sidebar sidebar-right no-print">
          {mode === "edit" ? (
            <AnnotationEditor
              annotation={selectedAnnotation}
              resolved={selectedResolved}
              mode={mode}
              onUpdate={handleUpdateAnnotation}
              onDelete={handleDeleteAnnotation}
              onUpdateValue={handleUpdateValue}
            />
          ) : (
            <FieldInspector
              annotation={selectedAnnotation}
              resolved={selectedResolved}
            />
          )}
        </aside>
      </div>

      {}
      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">Delete Field</div>
            <div className="modal-body">
              Are you sure you want to delete this field? This action cannot be
              undone.
            </div>
            <div className="modal-actions">
              <button
                className="modal-btn modal-btn-cancel"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </button>
              <button
                className="modal-btn modal-btn-delete"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="empty">
      <span className="empty-text">{text}</span>
    </div>
  );
}

const appStyles = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :root {
    --bg: #f8fafc;
    --surface: #ffffff;
    --border: #e2e8f0;
    --text: #0f172a;
    --text-muted: #64748b;
    --primary: #3b82f6;
    --primary-50: #eff6ff;
    --primary-100: #dbeafe;
    --primary-dark: #2563eb;
    --primary-hover: #1d4ed8;
    --accent: #8b5cf6;
    --danger: #ef4444;
    --success: #10b981;
    --gray-50: #f9fafb;
    --gray-100: #f3f4f6;
    --gray-200: #e5e7eb;
    --gray-300: #d1d5db;
    --gray-400: #9ca3af;
    --gray-500: #6b7280;
    --gray-600: #4b5563;
    --gray-700: #374151;
    --gray-800: #1f2937;
    --gray-900: #111827;
    --white: #ffffff;
    --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    --font-mono: 'SF Mono', 'Courier New', monospace;
    --transition-fast: 0.15s ease;
    --transition-base: 0.2s ease;
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  body {
    font-family: var(--font-primary);
    font-size: 14px;
    line-height: 1.5;
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--bg);
  }

  .top-nav {
    height: 56px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    gap: 16px;
    flex-shrink: 0;
  }

  .nav-section {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand-icon {
    width: 32px;
    height: 32px;
    background: var(--text);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-weight: 700;
  }

  .brand-name {
    font-size: 16px;
    font-weight: 600;
  }

  .divider {
    width: 1px;
    height: 24px;
    background: var(--border);
  }

  .select-input {
    height: 36px;
    padding: 0 32px 0 12px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--surface);
    font-size: 13px;
    cursor: pointer;
    min-width: 160px;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23666' stroke-width='1.5'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
  }

  .select-input:hover {
    border-color: var(--text-muted);
  }

  .select-input:focus {
    outline: none;
    border-color: var(--primary);
  }

  .select-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn {
    height: 36px;
    padding: 0 16px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--surface);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    color: var(--text);
  }

  .btn:hover {
    background: var(--bg);
    border-color: var(--text-muted);
  }

  .btn-active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  .btn-active:hover {
    background: var(--primary-hover);
    border-color: var(--primary-hover);
    color: white;
  }

  .btn-primary {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  .btn-primary:hover {
    background: var(--primary-hover);
  }

  .btn-group {
    display: flex;
    border: 1px solid var(--border);
    border-radius: 4px;
  }

  .btn-group .btn {
    border: none;
    border-radius: 0;
  }

  .btn-group .btn:not(:last-child) {
    border-right: 1px solid var(--border);
  }

  .checkbox {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    cursor: pointer;
  }

  .zoom {
    display: flex;
    align-items: center;
    gap: 4px;
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 2px;
  }

  .zoom button {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    border-radius: 2px;
    cursor: pointer;
    font-size: 16px;
  }

  .zoom button:hover {
    background: var(--bg);
  }

  .zoom span {
    min-width: 48px;
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
  }

  .notice {
    height: 44px;
    background: #fff9e6;
    border-bottom: 1px solid #ffe680;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    font-size: 13px;
  }

  .notice button {
    height: 28px;
    padding: 0 12px;
    border: 1px solid #daa520;
    border-radius: 4px;
    background: white;
    font-size: 12px;
    cursor: pointer;
  }

  .layout {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .sidebar {
    width: 280px;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .sidebar-right {
    border-right: none;
    border-left: 1px solid var(--border);
  }

  .main {
    flex: 1;
    overflow: auto;
    padding: 24px;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    gap: 12px;
  }

  .empty-text {
    font-size: 14px;
    color: var(--text-muted);
  }

  @media print {
    .no-print {
      display: none !important;
    }
    
    .main {
      padding: 0;
      overflow: visible;
    }
    
    body {
      background: white;
    }
  }

  /* Delete Confirmation Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: #fff;
    border-radius: 8px;
    width: 400px;
    max-width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    padding: 20px 24px;
    font-size: 18px;
    font-weight: 600;
    color: #111;
    border-bottom: 1px solid #e5e5e5;
  }

  .modal-body {
    padding: 24px;
    font-size: 14px;
    color: #333;
    line-height: 1.5;
  }

  .modal-actions {
    padding: 16px 24px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    border-top: 1px solid #e5e5e5;
  }

  .modal-btn {
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .modal-btn-cancel {
    background: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
  }

  .modal-btn-cancel:hover {
    background: #eee;
  }

  .modal-btn-delete {
    background: #dc2626;
    color: #fff;
  }

  .modal-btn-delete:hover {
    background: #b91c1c;
  }
`;
