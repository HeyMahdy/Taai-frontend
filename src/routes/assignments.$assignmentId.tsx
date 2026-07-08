import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { AppShell } from "@/components/app/shell";
import { motion } from "framer-motion";
import {
  ArrowLeft, Upload, FileText, Image as ImageIcon, X, Loader2,
  CheckCircle2, AlertTriangle, Pencil, Check, Brain, Hash, ClipboardList, BookCheck, Trash2,
  GraduationCap, BarChart3, User, Search, ChevronDown,
} from "lucide-react";
import {
  getAssignment, uploadQuestions, getQuestions, updateQuestion, deleteQuestion,
  uploadRubrics, getRubrics, updateRubric, deleteRubric,
  uploadSolutions, getSolutions, updateSolution, deleteSolution,
  getStudents, uploadStudentAnswers, getStudentAnswers, updateStudentAnswer,
  gradeStudent, getStudentScores,
  uploadSyllabus, getSyllabusStatus,
} from "@/lib/api";
import type { Assignment, Question, Rubric, RubricDescription, Solution, Student, StudentAnswer, ScoreEntry } from "@/lib/api";
import { DetailSkeleton } from "@/components/app/skeleton";
import { sortByQuestionLabel } from "@/lib/sort-questions";
import { normalizeRubricDescription } from "@/lib/normalize-rubric";
import { SearchableSelect } from "@/components/app/searchable-select";
import { MathText } from "@/components/app/math-text";
import { FilePreviewButton } from "@/components/app/file-preview";

export const Route = createFileRoute("/assignments/$assignmentId")({
  head: () => ({ meta: [{ title: "Assignment — TAAI" }] }),
  component: AssignmentDetail,
});

type Tab = "questions" | "rubrics" | "solutions" | "answers" | "grading" | "results";

