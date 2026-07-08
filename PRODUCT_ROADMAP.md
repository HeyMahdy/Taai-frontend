# TAAI — Product Gap Analysis & Business-Level Roadmap

## Current State Summary

TAAI is an AI-powered automated grading system for university teachers in Bangladesh. The current implementation covers:

- ✅ Auth (signup/login/JWT)
- ✅ User profile (view/edit display name)
- ✅ Student CRUD (add/edit/delete/view)
- ✅ Assignment CRUD (create/view/edit/delete)
- ✅ Questions upload + AI OCR extraction + edit
- ✅ Rubrics upload + AI OCR extraction + edit
- ✅ Teacher solutions upload + AI OCR extraction + edit
- ✅ Landing page, responsive UI, dark mode

---

## GAP ANALYSIS — What's Missing to Reach Business Level

---

### 🔴 CRITICAL GAPS (Must-have for MVP launch)

---

#### 1. Student Answer Sheet Grading (Core Value Proposition)

**The Problem:** The entire product promise is "AI grading" but there's no endpoint or UI for actually grading student submissions against the rubric + solution.

**What's Needed:**

Backend API:
- `POST /assignments/:assignmentId/grade` — Upload student answer sheets, AI grades them against questions + rubric + teacher solution
- `GET /assignments/:assignmentId/grades` — Get all grading results
- `GET /assignments/:assignmentId/grades/:studentId` — Get individual student grade
- `PATCH /assignments/:assignmentId/grades/:gradeId` — Teacher overrides AI score

Frontend:
- Upload student answer sheets (bulk — map to students)
- Grading progress view (real-time status as AI processes each paper)
- Results dashboard per assignment (score distribution, pass/fail, per-question breakdown)
- Individual student grade card (AI score, confidence, per-criterion breakdown, teacher override)
- Feedback generation (AI-written feedback per student)

**Business Impact:** Without this, the product has no core value. Teachers can set up assignments but can't actually grade anything.

---

#### 2. Assignment List API (Backend Gap)

**The Problem:** There's no `GET /assignments` endpoint to list all assignments. Frontend currently stores IDs in localStorage which breaks across devices/browsers.

**What's Needed:**

Backend API:
- `GET /assignments` — List all assignments for the authenticated teacher (with pagination)

Frontend:
- Remove localStorage hack
- Fetch assignments list directly from API

**Business Impact:** Without this, teachers lose their assignment list when they clear browser data or switch devices. Completely breaks the UX.

---

#### 3. Route Protection / Auth Guards

**The Problem:** Any unauthenticated user can navigate to `/dashboard`, `/assignments`, etc. The pages will just show errors when API calls fail with 401.

**What's Needed:**

Frontend:
- Route guard middleware that checks `isAuthenticated()` before rendering protected pages
- Redirect to `/login` if no token
- Redirect to `/dashboard` if authenticated user visits `/login` or `/register`

**Business Impact:** Security baseline. Without this, the app feels broken when unauthenticated users land on protected pages.

---

#### 4. Token Expiry & Refresh

**The Problem:** JWT tokens expire but there's no refresh mechanism. Users get silently logged out and see confusing errors.

**What's Needed:**

Backend API:
- `POST /auth/refresh` — Refresh expired access token (or implement long-lived tokens)

Frontend:
- Detect 401 responses → attempt token refresh → retry original request
- If refresh fails → redirect to login with "Session expired" message
- Show toast notification when session is about to expire

**Business Impact:** Teachers grading 50 papers in one session will get logged out mid-work. Unacceptable UX.

---

### 🟡 HIGH PRIORITY (Needed for usable product)

---

#### 5. Bulk Student Import (CSV/Excel)

**The Problem:** Teachers have 40-200 students. Adding them one by one is painful.

**What's Needed:**

Backend API:
- `POST /students/bulk` — Accept CSV/JSON array of students

Frontend:
- CSV file upload with preview
- Column mapping (ID column, Name column)
- Validation errors shown per row
- Success/failure summary

