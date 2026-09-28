# Graph Report - threads-edu  (2026-09-28)

## Corpus Check
- Large corpus: 383 files · ~546,062 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 1359 nodes · 3405 edges · 90 communities (63 shown, 27 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 67
- Community 68
- Community 69
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 84
- Community 86
- Community 87

## God Nodes (most connected - your core abstractions)
1. `next` - 134 edges
2. `getSession()` - 121 edges
3. `lucide-react` - 120 edges
4. `Badge()` - 72 edges
5. `Button` - 72 edges
6. `prisma` - 52 edges
7. `logAuditEvent()` - 40 edges
8. `Card` - 31 edges
9. `cn()` - 31 edges
10. `CardHeader` - 29 edges

## Surprising Connections (you probably didn't know these)
- `AdminLayout()` --calls--> `getSession()`  [EXTRACTED]
  app/(admin)/admin/layout.tsx → src/lib/auth/session.ts
- `PublicHomePage()` --calls--> `getSession()`  [EXTRACTED]
  app/(public)/page.tsx → src/lib/auth/session.ts
- `StudentAssignmentsPage()` --calls--> `getSession()`  [EXTRACTED]
  app/(student)/student/assignments/page.tsx → src/lib/auth/session.ts
- `AdminAuditLogMonitorPage()` --calls--> `getSession()`  [EXTRACTED]
  app/(admin)/admin/audit/page.tsx → src/lib/auth/session.ts
- `AdminBatchesPage()` --calls--> `getSession()`  [EXTRACTED]
  app/(admin)/admin/batches/page.tsx → src/lib/auth/session.ts

## Import Cycles
- None detected.

## Communities (90 total, 27 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (29): revalidate, revalidate, revalidate, revalidate, CheckInspectorClient(), revalidate, revalidate, revalidate (+21 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (46): app_globals, inter, metadata, outfit, viewport, ChatbotWidget(), ChatHeader(), ChatHeaderProps (+38 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (47): AdminCourseBuilderPage(), createCourseAction(), MentorDirectoryClient(), CourseSummary, StudentActionsClient(), handleCourseToggle(), handleDeleteConfirm(), handleEditSubmit() (+39 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (24): revalidate, revalidate, dynamic, dynamic, metadata, ReportsClientProps, revalidate, revalidate (+16 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (28): POST(), ChatRequestSchema, POST(), SYSTEM_CONTEXT, POST(), POST(), prisma, @prisma/client (+20 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (33): POST(), archiver, ref_child_process, cloudinary, ref_fs, ref_path, cleanString(), main() (+25 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (42): dependencies, @auth/prisma-adapter, class-variance-authority, cloudinary, clsx, date-fns, framer-motion, googleapis (+34 more)

### Community 7 - "Community 7"
Cohesion: 0.05
Nodes (38): react, react-dom, @types/react, @types/react-dom, name, private, version, @auth/prisma-adapter (+30 more)

### Community 8 - "Community 8"
Cohesion: 0.17
Nodes (19): DBSyncClient(), BatchAttendanceClientProps, LecturesManagementClientProps, ResourcesClientProps, CalendarClientProps, TodayClassroomClientProps, ref_react, BatchWorkspaceHeaderProps (+11 more)

### Community 9 - "Community 9"
Cohesion: 0.08
Nodes (24): revalidate, StudentAssignmentsPage(), Assignment, AssignmentsManagerClient(), handleCreateAssignment(), handleGradeSubmit(), Batch, BRIEFING_TIPS (+16 more)

### Community 10 - "Community 10"
Cohesion: 0.18
Nodes (25): POST(), POST(), POST(), POST(), verifyMentorCredentialsAction(), safeTimingEqual(), verifyGeneralAdminPasskey(), verifyGeneralAdminSecretKey() (+17 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (15): ImageUploader(), ImageUploaderProps, SEOPanel(), SEOPanelProps, MentorBlogDashboardClientProps, MentorBlogEditorClient(), MentorBlogEditorClientProps, PublicBlogArticleClientProps (+7 more)

### Community 12 - "Community 12"
Cohesion: 0.08
Nodes (20): CoursesSplitClientProps, DEFAULT_COURSES, ConveyorCircuitSvgProps, CourseCatalogue(), CourseCatalogueProps, CourseItem, DomainDualTierProps, SingleConveyorTrackProps (+12 more)

### Community 13 - "Community 13"
Cohesion: 0.15
Nodes (20): AdminLayout(), NotificationsClient(), AdminNavigation(), AdminNavigationProps, BroadcastNotificationBanner(), loadNotifications(), BroadcastMessageModal(), handleSubmit() (+12 more)

### Community 14 - "Community 14"
Cohesion: 0.08
Nodes (25): oxlint, vite, @vitejs/plugin-react, dependencies, react, react-dom, devDependencies, oxlint (+17 more)

### Community 15 - "Community 15"
Cohesion: 0.14
Nodes (16): POST(), GET(), googleapis, nodemailer, getGcpAuthClient(), appendLeadToGoogleSheet(), LeadSpreadsheetRow, IndexingResponse (+8 more)

### Community 16 - "Community 16"
Cohesion: 0.12
Nodes (18): asyncio, BaseModel, fastapi, fastapi_middleware_cors, fastapi_responses, get, hashlib, post (+10 more)

### Community 17 - "Community 17"
Cohesion: 0.13
Nodes (20): AdminBatchesPage(), revalidate, StudentDetailPage(), MentorBatchesDirectoryPage(), CalendarClient(), MentorCalendarPage(), revalidate, MentorDashboardPage() (+12 more)

### Community 18 - "Community 18"
Cohesion: 0.11
Nodes (17): BatchAttendancePage(), revalidate, BatchBroadcastPage(), revalidate, BatchWorkspaceLayout(), revalidate, LecturesManagementClient(), BatchLecturesPage() (+9 more)

### Community 19 - "Community 19"
Cohesion: 0.16
Nodes (17): DELETE(), GET(), PATCH(), GET(), POST(), MentorBlogEditPage(), slugify, calculateReadingTime() (+9 more)

### Community 20 - "Community 20"
Cohesion: 0.13
Nodes (19): dynamic, getWorkshopsOnServer(), metadata, WorkshopsPage(), categories, compressImage(), initialWorkshops, sanitizeInputText() (+11 more)

### Community 21 - "Community 21"
Cohesion: 0.12
Nodes (16): AdminAuditLogMonitorPage(), SuperAdminDbSyncPage(), AdminMentorDirectoryPage(), AdminDashboardOverviewPage(), AdminStudentDirectoryPage(), GET(), POST(), BatchResourcesPage() (+8 more)

### Community 22 - "Community 22"
Cohesion: 0.16
Nodes (19): BatchAttendanceClient(), BroadcastClient(), ResourcesClient(), TodayClassroomClient(), DashboardAttendanceCastSection(), adminReviewCorrectionRequestAction(), createBatchResourceAction(), markBatchAttendanceWithLockCheckAction() (+11 more)

### Community 23 - "Community 23"
Cohesion: 0.14
Nodes (13): BroadcastClientProps, revalidate, iconMap, NavItem, TubelightNavbar(), TubelightNavbarProps, TSIDBadge(), CardFooter (+5 more)

### Community 24 - "Community 24"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 25 - "Community 25"
Cohesion: 0.15
Nodes (13): GET(), CourseDetailPage(), dynamic, generateMetadata(), CourseJsonLd(), CourseFaq, CourseLab, CourseModule (+5 more)

### Community 26 - "Community 26"
Cohesion: 0.19
Nodes (14): constantTimeCompare(), UserSession, verifySessionToken(), checkIpRateLimit(), extractIpFromHeaders(), IpIntelligence, ipRateLimitMap, RateLimitBucket (+6 more)

### Community 27 - "Community 27"
Cohesion: 0.26
Nodes (10): POST(), POST(), GET(), ref_crypto, getAuthSecret(), getAuthSecrets(), MENTOR_CLEARANCE_COOKIE, SESSION_COOKIE_NAME (+2 more)

### Community 28 - "Community 28"
Cohesion: 0.14
Nodes (12): metadata, CoursesSplitClient(), dynamic, metadata, ContactFormClient(), ArticleJsonLd(), ArticleJsonLdProps, BreadcrumbItem (+4 more)

### Community 29 - "Community 29"
Cohesion: 0.17
Nodes (11): dotenv, os, qdrant_client_models, re, sentence_transformers, sys, dict_to_text(), extract_chunks() (+3 more)

### Community 30 - "Community 30"
Cohesion: 0.31
Nodes (14): BatchManagementClient(), MentorBatchAttendanceClient(), adminApproveOrRejectCorrectionAction(), assignStudentToBatchAction(), assignStudentToBatchByTsIdAction(), createBatchAction(), createBatchSessionAction(), fetchDeliveredLecturesAuditAction() (+6 more)

### Community 31 - "Community 31"
Cohesion: 0.18
Nodes (8): LogoutButton(), LogoutButtonProps, MobileNavDrawer(), MobileNavDrawerProps, MoreDropdown(), PublicFooter(), navItems, PublicNavbar()

### Community 32 - "Community 32"
Cohesion: 0.17
Nodes (14): logoutAction(), registerAction(), requestOtpAction(), verifyAdminCredentialsAction(), verifyOtpAction(), verifySecurityAdminChallengeAction(), LoginInput, LoginSchema (+6 more)

### Community 33 - "Community 33"
Cohesion: 0.15
Nodes (12): dynamic, PublicHomePage(), ApplyBatchesSection(), CertificatesSection(), FeaturedCoursesSection(), GuestClearanceBanner(), LOGO_DATA, MentorCredibilitySection() (+4 more)

### Community 34 - "Community 34"
Cohesion: 0.13
Nodes (15): devDependencies, archiver, autoprefixer, eslint, eslint-config-next, postcss, prisma, tailwindcss (+7 more)

### Community 35 - "Community 35"
Cohesion: 0.22
Nodes (14): buildGrid(), BuildGridParams, buildKeyframes(), clamp(), coverScale(), EASINGS, KeyframeParams, makeEasing() (+6 more)

### Community 36 - "Community 36"
Cohesion: 0.16
Nodes (9): dynamic, FALLBACK_PATHS, metadata, BentoProject, CATEGORIES, PROJECTS_DATA, DialogDescription, ScrollFloat() (+1 more)

### Community 37 - "Community 37"
Cohesion: 0.23
Nodes (9): GET(), GET(), metadata, PublicBlogLandingPage(), PublicBlogLandingClient(), getBlogCategories(), getBlogTags(), getPublicBlogs() (+1 more)

### Community 38 - "Community 38"
Cohesion: 0.21
Nodes (10): MentorLayout(), MentorAssignmentsPage(), revalidate, MentorVerifyClient(), handleSubmit(), MentorVerifyPage(), metadata, verifyMentorClearanceAction() (+2 more)

### Community 39 - "Community 39"
Cohesion: 0.19
Nodes (11): AI_CARDS, ALL_CARDS, ChallengeCard, ChallengesSection(), CYBER_CARDS, MoltenMetal, colorModeToFloat(), ctxMap (+3 more)

### Community 40 - "Community 40"
Cohesion: 0.29
Nodes (7): db, POST(), ref_stream, getDriveClient(), deleteDriveFile(), createBlogDriveFolder(), uploadFileToDrive()

### Community 41 - "Community 41"
Cohesion: 0.23
Nodes (5): groq, LLMClient, test_generate_stream_handles_empty_choice_chunks(), test_llm_client_uses_supported_groq_model(), types

### Community 42 - "Community 42"
Cohesion: 0.17
Nodes (12): scripts, build, dev, lint, package:hostinger, prisma:db:push, prisma:generate, prisma:seed (+4 more)

### Community 43 - "Community 43"
Cohesion: 0.35
Nodes (10): DELETE(), GET(), getWorkshopModel(), initialSeedWorkshops, memoryWorkshops, POST(), PUT(), sanitizeText() (+2 more)

### Community 44 - "Community 44"
Cohesion: 0.20
Nodes (8): metadata, CATEGORIES, COMPANY_PROFILES, CompanyProfile, DOMAIN_STATS, PlacementHighlightsClient(), PlacementRecord, PLACEMENTS_DATA

### Community 45 - "Community 45"
Cohesion: 0.38
Nodes (7): vitest, generateDomainTSID(), generateTSID(), isValidTSID(), generateSalt(), hashWithSalt(), verifySaltedHash()

### Community 46 - "Community 46"
Cohesion: 0.18
Nodes (8): CourseApplicationModalProps, CourseItem, CourseRoadmapSection(), COURSES_DATA, DomainType, DurationType, ModuleItem, TrainProgressTrackProps

### Community 47 - "Community 47"
Cohesion: 0.27
Nodes (4): HybridRetriever, Performs Hybrid Search using Reciprocal Rank Fusion (RRF) to combine Semantic…, Loads documents into the local BM25 index on startup., VectorStore

### Community 48 - "Community 48"
Cohesion: 0.24
Nodes (9): SecurityAnalystPage(), ref_os, getLiveSecurityLogsService(), getLmsHealthTelemetryService(), getSecurityAnalystChecksService(), LogEntry, SecurityCheckDetailRecord, SecurityCheckItem (+1 more)

### Community 49 - "Community 49"
Cohesion: 0.20
Nodes (9): graphify_analyze, graphify_build, graphify_cluster, graphify_detect, graphify_export, graphify_extract, graphify_report, json (+1 more)

### Community 50 - "Community 50"
Cohesion: 0.22
Nodes (8): ref_react_dom, App(), COURSE_ALIASES, COURSE_CATALOG, COURSE_DETAIL, MENTOR_PROFILES, SUGGESTIONS, ts_inchatbot_main_frontend_src_index

### Community 51 - "Community 51"
Cohesion: 0.39
Nodes (6): GET(), generateMetadata(), PublicBlogArticlePage(), PublicBlogArticleClient(), getPublicBlogBySlug(), getRelatedBlogs()

### Community 52 - "Community 52"
Cohesion: 0.28
Nodes (6): BatchOverviewPage(), revalidate, BatchProgressPage(), revalidate, MetricCard(), MetricCardProps

### Community 53 - "Community 53"
Cohesion: 0.22
Nodes (8): @tiptap/extension-image, @tiptap/extension-link, @tiptap/extension-placeholder, ref_tiptap_extension_underline, @tiptap/react, @tiptap/starter-kit, BlogEditor(), BlogEditorProps

### Community 54 - "Community 54"
Cohesion: 0.25
Nodes (7): heroFlipWords, HeroSection(), HeroSectionProps, FlipWord, FlipWordObject, FlipWords(), FlipWordsProps

### Community 56 - "Community 56"
Cohesion: 0.29
Nodes (4): framer-motion, ImpactStatsSection(), StatItem, STATS_DATA

### Community 57 - "Community 57"
Cohesion: 0.38
Nodes (6): ogl, ctxMap, directionToFloat(), hexToRgb(), Scanner(), ScannerProps

### Community 61 - "Community 61"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 63 - "Community 63"
Cohesion: 0.40
Nodes (3): CareerCard, CAREERS, CareersSection()

### Community 64 - "Community 64"
Cohesion: 0.40
Nodes (4): FAQ_DATA, FaqCategory, FaqItem, FaqSection()

### Community 65 - "Community 65"
Cohesion: 0.40
Nodes (3): ALL_REVIEWS, ReviewItem, StudentReviewsSection()

### Community 69 - "Community 69"
Cohesion: 0.50
Nodes (3): next_dev_types_root_params_d, next_dev_types_routes_d, NOTE: This file should not be edited

### Community 73 - "Community 73"
Cohesion: 0.67
Nodes (3): overrides, deepmerge-ts, nodemailer

## Knowledge Gaps
- **406 isolated node(s):** `revalidate`, `revalidate`, `revalidate`, `revalidate`, `revalidate` (+401 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 570 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 15`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 25`, `Community 26`, `Community 27`, `Community 28`, `Community 30`, `Community 31`, `Community 33`, `Community 36`, `Community 37`, `Community 38`, `Community 39`, `Community 40`, `Community 43`, `Community 44`, `Community 46`, `Community 51`, `Community 52`, `Community 54`, `Community 63`, `Community 65`, `Community 67`, `Community 68`, `Community 72`, `Community 81`, `Community 82`, `Community 83`, `Community 85`, `Community 87`?**
  _High betweenness centrality (0.286) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 7`, `Community 8`, `Community 9`, `Community 11`, `Community 12`, `Community 13`, `Community 17`, `Community 18`, `Community 23`, `Community 25`, `Community 28`, `Community 30`, `Community 31`, `Community 33`, `Community 36`, `Community 39`, `Community 44`, `Community 46`, `Community 51`, `Community 52`, `Community 53`, `Community 54`, `Community 56`, `Community 58`, `Community 62`, `Community 63`, `Community 64`, `Community 65`, `Community 76`, `Community 77`, `Community 78`?**
  _High betweenness centrality (0.151) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 6` to `Community 7`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **What connects `revalidate`, `revalidate`, `revalidate` to the rest of the system?**
  _406 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.10523532522474881 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06662770309760374 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._