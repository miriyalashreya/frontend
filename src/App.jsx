import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import WorkflowStepper from './components/WorkflowStepper';
import DashboardView from './components/DashboardView';
import CompletedCoursesView from './components/CompletedCoursesView';
import EligibilityView from './components/EligibilityView';
import CoursePathView from './components/CoursePathView';
import SemesterPlannerView from './components/SemesterPlannerView';
import DegreeAuditView from './components/DegreeAuditView';
import AdminPortalView from './components/AdminPortalView';
import CourseDetailModal from './components/CourseDetailModal';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import { api } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [eligibilityList, setEligibilityList] = useState([]);
  const [pathSummary, setPathSummary] = useState(null);
  const [modalCourse, setModalCourse] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize data
  useEffect(() => {
    initApp();
  }, []);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const initApp = async () => {
    try {
      setLoading(true);
      const [users, allCourses, allDepts] = await Promise.all([
        api.getAllUsers(),
        api.getCourses(),
        api.getDepartments(),
      ]);

      setUsersList(users);
      setCourses(allCourses);
      setDepartments(allDepts);

      // Check for saved user in localStorage, or default to student "John Doe"
      const savedUserId = localStorage.getItem('coursepath_userId');
      let targetUser = users.find((u) => u.id === Number(savedUserId));

      if (!targetUser) {
        targetUser =
          users.find((u) => u.username === 'student') ||
          users.find((u) => u.role === 'STUDENT') ||
          users[0];
      }

      if (targetUser) {
        setCurrentUser(targetUser);
        await loadStudentData(targetUser.id);
      }
    } catch (err) {
      console.error('Failed to initialize application:', err);
      showToast('Error connecting to backend API: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentData = async (studentId) => {
    try {
      const [completed, eligibility, path] = await Promise.all([
        api.getCompletedCourses(studentId),
        api.getEligibility(studentId),
        api.getCoursePathSummary(studentId),
      ]);

      setCompletedCourses(completed);
      setEligibilityList(eligibility);
      setPathSummary(path);
    } catch (err) {
      console.error('Failed to load student data:', err);
    }
  };

  const handleSwitchUser = async (userId) => {
    const targetUser = usersList.find((u) => u.id === userId);
    if (!targetUser) return;
    setCurrentUser(targetUser);
    localStorage.setItem('coursepath_userId', String(targetUser.id));

    if (targetUser.role === 'ADMIN') {
      setActiveTab('admin');
      showToast(`Switched to Administrator profile (${targetUser.fullName})`, 'info');
    } else {
      await loadStudentData(targetUser.id);
      setActiveTab('dashboard');
      showToast(`Switched to student profile (${targetUser.fullName})`, 'info');
    }
  };

  const handleLoginSuccess = async (user) => {
    setCurrentUser(user);
    localStorage.setItem('coursepath_userId', String(user.id));
    
    // Refresh users list so new user is selectable in dropdown
    const users = await api.getAllUsers();
    setUsersList(users);

    if (user.role === 'ADMIN') {
      setActiveTab('admin');
    } else {
      await loadStudentData(user.id);
      setActiveTab('dashboard');
    }
  };

  const handleRefreshData = async () => {
    const allCourses = await api.getCourses();
    setCourses(allCourses);
    if (currentUser?.id) {
      await loadStudentData(currentUser.id);
    }
  };

  const handleAddToPlan = (course) => {
    setActiveTab('planner');
    showToast(`Navigated to Semester Planner for ${course.code}`, 'info');
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        usersList={usersList}
        onSwitchUser={handleSwitchUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Workflow Progress Bar matching the abstract */}
      <WorkflowStepper activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Body */}
      <main className="main-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '6rem 0' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#60a5fa' }}>
              Initializing CoursePath Academic Engine...
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>
              Loading curriculum graph and student records from Spring Boot backend
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                pathSummary={pathSummary}
                currentUser={currentUser}
                setActiveTab={setActiveTab}
                onSelectCourse={setModalCourse}
              />
            )}

            {activeTab === 'completed' && (
              <CompletedCoursesView
                courses={courses}
                completedCourses={completedCourses}
                currentUser={currentUser}
                onRefreshData={handleRefreshData}
                showToast={showToast}
                onSelectCourse={setModalCourse}
              />
            )}

            {activeTab === 'eligibility' && (
              <EligibilityView
                eligibilityList={eligibilityList}
                onSelectCourse={setModalCourse}
                onAddToPlan={handleAddToPlan}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'path' && (
              <CoursePathView
                pathSummary={pathSummary}
                allCourses={courses}
                eligibilityList={eligibilityList}
                onSelectCourse={setModalCourse}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'planner' && (
              <SemesterPlannerView
                currentUser={currentUser}
                pathSummary={pathSummary}
                onRefreshData={handleRefreshData}
                showToast={showToast}
                onSelectCourse={setModalCourse}
              />
            )}

            {activeTab === 'audit' && (
              <DegreeAuditView
                currentUser={currentUser}
                pathSummary={pathSummary}
                courses={courses}
                completedCourses={completedCourses}
                onSelectCourse={setModalCourse}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'admin' && (
              <AdminPortalView
                courses={courses}
                departments={departments}
                onRefreshData={handleRefreshData}
                showToast={showToast}
              />
            )}
          </>
        )}
      </main>

      {/* Course Detail Popup Modal */}
      {modalCourse && (
        <CourseDetailModal
          course={modalCourse}
          allCourses={courses}
          onClose={() => setModalCourse(null)}
          onAddToPlan={handleAddToPlan}
        />
      )}

      {/* Authentication & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        departments={departments}
        showToast={showToast}
      />

      {/* Floating Toast Notifications */}
      <Toast
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
