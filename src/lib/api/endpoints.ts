export const API_ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
  },

  students: "/api/students",
  teachers: "/api/teachers",
  classes: "/api/classes",
  subjects: "/api/subjects",
  grades: "/api/grades",
  attendance: "/api/attendance",
} as const;
