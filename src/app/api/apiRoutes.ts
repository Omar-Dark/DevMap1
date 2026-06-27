import { convertToQueryString } from "../helper";
import { FiltersProps, QuestionsFilterProps } from "../types/api";

export const apiRoutes = {
  Auth: {
    login:  { route: "/api/v1/auth/login"  },
    signup: { route: "/api/v1/auth/signup" },
    logout: { route: "/api/v1/auth/logout" },
  },

  Users: {
    getProfile:    { route: "/api/v1/users/profile" },
    updateProfile: { route: "/api/v1/users/profile" },   // PUT
    deleteProfile: { route: "/api/v1/users/profile" },   // DELETE
    uploadImage:   { route: "/api/v1/users/profile/upload-image" },  // PUT multipart
    deleteImage:   { route: "/api/v1/users/profile/delete-image" },  // DELETE
    changePassword:{ route: "/api/v1/users/profile/change-password" }, // PUT
    getAllUsers: {
      route: (filters: FiltersProps) =>
        `/api/v1/users?${convertToQueryString(filters)}`,
    },
    getUserById:    { route: (userId: string) => `/api/v1/users/${userId}` },
    deleteUserById: { route: (userId: string) => `/api/v1/users/${userId}` },
    updateUserById: { route: (userId: string) => `/api/v1/users/${userId}` },
    toggleRole:     { route: (userId: string) => `/api/v1/users/${userId}/role` },
  },

  Quiz: {
    // GET /api/v1/quiz → { success, quizData: [{_id, title, description, rank}] }
    getAllQuizzes: { route: "/api/v1/quiz" },
    // GET /api/v1/quiz/:id → { success, quiz: {_id, title, description, rank, questions[]}, totalQuestions }
    getQuizById:  { route: (quizId: string) => `/api/v1/quiz/${quizId}` },
    createQuiz:   { route: "/api/v1/quiz" },
    deleteQuiz:   { route: (quizId: string) => `/api/v1/quiz/${quizId}` },
    updateQuiz:   { route: (quizId: string) => `/api/v1/quiz/${quizId}` },
    exportQuizToPDF:  { route: (quizId: string) => `/api/v1/quiz/${quizId}/export/pdf`  },
    exportQuizToJSON: { route: (quizId: string) => `/api/v1/quiz/${quizId}/export/json` },
    exportQuizToCSV:  { route: (quizId: string) => `/api/v1/quiz/${quizId}/export/csv`  },
    updateQuizById: { route: (quizId: string) => `/api/v1/quiz/${quizId}` },
    deleteQuizById: { route: (quizId: string) => `/api/v1/quiz/${quizId}` },
  },

  Question: {
    // GET /api/v1/quiz/:quizId/questions?page=&limit=&random=
    // → { success, questions:[{_id, question, options, answer}], totalPages, page }
    getAllQuestionsByQuiz: {
      route: (quizId: string, filters: QuestionsFilterProps) =>
        `/api/v1/quiz/${quizId}/questions?${convertToQueryString(filters)}`,
    },
    getQuestion:   { route: (quizId: string, questionId: string) => `/api/v1/quiz/${quizId}/questions/${questionId}` },
    createQuestion:{ route: (quizId: string) => `/api/v1/quiz/${quizId}/questions` },
    updateQuestion:{ route: (quizId: string, questionId: string) => `/api/v1/quiz/${quizId}/questions/${questionId}` },
    deleteQuestion:{ route: (quizId: string, questionId: string) => `/api/v1/quiz/${quizId}/questions/${questionId}` },
    // POST /api/v1/quiz/:quizId/questions/submit
    // body: { answers: [{ questionId: string, answer: string }] }
    // → { success, result: { quizTitle, percentage, grade, status, correctAnswers, wrongAnswers, totalQuestions, answerDetails } }
    submitQuizAnswers: { route: (quizId: string) => `/api/v1/quiz/${quizId}/questions/submit` },
    // GET /api/v1/quiz/:quizId/questions/restart → { success, message }
    restartQuizAnswers:{ route: (quizId: string) => `/api/v1/quiz/${quizId}/questions/restart` },
    explainQuestion:   { route: (quizId: string, questionId: string) => `/api/v1/quiz/${quizId}/questions/${questionId}/explain-question` },
    createQuestionFromQuiz: { route: (quizId: string) => `/api/v1/quiz/${quizId}/questions` },
    updateQuestionFromQuiz: { route: (quizId: string, questionId: string) => `/api/v1/quiz/${quizId}/questions/${questionId}` },
    deleteQuestionFromQuiz: { route: (quizId: string, questionId: string) => `/api/v1/quiz/${quizId}/questions/${questionId}` },
  },

  Roadmap: {
    // GET /api/v1/roadmap → { success, roadmap:[{_id, title, description, tags, image, sections[]}] }
    getAllRoadmaps: { route: "/api/v1/roadmap" },
    // GET /api/v1/roadmap/:id → { success, roadmap }
    getRoadmapById: { route: (roadmapId: string) => `/api/v1/roadmap/${roadmapId}` },
    createRoadmap:  { route: "/api/v1/roadmap" },
    updateRoadmap:  { route: (roadmapId: string) => `/api/v1/roadmap/${roadmapId}` },
    deleteRoadmap:  { route: (roadmapId: string) => `/api/v1/roadmap/${roadmapId}` },
    // GET /api/v1/roadmap/:id/progress (auth required)
    // → { success, roadmap:{_id,title,...}, sections:[{_id,title,completed,resources[]}], completed, total }
    getProgress: { route: (roadmapId: string) => `/api/v1/roadmap/${roadmapId}/progress` },
    // GET /api/v1/roadmap/:id/quizzes?page=&limit= (auth required)
    // → { success, quizzes:[{_id,title,description,rank}] }
    getRelatedQuizzes:   { route: (roadmapId: string, page = 1, limit = 5) => `/api/v1/roadmap/${roadmapId}/quizzes?page=${page}&limit=${limit}` },
    // GET /api/v1/roadmap/:id/projects?page=&limit= (auth required)
    getRelatedProjects:  { route: (roadmapId: string, page = 1, limit = 5) => `/api/v1/roadmap/${roadmapId}/projects?page=${page}&limit=${limit}` },
    exportToPDF:  { route: (roadmapId: string) => `/api/v1/roadmap/${roadmapId}/progress/export/pdf`  },
    exportToJSON: { route: (roadmapId: string) => `/api/v1/roadmap/${roadmapId}/progress/export/json` },
    exportToCSV:  { route: (roadmapId: string) => `/api/v1/roadmap/${roadmapId}/progress/export/csv`  },
    // Legacy aliases used by export helper
    exportRoadmapToPDF:  { route: (roadmapId: string) => `/api/v1/roadmap/${roadmapId}/progress/export/pdf`  },
    exportRoadmapToJSON: { route: (roadmapId: string) => `/api/v1/roadmap/${roadmapId}/progress/export/json` },
    exportRoadmapToCSV:  { route: (roadmapId: string) => `/api/v1/roadmap/${roadmapId}/progress/export/csv`  },
    updateRoadmapById: { route: (roadmapId: string) => `/api/v1/roadmap/${roadmapId}` },
    deleteRoadmapById: { route: (roadmapId: string) => `/api/v1/roadmap/${roadmapId}` },
  },

  Section: {
    getAllRoadmapSections: { route: (roadmapId: string) => `/api/v1/roadmap/${roadmapId}/sections` },
    createSection: { route: (roadmapId: string) => `/api/v1/roadmap/${roadmapId}/sections` },
    getSection:    { route: (roadmapId: string, sectionId: string) => `/api/v1/roadmap/${roadmapId}/sections/${sectionId}` },
    updateSection: { route: (roadmapId: string, sectionId: string) => `/api/v1/roadmap/${roadmapId}/sections/${sectionId}` },
    deleteSection: { route: (roadmapId: string, sectionId: string) => `/api/v1/roadmap/${roadmapId}/sections/${sectionId}` },
    // POST /api/v1/roadmap/:id/sections/:sectionId/complete (auth required)
    // → { success, message, completed: bool }
    toggleCompletionSection: {
      route: (roadmapId: string, sectionId: string) =>
        `/api/v1/roadmap/${roadmapId}/sections/${sectionId}/complete`,
    },
    // legacy alias
    getSectionToRoadmap:    { route: (roadmapId: string, sectionId: string) => `/api/v1/roadmap/${roadmapId}/sections/${sectionId}` },
    createSectionToRoadmap: { route: (roadmapId: string) => `/api/v1/roadmap/${roadmapId}/sections` },
    updateSectionToRoadmap: { route: (roadmapId: string, sectionId: string) => `/api/v1/roadmap/${roadmapId}/sections/${sectionId}` },
    deleteSectionToRoadmap: { route: (roadmapId: string, sectionId: string) => `/api/v1/roadmap/${roadmapId}/sections/${sectionId}` },
  },

  Resource: {
    getAllResourcesToSection: { route: (roadmapId: string, sectionId: string) => `/api/v1/roadmap/${roadmapId}/sections/${sectionId}/resources` },
    createResourceToRoadmap: { route: (roadmapId: string, sectionId: string) => `/api/v1/roadmap/${roadmapId}/sections/${sectionId}/resources` },
    getResourceByIdToRoadmap:    { route: (roadmapId: string, sectionId: string, resourceId: string) => `/api/v1/roadmap/${roadmapId}/sections/${sectionId}/resources/${resourceId}` },
    updateResourceByIdToRoadmap: { route: (roadmapId: string, sectionId: string, resourceId: string) => `/api/v1/roadmap/${roadmapId}/sections/${sectionId}/resources/${resourceId}` },
    deleteResourceByIdToRoadmap: { route: (roadmapId: string, sectionId: string, resourceId: string) => `/api/v1/roadmap/${roadmapId}/sections/${sectionId}/resources/${resourceId}` },
  },

  Project: {
    getAllProjects: {
      route: (filters: FiltersProps) =>
        `/api/v1/project?${convertToQueryString(filters)}`,
    },
    createProject:     { route: "/api/v1/project" },
    getProjectById:    { route: (projectId: string) => `/api/v1/project/${projectId}` },
    updateProjectById: { route: (projectId: string) => `/api/v1/project/${projectId}` },
    deleteProjectById: { route: (projectId: string) => `/api/v1/project/${projectId}` },
    exportProjectToPDF:  { route: (projectId: string) => `/api/v1/project/${projectId}/export/pdf`  },
    exportProjectToJSON: { route: (projectId: string) => `/api/v1/project/${projectId}/export/json` },
    exportProjectToCSV:  { route: (projectId: string) => `/api/v1/project/${projectId}/export/csv`  },
  },

  Steps: {
    getAllSteps: { route: (projectId: string) => `/api/v1/project/${projectId}/steps` },
    createStep:  { route: (projectId: string) => `/api/v1/project/${projectId}/steps` },
    updateStep:  { route: (projectId: string, stepId: string) => `/api/v1/project/${projectId}/steps/${stepId}` },
    toggleStep:  { route: (projectId: string, stepId: string) => `/api/v1/project/${projectId}/steps/${stepId}` },
    deleteStep:  { route: (projectId: string, stepId: string) => `/api/v1/project/${projectId}/steps/${stepId}` },
  },

  // GET /api/v1/achievement (auth required)
  // → { success, achievements: [{_id, title, description, image}] }
  Achievement: {
    getAll: { route: "/api/v1/achievement" },
    getById:{ route: (id: string) => `/api/v1/achievement/${id}` },
  },

  // POST /api/v1/chatbot
  // body: { message: string, history?: [{role: "user"|"model", text: string}] }
  // → { success: true, message: string }  (AI reply in `message` field)
  Chatbot: {
    chat: { route: "/api/v1/chatbot" },
  },
};

// ── Legacy aliases used by Admin components ──────────────────────
// (added to avoid breaking existing admin modals)
