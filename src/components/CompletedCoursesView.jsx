import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Save, 
  RotateCcw, 
  Sparkles, 
  Filter, 
  Search, 
  CheckCircle,
  GraduationCap
} from 'lucide-react';
import { api } from '../api';

const GRADE_OPTIONS = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D'];

export default function CompletedCoursesView({
  courses,
  completedCourses,
  currentUser,
  onRefreshData,
  showToast,
  onSelectCourse
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [pendingChanges, setPendingChanges] = useState({});
  const [saving, setSaving] = useState(false);

  // Map completed course IDs to their records
  const completedMap = {};
  completedCourses.forEach((c) => {
    completedMap[c.courseId] = c;
  });

  const handleToggleComplete = async (course) => {
    const isCompleted = !!completedMap[course.id];
    try {
      if (isCompleted) {
        await api.removeCompletedCourse(currentUser.id, course.id);
        showToast(`Removed ${course.code} from completed courses`, 'info');
      } else {
        await api.markCourseCompleted(currentUser.id, course.id, course.semester, 'A');
        showToast(`Marked ${course.code} as completed (Grade: A)`, 'success');
      }
      onRefreshData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleGradeChange = async (courseId, semester, newGrade) => {
    try {
      await api.markCourseCompleted(currentUser.id, courseId, semester, newGrade);
      showToast(`Updated grade for course to ${newGrade}`, 'success');
      onRefreshData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handlePresetSelect = async (preset) => {
    try {
      let targetCourseIds = [];
      if (preset === 'CLEAR') {
        targetCourseIds = [];
      } else if (preset === 'SEM1_2') {
        targetCourseIds = courses.filter((c) => c.semester <= 2).map((c) => c.id);
      } else if (preset === 'SEM1_4') {
        targetCourseIds = courses.filter((c) => c.semester <= 4).map((c) => c.id);
      }

      await api.setCompletedCoursesBulk(currentUser.id, targetCourseIds);
      showToast(`Updated completed courses based on preset!`, 'success');
      onRefreshData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Filter courses
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester =
      selectedSemester === 'ALL' || c.semester === Number(selectedSemester);
    return matchesSearch && matchesSemester;
  });

  // Group by Semester
  const coursesBySemester = {};
  for (let s = 1; s <= 8; s++) {
    coursesBySemester[s] = filteredCourses.filter((c) => c.semester === s);
  }

  return (
    <div>
      <div className="view-header">
        <div className="view-title-group">
          <h1>Select Completed Courses</h1>
          <p>
            Mark the academic subjects you have already completed. The prerequisite engine uses this transcript to calculate eligible courses and plan your future semesters.
          </p>
        </div>
        <div className="header-actions">
          {/* Quick presets */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handlePresetSelect('SEM1_2')}
            title="Mark all 8 courses from Semesters 1 & 2 as completed"
          >
            <GraduationCap size={15} />
            <span>Preset: Sem 1 & 2 (Sophomore)</span>
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handlePresetSelect('SEM1_4')}
            title="Mark all courses from Semesters 1 to 4 as completed"
          >
            <span>Preset: Sem 1-4 (Junior)</span>
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handlePresetSelect('CLEAR')}
          >
            <RotateCcw size={14} />
            <span>Reset All</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by course code or title (e.g., CS101, Data Structures)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Semester:</span>
          <select
            className="filter-select"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            <option value="ALL">All Semesters (1 - 8)</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Box */}
      <div
        style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle size={22} color="#34d399" />
          <div>
            <div style={{ fontWeight: 700, color: '#fff' }}>
              Currently Completed: {completedCourses.length} Courses
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Total Credits Earned:{' '}
              {completedCourses.reduce((acc, c) => acc + (c.credits || 0), 0)} Credits
            </div>
          </div>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
          Tip: Click any course box to toggle completion status.
        </div>
      </div>

      {/* Grouped by Semester */}
      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
        const semList = coursesBySemester[sem] || [];
        if (semList.length === 0) return null;

        const semCompletedCount = semList.filter((c) => !!completedMap[c.id]).length;

        return (
          <div key={sem} style={{ marginBottom: '2.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                borderBottom: '1px solid #23324d',
                paddingBottom: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  Semester {sem}
                </span>
                <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  {semCompletedCount} of {semList.length} Completed
                </span>
              </div>
            </div>

            <div className="course-grid">
              {semList.map((course) => {
                const isCompleted = !!completedMap[course.id];
                const completedRecord = completedMap[course.id];

                return (
                  <div
                    key={course.id}
                    className={`course-card ${isCompleted ? 'status-completed' : ''}`}
                    style={{
                      borderWidth: isCompleted ? '2px' : '1px',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleToggleComplete(course)}
                  >
                    <div>
                      <div className="course-card-top">
                        <span className="course-code">{course.code}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {isCompleted ? (
                            <span className="badge-status completed">
                              <CheckCircle size={12} />
                              Completed
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: '#94a3b8',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                            >
                              <Square size={14} />
                              Not Taken
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="course-title">{course.title}</h4>
                      <p className="course-desc">{course.description}</p>
                    </div>

                    <div>
                      <div className="course-meta">
                        <span className="meta-pill">{course.credits} Credits</span>
                        <span className="meta-pill">{course.departmentCode}</span>
                        {course.prerequisites && course.prerequisites.length > 0 && (
                          <span className="meta-pill" style={{ color: '#fbbf24' }}>
                            {course.prerequisites.length} Prerequisite(s)
                          </span>
                        )}
                      </div>

                      <div
                        className="course-card-actions"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isCompleted ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Grade:</span>
                            <select
                              className="filter-select"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                              value={completedRecord?.grade || 'A'}
                              onChange={(e) =>
                                handleGradeChange(
                                  course.id,
                                  completedRecord?.semesterCompleted || course.semester,
                                  e.target.value
                                )
                              }
                            >
                              {GRADE_OPTIONS.map((g) => (
                                <option key={g} value={g}>
                                  {g}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Click to mark completed
                          </span>
                        )}

                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onSelectCourse(course)}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
