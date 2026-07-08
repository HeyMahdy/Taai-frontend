import { apiClient } from "./client";
import { ENDPOINTS } from "./config";

// Types
export type Question = {
  id: number;
  question_label: string;
  question_description: string;
  marks: number | null;
  created_at: string;
};

export type UpdateQuestionPayload = {
  question_label?: string;
  question_description?: string;
  marks?: number;
};

type QuestionsListResponse = {
  message: string;
  count: number;
  data: Question[];
};

type QuestionUploadResponse = {
  message: string;
  data: string; // JSON string of extracted questions
};

type QuestionUpdateResponse = {
  message: string;
  data: Question;
};

// API calls
export async function uploadQuestions(assignmentId: number, files: File[], isHandwritten: boolean) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("is_handwritten", isHandwritten.toString());

  return apiClient<QuestionUploadResponse>(ENDPOINTS.QUESTIONS_UPLOAD(assignmentId), {
    method: "POST",
    body: formData as unknown as FormData,
  });
}

export async function getQuestions(assignmentId: number) {
  return apiClient<QuestionsListResponse>(ENDPOINTS.QUESTIONS(assignmentId));
}

export async function updateQuestion(questionId: number, payload: UpdateQuestionPayload) {
  return apiClient<QuestionUpdateResponse>(ENDPOINTS.QUESTION_UPDATE(questionId), {
    method: "PATCH",
    body: payload as unknown as Record<string, unknown>,
  });
}

export async function deleteQuestion(questionId: number) {
  return apiClient<{ message: string }>(ENDPOINTS.QUESTION_DELETE(questionId), {
    method: "DELETE",
  });
}
