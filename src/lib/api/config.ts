/**
 * API Configuration
 * Uses VITE_API_BASE_URL from environment variables.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://5zcs6sz7-8080.asse.devtunnels.ms";

export const ENDPOINTS = {
  // Auth
  AUTH_SIGNUP: "/auth/signup",
  AUTH_LOGIN: "/auth/login",

  // User Profile
  USER_ME: "/users/me",

  // Students
  STUDENTS: "/students",
  STUDENT: (studentId: string) => `/students/${studentId}`,

  // Assignments
  ASSIGNMENTS: "/assignments",
  ASSIGNMENT: (assignmentId: number) => `/assignments/${assignmentId}`,

  // Questions
  QUESTIONS_UPLOAD: (assignmentId: number) => `/assignments/${assignmentId}/questions/upload`,
  QUESTIONS: (assignmentId: number) => `/assignments/${assignmentId}/questions`,
  QUESTION_UPDATE: (questionId: number) => `/assignments/${questionId}/questions`,
  QUESTION_DELETE: (questionId: number) => `/assignments/${questionId}/questions`,

  // Rubrics
  RUBRICS_UPLOAD: (assignmentId: number) => `/assignments/${assignmentId}/rubrics/upload`,
  RUBRICS: (assignmentId: number) => `/assignments/${assignmentId}/rubrics`,
  RUBRIC_UPDATE: (rubricId: number) => `/assignments/${rubricId}/rubrics`,
  RUBRIC_DELETE: (assignmentId: number, rubricId: number) => `/assignments/${assignmentId}/rubrics/${rubricId}`,

  // Teacher Solutions
  SOLUTIONS_UPLOAD: (assignmentId: number) => `/assignments/${assignmentId}/solutions/upload`,
  SOLUTIONS: (assignmentId: number) => `/assignments/${assignmentId}/solutions`,
  SOLUTION_UPDATE: (solutionId: number) => `/assignments/${solutionId}/solutions`,
  SOLUTION_DELETE: (assignmentId: number, solutionId: number) => `/assignments/${assignmentId}/solutions/${solutionId}`,

  // Student Answers
  STUDENT_ANSWERS_UPLOAD: (assignmentId: number, studentId: string) =>
    `/assignments/${assignmentId}/students/${studentId}/answers/upload`,
  STUDENT_ANSWERS: (assignmentId: number, studentId: string) =>
    `/assignments/${assignmentId}/students/${studentId}/answers`,
  STUDENT_ANSWER_UPDATE: (answerId: number) => `/student-answers/${answerId}`,

  // Student Assignment Marks
  STUDENT_ASSIGNMENTS: (studentId: string) => `/students/${studentId}/assignment-grades`,

  // Grading
  GRADE_STUDENT: (assignmentId: number, studentId: string) =>
    `/assignments/${assignmentId}/students/${studentId}/grade`,
  STUDENT_SCORES: (assignmentId: number, studentId: string) =>
    `/assignments/${assignmentId}/students/${studentId}/scores`,

  // Syllabus GraphRAG
  SYLLABUS_UPLOAD: (assignmentId: number) => `/assignments/${assignmentId}/syllabus/upload`,
  SYLLABUS_STATUS: (syllabusId: number) => `/syllabus/${syllabusId}/status`,
  SYLLABUS_GRAPH: (assignmentId: number, syllabusId: number) => `/assignments/${assignmentId}/syllabus/${syllabusId}/graph`,
  SYLLABUS_QUERY: "/syllabus/query",
  SYLLABUS_PREREQUISITES: (syllabusId: number, topic: string) =>
    `/syllabus/${syllabusId}/prerequisites/${encodeURIComponent(topic)}`,

  // TA Chat
  TA_CHAT: "/ta/chat",
} as const;
