import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  Layers, 
  BookOpen, 
  Building, 
  Link2,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api';

export default function AdminPortalView({
  courses,
  departments,
  onRefreshData,
  showToast
}) {
  const [activeAdminTab, setActiveAdminTab] = useState('courses'); // courses, prerequisites, departments, stats
  const [adminStats, setAdminStats] = useState(null);

  // New Course Form State
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    code: '',
    title: '',
    description: '',
    credits: 3,
    semester: 1,
    departmentId: '',
  });

  // Prerequisite Form State
  const [prereqForm, setPrereqForm] = useState({
    courseId: '',
    prerequisiteCourseId: '',
    requirementType: 'MANDATORY',
    minGrade: 'C',
  });

  // Department Form State
  const [deptForm, setDeptForm] = useState({
    code: '',
    name: '',
    description: '',
  });

  useEffect(() => {
    loadStats();
    if (departments.length > 0 && !courseForm.departmentId) {
      setCourseForm((prev) => ({ ...prev, departmentId: departments[0].id }));
    }
  }, [departments]);

  const loadStats = async () => {
    try {
      const stats = await api.getAdminStats();
      setAdminStats(stats);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await api.updateCourse(editingCourse.id, {
          ...courseForm,
          credits: Number(courseForm.credits),
          semester: Number(courseForm.semester),
          departmentId: Number(courseForm.departmentId),
        });
        showToast(`Course ${courseForm.code} updated successfully`, 'success');
      } else {
        await api.createCourse({
          ...courseForm,
          credits: Number(courseForm.credits),
          semester: Number(courseForm.semester),
          departmentId: Number(courseForm.departmentId),
        });
        showToast(`Course ${courseForm.code} created successfully`, 'success');
      }
      setIsAddingCourse(false);
      setEditingCourse(null);
      setCourseForm({
        code: '',
        title: '',
        description: '',
        credits: 3,
        semester: 1,
        departmentId: departments[0]?.id || '',
      });
      onRefreshData();
      loadStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteCourse = async (id, code) => {
    if (!window.confirm(`Delete course ${code}? This will also delete any prerequisite links involving this course.`)) return;
    try {
      await api.deleteCourse(id);
      showToast(`Deleted course ${code}`, 'info');
      onRefreshData();
      loadStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEditClick = (c) => {
    setEditingCourse(c);
    setCourseForm({
      code: c.code,
      title: c.title,
      description: c.description || '',
      credits: c.credits,
      semester: c.semester,
      departmentId: c.departmentId || departments[0]?.id,
    });
    setIsAddingCourse(true);
  };

  const handleAddPrerequisite = async (e) => {
    e.preventDefault();
    if (!prereqForm.courseId || !prereqForm.prerequisiteCourseId) {
      showToast('Please select both a course and a prerequisite course.', 'error');
      return;
    }

    try {
      await api.addPrerequisite({
        courseId: Number(prereqForm.courseId),
        prerequisiteCourseId: Number(prereqForm.prerequisiteCourseId),
        requirementType: prereqForm.requirementType,
        minGrade: prereqForm.minGrade,
      });
      showToast('Prerequisite relationship added successfully!', 'success');
      setPrereqForm({
        courseId: '',
        prerequisiteCourseId: '',
        requirementType: 'MANDATORY',
        minGrade: 'C',
      });
      onRefreshData();
      loadStats();
    } catch (err) {
      // Highlights cycle detection errors or duplicates!
      showToast(err.message, 'error');
    }
  };

  const handleRemovePrereq = async (prereqId) => {
    try {
      await api.removePrerequisite(prereqId);
      showToast('Prerequisite relationship removed', 'info');
      onRefreshData();
      loadStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      await api.createDepartment(deptForm);
      showToast(`Department ${deptForm.code} added successfully`, 'success');
      setDeptForm({ code: '', name: '', description: '' });
      onRefreshData();
      loadStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Flatten all prerequisites for table view
  const allPrerequisites = [];
  courses.forEach((c) => {
    if (c.prerequisites) {
      c.prerequisites.forEach((p) => {
        allPrerequisites.push({
          ...p,
          courseCode: c.code,
          courseTitle: c.title,
        });
      });
    }
  });

  return (
    <div>
      <div className="view-header">
        <div className="view-title-group">
          <h1>Admin Control & Curriculum Management</h1>
          <p>
            Configure departments, manage curriculum course offerings, define prerequisite dependency rules with automated cycle detection, and monitor bottlenecks.
          </p>
        </div>
      </div>

      {/* Admin Quick Metrics */}
      {adminStats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Active Students</span>
              <div className="stat-icon" style={{ color: '#38bdf8' }}>
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="stat-value">{adminStats.totalStudents}</div>
            <div className="stat-subtext">Registered academic profiles</div>
          </div>

          <div className="stat-card green">
            <div className="stat-top">
              <span className="stat-label">Curriculum Courses</span>
              <div className="stat-icon" style={{ color: '#34d399' }}>
                <BookOpen size={18} />
              </div>
            </div>
            <div className="stat-value">{adminStats.totalCourses}</div>
            <div className="stat-subtext">Across {adminStats.totalDepartments} departments</div>
          </div>

          <div className="stat-card amber">
            <div className="stat-top">
              <span className="stat-label">Prerequisite Rules</span>
              <div className="stat-icon" style={{ color: '#fbbf24' }}>
                <Link2 size={18} />
              </div>
            </div>
            <div className="stat-value">{adminStats.totalPrerequisites}</div>
            <div className="stat-subtext">Active dependency edges</div>
          </div>

          <div className="stat-card purple">
            <div className="stat-top">
              <span className="stat-label">Semester Plans</span>
              <div className="stat-icon" style={{ color: '#c084fc' }}>
                <Layers size={18} />
              </div>
            </div>
            <div className="stat-value">{adminStats.totalPlansCreated}</div>
            <div className="stat-subtext">Student plans configured</div>
          </div>
        </div>
      )}

      {/* Bottleneck Analysis Banner */}
      {adminStats?.topBottlenecks && adminStats.topBottlenecks.length > 0 && (
        <div
          className="card"
          style={{
            marginBottom: '2rem',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            background: 'rgba(245, 158, 11, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
            <AlertTriangle size={20} color="#f59e0b" />
            <span style={{ fontWeight: 700, color: '#fbbf24', fontSize: '1rem' }}>
              Academic Prerequisite Bottleneck Insights
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.75rem' }}>
            These foundation courses act as prerequisites for the largest number of advanced subjects. A failure or delay in these courses causes downstream degree delays:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
            {adminStats.topBottlenecks.map((b) => (
              <span
                key={b.courseId}
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#fde68a',
                }}
              >
                {b.courseCode} ({b.courseTitle}): Blocks <strong>{b.dependentCoursesCount}</strong> future courses
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Admin Module Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #23324d', paddingBottom: '0.5rem' }}>
        <button
          className={`btn ${activeAdminTab === 'courses' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveAdminTab('courses')}
        >
          <BookOpen size={15} />
          <span>Courses Catalog ({courses.length})</span>
        </button>

        <button
          className={`btn ${activeAdminTab === 'prerequisites' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveAdminTab('prerequisites')}
        >
          <Link2 size={15} />
          <span>Prerequisite Dependencies ({allPrerequisites.length})</span>
        </button>

        <button
          className={`btn ${activeAdminTab === 'departments' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveAdminTab('departments')}
        >
          <Building size={15} />
          <span>Departments ({departments.length})</span>
        </button>
      </div>

      {/* TAB 1: COURSES CATALOG */}
      {activeAdminTab === 'courses' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
              Academic Course Offerings
            </h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingCourse(null);
                setCourseForm({
                  code: '',
                  title: '',
                  description: '',
                  credits: 3,
                  semester: 1,
                  departmentId: departments[0]?.id || '',
                });
                setIsAddingCourse(true);
              }}
            >
              <Plus size={14} />
              <span>Add New Course</span>
            </button>
          </div>

          {/* Add / Edit Course Form Modal */}
          {isAddingCourse && (
            <div className="modal-backdrop" onClick={() => setIsAddingCourse(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                    {editingCourse ? `Edit Course ${editingCourse.code}` : 'Add New Academic Course'}
                  </h3>
                  <button className="modal-close" onClick={() => setIsAddingCourse(false)}>
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveCourse}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Course Code *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. CS208"
                        required
                        value={courseForm.code}
                        onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Course Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Introduction to Cybernetics"
                        required
                        value={courseForm.title}
                        onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Credits *</label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        className="form-control"
                        required
                        value={courseForm.credits}
                        onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Semester *</label>
                      <select
                        className="form-control"
                        value={courseForm.semester}
                        onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>
                            Semester {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Department *</label>
                      <select
                        className="form-control"
                        value={courseForm.departmentId}
                        onChange={(e) => setCourseForm({ ...courseForm, departmentId: e.target.value })}
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.code} - {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Course Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Outline topics covered and objectives..."
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    ></textarea>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setIsAddingCourse(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingCourse ? 'Save Changes' : 'Create Course'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Courses Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Dept</th>
                  <th>Sem</th>
                  <th>Credits</th>
                  <th>Prerequisites</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="course-code">{c.code}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.title}</td>
                    <td>{c.departmentCode}</td>
                    <td>Sem {c.semester}</td>
                    <td>{c.credits}</td>
                    <td>
                      {c.prerequisites && c.prerequisites.length > 0 ? (
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          {c.prerequisites.map((p) => (
                            <span key={p.id} className="chip-prereq neutral">
                              {p.prerequisiteCourseCode}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>None</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ marginRight: '0.5rem' }}
                        onClick={() => handleEditClick(c)}
                        title="Edit course details"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteCourse(c.id, c.code)}
                        title="Delete course"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PREREQUISITE MANAGER */}
      {activeAdminTab === 'prerequisites' && (
        <div>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
              Add Course Prerequisite Relationship
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Link which course must be completed before a student is allowed to enroll in a target course. The system automatically validates for circular dependencies.
            </p>

            <form onSubmit={handleAddPrerequisite} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Target Course (Requires Prereq)</label>
                <select
                  className="form-control"
                  required
                  value={prereqForm.courseId}
                  onChange={(e) => setPrereqForm({ ...prereqForm, courseId: e.target.value })}
                >
                  <option value="">Select target course...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title} (Sem {c.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Prerequisite Course (Required Before)</label>
                <select
                  className="form-control"
                  required
                  value={prereqForm.prerequisiteCourseId}
                  onChange={(e) => setPrereqForm({ ...prereqForm, prerequisiteCourseId: e.target.value })}
                >
                  <option value="">Select prerequisite course...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title} (Sem {c.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Requirement Type</label>
                <select
                  className="form-control"
                  value={prereqForm.requirementType}
                  onChange={(e) => setPrereqForm({ ...prereqForm, requirementType: e.target.value })}
                >
                  <option value="MANDATORY">Mandatory (Strict)</option>
                  <option value="RECOMMENDED">Recommended</option>
                </select>
              </div>

              <div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Plus size={15} />
                  <span>Link Prerequisite</span>
                </button>
              </div>
            </form>
          </div>

          {/* Prerequisite Relationships Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Target Course</th>
                  <th>Prerequisite Course</th>
                  <th>Requirement Type</th>
                  <th>Min Grade</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allPrerequisites.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="course-code">{p.courseCode}</span> ({p.courseTitle})
                    </td>
                    <td>
                      <span className="chip-prereq satisfied">{p.prerequisiteCourseCode}</span> ({p.prerequisiteCourseTitle})
                    </td>
                    <td>
                      <span className={`role-pill ${p.requirementType === 'MANDATORY' ? 'admin' : 'student'}`}>
                        {p.requirementType}
                      </span>
                    </td>
                    <td>Grade {p.minGrade}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemovePrereq(p.id)}
                        title="Remove prerequisite link"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTMENTS */}
      {activeAdminTab === 'departments' && (
        <div>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
              Add New Academic Department
            </h3>
            <form onSubmit={handleAddDepartment} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 3fr auto', gap: '1rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Code *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. MECH"
                  required
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Department Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Mechanical Engineering"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Thermodynamics, robotics, and design"
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                />
              </div>

              <div>
                <button type="submit" className="btn btn-primary">
                  <Plus size={15} />
                  <span>Add Department</span>
                </button>
              </div>
            </form>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Department Code</th>
                  <th>Department Name</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <span className="course-code">{d.code}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td style={{ color: '#94a3b8' }}>{d.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