**Business Impact:** Onboarding friction. If a teacher can't import their class roster in 30 seconds, they'll abandon the product.

---

#### 6. Assignment Workflow Status

**The Problem:** No way to track where an assignment is in the workflow (setup → questions uploaded → rubric uploaded → solutions uploaded → ready to grade → grading → complete).

**What's Needed:**

Backend:
- Add `status` field to assignments (draft, ready, grading, completed)
- Auto-update status based on what's been uploaded

Frontend:
- Visual progress indicator on assignment cards (step 1/4, 2/4, etc.)
- "Ready to Grade" badge when all 3 uploads are complete
- Prevent grading if setup is incomplete

**Business Impact:** Teachers need to know at a glance which assignments are ready and which need more setup.

---

#### 7. Dashboard with Real Analytics

**The Problem:** Dashboard shows basic counts but no actionable insights.

**What's Needed:**

Backend API:
- `GET /dashboard/stats` — Aggregated stats (total graded, avg score, pending, recent activity)
- `GET /assignments/:id/analytics` — Per-assignment analytics

Frontend:
- Total papers graded (all time, this week)
- Average class score across assignments
- Pending grading queue
- Recent activity feed (last 5 actions)
- Per-assignment: score distribution chart, weak topics, pass rate

**Business Impact:** Teachers need to see value immediately on login. A data-rich dashboard proves the product is working.

---

#### 8. Feedback Report Generation

**The Problem:** After grading, teachers need to share results with students. No export or report feature exists.

**What's Needed:**

Backend API:
- `GET /assignments/:id/report` — Generate PDF/summary report
- `GET /assignments/:id/grades/:studentId/feedback` — AI-generated personalized feedback

Frontend:
- "Generate Report" button per assignment
- PDF export (class summary + individual student sheets)
- Shareable link per student (optional)
- AI feedback preview + edit before sharing

**Business Impact:** The end deliverable teachers need. Without reports, they still have to manually write feedback — defeating the purpose.

---

#### 9. Error Boundary & Offline Handling

**The Problem:** Network errors, API timeouts (especially during 30-sec AI processing), and server errors show raw error messages or break the UI.

**What's Needed:**

Frontend:
- Global error boundary with friendly error page
- Retry mechanism for failed uploads
- Offline detection banner ("You're offline — changes will sync when connected")
- Upload progress with cancel option
- Timeout handling for AI processing (show "still processing" after 15s, "taking longer than usual" after 30s)

**Business Impact:** Teachers in Bangladesh may have unstable internet. The app must handle this gracefully or they'll think it's broken.

---

### 🟢 NICE TO HAVE (Competitive advantage)

---

#### 10. Multi-language Support (Bangla + English)

**The Problem:** The UI is English-only but the target users are Bangladeshi teachers who may prefer Bangla.

**What's Needed:**
- i18n framework (react-i18next or similar)
- Bangla translations for all UI strings
- Language toggle in settings
- RTL support not needed (Bangla is LTR)

**Business Impact:** Accessibility for non-English-comfortable teachers. Differentiator in the Bangladeshi market.

---

#### 11. Notification System

**The Problem:** No way to notify teachers when AI grading completes (especially for large batches that take minutes).

**What's Needed:**

Backend:
- WebSocket or SSE for real-time updates
- `GET /notifications` — List notifications

Frontend:
- Toast notifications for completed actions
- Notification bell with unread count
- Email notifications (optional, for long-running tasks)

**Business Impact:** Teachers submit 50 papers and walk away. They need to know when results are ready without refreshing.

---

#### 12. Assignment Templates

**The Problem:** Teachers create similar assignments repeatedly (same subject, similar rubric structure).

**What's Needed:**
- Save assignment as template
- Create from template (pre-fills title pattern, subject, marks, rubric structure)
- Template library (personal)

**Business Impact:** Reduces setup time from 10 minutes to 30 seconds for repeat assignments.

---

#### 13. Student Performance Tracking

