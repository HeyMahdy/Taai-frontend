import { apiClient } from "./client";
import { ENDPOINTS } from "./config";

// Types
export type GradeResult = {
  label: string;
  grader_1_score: number;
  grader_2_score: number;
  final_score: number;
  confidence: number;
  confidence_label: "high" | "medium" | "low";
};

export type ScoreEntry = {
  id: number;
  question_label: string;
  student_solution: string;
  marks: number;
  confidence_score: number;
  teacher_comment: string | null;
  created_at: string;
  updated_at: string;
};

type GradeResponse = {
  message: string;
  data: GradeResult[];
};

type ScoresResponse = {
  message: string;
  count: number;
  total_marks: number;
  data: ScoreEntry[];
};

// API calls

/** Trigger AI grading for a student's answers on an assignment */
export async function gradeStudent(assignmentId: number, studentId: string) {
  return apiClient<GradeResponse>(
    ENDPOINTS.GRADE_STUDENT(assignmentId, studentId),
    { method: "POST" }
  );
}

/** Get grading results/scores for a student on an assignment */
export async function getStudentScores(assignmentId: number, studentId: string) {
  return apiClient<ScoresResponse>(
    ENDPOINTS.STUDENT_SCORES(assignmentId, studentId)
  );
}
