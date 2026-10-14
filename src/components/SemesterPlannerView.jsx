import React, { useState, useEffect } from 'react';
import { 
  CalendarPlus, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  FileText, 
  Printer, 
  BookOpen 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';

export default function SemesterPlannerView({
  currentUser,
  pathSummary,
  onRefreshData,
  showToast,
  onSelectCourse
}) {
  const [planName, setPlanName] = useState('Fall 2026 Academic Term');
  const [targetSemester, setTargetSemester] = useState(3);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [notes, setNotes] = useState('');
  const [savedPlans, setSavedPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);

  useEffect(() => {
    if (currentUser?.currentSemester) {
      setTargetSemester(Math.min(currentUser.currentSemester + 1, 8));
      setPlanName(`Semester ${Math.min(currentUser.currentSemester + 1, 8)} Plan`);
    }
    loadPlans();
  }, [currentUser]);

  const loadPlans = async () => {
    if (!currentUser?.id) return;
    try {
      setLoadingPlans(true);
      const plans = await api.getStudentPlans(currentUser.id);
      setSavedPlans(plans);
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const eligibleCourses = (pathSummary?.eligibleNextCourses || []).map((e) => e.course);

  const handleAddCourse = (course) => {
    if (selectedCourses.some((c) => c.id === course.id)) {
      showToast(`${course.code} is already in your semester plan!`, 'info');
      return;
    }
    setSelectedCourses([...selectedCourses, course]);
    showToast(`Added ${course.code} (${course.credits} cr) to plan`, 'success');
  };

  const handleRemoveCourse = (courseId) => {
    setSelectedCourses(selectedCourses.filter((c) => c.id !== courseId));
  };

  const totalCredits = selectedCourses.reduce((sum, c) => sum + (c.credits || 0), 0);

  const handleSavePlan = async () => {
    if (selectedCourses.length === 0) {
      showToast('Please select at least one course to save your plan.', 'error');
      return;
    }

    try {
      setSavingPlan(true);
      const planData = {
        planName,
        targetSemester: Number(targetSemester),
        courseIds: selectedCourses.map((c) => c.id),
        notes,
      };

      await api.createSemesterPlan(currentUser.id, planData);

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Ignore if confetti not supported
      }

      showToast(`Semester plan "${planName}" successfully saved!`, 'success');
      setSelectedCourses([]);
      setNotes('');
      loadPlans();
      onRefreshData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingPlan(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this semester plan?')) return;
    try {
      await api.deletePlan(planId);
      showToast('Plan deleted successfully', 'info');
      loadPlans();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handlePrintPlan = (plan) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${plan.planName} - CoursePath Academic Schedule</title>
          <style>
            body { font-family: sans-serif; padding: 2rem; color: #111; }
            h1 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 0.5rem; }
            .meta { margin-bottom: 1.5rem; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
            th { background-color: #f3f4f6; }
            .total { font-weight: bold; margin-top: 1rem; font-size: 1.1rem; }
          </style>
        </head>
        <body>
          <h1>CoursePath - Official Semester Schedule</h1>
          <div class="meta">
            <p><strong>Student:</strong> ${plan.studentName}</p>
            <p><strong>Plan Name:</strong> ${plan.planName}</p>
            <p><strong>Target Semester:</strong> Semester ${plan.targetSemester}</p>
            <p><strong>Status:</strong> ${plan.status}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Department</th>
                <th>Credits</th>
              </tr>
            </thead>
            <tbody>
              ${plan.plannedCourses
                .map(
                  (c) => `
                <tr>
                  <td><strong>${c.code}</strong></td>
                  <td>${c.title}</td>
                  <td>${c.departmentCode || 'CSE'}</td>
                  <td>${c.credits}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          <p class="total">Total Planned Credits: ${plan.totalPlannedCredits} Credits</p>
          <p style="margin-top: 3rem; font-size: 0.8rem; color: #888;">Generated via CoursePath Academic Prerequisite & Course Planning System</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title-group">
          <h1>Next Semester Course Planner</h1>
          <p>
            Build and optimize your upcoming semester course schedule from eligible subjects. Monitor your credit load in real time to avoid underloading or overloading.
          </p>
        </div>
      </div>

      <div className="planner-layout">
        {/* Left Column: Eligible Courses Available */}
        <div>
          <div className="card-header" style={{ marginBottom: '1rem' }}>
            <div className="card-title">
              <Sparkles size={18} color="#0ea5e9" />
              <span>Available Eligible Courses ({eligibleCourses.length})</span>
            </div>
          </div>

          {eligibleCourses.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
              <p>No eligible courses available at this time.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Go to the "Completed Courses" tab to check off prerequisite subjects you have completed.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {eligibleCourses.map((course) => {
                const isSelected = selectedCourses.some((c) => c.id === course.id);

                return (
                  <div
                    key={course.id}
                    className="card"
                    style={{
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderColor: isSelected ? '#3b82f6' : 'var(--border-light)',
                      background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-card)',
                    }}
                  >
                    <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onSelectCourse(course)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span className="course-code">{course.code}</span>
                        <span className="meta-pill">Sem {course.semester}</span>
                        <span className="meta-pill" style={{ color: '#6ee7b7' }}>
                          {course.credits} Credits
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                        {course.title}
                      </div>
                    </div>

                    <div>
                      {isSelected ? (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#fda4af' }}
                          onClick={() => handleRemoveCourse(course.id)}
                        >
                          <Minus size={14} />
                          Remove
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAddCourse(course)}
                        >
                          <Plus size={14} />
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Next Semester Plan Cart */}
        <div>
          <div className="plan-cart">
            <div className="card-header">
              <div className="card-title">
                <CalendarPlus size={18} color="#3b82f6" />
                <span>Semester Plan Cart</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Plan Title</label>
              <input
                type="text"
                className="form-control"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="e.g. Fall 2026 Academic Schedule"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Semester</label>
              <select
                className="form-control"
                value={targetSemester}
                onChange={(e) => setTargetSemester(e.target.value)}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Credit Load Meter */}
            <div className="credit-meter-box">
              <div className="meter-header">
                <span>Credit Load Meter:</span>
                <span
                  style={{
                    color:
                      totalCredits < 12
                        ? '#fbbf24'
                        : totalCredits > 18
                        ? '#fb7185'
                        : '#34d399',
                    fontWeight: 700,
                  }}
                >
                  {totalCredits} / 18 Credits
                </span>
              </div>

              <div className="progress-container" style={{ height: '8px', margin: '0.4rem 0' }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min((totalCredits / 18) * 100, 100)}%`,
                    background:
                      totalCredits < 12
                        ? '#f59e0b'
                        : totalCredits > 18
                        ? '#ef4444'
                        : '#10b981',
                  }}
                ></div>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {totalCredits < 12 && '⚠️ Underload: Full-time standard requires at least 12 credits.'}
                {totalCredits >= 12 && totalCredits <= 18 && '✓ Optimal full-time credit load (12 - 18 credits).'}
                {totalCredits > 18 && '⚠️ Overload: Exceeds 18 credits; academic advisor approval required.'}
              </div>
            </div>

            {/* Selected Courses List */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
                Selected Courses ({selectedCourses.length}):
              </div>

              {selectedCourses.length === 0 ? (
                <div style={{ padding: '1rem', border: '1px dashed #23324d', borderRadius: '8px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                  No courses added yet. Click "+ Add" on the eligible courses to the left.
                </div>
              ) : (
                selectedCourses.map((c) => (
                  <div key={c.id} className="selected-course-row">
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>
                        {c.code}: {c.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {c.credits} Credits • Sem {c.semester}
                      </div>
                    </div>
                    <button
                      style={{ background: 'transparent', border: 'none', color: '#fb7185', cursor: 'pointer' }}
                      onClick={() => handleRemoveCourse(c.id)}
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Optional Study Notes</label>
              <textarea
                className="form-control"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Focus on Algorithms assignments; group study on Databases"
              ></textarea>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
              onClick={handleSavePlan}
              disabled={savingPlan || selectedCourses.length === 0}
            >
              <CalendarPlus size={16} />
              <span>{savingPlan ? 'Saving Plan...' : 'Save Semester Plan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Saved Semester Plans Section */}
      <div className="card" style={{ marginTop: '3rem' }}>
        <div className="card-header">
          <div className="card-title">
            <FileText size={18} color="#60a5fa" />
            <span>My Saved Semester Plans</span>
          </div>
        </div>

        {loadingPlans ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8' }}>
            Loading saved plans...
          </div>
        ) : savedPlans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8' }}>
            No saved plans yet. Build and save your first schedule above!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {savedPlans.map((plan) => (
              <div
                key={plan.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid #23324d',
                  borderRadius: '12px',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                      {plan.planName}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      Target: Semester {plan.targetSemester} • Total: {plan.totalPlannedCredits} Credits • Status: {plan.status}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handlePrintPlan(plan)}
                      title="Print or export schedule"
                    >
                      <Printer size={14} />
                      Export / Print
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeletePlan(plan.id)}
                      title="Delete this plan"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {plan.plannedCourses.map((c) => (
                    <span
                      key={c.id}
                      style={{
                        background: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: '#93c5fd',
                        padding: '0.3rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {c.code}: {c.title} ({c.credits} cr)
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
