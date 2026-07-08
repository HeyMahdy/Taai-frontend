# TAAI — Extended Field Requirements for Business-Level Product

This document lists all the additional fields needed for each entity/system to make the product complete and professional. These are fields that the **backend needs to add** beyond the current API spec.

---

## 1. Teacher Profile (User)

### Current Fields
- `id` (UUID)
- `email` (string)
- `display_name` (string, nullable)
- `password_hash` (internal)
- `created_at` (timestamp)

### Missing Fields Needed

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `first_name` | string | Yes | Teacher's first name |
| `last_name` | string | Yes | Teacher's last name |
| `phone` | string | No | Contact number (e.g. +880...) |
| `institution` | string | Yes | University/college name |
| `department` | string | No | Department (e.g. Computer Science) |
| `designation` | string | No | Title (e.g. Associate Professor, Lecturer) |
| `employee_id` | string | No | Institutional employee/faculty ID |
| `avatar_url` | string | No | Profile picture URL |
| `bio` | text | No | Short bio/about |
| `country` | string | No | Default: Bangladesh |
| `timezone` | string | No | For scheduling (default: Asia/Dhaka) |
| `preferred_language` | enum | No | `en` or `bn` (English/Bangla) |
| `updated_at` | timestamp | Auto | Last profile update |

### Why These Matter
- **Institution + Department**: Required for reports, branding on exported PDFs, multi-teacher collaboration
- **Phone**: For account recovery, notifications
- **Designation**: Displayed on reports shared with students
- **Employee ID**: Institutional verification, enterprise onboarding

---

## 2. Students

### Current Fields
- `teacher_id` (UUID, FK)
- `id` (string — student ID)
- `name` (string)
- `created_at` (timestamp)

### Missing Fields Needed

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | No | Student email for sharing results |
| `phone` | string | No | Student contact |
| `section` | string | No | Class section (e.g. A, B, C) |
| `batch` | string | No | Batch/year (e.g. 2021, 2022) |
| `department` | string | No | Student's department |
| `program` | string | No | Degree program (e.g. BSc CSE, BBA) |
| `semester` | string | No | Current semester (e.g. 5th, 6th) |
| `gender` | enum | No | `male`, `female`, `other` |
| `guardian_name` | string | No | Parent/guardian name |
| `guardian_phone` | string | No | For parent communication |
| `avatar_url` | string | No | Student photo |
| `status` | enum | No | `active`, `inactive`, `graduated`, `dropped` |
| `notes` | text | No | Teacher's private notes about the student |
| `updated_at` | timestamp | Auto | Last update |

### Why These Matter
- **Section + Batch**: Teachers handle multiple sections; filtering is essential
- **Email**: Required for sharing grade reports with students
- **Program + Semester**: Context for grading standards (1st year vs 4th year)
- **Status**: Track active vs dropped students, don't include dropped in grading
- **Guardian info**: Parent communication for underperforming students (common in BD universities)

---

## 3. Assignments

### Current Fields
- `id` (integer)
- `teacher_id` (UUID, FK)
- `title` (string)
- `subject` (string)
- `topic` (string, nullable)
- `total_marks` (integer)
- `created_at` (timestamp)

### Missing Fields Needed

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | text | No | Detailed instructions for the assignment |
| `course_code` | string | No | Course code (e.g. CSE-221, PHY-101) |
| `section` | string | No | Which section this assignment is for |
| `batch` | string | No | Which batch (e.g. 2021) |
| `semester` | string | No | Semester (e.g. Fall 2025, Spring 2026) |
| `assignment_type` | enum | Yes | `exam`, `quiz`, `homework`, `lab`, `project`, `midterm`, `final` |
| `deadline` | timestamp | No | Submission deadline |
| `issued_date` | timestamp | No | When the assignment was given |
| `duration_minutes` | integer | No | Time allowed (for exams) |
| `status` | enum | Auto | `draft`, `setup`, `ready`, `grading`, `completed` |
| `passing_marks` | integer | No | Minimum marks to pass |
| `grading_scale` | enum | No | `percentage`, `gpa_4`, `gpa_5`, `letter_grade` |
| `is_published` | boolean | No | Whether results are shared with students |
| `instructions` | text | No | Special instructions for grading AI |
| `allow_late_submission` | boolean | No | Accept late papers |
| `penalty_per_day` | number | No | Late penalty percentage per day |
| `weight` | number | No | Weight in final grade (e.g. 20% of total) |
| `tags` | string[] | No | Tags for categorization |
| `updated_at` | timestamp | Auto | Last update |

