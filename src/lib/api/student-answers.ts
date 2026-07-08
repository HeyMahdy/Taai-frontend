import { apiClient } from "./client";
import { ENDPOINTS } from "./config";

// Types
export type StudentAnswer = {
  id: number;
  question_label: string;
  answer: string;
  created_at: string;
};

export type UpdateStudentAnswerPayload = {
  question_label?: string;
  answer?: string;
};

type StudentAnswersListResponse = {
  message: string;
  count: number;
  data: StudentAnswer[];
};

type StudentAnswerUploadResponse = {
  message: string;
  data: string; // JSON string of extracted answers
};

type StudentAnswerUpdateResponse = {
  message: string;
  data: StudentAnswer;
};

// API calls
export async function uploadStudentAnswers(
  assignmentId: number,
  studentId: string,
  files: File[],
  isHandwritten: boolean
) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("is_handwritten", isHandwritten.toString());

  return apiClient<StudentAnswerUploadResponse>(
    ENDPOINTS.STUDENT_ANSWERS_UPLOAD(assignmentId, studentId),
    { method: "POST", body: formData as unknown as FormData }
  );
}

export async function getStudentAnswers(assignmentId: number, studentId: string) {
  return apiClient<StudentAnswersListResponse>(
    ENDPOINTS.STUDENT_ANSWERS(assignmentId, studentId)
  );
}

export async function updateStudentAnswer(answerId: number, payload: UpdateStudentAnswerPayload) {
  return apiClient<StudentAnswerUpdateResponse>(
    ENDPOINTS.STUDENT_ANSWER_UPDATE(answerId),
    { method: "PATCH", body: payload as unknown as Record<string, unknown> }
  );
}
