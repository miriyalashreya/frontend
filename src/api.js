// CoursePath API Client
const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      let errorMsg = `Request failed: ${response.statusText}`;
      try {
        const errJson = await response.json();
        errorMsg = errJson.message || errJson.error || errorMsg;
      } catch (e) {
        const text = await response.text();
        if (text) errorMsg = text;
      }
      throw new Error(errorMsg);
    }
    
    // Check if empty response (e.g., 200/204 No Content for DELETE)
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  register: (data) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAllStudents: () => request('/auth/students'),
  getAllUsers: () => request('/auth/users'),

  // Departments
  getDepartments: () => request('/departments'),
  createDepartment: (dept) =>
    request('/departments', {
      method: 'POST',
      body: JSON.stringify(dept),
    }),
  deleteDepartment: (id) =>
    request(`/departments/${id}`, {
      method: 'DELETE',
    }),

  // Courses
  getCourses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/courses${query ? `?${query}` : ''}`);
  },
  getCourse: (id) => request(`/courses/${id}`),
  createCourse: (course) =>
    request('/courses', {
      method: 'POST',
      body: JSON.stringify(course),
    }),
  updateCourse: (id, course) =>
    request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(course),
    }),
  deleteCourse: (id) =>
    request(`/courses/${id}`, {
      method: 'DELETE',
    }),

  // Prerequisites
  getPrerequisitesForCourse: (courseId) =>
    request(`/prerequisites/course/${courseId}`),
  addPrerequisite: (data) =>
    request('/prerequisites', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  removePrerequisite: (id) =>
    request(`/prerequisites/${id}`, {
      method: 'DELETE',
    }),

  // Student Course Progress & Path
  getCompletedCourses: (studentId) =>
    request(`/student/${studentId}/completed`),
  markCourseCompleted: (studentId, courseId, semesterCompleted, grade) =>
    request(`/student/${studentId}/completed`, {
      method: 'POST',
      body: JSON.stringify({ courseId, semesterCompleted, grade }),
    }),
  removeCompletedCourse: (studentId, courseId) =>
    request(`/student/${studentId}/completed/${courseId}`, {
      method: 'DELETE',
    }),
  setCompletedCoursesBulk: (studentId, courseIds) =>
    request(`/student/${studentId}/completed/bulk`, {
      method: 'POST',
      body: JSON.stringify(courseIds),
    }),
  getEligibility: (studentId) =>
    request(`/student/${studentId}/eligibility`),
  getCoursePathSummary: (studentId) =>
    request(`/student/${studentId}/course-path`),

  // Semester Plans
  getStudentPlans: (studentId) =>
    request(`/student/${studentId}/plans`),
  createSemesterPlan: (studentId, planData) =>
    request(`/student/${studentId}/plans`, {
      method: 'POST',
      body: JSON.stringify(planData),
    }),
  deletePlan: (planId) =>
    request(`/plans/${planId}`, {
      method: 'DELETE',
    }),

  // Admin Stats
  getAdminStats: () => request('/admin/stats'),
};
