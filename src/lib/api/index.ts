// Config
export { API_BASE_URL, ENDPOINTS } from "./config";

// Client
export { apiClient } from "./client";

// Auth
export { signup, login } from "./auth";
export type { AuthUser, AuthResponse, SignupPayload, LoginPayload } from "./auth";

// User
export { getProfile, updateProfile } from "./user";
export type { UserProfile, UpdateProfilePayload } from "./user";

// Students
export { getStudents, getStudent, createStudent, updateStudent, deleteStudent, getStudentAssignments } from "./students";
export type { Student, CreateStudentPayload, UpdateStudentPayload, StudentAssignmentMark } from "./students";

// Assignments
export { getAssignments, createAssignment, getAssignment, updateAssignment, deleteAssignment } from "./assignments";
export type { Assignment, CreateAssignmentPayload, UpdateAssignmentPayload } from "./assignments";

// Questions
export { uploadQuestions, getQuestions, updateQuestion, deleteQuestion } from "./questions";
export type { Question, UpdateQuestionPayload } from "./questions";

// Rubrics
export { uploadRubrics, createRubric, getRubrics, updateRubric, deleteRubric } from "./rubrics";
export type { Rubric, RubricDescription, RubricCriteria, RubricPenalty, UpdateRubricPayload } from "./rubrics";

// Solutions
export { uploadSolutions, getSolutions, updateSolution, deleteSolution } from "./solutions";
export type { Solution, UpdateSolutionPayload } from "./solutions";

// Student Answers
export { uploadStudentAnswers, getStudentAnswers, updateStudentAnswer } from "./student-answers";
export type { StudentAnswer, UpdateStudentAnswerPayload } from "./student-answers";

// Grading
export { gradeStudent, getStudentScores } from "./grading";
export type { GradeResult, ScoreEntry } from "./grading";

// Syllabus GraphRAG
export { uploadSyllabus, getSyllabusStatus, getSyllabusGraph, querySyllabus, getPrerequisites } from "./syllabus";
export type { SyllabusNode, SyllabusEdge, SyllabusGraph, SyllabusQueryResult, PrerequisiteEntry } from "./syllabus";

// TA Chat
export { sendChatMessage } from "./chat";
export type { ChatMessage } from "./chat";
