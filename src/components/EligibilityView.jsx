import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  Search, 
  CalendarPlus, 
  AlertCircle,
  ArrowRight,
  Info
} from 'lucide-react';

export default function EligibilityView({
  eligibilityList,
  onSelectCourse,
  onAddToPlan,
  setActiveTab
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');

  if (!eligibilityList || eligibilityList.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
        Loading prerequisite eligibility data...
      </div>
    );
  }

  // Filter
  const filteredList = eligibilityList.filter((item) => {
    const course = item.course;
    const matchesSearch =
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || item.status === statusFilter;
    const matchesSemester =
      semesterFilter === 'ALL' || course.semester === Number(semesterFilter);

    return matchesSearch && matchesStatus && matchesSemester;
  });

  const eligibleCount = eligibilityList.filter((i) => i.status === 'ELIGIBLE').length;
  const lockedCount = eligibilityList.filter((i) => i.status === 'LOCKED').length;
  const completedCount = eligibilityList.filter((i) => i.status === 'COMPLETED').length;

  return (
    <div>
      <div className="view-header">
        <div className="view-title-group">
          <h1>Prerequisite Check & Eligible Courses</h1>
          <p>
            The system cross-references your completed subjects against the curriculum prerequisite dependency tree to calculate which courses you are currently eligible to take.
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setActiveTab('planner')}>
            <CalendarPlus size={16} />
            <span>Go to Semester Planner</span>
          </button>
        </div>
      </div>

      {/* Status Filter Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div
          className={`card ${statusFilter === 'ALL' ? 'active' : ''}`}
          style={{
            cursor: 'pointer',
            padding: '1rem',
            borderColor: statusFilter === 'ALL' ? '#3b82f6' : 'var(--border-light)',
            background: statusFilter === 'ALL' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)'
          }}
          onClick={() => setStatusFilter('ALL')}
        >
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>All Curriculum</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{eligibilityList.length}</div>
        </div>

        <div
          className={`card ${statusFilter === 'ELIGIBLE' ? 'active' : ''}`}
          style={{
            cursor: 'pointer',
            padding: '1rem',
            borderColor: statusFilter === 'ELIGIBLE' ? '#0ea5e9' : 'var(--border-light)',
            background: statusFilter === 'ELIGIBLE' ? 'rgba(14, 165, 233, 0.15)' : 'var(--bg-card)'
          }}
          onClick={() => setStatusFilter('ELIGIBLE')}
        >
          <div style={{ fontSize: '0.8rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={14} />
            Eligible Now
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>{eligibleCount}</div>
        </div>

        <div
          className={`card ${statusFilter === 'LOCKED' ? 'active' : ''}`}
          style={{
            cursor: 'pointer',
            padding: '1rem',
            borderColor: statusFilter === 'LOCKED' ? '#f43f5e' : 'var(--border-light)',
            background: statusFilter === 'LOCKED' ? 'rgba(244, 63, 94, 0.15)' : 'var(--bg-card)'
          }}
          onClick={() => setStatusFilter('LOCKED')}
        >
          <div style={{ fontSize: '0.8rem', color: '#fb7185', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Lock size={14} />
            Locked (Unmet Prereq)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fb7185' }}>{lockedCount}</div>
        </div>

        <div
          className={`card ${statusFilter === 'COMPLETED' ? 'active' : ''}`}
          style={{
            cursor: 'pointer',
            padding: '1rem',
            borderColor: statusFilter === 'COMPLETED' ? '#10b981' : 'var(--border-light)',
            background: statusFilter === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)'
          }}
          onClick={() => setStatusFilter('COMPLETED')}
        >
          <div style={{ fontSize: '0.8rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={14} />
            Completed
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>{completedCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search eligible or locked courses by code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Semester:</span>
          <select
            className="filter-select"
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
          >
            <option value="ALL">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="course-grid">
        {filteredList.map((item) => {
          const { course, status, reason, missingPrerequisites, satisfiedPrerequisites, gradeEarned } = item;

          let statusClass = 'status-locked';
          let badgeLabel = 'Locked';
          let BadgeIcon = Lock;

          if (status === 'COMPLETED') {
            statusClass = 'status-completed';
            badgeLabel = `Completed (${gradeEarned})`;
            BadgeIcon = CheckCircle2;
          } else if (status === 'ELIGIBLE') {
            statusClass = 'status-eligible';
            badgeLabel = 'Eligible Now';
            BadgeIcon = Sparkles;
          }

          return (
            <div
              key={course.id}
              className={`course-card ${statusClass}`}
              onClick={() => onSelectCourse(course)}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <div className="course-card-top">
                  <span className="course-code">{course.code}</span>
                  <span className={`badge-status ${status.toLowerCase()}`}>
                    <BadgeIcon size={12} />
                    {badgeLabel}
                  </span>
                </div>

                <h4 className="course-title">{course.title}</h4>
                <p className="course-desc">{course.description}</p>
              </div>

              <div>
                <div className="course-meta">
                  <span className="meta-pill">Sem {course.semester}</span>
                  <span className="meta-pill">{course.credits} Credits</span>
                  <span className="meta-pill">{course.departmentCode}</span>
                </div>

                {/* Prerequisites Breakdown */}
                {course.prerequisites && course.prerequisites.length > 0 && (
                  <div className="prereq-section">
                    <div className="prereq-label">
                      <span>Prerequisites:</span>
                      {status === 'LOCKED' && (
                        <span style={{ color: '#fb7185' }}>Action required</span>
                      )}
                    </div>
                    <div className="prereq-chips">
                      {course.prerequisites.map((p) => {
                        const isMissing = missingPrerequisites.some(
                          (m) => m.code === p.prerequisiteCourseCode
                        );
                        return (
                          <span
                            key={p.id}
                            className={`chip-prereq ${isMissing ? 'missing' : 'satisfied'}`}
                            title={`Requires ${p.prerequisiteCourseTitle} (Min grade: ${p.minGrade})`}
                          >
                            {isMissing ? '✕ ' : '✓ '}
                            {p.prerequisiteCourseCode}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="course-card-actions">
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color:
                        status === 'ELIGIBLE'
                          ? '#38bdf8'
                          : status === 'COMPLETED'
                          ? '#34d399'
                          : '#fb7185',
                      fontWeight: 600,
                      maxWidth: '65%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={reason}
                  >
                    {reason}
                  </span>

                  {status === 'ELIGIBLE' ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToPlan(course);
                      }}
                    >
                      <CalendarPlus size={14} />
                      Plan
                    </button>
                  ) : (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCourse(course);
                      }}
                    >
                      Info
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