**The Problem:** No longitudinal view of how a student performs across assignments.

**What's Needed:**

Backend:
- `GET /students/:id/performance` — Grades across all assignments

Frontend:
- Student profile page with grade history
- Trend chart (improving/declining)
- Weak topic identification per student
- At-risk student flagging

**Business Impact:** Transforms the product from "grading tool" to "teaching intelligence platform."

---

#### 14. Collaboration (Multi-teacher)

**The Problem:** Currently single-teacher only. University courses often have TAs or co-instructors.

**What's Needed:**
- Invite collaborators to an assignment
- Role-based access (owner, grader, viewer)
- Activity log (who graded what)

**Business Impact:** Enterprise/institutional sales require multi-user support.

---

#### 15. Mobile Responsive Dashboard

**The Problem:** Sidebar is hidden on mobile (`hidden md:flex`). No mobile navigation exists.

**What's Needed:**
- Mobile hamburger menu
- Slide-out drawer for navigation
- Touch-friendly upload (camera capture for phone photos of papers)
- Responsive tables → card view on mobile

**Business Impact:** Teachers may want to check grades on their phone. Upload from phone camera is a killer feature.

---

## PRIORITY MATRIX

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| P0 | Student Answer Grading | High | Critical |
| P0 | Assignment List API | Low | Critical |
| P0 | Route Protection | Low | Critical |
| P1 | Token Refresh | Medium | High |
| P1 | Bulk Student Import | Medium | High |
| P1 | Assignment Workflow Status | Medium | High |
| P1 | Dashboard Analytics | Medium | High |
| P1 | Feedback Reports | High | High |
| P2 | Error/Offline Handling | Medium | Medium |
| P2 | Bangla Language | Medium | Medium |
| P2 | Notifications | Medium | Medium |
| P3 | Assignment Templates | Low | Medium |
| P3 | Student Performance | Medium | Medium |
| P3 | Multi-teacher | High | Medium |
| P3 | Mobile Responsive | Medium | Medium |

---

## RECOMMENDED NEXT SPRINT

**Sprint Goal:** Make the product actually grade papers (the core promise).

1. Ask backend dev to add `GET /assignments` (list) endpoint — removes localStorage hack
2. Implement route guards (2 hours of work)
3. Build the grading flow UI (upload student papers → show progress → display results)
4. Work with backend dev on the grading API design
5. Add assignment status tracking

**After that sprint, the product can:**
- Teacher signs up → adds students → creates assignment → uploads questions/rubric/solution → uploads student papers → gets AI grades → reviews/overrides → done.

That's the complete workflow. Everything else is optimization.

---

## TECHNICAL DEBT TO ADDRESS

| Issue | Location | Fix |
|-------|----------|-----|
| localStorage for assignment IDs | `assignments.index.tsx` | Replace with API list endpoint |
| No route guards | All protected routes | Add auth check middleware |
| Unused route files | `analytics`, `grading`, `feedback`, `review`, `notifications`, `upload`, `rubric` | Delete or repurpose when features are built |
| No form validation library used | All forms | Consider using react-hook-form + zod (already in deps) |
| No React Query integration | All API calls | Migrate from raw `useEffect` to `useQuery`/`useMutation` for caching, deduplication, background refresh |
| Topbar fetches profile on every page | `topbar.tsx` | Move to context/provider or React Query cache |

---

## COMPETITIVE LANDSCAPE (Bangladesh EdTech)

| Competitor | What they do | TAAI's advantage |
|-----------|-------------|-----------------|
| Manual grading | Paper-based, 6+ hours/week | AI does it in minutes |
| Google Classroom | Assignment distribution only | No AI grading |
| Turnitin | Plagiarism only | No rubric-based grading |
| Gradescope (US) | AI grading but expensive, English-only | Bangla support, local pricing, OCR for handwritten |

**TAAI's unique position:** AI grading with Bangla + English OCR, rubric-aware evaluation, built specifically for Bangladeshi university workflows.

---

*Last updated: May 2026*