function AssignmentDetail() {
  const { assignmentId } = Route.useParams();
  const id = Number(assignmentId);

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loadingAssignment, setLoadingAssignment] = useState(true);

  // Persist active tab in URL hash
  const validTabs: Tab[] = ["questions", "rubrics", "solutions", "answers", "grading", "results"];
  const hashTab = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
  const initialTab: Tab = validTabs.includes(hashTab as Tab) ? (hashTab as Tab) : "questions";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  function switchTab(tab: Tab) {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      window.location.hash = tab;
    }
  }

  // Upload state (shared)
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [questionEditForm, setQuestionEditForm] = useState({ question_label: "", question_description: "", marks: "" });
  const [questionEditLoading, setQuestionEditLoading] = useState(false);

  // Rubrics state
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [loadingRubrics, setLoadingRubrics] = useState(false);
  const [editingRubricId, setEditingRubricId] = useState<number | null>(null);
  const [rubricEditLabel, setRubricEditLabel] = useState("");
  const [rubricEditCriteria, setRubricEditCriteria] = useState<{ points: number; description: string }[]>([]);
  const [rubricEditPenalties, setRubricEditPenalties] = useState<{ deduction: number; condition: string }[]>([]);
  const [rubricEditFatalFlaw, setRubricEditFatalFlaw] = useState("");
  const [rubricEditLoading, setRubricEditLoading] = useState(false);

  // Solutions state
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loadingSolutions, setLoadingSolutions] = useState(false);
  const [editingSolutionId, setEditingSolutionId] = useState<number | null>(null);
  const [solutionEditForm, setSolutionEditForm] = useState({ question_label: "", solution_text: "" });
  const [solutionEditLoading, setSolutionEditLoading] = useState(false);

  // Student Answers state
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [answerFiles, setAnswerFiles] = useState<File[]>([]);
  const [uploadingAnswers, setUploadingAnswers] = useState(false);
  const [answerUploadSuccess, setAnswerUploadSuccess] = useState<string | null>(null);
  const [answerUploadError, setAnswerUploadError] = useState<string | null>(null);
  const answerFileInputRef = useRef<HTMLInputElement>(null);

  // Grading state
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [totalMarksObtained, setTotalMarksObtained] = useState<number>(0);
  const [loadingScores, setLoadingScores] = useState(false);
  const [grading, setGrading] = useState(false);
  const [gradingSuccess, setGradingSuccess] = useState<string | null>(null);
  const [gradingError, setGradingError] = useState<string | null>(null);

  // Results tab state (all students scores)
  const [allResults, setAllResults] = useState<{ studentId: string; name: string; totalMarks: number | null }[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [resultsSearch, setResultsSearch] = useState("");
  const [resultsFilter, setResultsFilter] = useState<string>("all");

  // Syllabus state
  const syllabusStorageKey = `taai_syllabus_${id}`;
  const [syllabusId, setSyllabusId] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(syllabusStorageKey);
    return stored ? Number(stored) : null;
  });
  const [syllabusStatus, setSyllabusStatus] = useState<string | null>(null);
  const [uploadingSyllabus, setUploadingSyllabus] = useState(false);
  const [syllabusError, setSyllabusError] = useState<string | null>(null);
  const syllabusFileRef = useRef<HTMLInputElement>(null);

  // Check syllabus status on load if we have an ID
  useEffect(() => {
    if (!syllabusId) return;
    async function checkStatus() {
      const res = await getSyllabusStatus(syllabusId!);
      if (res.data) setSyllabusStatus(res.data.data.status);
    }
    checkStatus();
  }, [syllabusId]);

  // Fetch assignment
  useEffect(() => {
    async function load() {
      setLoadingAssignment(true);
      const result = await getAssignment(id);
      if (result.data) setAssignment(result.data);
      setLoadingAssignment(false);
    }
    load();
  }, [id]);

  // Fetch questions
  const fetchQuestions = useCallback(async () => {
    setLoadingQuestions(true);
    const result = await getQuestions(id);
    if (result.data) setQuestions(sortByQuestionLabel(result.data.data));
    setLoadingQuestions(false);
  }, [id]);

  // Fetch rubrics
  const fetchRubrics = useCallback(async () => {
    setLoadingRubrics(true);
    const result = await getRubrics(id);
    if (result.data) {
      const normalized = result.data.data.map((r) => ({
        ...r,
        rubric_description: normalizeRubricDescription(r.rubric_description),
      }));
      setRubrics(sortByQuestionLabel(normalized));
    }
    setLoadingRubrics(false);
  }, [id]);

  // Fetch solutions
  const fetchSolutions = useCallback(async () => {
    setLoadingSolutions(true);
    const result = await getSolutions(id);
    if (result.data) setSolutions(sortByQuestionLabel(result.data.data));
    setLoadingSolutions(false);
  }, [id]);

  useEffect(() => { fetchQuestions(); fetchRubrics(); fetchSolutions(); }, [fetchQuestions, fetchRubrics, fetchSolutions]);

  // Fetch students list
  useEffect(() => {
    async function loadStudents() {
      const result = await getStudents();
      if (result.data) setStudents(result.data.data);
    }
    loadStudents();
  }, []);

  // Fetch student answers when student is selected
  const fetchStudentAnswers = useCallback(async () => {
    if (!selectedStudentId) return;
    setLoadingAnswers(true);
    const result = await getStudentAnswers(id, selectedStudentId);
    if (result.data) setStudentAnswers(sortByQuestionLabel(result.data.data));
    else setStudentAnswers([]);
    setLoadingAnswers(false);
  }, [id, selectedStudentId]);

  useEffect(() => { if (selectedStudentId) fetchStudentAnswers(); }, [selectedStudentId, fetchStudentAnswers]);

  // Fetch scores when student is selected on grading tab
  const fetchScores = useCallback(async () => {
    if (!selectedStudentId) return;
    setLoadingScores(true);
    const result = await getStudentScores(id, selectedStudentId);
    if (result.data) {
      setScores(sortByQuestionLabel(result.data.data.map((s) => ({ ...s, question_label: s.question_label }))));
      setTotalMarksObtained(result.data.total_marks);
    } else {
      setScores([]);
      setTotalMarksObtained(0);
    }
    setLoadingScores(false);
  }, [id, selectedStudentId]);

  useEffect(() => { if (selectedStudentId && activeTab === "grading") fetchScores(); }, [selectedStudentId, activeTab, fetchScores]);

  // Fetch all students' scores for results tab
  useEffect(() => {
    if (activeTab !== "results" || students.length === 0) return;
    async function loadAllResults() {
      setLoadingResults(true);
      const results = await Promise.all(
        students.map(async (s) => {
          const res = await getStudentScores(id, s.id);
          return {
            studentId: s.student_id,
            name: s.name,
            totalMarks: res.data ? res.data.total_marks : null,
          };
        })
      );
      setAllResults(results);
      setLoadingResults(false);
    }
    loadAllResults();
  }, [activeTab, students, id]);

  // File handling
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected) return;
    setFiles(Array.from(selected).slice(0, 10));
    setUploadError(null);
    setUploadSuccess(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setFiles(Array.from(e.dataTransfer.files).slice(0, 10));
    setUploadError(null);
    setUploadSuccess(null);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // Upload
  async function handleUpload() {
    if (files.length === 0) return;
    setUploadError(null);
    setUploadSuccess(null);
    setUploading(true);

    if (activeTab === "questions") {
      const result = await uploadQuestions(id, files, true);
      setUploading(false);
      if (result.error) { setUploadError(result.error); return; }
      setUploadSuccess("Questions extracted successfully!");
      setFiles([]);
      fetchQuestions();
    } else if (activeTab === "rubrics") {
      const result = await uploadRubrics(id, files, true);
      setUploading(false);
      if (result.error) { setUploadError(result.error); return; }
      setUploadSuccess("Rubrics extracted successfully!");
      setFiles([]);
      fetchRubrics();
    } else {
      const result = await uploadSolutions(id, files, true);
      setUploading(false);
      if (result.error) { setUploadError(result.error); return; }
      setUploadSuccess("Solutions extracted successfully!");
      setFiles([]);
      fetchSolutions();
    }
  }

  // Edit question
  function startEditQuestion(q: Question) {
    setEditingQuestionId(q.id);
    setQuestionEditForm({
      question_label: q.question_label,
      question_description: q.question_description,
      marks: q.marks != null ? String(q.marks) : "",
    });
  }

  async function handleQuestionEditSave() {
    if (!editingQuestionId) return;
    setQuestionEditLoading(true);
    await updateQuestion(editingQuestionId, {
      question_label: questionEditForm.question_label.trim() || undefined,
      question_description: questionEditForm.question_description.trim() || undefined,
      marks: questionEditForm.marks ? Number(questionEditForm.marks) : undefined,
    });
    setQuestionEditLoading(false);
    setEditingQuestionId(null);
    fetchQuestions();
  }

  // Edit rubric
  function startEditRubric(r: Rubric) {
    setEditingRubricId(r.id);
    setRubricEditLabel(r.question_label);
    setRubricEditCriteria(r.rubric_description?.criteria?.map((c) => ({ points: c.points, description: c.description })) || []);
    setRubricEditPenalties(r.rubric_description?.penalties?.map((p) => ({ deduction: p.deduction, condition: p.condition })) || []);
    setRubricEditFatalFlaw(r.rubric_description?.fatal_flaw || "");
  }

  async function handleRubricEditSave() {
    if (!editingRubricId) return;
    setRubricEditLoading(true);
    await updateRubric(editingRubricId, {
      question_label: rubricEditLabel.trim() || undefined,
      rubric_description: {
        criteria: rubricEditCriteria.filter((c) => c.description.trim()),
        penalties: rubricEditPenalties.filter((p) => p.condition.trim()),
        fatal_flaw: rubricEditFatalFlaw.trim() || null,
      },
    });
    setRubricEditLoading(false);
    setEditingRubricId(null);
    fetchRubrics();
  }

  // Edit solution
  function startEditSolution(s: Solution) {
    setEditingSolutionId(s.id);
    setSolutionEditForm({
      question_label: s.question_label,
      solution_text: s.solution_text,
    });
  }

  async function handleSolutionEditSave() {
    if (!editingSolutionId) return;
    setSolutionEditLoading(true);
    await updateSolution(editingSolutionId, {
      question_label: solutionEditForm.question_label.trim() || undefined,
      solution_text: solutionEditForm.solution_text.trim() || undefined,
    });
    setSolutionEditLoading(false);
    setEditingSolutionId(null);
    fetchSolutions();
  }

  // Upload student answers
  async function handleUploadAnswers() {
    if (!selectedStudentId || answerFiles.length === 0) return;
    setAnswerUploadError(null);
    setAnswerUploadSuccess(null);
    setUploadingAnswers(true);
    const result = await uploadStudentAnswers(id, selectedStudentId, answerFiles, true);
    setUploadingAnswers(false);
    if (result.error) { setAnswerUploadError(result.error); return; }
    setAnswerUploadSuccess("Student answers extracted successfully!");
    setAnswerFiles([]);
    fetchStudentAnswers();
  }

  // Trigger AI grading
  async function handleGrade() {
    if (!selectedStudentId) return;
    setGradingError(null);
    setGradingSuccess(null);
    setGrading(true);
    const result = await gradeStudent(id, selectedStudentId);
    setGrading(false);
    if (result.error) { setGradingError(result.error); return; }
    setGradingSuccess("Grading completed successfully!");
    fetchScores();
  }

  // Syllabus upload
  async function handleSyllabusUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSyllabusError(null);
    setUploadingSyllabus(true);

    const result = await uploadSyllabus(file, id);
    setUploadingSyllabus(false);
    if (result.error) { setSyllabusError(result.error); return; }
    if (result.data) {
      const newId = result.data.data.syllabus_id;
      setSyllabusId(newId);
      setSyllabusStatus(result.data.data.status);
      localStorage.setItem(syllabusStorageKey, String(newId));
      if (result.data.data.status === "processing") {
        pollSyllabusStatus(newId);
      }
    }
  }

  async function pollSyllabusStatus(sId: number) {
    const interval = setInterval(async () => {
      const res = await getSyllabusStatus(sId);
      if (res.data) {
        setSyllabusStatus(res.data.data.status);
        if (res.data.data.status !== "processing") {
          clearInterval(interval);
        }
      }
    }, 3000);
  }

  function getFileIcon(file: File) {
    if (file.type.startsWith("image/")) return <ImageIcon className="size-4" />;
    return <FileText className="size-4" />;
  }

  if (loadingAssignment) {
    return (
      <AppShell title="Assignment">
        <DetailSkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={assignment?.title || `Assignment #${id}`}
      subtitle={assignment ? `${assignment.subject} · ${assignment.total_marks} marks` : undefined}
    >
      <div className="w-full">
        {/* Top row: Back + Syllabus upload */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/assignments" className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition cursor-pointer">
            <ArrowLeft className="size-4" /> Back to Assignments
          </Link>

          <div className="flex items-center gap-3">
            {syllabusStatus && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${syllabusStatus === "completed" ? "bg-success/10 text-success" : syllabusStatus === "processing" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}`}>
                Course Outline: {syllabusStatus}
              </span>
            )}
            {syllabusStatus === "completed" && syllabusId && (
              <Link
                to="/graph/$assignmentId"
                params={{ assignmentId: String(id) }}
                search={{ syllabusId: syllabusId }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-primary/30 text-xs font-medium text-primary hover:bg-primary/5 transition cursor-pointer"
              >
                <BarChart3 className="size-3.5" /> View Knowledge Graph
              </Link>
            )}
            {syllabusError && <span className="text-xs text-destructive">{syllabusError}</span>}
            <input ref={syllabusFileRef} type="file" accept=".pdf,.docx,.txt" onChange={handleSyllabusUpload} className="hidden" />
            <button
              onClick={() => syllabusFileRef.current?.click()}
              disabled={uploadingSyllabus}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-xs font-medium hover:bg-accent transition cursor-pointer disabled:opacity-60"
            >
              {uploadingSyllabus ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
              {syllabusId ? "Re-upload" : "Upload Course Outline"}
            </button>
          </div>
        </div>

        {/* Assignment details card */}
        {assignment && (
          <div className="mb-6 p-5 rounded-lg bg-card border border-border flex flex-wrap items-center gap-6">
            <div className="size-12 rounded-md bg-primary grid place-items-center text-primary-foreground text-sm font-bold shrink-0">
              {assignment.subject.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-lg truncate">{assignment.title}</h2>
              <p className="text-sm text-muted-foreground">{assignment.subject}{assignment.topic ? ` · ${assignment.topic}` : ""}</p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{assignment.total_marks}</div>
                <div className="text-[11px] text-muted-foreground">Total Marks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{questions.length}</div>
                <div className="text-[11px] text-muted-foreground">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{rubrics.length}</div>
                <div className="text-[11px] text-muted-foreground">Rubrics</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{solutions.length}</div>
                <div className="text-[11px] text-muted-foreground">Solutions</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-mono text-muted-foreground">ID</div>
                <div className="text-sm font-bold">{id}</div>
              </div>
            </div>
          </div>
        )}

        {/* Two-group tab system */}
        <div className="flex flex-wrap items-start gap-6 mb-6">
          {/* Group 1: Assignment Setup */}
          <div>
            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Assignment Setup</div>
            <div className="flex items-center gap-1 p-1 rounded-md bg-muted/50 border border-border">
              <button
                onClick={() => { switchTab("questions"); setFiles([]); setUploadError(null); setUploadSuccess(null); }}
                className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${activeTab === "questions" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Questions
              </button>
              <button
                onClick={() => { switchTab("rubrics"); setFiles([]); setUploadError(null); setUploadSuccess(null); }}
                className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${activeTab === "rubrics" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Rubrics
              </button>
              <button
                onClick={() => { switchTab("solutions"); setFiles([]); setUploadError(null); setUploadSuccess(null); }}
                className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${activeTab === "solutions" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Solutions
              </button>
            </div>
          </div>

          {/* Group 2: Student Evaluation */}
          <div>
            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Student Evaluation</div>
            <div className="flex items-center gap-1 p-1 rounded-md bg-muted/50 border border-border">
              <button
                onClick={() => { switchTab("answers"); setAnswerUploadError(null); setAnswerUploadSuccess(null); }}
                className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${activeTab === "answers" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Student Answers
              </button>
              <button
                onClick={() => { switchTab("grading"); setGradingError(null); setGradingSuccess(null); }}
                className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${activeTab === "grading" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Grading
              </button>
              <button
                onClick={() => { switchTab("results"); }}
                className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${activeTab === "results" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Results
              </button>
            </div>
          </div>
        </div>

        {/* Two-column layout for Questions/Rubrics/Solutions — content first, upload compact */}
        {(activeTab === "questions" || activeTab === "rubrics" || activeTab === "solutions") && (
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          {/* Left: Upload (visually on right via order) */}
          <div className="space-y-5 lg:order-2">
            <h2 className="font-bold text-sm">
              Upload {activeTab === "questions" ? "Questions" : activeTab === "rubrics" ? "Rubrics" : "Solutions"}
            </h2>

            {/* Drop zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="rounded-lg border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-8 text-center hover:border-primary/50 transition"
            >
              <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf" onChange={handleFileSelect} className="hidden" />
              <div className="size-14 rounded-lg bg-primary mx-auto grid place-items-center text-primary-foreground">
                <Upload className="size-6" />
              </div>
              <h3 className="font-bold mt-3">
                Drop {activeTab === "questions" ? "question papers" : activeTab === "rubrics" ? "rubric documents" : "solution documents"} here
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Images (JPG, PNG) or PDFs · Max 10 files</p>
              <button onClick={() => fileInputRef.current?.click()} className="mt-4 px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold cursor-pointer">
                Browse files
              </button>
            </div>

            {/* Selected files */}
            {files.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm">{files.length} file{files.length > 1 ? "s" : ""} selected</h3>
                  <button onClick={() => setFiles([])} className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">Clear all</button>
                </div>
                {files.map((file, i) => (
                  <div key={`${file.name}-${i}`} className="flex items-center gap-3 px-4 py-3 rounded-md border border-border bg-card">
                    <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center">{getFileIcon(file)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{file.name}</div>
                      <div className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</div>
                    </div>
                    <FilePreviewButton file={file} />
                    <button onClick={() => removeFile(i)} className="size-7 rounded-lg hover:bg-accent grid place-items-center cursor-pointer"><X className="size-3.5 text-muted-foreground" /></button>
                  </div>
                ))}

                <div className="flex items-center justify-end pt-2">
                  <button onClick={handleUpload} disabled={uploading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold cursor-pointer disabled:opacity-60">
                    {uploading ? (
                      <><Loader2 className="size-4 animate-spin" /> Processing...</>
                    ) : (
                      <><Brain className="size-4" /> Extract {activeTab === "questions" ? "Questions" : activeTab === "rubrics" ? "Rubrics" : "Solutions"}</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Feedback */}
            {uploadError && (
              <div className="px-4 py-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0" /> {uploadError}
              </div>
            )}
            {uploadSuccess && (
              <div className="px-4 py-3 rounded-md bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" /> {uploadSuccess}
              </div>
            )}

            {/* Processing indicator */}
            {uploading && (
              <div className="p-5 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-10 rounded-md bg-primary/10 grid place-items-center"><Brain className="size-5 text-primary animate-pulse" /></div>
                  <div><div className="font-bold text-sm">AI is processing...</div><div className="text-xs text-muted-foreground">This may take 5–30 seconds</div></div>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div className="h-full bg-primary" initial={{ width: "5%" }} animate={{ width: "85%" }} transition={{ duration: 15, ease: "easeOut" }} />
                </div>
              </div>
            )}
          </div>

          {/* Left: Results panel (content focus) */}
          <div className="space-y-4 lg:order-1">
            {activeTab === "questions" ? (
              /* Questions panel */
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg">Extracted Questions</h2>
                  {questions.length > 0 && <span className="text-xs text-muted-foreground">{questions.length} questions</span>}
                </div>

                {loadingQuestions ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
                ) : questions.length === 0 ? (
                  <div className="p-6 rounded-lg border border-dashed border-border text-center">
                    <FileText className="size-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No questions yet. Upload a question paper to extract with AI.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto scrollbar-thin pr-1">
                    {questions.map((q) => (
                      <div key={q.id} className="p-4 rounded-md border border-border bg-card hover:border-primary/20 transition">
                        {editingQuestionId === q.id ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-[1fr_80px] gap-2">
                              <div><label className="text-[10px] font-medium text-muted-foreground uppercase">Label</label><input type="text" value={questionEditForm.question_label} onChange={(e) => setQuestionEditForm((p) => ({ ...p, question_label: e.target.value }))} className="mt-0.5 w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-ring" /></div>
                              <div><label className="text-[10px] font-medium text-muted-foreground uppercase">Marks</label><input type="number" value={questionEditForm.marks} onChange={(e) => setQuestionEditForm((p) => ({ ...p, marks: e.target.value }))} className="mt-0.5 w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-ring" /></div>
                            </div>
                            <div><label className="text-[10px] font-medium text-muted-foreground uppercase">Description</label><textarea value={questionEditForm.question_description} onChange={(e) => setQuestionEditForm((p) => ({ ...p, question_description: e.target.value }))} rows={3} className="mt-0.5 w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-ring resize-none" /></div>
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => setEditingQuestionId(null)} className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-accent cursor-pointer">Cancel</button>
                              <button onClick={handleQuestionEditSave} disabled={questionEditLoading} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium cursor-pointer disabled:opacity-60">{questionEditLoading ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />} Save</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold">{q.question_label}</span>
                                {q.marks != null && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Hash className="size-3" /> {q.marks} marks</span>}
                              </div>
                              <div className="flex items-center gap-0.5">
                                <button onClick={() => startEditQuestion(q)} className="size-7 rounded-lg hover:bg-accent grid place-items-center cursor-pointer opacity-60 hover:opacity-100 transition" title="Edit"><Pencil className="size-3.5 text-muted-foreground" /></button>
                                <button onClick={async () => { await deleteQuestion(q.id); fetchQuestions(); }} className="size-7 rounded-lg hover:bg-destructive/10 grid place-items-center cursor-pointer opacity-60 hover:opacity-100 transition" title="Delete"><Trash2 className="size-3.5 text-muted-foreground" /></button>
                              </div>
                            </div>
                            <p className="text-sm text-foreground/80 leading-relaxed"><MathText text={q.question_description} /></p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : activeTab === "rubrics" ? (
              /* Rubrics panel */
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg">Extracted Rubrics</h2>
                  {rubrics.length > 0 && <span className="text-xs text-muted-foreground">{rubrics.length} rubrics</span>}
                </div>

                {loadingRubrics ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
                ) : rubrics.length === 0 ? (
                  <div className="p-6 rounded-lg border border-dashed border-border text-center">
                    <ClipboardList className="size-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No rubrics yet. Upload a rubric document to extract grading criteria with AI.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto scrollbar-thin pr-1">
                    {rubrics.map((r) => (
                      <div key={r.id} className="p-4 rounded-md border border-border bg-card hover:border-primary/20 transition">
                        {editingRubricId === r.id ? (
                          <div className="space-y-4">
                            {/* Question Label */}
                            <div>
                              <label className="text-[10px] font-medium text-muted-foreground uppercase">Question Label</label>
                              <input type="text" value={rubricEditLabel} onChange={(e) => setRubricEditLabel(e.target.value)} className="mt-0.5 w-full px-2 py-1.5 rounded-md border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-ring" />
                            </div>

                            {/* Criteria */}
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[10px] font-medium text-muted-foreground uppercase">Criteria</label>
                                <button onClick={() => setRubricEditCriteria([...rubricEditCriteria, { points: 1, description: "" }])} className="text-[10px] text-primary font-medium cursor-pointer">+ Add</button>
                              </div>
                              <div className="space-y-2">
                                {rubricEditCriteria.map((c, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <input type="number" value={c.points} onChange={(e) => { const arr = [...rubricEditCriteria]; arr[i] = { ...arr[i], points: Number(e.target.value) }; setRubricEditCriteria(arr); }} className="w-16 px-2 py-1.5 rounded-md border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-ring" placeholder="Pts" />
                                    <input type="text" value={c.description} onChange={(e) => { const arr = [...rubricEditCriteria]; arr[i] = { ...arr[i], description: e.target.value }; setRubricEditCriteria(arr); }} className="flex-1 px-2 py-1.5 rounded-md border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-ring" placeholder="Description" />
                                    <button onClick={() => setRubricEditCriteria(rubricEditCriteria.filter((_, j) => j !== i))} className="size-7 rounded-md hover:bg-destructive/10 grid place-items-center cursor-pointer shrink-0"><X className="size-3 text-muted-foreground" /></button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Penalties */}
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[10px] font-medium text-muted-foreground uppercase">Penalties</label>
                                <button onClick={() => setRubricEditPenalties([...rubricEditPenalties, { deduction: 1, condition: "" }])} className="text-[10px] text-primary font-medium cursor-pointer">+ Add</button>
                              </div>
                              <div className="space-y-2">
                                {rubricEditPenalties.map((p, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <input type="number" value={p.deduction} onChange={(e) => { const arr = [...rubricEditPenalties]; arr[i] = { ...arr[i], deduction: Number(e.target.value) }; setRubricEditPenalties(arr); }} className="w-16 px-2 py-1.5 rounded-md border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-ring" placeholder="-Pts" />
                                    <input type="text" value={p.condition} onChange={(e) => { const arr = [...rubricEditPenalties]; arr[i] = { ...arr[i], condition: e.target.value }; setRubricEditPenalties(arr); }} className="flex-1 px-2 py-1.5 rounded-md border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-ring" placeholder="Condition" />
                                    <button onClick={() => setRubricEditPenalties(rubricEditPenalties.filter((_, j) => j !== i))} className="size-7 rounded-md hover:bg-destructive/10 grid place-items-center cursor-pointer shrink-0"><X className="size-3 text-muted-foreground" /></button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Fatal Flaw */}
                            <div>
                              <label className="text-[10px] font-medium text-muted-foreground uppercase">Fatal Flaw (optional)</label>
                              <input type="text" value={rubricEditFatalFlaw} onChange={(e) => setRubricEditFatalFlaw(e.target.value)} className="mt-0.5 w-full px-2 py-1.5 rounded-md border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-ring" placeholder="e.g. Completely wrong approach" />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => setEditingRubricId(null)} className="px-3 py-1.5 rounded-md border border-border text-xs hover:bg-accent cursor-pointer">Cancel</button>
                              <button onClick={handleRubricEditSave} disabled={rubricEditLoading} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium cursor-pointer disabled:opacity-60">{rubricEditLoading ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />} Save</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold">{r.question_label}</span>
                              <div className="flex items-center gap-0.5">
                                <button onClick={() => startEditRubric(r)} className="size-7 rounded-lg hover:bg-accent grid place-items-center cursor-pointer opacity-60 hover:opacity-100 transition" title="Edit"><Pencil className="size-3.5 text-muted-foreground" /></button>
                                <button onClick={async () => { await deleteRubric(id, r.id); fetchRubrics(); }} className="size-7 rounded-lg hover:bg-destructive/10 grid place-items-center cursor-pointer opacity-60 hover:opacity-100 transition" title="Delete"><Trash2 className="size-3.5 text-muted-foreground" /></button>
                              </div>
                            </div>
                            {r.rubric_description?.criteria && r.rubric_description.criteria.length > 0 && (
                              <div className="mb-3">
                                <div className="text-[10px] font-medium text-muted-foreground uppercase mb-1.5">Criteria</div>
                                <div className="space-y-1.5">
                                  {r.rubric_description.criteria.map((c, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm">
                                      <span className="shrink-0 px-1.5 py-0.5 rounded bg-success/10 text-success text-[10px] font-bold">+{c.points}</span>
                                      <span className="text-foreground/80"><MathText text={c.description} /></span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {r.rubric_description?.penalties && r.rubric_description.penalties.length > 0 && (
                              <div className="mb-3">
                                <div className="text-[10px] font-medium text-muted-foreground uppercase mb-1.5">Penalties</div>
                                <div className="space-y-1.5">
                                  {r.rubric_description.penalties.map((p, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm">
                                      <span className="shrink-0 px-1.5 py-0.5 rounded bg-destructive/10 text-destructive text-[10px] font-bold">{p.deduction}</span>
                                      <span className="text-foreground/80"><MathText text={p.condition} /></span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {r.rubric_description?.fatal_flaw && (
                              <div>
                                <div className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Fatal Flaw</div>
                                <div className="text-sm text-destructive/80 italic"><MathText text={r.rubric_description.fatal_flaw} /></div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : activeTab === "solutions" ? (
              /* Solutions panel */
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg">Extracted Solutions</h2>
                  {solutions.length > 0 && <span className="text-xs text-muted-foreground">{solutions.length} solutions</span>}
                </div>

                {loadingSolutions ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
                ) : solutions.length === 0 ? (
                  <div className="p-6 rounded-lg border border-dashed border-border text-center">
                    <BookCheck className="size-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No solutions yet. Upload teacher solution documents to extract model answers with AI.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto scrollbar-thin pr-1">
                    {solutions.map((s) => (
                      <div key={s.id} className="p-4 rounded-md border border-border bg-card hover:border-primary/20 transition">
                        {editingSolutionId === s.id ? (
                          <div className="space-y-3">
                            <div><label className="text-[10px] font-medium text-muted-foreground uppercase">Question Label</label><input type="text" value={solutionEditForm.question_label} onChange={(e) => setSolutionEditForm((p) => ({ ...p, question_label: e.target.value }))} className="mt-0.5 w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-ring" /></div>
                            <div><label className="text-[10px] font-medium text-muted-foreground uppercase">Solution Text</label><textarea value={solutionEditForm.solution_text} onChange={(e) => setSolutionEditForm((p) => ({ ...p, solution_text: e.target.value }))} rows={6} className="mt-0.5 w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-ring resize-none" /></div>
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => setEditingSolutionId(null)} className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-accent cursor-pointer">Cancel</button>
                              <button onClick={handleSolutionEditSave} disabled={solutionEditLoading} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium cursor-pointer disabled:opacity-60">{solutionEditLoading ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />} Save</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="px-2 py-0.5 rounded-md bg-secondary/20 text-secondary-foreground text-xs font-bold">{s.question_label}</span>
                              <div className="flex items-center gap-0.5">
                                <button onClick={() => startEditSolution(s)} className="size-7 rounded-lg hover:bg-accent grid place-items-center cursor-pointer opacity-60 hover:opacity-100 transition" title="Edit"><Pencil className="size-3.5 text-muted-foreground" /></button>
                                <button onClick={async () => { await deleteSolution(id, s.id); fetchSolutions(); }} className="size-7 rounded-lg hover:bg-destructive/10 grid place-items-center cursor-pointer opacity-60 hover:opacity-100 transition" title="Delete"><Trash2 className="size-3.5 text-muted-foreground" /></button>
                              </div>
                            </div>
                            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap"><MathText text={s.solution_text} /></p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : activeTab === "solutions" ? (
              /* Solutions panel */
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg">Extracted Solutions</h2>
                  {solutions.length > 0 && <span className="text-xs text-muted-foreground">{solutions.length} solutions</span>}
                </div>

                {loadingSolutions ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
                ) : solutions.length === 0 ? (
                  <div className="p-6 rounded-lg border border-dashed border-border text-center">
                    <BookCheck className="size-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No solutions yet. Upload teacher solution documents to extract model answers with AI.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto scrollbar-thin pr-1">
                    {solutions.map((s) => (
                      <div key={s.id} className="p-4 rounded-md border border-border bg-card hover:border-primary/20 transition">
                        {editingSolutionId === s.id ? (
                          <div className="space-y-3">
                            <div><label className="text-[10px] font-medium text-muted-foreground uppercase">Question Label</label><input type="text" value={solutionEditForm.question_label} onChange={(e) => setSolutionEditForm((p) => ({ ...p, question_label: e.target.value }))} className="mt-0.5 w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-ring" /></div>
                            <div><label className="text-[10px] font-medium text-muted-foreground uppercase">Solution Text</label><textarea value={solutionEditForm.solution_text} onChange={(e) => setSolutionEditForm((p) => ({ ...p, solution_text: e.target.value }))} rows={6} className="mt-0.5 w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-ring resize-none" /></div>
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => setEditingSolutionId(null)} className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-accent cursor-pointer">Cancel</button>
                              <button onClick={handleSolutionEditSave} disabled={solutionEditLoading} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium cursor-pointer disabled:opacity-60">{solutionEditLoading ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />} Save</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="px-2 py-0.5 rounded-md bg-secondary/20 text-secondary-foreground text-xs font-bold">{s.question_label}</span>
                              <div className="flex items-center gap-0.5">
                                <button onClick={() => startEditSolution(s)} className="size-7 rounded-lg hover:bg-accent grid place-items-center cursor-pointer opacity-60 hover:opacity-100 transition" title="Edit"><Pencil className="size-3.5 text-muted-foreground" /></button>
                                <button onClick={async () => { await deleteSolution(id, s.id); fetchSolutions(); }} className="size-7 rounded-lg hover:bg-destructive/10 grid place-items-center cursor-pointer opacity-60 hover:opacity-100 transition" title="Delete"><Trash2 className="size-3.5 text-muted-foreground" /></button>
                              </div>
                            </div>
                            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap"><MathText text={s.solution_text} /></p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
        )}

        {/* Student Answers — full width, own layout */}
        {activeTab === "answers" && (
          <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
            {/* Left: Upload */}
            <div className="space-y-4">
              <h2 className="font-display font-bold text-lg">Upload Student Answers</h2>
              <p className="text-sm text-muted-foreground -mt-2">Select a student, then upload their answer sheets. AI will extract answers per question.</p>

              {/* Student selector */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Select Student</label>
                <SearchableSelect
                  options={students.map((s) => ({ value: s.id, label: s.name, sub: s.student_id }))}
                  value={selectedStudentId}
                  onChange={(v) => { setSelectedStudentId(v); setStudentAnswers([]); setAnswerUploadSuccess(null); setAnswerUploadError(null); }}
                  placeholder="Choose a student..."
                  className="max-w-md"
                />
              </div>

              {selectedStudentId && (
                <>
                  {/* Drop zone */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); setAnswerFiles(Array.from(e.dataTransfer.files).slice(0, 10)); }}
                    className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center hover:border-primary/50 transition"
                  >
                    <input ref={answerFileInputRef} type="file" multiple accept="image/*,.pdf" onChange={(e) => { if (e.target.files) setAnswerFiles(Array.from(e.target.files).slice(0, 10)); }} className="hidden" />
                    <Upload className="size-10 text-primary/40 mx-auto mb-2" />
                    <h3 className="font-bold text-sm">Drop answer sheets here</h3>
                    <p className="text-xs text-muted-foreground mt-1">Images (JPG, PNG) or PDFs · Max 10 files</p>
                    <button onClick={() => answerFileInputRef.current?.click()} className="mt-3 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium cursor-pointer">Browse files</button>
                  </div>

                  {/* Selected files */}
                  {answerFiles.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{answerFiles.length} file{answerFiles.length > 1 ? "s" : ""} selected</span>
                        <button onClick={() => setAnswerFiles([])} className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">Clear</button>
                      </div>
                      {answerFiles.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card text-xs">
                          <FileText className="size-3.5 text-muted-foreground shrink-0" />
                          <span className="flex-1 truncate">{f.name}</span>
                          <span className="text-muted-foreground shrink-0">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                          <FilePreviewButton file={f} />
                          <button onClick={() => setAnswerFiles(answerFiles.filter((_, j) => j !== i))} className="cursor-pointer"><X className="size-3 text-muted-foreground" /></button>
                        </div>
                      ))}
                      <button onClick={handleUploadAnswers} disabled={uploadingAnswers} className="w-full py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium cursor-pointer disabled:opacity-60">
                        {uploadingAnswers ? <><Loader2 className="size-4 animate-spin inline mr-2" /> Processing with AI...</> : <><Brain className="size-4 inline mr-2" /> Extract Answers</>}
                      </button>
                    </div>
                  )}

                  {/* Feedback */}
                  {answerUploadError && <div className="px-4 py-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2"><AlertTriangle className="size-4 shrink-0" /> {answerUploadError}</div>}
                  {answerUploadSuccess && <div className="px-4 py-3 rounded-md bg-success/10 text-success text-sm flex items-center gap-2"><CheckCircle2 className="size-4 shrink-0" /> {answerUploadSuccess}</div>}

                  {uploadingAnswers && (
                    <div className="p-4 rounded-md bg-card border border-border">
                      <div className="flex items-center gap-2 mb-2"><Brain className="size-4 text-primary animate-pulse" /><span className="text-xs font-medium">AI extracting answers...</span></div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden"><motion.div className="h-full bg-primary" initial={{ width: "5%" }} animate={{ width: "85%" }} transition={{ duration: 15, ease: "easeOut" }} /></div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right: Extracted answers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-lg">Extracted Answers</h2>
                {studentAnswers.length > 0 && <span className="text-xs text-muted-foreground">{studentAnswers.length} answers</span>}
              </div>

              {!selectedStudentId ? (
                <div className="p-8 rounded-lg border border-dashed border-border text-center">
                  <User className="size-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Select a student to view or upload their answers.</p>
                </div>
              ) : loadingAnswers ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
              ) : studentAnswers.length === 0 ? (
                <div className="p-8 rounded-lg border border-dashed border-border text-center">
                  <FileText className="size-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No answers uploaded for this student yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin pr-1">
                  {studentAnswers.map((a) => (
                    <div key={a.id} className="p-4 rounded-md border border-border bg-card">
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold">{a.question_label}</span>
                      <p className="mt-2 text-sm text-foreground/80 leading-relaxed"><MathText text={a.answer} /></p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Grading — full width, own layout */}
        {activeTab === "grading" && (
          <div className="max-w-3xl space-y-5">
            <h2 className="font-display font-bold text-lg">AI Grading</h2>
            <p className="text-sm text-muted-foreground -mt-3">Select a student and run AI grading. The system uses dual AI graders for accuracy.</p>

            {/* Student selector */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Select Student</label>
              <SearchableSelect
                options={students.map((s) => ({ value: s.id, label: s.name, sub: s.student_id }))}
                value={selectedStudentId}
                onChange={(v) => { setSelectedStudentId(v); setScores([]); setTotalMarksObtained(0); setGradingSuccess(null); setGradingError(null); }}
                placeholder="Choose a student..."
                className="max-w-md"
              />
            </div>

            {selectedStudentId && (
              <>
                {/* Grade button */}
                <button onClick={handleGrade} disabled={grading} className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground text-sm font-medium cursor-pointer disabled:opacity-60">
                  {grading ? <><Loader2 className="size-4 animate-spin" /> Grading with AI...</> : <><Brain className="size-4" /> Run AI Grading</>}
                </button>

                {gradingError && <div className="px-4 py-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2"><AlertTriangle className="size-4 shrink-0" /> {gradingError}</div>}
                {gradingSuccess && <div className="px-4 py-3 rounded-md bg-success/10 text-success text-sm flex items-center gap-2"><CheckCircle2 className="size-4 shrink-0" /> {gradingSuccess}</div>}

                {grading && (
                  <div className="p-5 rounded-md bg-card border border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <Brain className="size-5 text-primary animate-pulse" />
                      <div><div className="text-sm font-medium">Dual AI graders evaluating...</div><div className="text-xs text-muted-foreground">This may take 15–60 seconds</div></div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden"><motion.div className="h-full bg-primary" initial={{ width: "5%" }} animate={{ width: "80%" }} transition={{ duration: 30, ease: "easeOut" }} /></div>
                  </div>
                )}

                {/* Scores */}
                {loadingScores ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
                ) : scores.length > 0 && (
                  <div className="space-y-4">
                    {/* Total score card */}
                    <div className="p-5 rounded-md bg-primary/5 border border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">Total Score</div>
                          <div className="text-3xl font-bold text-primary mt-1">{totalMarksObtained} <span className="text-lg text-muted-foreground font-normal">/ {assignment?.total_marks || "?"}</span></div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Questions Graded</div>
                          <div className="text-2xl font-bold mt-1">{scores.length}</div>
                        </div>
                      </div>
                    </div>

                    {/* Per-question breakdown */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold">Per-Question Breakdown</h3>
                      {scores.map((s) => (
                        <div key={s.id} className="p-4 rounded-md border border-border bg-card">
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold">{s.question_label}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold">{s.marks}</span>
                              {s.confidence_score != null && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.confidence_score >= 0.8 ? "bg-success/10 text-success" : s.confidence_score >= 0.6 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
                                  {Math.round(s.confidence_score * 100)}% confidence
                                </span>
                              )}
                            </div>
                          </div>
                          {s.student_solution && <p className="text-xs text-muted-foreground leading-relaxed"><MathText text={s.student_solution} /></p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Results — full width table */}
        {activeTab === "results" && (
          <div className="w-full">
            <h2 className="font-display font-bold text-lg mb-4">All Students Results</h2>

            {loadingResults ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
            ) : allResults.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">No students found. Add students first.</div>
            ) : (() => {
              const total = assignment?.total_marks || 100;
              const filterRanges: { label: string; value: string; min: number; max: number }[] = [
                { label: "All", value: "all", min: 0, max: Infinity },
                { label: `${Math.round(total * 0.7)}–${total}`, value: "high", min: total * 0.7, max: total + 1 },
                { label: `${Math.round(total * 0.5)}–${Math.round(total * 0.7)}`, value: "mid", min: total * 0.5, max: total * 0.7 },
                { label: `${Math.round(total * 0.33)}–${Math.round(total * 0.5)}`, value: "low", min: total * 0.33, max: total * 0.5 },
                { label: `0–${Math.round(total * 0.33)}`, value: "fail", min: 0, max: total * 0.33 },
                { label: "Not graded", value: "ungraded", min: -1, max: -1 },
              ];
              const activeRange = filterRanges.find((f) => f.value === resultsFilter) || filterRanges[0];

              const filteredResults = allResults.filter((r) => {
                // Search filter
                const matchesSearch = !resultsSearch ||
                  r.name.toLowerCase().includes(resultsSearch.toLowerCase()) ||
                  r.studentId.toLowerCase().includes(resultsSearch.toLowerCase());
                if (!matchesSearch) return false;

                // Score range filter
                if (resultsFilter === "all") return true;
                if (resultsFilter === "ungraded") return r.totalMarks == null;
                if (r.totalMarks == null) return false;
                return r.totalMarks >= activeRange.min && r.totalMarks < activeRange.max;
              });

              return (
                <>
                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card w-64">
                      <Search className="size-4 text-muted-foreground" />
                      <input
                        placeholder="Search by name or ID..."
                        value={resultsSearch}
                        onChange={(e) => setResultsSearch(e.target.value)}
                        className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="flex items-center gap-1 p-1 rounded-md bg-muted/50 border border-border">
                      {filterRanges.map((f) => (
                        <button
                          key={f.value}
                          onClick={() => setResultsFilter(f.value)}
                          className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${resultsFilter === f.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Count */}
                  <div className="text-xs text-muted-foreground mb-2">{filteredResults.length} of {allResults.length} students</div>

                  {/* Table */}
                  {filteredResults.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">No students match the current filters.</div>
                  ) : (
                    <div className="rounded-md border border-border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50 border-b border-border">
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student ID</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {filteredResults.map((r) => (
                            <tr key={r.studentId} className="hover:bg-accent/50 transition">
                              <td className="px-4 py-3 font-mono text-muted-foreground">{r.studentId}</td>
                              <td className="px-4 py-3 font-medium">{r.name}</td>
                              <td className="px-4 py-3 text-right">
                                {r.totalMarks != null ? (
                                  <span className="font-bold">{r.totalMarks} <span className="text-muted-foreground font-normal">/ {total}</span></span>
                                ) : (
                                  <span className="text-muted-foreground text-xs">Not graded</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </AppShell>
  );
}
