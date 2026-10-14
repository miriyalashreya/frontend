import React from 'react';
import { BookOpen, CheckCircle2, Lock, Sparkles, X, ChevronRight, Layers } from 'lucide-react';

export default function CourseDetailModal({ course, allCourses, onClose, onAddToPlan }) {
  if (!course) return null;

  // Find which courses require this course as a prerequisite! ("What this course unlocks")
  const downstreamCourses = allCourses.filter((c) =>
    c.prerequisites?.some((p) => p.prerequisiteCourseId === course.id || p.prerequisiteCourseCode === course.code)
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="course-code" style={{ fontSize: '1.25rem' }}>
              {course.code}
            </span>
            <span className="meta-pill">Semester {course.semester}</span>
            <span className="meta-pill" style={{ color: '#38bdf8' }}>
              {course.credits} Credits
            </span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
            {course.title}
          </h2>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
            Department: {course.departmentName || course.departmentCode || 'Computer Science'}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Course Overview & Syllabus
            </h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.6' }}>
              {course.description || 'No detailed syllabus available.'}
            </p>
          </div>

          {/* Prerequisite Requirements */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Prerequisites Required to Enroll
            </h4>
            {course.prerequisites && course.prerequisites.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {course.prerequisites.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid #23324d',
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span className="course-code">{p.prerequisiteCourseCode}</span> -{' '}
                      <span style={{ color: '#fff', fontWeight: 600 }}>
                        {p.prerequisiteCourseTitle}
                      </span>
                    </div>
                    <span className="role-pill student">
                      Min Grade {p.minGrade} ({p.requirementType})
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '0.65rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', color: '#6ee7b7', fontSize: '0.85rem' }}>
                ✓ No prerequisite courses required. Open to all students.
              </div>
            )}
          </div>

          {/* Unlocked Downstream Courses */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              What This Course Unlocks ({downstreamCourses.length} Advanced Subjects)
            </h4>
            {downstreamCourses.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {downstreamCourses.map((d) => (
                  <span
                    key={d.id}
                    style={{
                      background: 'rgba(168, 85, 247, 0.12)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      color: '#d8b4fe',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    {d.code}: {d.title} (Sem {d.semester})
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Terminal subject (e.g. Capstone project or elective).
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            {onAddToPlan && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  onAddToPlan(course);
                  onClose();
                }}
              >
                Add to Semester Plan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
