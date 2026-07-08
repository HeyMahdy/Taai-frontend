import { apiClient } from "./client";
import { ENDPOINTS } from "./config";

// Types
export type RubricCriteria = {
  points: number;
  description: string;
};

export type RubricPenalty = {
  deduction: number;
  condition: string;
};

export type RubricDescription = {
  criteria: RubricCriteria[];
  penalties: RubricPenalty[];
  fatal_flaw: string | null;
};

export type Rubric = {
  id: number;
  question_label: string;
  rubric_description: RubricDescription;
  created_at: string;
};

export type UpdateRubricPayload = {
  question_label?: string;
  rubric_description?: RubricDescription;
};

type RubricsListResponse = {
  message: string;
  count: number;
  data: Rubric[];
};

type RubricUploadResponse = {
  message: string;
  data: string; // JSON string of extracted rubrics
};

type RubricUpdateResponse = {
  message: string;
  data: Rubric;
};

// API calls
export async function uploadRubrics(assignmentId: number, files: File[], isHandwritten: boolean) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("is_handwritten", isHandwritten.toString());

  return apiClient<RubricUploadResponse>(ENDPOINTS.RUBRICS_UPLOAD(assignmentId), {
    method: "POST",
    body: formData as unknown as FormData,
  });
}

export async function createRubric(assignmentId: number, payload: { question_label: string; rubric_description: RubricDescription }) {
  return apiClient<RubricUpdateResponse>(ENDPOINTS.RUBRICS(assignmentId), {
    method: "POST",
    body: payload as unknown as Record<string, unknown>,
  });
}

export async function getRubrics(assignmentId: number) {
  return apiClient<RubricsListResponse>(ENDPOINTS.RUBRICS(assignmentId));
}

export async function updateRubric(rubricId: number, payload: UpdateRubricPayload) {
  return apiClient<RubricUpdateResponse>(ENDPOINTS.RUBRIC_UPDATE(rubricId), {
    method: "PATCH",
    body: payload as unknown as Record<string, unknown>,
  });
}

export async function deleteRubric(assignmentId: number, rubricId: number) {
  return apiClient<{ message: string; data: { id: number; question_label: string } }>(
    ENDPOINTS.RUBRIC_DELETE(assignmentId, rubricId),
    { method: "DELETE" }
  );
}
