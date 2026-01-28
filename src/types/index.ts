

export interface FormTemplate {
  id: string;
  form_code: string;
  tax_year: number;
  title: string;
  description: string | null;
  page_count: number;
  page_width: number;
  page_height: number;
  version: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FieldFormat {
  font_family: string;
  font_size: number;
  font_weight: "normal" | "bold";
  text_align: "left" | "center" | "right";
  vertical_align: "top" | "middle" | "bottom";
  color: string;
  max_length: number | null;
  decimal_places: number | null;
  prefix: string | null;
  suffix: string | null;
  date_format: string | null;
  letter_spacing: number | null;
  overflow: "truncate" | "shrink" | "wrap";
  text_transform: "uppercase" | "lowercase" | "none";
  padding_top: number;
  padding_right: number;
  padding_bottom: number;
  padding_left: number;
}

export interface CharBoxConfig {
  count: number;
  box_width: number;
  gap: number;
}

export interface FieldAnnotation {
  id: string;
  form_template_id: string;
  field_key: string;
  page_number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  field_type: string;
  data_binding: string;
  format: FieldFormat;
  validation: {
    required: boolean;
    min_value: number | null;
    max_value: number | null;
    pattern: string | null;
    custom_message: string | null;
  };
  char_boxes: CharBoxConfig | null;
  label: string | null;
  help_text: string | null;
  group_name: string | null;
  sort_order: number;
  is_computed: boolean;
  compute_expression: string | null;
  created_at: string;
  updated_at: string;
}

export interface FormSubmission {
  id: string;
  form_template_id: string;
  taxpayer_data: Record<string, unknown>;
  status: "draft" | "completed" | "printed";
  created_at: string;
  updated_at: string;
}

export interface ResolvedFieldValue {
  field_key: string;
  annotation_id: string;
  raw_value: unknown;
  display_value: string;
  page_number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  format: FieldFormat;
  char_boxes: CharBoxConfig | null;
}
