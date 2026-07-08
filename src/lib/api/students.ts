import { apiClient } from "./client";
import { ENDPOINTS } from "./config";

// Types
export type Student = {
  teacher_id: string;
  id: string;          // UUID (internal)
  student_id: string;  // Human-readable student ID — used in API path params
  name: string;
  created_at: string;
};

export type CreateStudentPayload = {
  student_id: string;
  name: string;
};

export type UpdateStudentPayload = {
  student_id?: string;
  name?: string;
};

type StudentsListResponse = {
  message: string;
  count: number;
  data: Student[];
};

type StudentResponse = {
  message: string;
  data: Student;
};

// API calls
export async function getStudents() {
  return apiClient<StudentsListResponse>(ENDPOINTS.STUDENTS);
}

export async function getStudent(studentId: string) {
  return apiClient<StudentResponse>(ENDPOINTS.STUDENT(studentId));
}

export async function createStudent(payload: CreateStudentPayload) {
  return apiClient<StudentResponse>(ENDPOINTS.STUDENTS, {
    method: "POST",
    body: payload as unknown as Record<string, unknown>,
  });
}

export async function updateStudent(studentId: string, payload: UpdateStudentPayload) {
  return apiClient<StudentResponse>(ENDPOINTS.STUDENT(studentId), {
    method: "PATCH",
    body: payload as unknown as Record<string, unknown>,
  });
}

export async function deleteStudent(studentId: string) {
  return apiClient<StudentResponse>(ENDPOINTS.STUDENT(studentId), {
    method: "DELETE",
  });
}

// Student assignment marks
export type StudentAssignmentMark = {
  assignment_id: number;
  title: string;
  subject: string;
  assignment_total_marks: number;
  marks_obtained: number;
  graded_question_count: number;
  created_at: string;
};

type StudentAssignmentsResponse = {
  message: string;
  student: Student;
  data: StudentAssignmentMark[];
};

export async function getStudentAssignments(studentId: string) {
  return apiClient<StudentAssignmentsResponse>(ENDPOINTS.STUDENT_ASSIGNMENTS(studentId));
}