### Why These Matter
- **Course code + Section + Batch**: Teachers teach multiple sections of the same course
- **Assignment type**: Different grading standards for quiz vs final exam
- **Deadline + Duration**: Essential for exam management
- **Status**: Workflow tracking (is setup complete? is grading done?)
- **Grading scale**: BD universities use different scales (GPA 4.0, percentage, letter)
- **Passing marks**: Auto-flag failing students
- **Weight**: Calculate final course grade from multiple assignments

---

## 4. Questions

### Current Fields
- `id` (integer)
- `teacher_id` (UUID, FK)
- `assignment_id` (integer, FK)
- `question_label` (string)
- `question_description` (text)
- `marks` (integer, nullable)
- `created_at` (timestamp)

### Missing Fields Needed

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question_type` | enum | No | `short_answer`, `essay`, `mcq`, `problem_solving`, `diagram`, `code` |
| `difficulty` | enum | No | `easy`, `medium`, `hard` |
| `bloom_level` | enum | No | `remember`, `understand`, `apply`, `analyze`, `evaluate`, `create` |
| `topic` | string | No | Specific topic this question covers |
| `sub_questions` | jsonb | No | For multi-part questions (a, b, c) |
| `expected_length` | string | No | Expected answer length (e.g. "2-3 paragraphs", "50 words") |
| `order` | integer | No | Display order |
| `is_bonus` | boolean | No | Bonus question (doesn't count against total) |
| `image_url` | string | No | Attached diagram/figure |
| `updated_at` | timestamp | Auto | Last update |

### Why These Matter
- **Question type**: AI needs to know if it's grading an essay vs a math problem vs code
- **Bloom's taxonomy level**: Aligns with academic standards, useful for analytics
- **Difficulty**: Helps in analytics (are students failing easy or hard questions?)
- **Order**: Maintain question sequence as in the original paper
- **Sub-questions**: Many exam questions have parts (1a, 1b, 1c)

---

## 5. Rubrics

### Current Fields
- `id` (integer)
- `teacher_id` (UUID, FK)
- `assignment_id` (integer, FK)
- `question_label` (string)
- `rubric_description` (JSONB — criteria, penalties, fatal_flaw)
- `created_at` (timestamp)

### Missing Fields Needed

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `max_marks` | integer | Yes | Maximum marks for this rubric's question |
| `grading_approach` | enum | No | `holistic`, `analytic`, `checklist` |
| `partial_credit` | boolean | No | Allow partial marks or all-or-nothing |
| `keywords` | string[] | No | Key terms AI should look for in answers |
| `common_mistakes` | jsonb | No | List of common errors and their deductions |
| `exemplar_answer` | text | No | Example of a perfect answer |
| `notes` | text | No | Teacher notes for manual review |
| `order` | integer | No | Display order matching question order |
| `updated_at` | timestamp | Auto | Last update |

### Why These Matter
- **Max marks**: Rubric needs to know the ceiling for scoring
- **Grading approach**: Holistic (overall impression) vs analytic (point by point) changes AI behavior
- **Keywords**: Helps AI identify correct concepts even if phrased differently
- **Common mistakes**: Pre-loaded deduction rules for frequent errors
- **Exemplar answer**: AI can compare student answers against the ideal

---

## 6. Teacher Solutions

### Current Fields
- `id` (integer)
- `teacher_id` (UUID, FK)
- `assignment_id` (integer, FK)
- `question_label` (string)
- `solution_text` (text)
- `created_at` (timestamp)

### Missing Fields Needed

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `solution_type` | enum | No | `text`, `code`, `mathematical`, `diagram_description` |
| `alternative_solutions` | text[] | No | Multiple valid approaches |
| `key_steps` | jsonb | No | Required steps for problem-solving questions |
| `marks_distribution` | jsonb | No | How marks are split across steps |
| `references` | text | No | Textbook/source references |
| `notes` | text | No | Additional context for AI grading |
| `order` | integer | No | Display order |
| `updated_at` | timestamp | Auto | Last update |

### Why These Matter
- **Alternative solutions**: Math/code problems often have multiple valid approaches
- **Key steps**: For problem-solving, partial credit depends on which steps are correct
- **Marks distribution**: "Step 1 = 2 marks, Step 2 = 3 marks" for granular grading

---

## 7. Grading Results (NEW — Doesn't exist yet)

### Fields Needed

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | integer | Auto | Primary key |
| `assignment_id` | integer | Yes | FK to assignment |
| `student_id` | string | Yes | FK to student |
| `teacher_id` | UUID | Yes | FK to teacher |
| `total_score` | number | Yes | Total marks obtained |
| `total_possible` | number | Yes | Total marks possible |
| `percentage` | number | Auto | Calculated percentage |
| `grade_letter` | string | Auto | Letter grade (A+, A, B+, etc.) |
| `gpa` | number | Auto | GPA equivalent |
| `status` | enum | Yes | `pending`, `grading`, `graded`, `reviewed`, `published` |
| `ai_confidence` | number | Yes | Overall AI confidence (0-100) |
| `needs_review` | boolean | Auto | True if confidence < threshold |
| `per_question_scores` | jsonb | Yes | Array of {question_id, score, max, confidence, feedback} |
| `overall_feedback` | text | No | AI-generated overall feedback |
| `teacher_comments` | text | No | Teacher's manual comments |
| `teacher_override_score` | number | No | If teacher overrides AI score |
| `graded_at` | timestamp | Auto | When AI grading completed |
| `reviewed_at` | timestamp | No | When teacher reviewed |
| `published_at` | timestamp | No | When shared with student |
| `answer_sheet_urls` | string[] | Yes | Uploaded answer sheet files |
| `created_at` | timestamp | Auto | Record creation |
| `updated_at` | timestamp | Auto | Last update |

---

## 8. Course/Class (NEW — Doesn't exist yet)

### Why Needed
Teachers don't just have assignments — they have **courses**. A course has multiple assignments, a roster of students, and runs for a semester.

### Fields Needed

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | integer | Auto | Primary key |
| `teacher_id` | UUID | Yes | FK to teacher |
| `title` | string | Yes | Course name (e.g. "Data Structures") |
| `course_code` | string | Yes | Code (e.g. CSE-221) |
| `section` | string | No | Section (A, B, C) |
| `semester` | string | Yes | e.g. "Spring 2026" |
| `batch` | string | No | Student batch year |
| `department` | string | No | Department |
| `credit_hours` | number | No | Credit hours |
| `student_ids` | string[] | No | Enrolled student IDs |
| `status` | enum | No | `active`, `completed`, `archived` |
| `grading_policy` | jsonb | No | Weight distribution (midterm 30%, final 40%, etc.) |
| `created_at` | timestamp | Auto | |
| `updated_at` | timestamp | Auto | |

### Why This Matters
- Assignments belong to a course
- Students are enrolled in courses
- Final grade = weighted sum of all assignment grades in a course
- Semester-based organization is how universities work

---

## 9. Activity Log / Audit Trail (NEW)

### Fields Needed

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Primary key |
| `teacher_id` | UUID | Who performed the action |
| `action` | enum | `created`, `updated`, `deleted`, `graded`, `published`, `uploaded` |
| `entity_type` | string | `assignment`, `student`, `question`, `rubric`, `solution`, `grade` |
| `entity_id` | string | ID of the affected entity |
| `details` | jsonb | Additional context |
| `created_at` | timestamp | When it happened |

### Why This Matters
- Audit trail for accountability
- "Recent activity" feed on dashboard
- Undo support (know what was changed)
- Required for institutional compliance

---

## SUMMARY — Total New Fields by Entity

| Entity | Current Fields | Proposed Additional | Total |
|--------|---------------|-------------------|-------|
| Teacher Profile | 5 | 13 | 18 |
| Students | 4 | 14 | 18 |
| Assignments | 7 | 18 | 25 |
| Questions | 7 | 10 | 17 |
| Rubrics | 6 | 9 | 15 |
| Solutions | 6 | 8 | 14 |
| Grading Results | — | 20 | 20 (NEW) |
| Course/Class | — | 13 | 13 (NEW) |
| Activity Log | — | 7 | 7 (NEW) |

**Total new fields to add: ~112 fields across 9 entities**

---

## IMPLEMENTATION PRIORITY

### Phase 1 — Minimum viable additions (do now)
- Teacher: `institution`, `department`, `designation`, `phone`
- Student: `email`, `section`, `batch`, `program`, `status`
- Assignment: `course_code`, `assignment_type`, `deadline`, `status`, `description`
- Grading Results: entire entity (core feature)

### Phase 2 — Enhanced functionality
- Teacher: `avatar_url`, `employee_id`
- Student: `semester`, `gender`, `notes`
- Assignment: `semester`, `grading_scale`, `passing_marks`, `weight`, `duration_minutes`
- Questions: `question_type`, `difficulty`, `order`
- Rubrics: `max_marks`, `grading_approach`, `keywords`
- Solutions: `alternative_solutions`, `key_steps`

### Phase 3 — Full platform
- Course/Class entity
- Activity Log
- All remaining optional fields
- Guardian info, bio, timezone, etc.

---

## ACTION ITEMS FOR BACKEND DEVELOPER

1. **Immediate**: Add `GET /assignments` list endpoint (blocks frontend)
2. **This week**: Add Phase 1 fields to existing tables (migration)
3. **Next week**: Design and implement Grading Results entity + API
4. **Sprint 2**: Course entity, Activity Log, Phase 2 fields

---

*This document should be shared with the backend developer for API schema planning.*
