const BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...opts?.headers },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  const json = await res.json();
  return json.data ?? json;
}

export const api = {
  getForms: (params?: string) =>
    request<import("../types").FormTemplate[]>(
      `/forms${params ? `?${params}` : ""}`,
    ),
  getForm: (id: string) =>
    request<import("../types").FormTemplate>(`/forms/${id}`),
  createForm: (data: Record<string, unknown>) =>
    request<import("../types").FormTemplate>("/forms", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAnnotations: (templateId: string, params?: string) =>
    request<import("../types").FieldAnnotation[]>(
      `/forms/${templateId}/annotations${params ? `?${params}` : ""}`,
    ),
  createAnnotation: (templateId: string, data: Record<string, unknown>) =>
    request<import("../types").FieldAnnotation>(
      `/forms/${templateId}/annotations`,
      { method: "POST", body: JSON.stringify(data) },
    ),
  updateAnnotation: (id: string, data: Record<string, unknown>) =>
    request<import("../types").FieldAnnotation>(`/annotations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteAnnotation: (id: string) =>
    request<void>(`/annotations/${id}`, { method: "DELETE" }),

  getSubmissions: (params?: string) =>
    request<import("../types").FormSubmission[]>(
      `/submissions${params ? `?${params}` : ""}`,
    ),
  getSubmission: (id: string) =>
    request<import("../types").FormSubmission>(`/submissions/${id}`),
  createSubmission: (data: Record<string, unknown>) =>
    request<import("../types").FormSubmission>("/submissions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSubmission: (id: string, data: Record<string, unknown>) =>
    request<import("../types").FormSubmission>(`/submissions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  resolveFields: (submissionId: string) =>
    request<import("../types").ResolvedFieldValue[]>(
      `/submissions/${submissionId}/resolve`,
    ),
};
