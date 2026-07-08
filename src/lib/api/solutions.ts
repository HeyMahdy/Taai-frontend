import { apiClient } from "./client";
import { ENDPOINTS } from "./config";

// Types
export type Solution = {
  id: number;
  question_label: string;
  solution_text: string;
  created_at: string;
};

export type UpdateSolutionPayload = {
  question_label?: string;
  solution_text?: string;
};

type SolutionsListResponse = {
  message: string;
  count: number;
  data: Solution[];
};

type SolutionUploadResponse = {
  message: string;
  data: string; // JSON string of extracted solutions
};

type SolutionUpdateResponse = {
  message: string;
  data: Solution;
};

// API calls
export async function uploadSolutions(assignmentId: number, files: File[], isHandwritten: boolean) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("is_handwritten", isHandwritten.toString());

  return apiClient<SolutionUploadResponse>(ENDPOINTS.SOLUTIONS_UPLOAD(assignmentId), {
    method: "POST",
    body: formData as unknown as FormData,
  });
}

export async function getSolutions(assignmentId: number) {
  return apiClient<SolutionsListResponse>(ENDPOINTS.SOLUTIONS(assignmentId));
}

export async function updateSolution(solutionId: number, payload: UpdateSolutionPayload) {
  return apiClient<SolutionUpdateResponse>(ENDPOINTS.SOLUTION_UPDATE(solutionId), {
    method: "PATCH",
    body: payload as unknown as Record<string, unknown>,
  });
}

export async function deleteSolution(assignmentId: number, solutionId: number) {
  return apiClient<{ message: string; data: { id: number; question_label: string } }>(
    ENDPOINTS.SOLUTION_DELETE(assignmentId, solutionId),
    { method: "DELETE" }
  );
}
