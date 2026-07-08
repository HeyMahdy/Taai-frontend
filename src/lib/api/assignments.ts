import { apiClient } from "./client";
import { ENDPOINTS } from "./config";

// Types
export type Assignment = {
  id?: number;
  assignment_id?: number;
  teacher_id?: string;
  title: string;
  subject: string;
  topic?: string | null;
  total_marks: number;
  created_at?: string;
};

export type CreateAssignmentPayload = {
  title: string;
  subject: string;
  total_marks: number;
};

export type UpdateAssignmentPayload = {
  title?: string;
  subject?: string;
  topic?: string;
  total_marks?: number;
};

type CreateAssignmentResponse = {
  assignment_id: number;
  message: string;
};

type AssignmentsListResponse = {
  message: string;
  count: number;
  data: Assignment[];
};

type DeleteAssignmentResponse = {
  message: string;
};

// API calls
export async function getAssignments() {
  return apiClient<AssignmentsListResponse>(ENDPOINTS.ASSIGNMENTS);
}

export async function createAssignment(payload: CreateAssignmentPayload) {
  return apiClient<CreateAssignmentResponse>(ENDPOINTS.ASSIGNMENTS, {
    method: "POST",
    body: payload as unknown as Record<string, unknown>,
  });
}

export async function getAssignment(assignmentId: number) {
  return apiClient<Assignment>(ENDPOINTS.ASSIGNMENT(assignmentId));
}

export async function updateAssignment(assignmentId: number, payload: UpdateAssignmentPayload) {
  return apiClient<Assignment>(ENDPOINTS.ASSIGNMENT(assignmentId), {
    method: "PATCH",
    body: payload as unknown as Record<string, unknown>,
  });
}

export async function deleteAssignment(assignmentId: number) {
  return apiClient<DeleteAssignmentResponse>(ENDPOINTS.ASSIGNMENT(assignmentId), {
    method: "DELETE",
  });
}
