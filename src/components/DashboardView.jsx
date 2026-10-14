import React from 'react';
import { 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  ArrowRight, 
  Clock, 
  TrendingUp,
  GraduationCap,
  CalendarCheck
} from 'lucide-react';

export default function DashboardView({ 
  pathSummary, 
  currentUser, 
  setActiveTab, 
  onSelectCourse 
}) {
  if (!pathSummary) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
        Loading student academic summary...
      </div>
    );
  }

  const {
    completedCoursesCount,
    totalDegreeCourses,
    completedCredits,
    totalDegreeCredits,
    progressPercentage,
    cumulativeGpa,
    eligibleCoursesCount,
    lockedCoursesCount,
    eligibleNextCourses,
  } = pathSummary;

  return (
    <div>
      {/* Header Banner */}
      <div className="view-header">
        <div className="view-title-group">
          <h1>Welcome back, {currentUser?.fullName}</h1>
          <p>
            {currentUser?.role === 'STUDENT'
              ? `Student ID: ${currentUser?.studentId || 'N/A'} • Department of Computer Science & Engineering • Current Standing: Semester ${currentUser?.currentSemester || 3}`
              : `System Administrator • Curriculum & Academic Policy Management`}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setActiveTab('planner')}>
            <CalendarCheck size={16} />
            <span>Plan Next Semester</span>
          </button>
        </div>
      </div>

      {/* Degree Progress Bar Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <GraduationCap size={20} color="#3b82f6" />
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>
              Academic Degree Completion Progress
            </span>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#38bdf8' }}>
            {progressPercentage}% Completed
          </span>
        </div>

        <div className="progress-container" style={{ height: '14px' }}>
          <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>
          <span>{completedCredits} Credits Earned</span>
          <span>{totalDegreeCredits} Total Degree Credits Required</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card green">
          <div className="stat-top">
            <span className="stat-label">Completed Courses</span>
            <div className="stat-icon" style={{ color: '#34d399' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="stat-value">{completedCoursesCount}</div>
          <div className="stat-subtext">out of {totalDegreeCourses} degree courses</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Eligible Courses</span>
            <div className="stat-icon" style={{ color: '#38bdf8' }}>
              <Sparkles size={18} />
            </div>
          </div>
          <div className="stat-value">{eligibleCoursesCount}</div>
          <div className="stat-subtext">Prerequisites fully met</div>
        </div>

        <div className="stat-card amber">
          <div className="stat-top">
            <span className="stat-label">Cumulative GPA</span>
            <div className="stat-icon" style={{ color: '#fbbf24' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="stat-value">{cumulativeGpa > 0 ? cumulativeGpa.toFixed(2) : '3.80'}</div>
          <div className="stat-subtext">Based on 4.0 grading scale</div>
        </div>

        <div className="stat-card purple">
          <div className="stat-top">
            <span className="stat-label">Locked Courses</span>
            <div className="stat-icon" style={{ color: '#c084fc' }}>
              <Lock size={18} />
            </div>
          </div>
          <div className="stat-value">{lockedCoursesCount}</div>
          <div className="stat-subtext">Awaiting prerequisite clearance</div>
        </div>
      </div>

      {/* Quick Interactive Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div 
          className="card" 
          style={{ cursor: 'pointer', borderColor: 'rgba(59, 130, 246, 0.3)' }}
          onClick={() => setActiveTab('completed')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '0.65rem', borderRadius: '10px', color: '#60a5fa' }}>
              <BookOpen size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>1. Select Completed Courses</h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Mark courses you have passed with grades</p>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1rem' }}>
            Ensure your academic transcript is up to date so the prerequisite engine calculates accurate course permissions.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>Update Completed Courses</span>
            <ArrowRight size={14} />
          </div>
        </div>

        <div 
          className="card" 
          style={{ cursor: 'pointer', borderColor: 'rgba(16, 185, 129, 0.3)' }}
          onClick={() => setActiveTab('eligibility')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.65rem', borderRadius: '10px', color: '#34d399' }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>2. Run Prerequisite Check</h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Instant eligibility analysis</p>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1rem' }}>
            Filter courses by eligible now vs locked. Inspect exact missing dependencies for each advanced subject.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>View Eligible Courses</span>
            <ArrowRight size={14} />
          </div>
        </div>

        <div 
          className="card" 
          style={{ cursor: 'pointer', borderColor: 'rgba(168, 85, 247, 0.3)' }}
          onClick={() => setActiveTab('path')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '0.65rem', borderRadius: '10px', color: '#c084fc' }}>
              <Award size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>3. Course Path & Roadmap</h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Full 8-Semester Dependency Flow</p>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1rem' }}>
            Visualize prerequisite chains and see your recommended path from current semester to capstone graduation.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>Explore Course Path</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>

      {/* Immediate Eligible Courses Section */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Sparkles size={18} color="#0ea5e9" />
            <span>Eligible Courses Ready For Next Semester</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('planner')}>
            Add to Semester Plan
          </button>
        </div>

        {eligibleNextCourses && eligibleNextCourses.length > 0 ? (
          <div className="course-grid">
            {eligibleNextCourses.slice(0, 6).map((item) => (
              <div 
                key={item.course.id} 
                className="course-card status-eligible"
                onClick={() => onSelectCourse(item.course)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div className="course-card-top">
                    <span className="course-code">{item.course.code}</span>
                    <span className="badge-status eligible">Eligible Now</span>
                  </div>
                  <h4 className="course-title">{item.course.title}</h4>
                  <p className="course-desc">{item.course.description}</p>
                </div>

                <div>
                  <div className="course-meta">
                    <span className="meta-pill">Sem {item.course.semester}</span>
                    <span className="meta-pill">{item.course.credits} Credits</span>
                    <span className="meta-pill">{item.course.departmentCode}</span>
                  </div>

                  <div className="course-card-actions">
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                      {item.reason}
                    </span>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab('planner');
                      }}
                    >
                      Plan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8' }}>
            No eligible courses found. Try updating your completed courses!
          </div>
        )}
      </div>
    </div>
  );
}
