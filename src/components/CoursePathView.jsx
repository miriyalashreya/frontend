import React, { useState } from 'react';
import { 
  GitFork, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  ArrowRight, 
  Compass, 
  Layers, 
  Award,
  ChevronRight,
  Info,
  Network
} from 'lucide-react';
import VisualDependencyGraph from './VisualDependencyGraph';

export default function CoursePathView({ 
  pathSummary, 
  allCourses,
  eligibilityList,
  onSelectCourse, 
  setActiveTab 
}) {
  const [viewMode, setViewMode] = useState('graph'); // 'graph', 'roadmap', 'tracks'

  if (!pathSummary || !pathSummary.semesterRoadmap) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
        Loading academic roadmap...
      </div>
    );
  }

  const { semesterRoadmap, completedCredits, totalDegreeCredits, progressPercentage } = pathSummary;

  // Key academic graduation tracks
  const tracks = [
    {
      title: 'Artificial Intelligence & Machine Learning Track',
      color: '#8b5cf6',
      chain: ['CS101', 'CS102', 'CS201', 'CS204', 'CS303', 'CS305', 'CS401'],
      description: 'Progression from basic programming to Deep Learning & Neural Networks.',
    },
    {
      title: 'Systems & Cloud Infrastructure Track',
      color: '#06b6d4',
      chain: ['CS101', 'CS102', 'CS201', 'CS205', 'CS301', 'CS304', 'CS402'],
      description: 'Progression from data structures to Distributed Systems and Cloud Computing.',
    },
    {
      title: 'Software Engineering & Capstone Track',
      color: '#10b981',
      chain: ['CS101', 'CS102', 'CS206', 'CS498', 'CS499'],
      description: 'Core engineering lifecycle leading to Capstone Phase 1 & 2 defense.',
    },
  ];

  return (
    <div>
      <div className="view-header">
        <div className="view-title-group">
          <h1>Academic Course Path & Dependency Roadmap</h1>
          <p>
            Explore the multi-semester academic progression path. Courses are color-coded based on your actual transcript: Green (Completed), Cyan (Eligible Now), and Red (Locked by Prerequisites).
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setActiveTab('planner')}>
            <span>Plan Next Semester</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Degree Milestone Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
          marginBottom: '1.5rem',
          border: '1px solid #23324d',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Academic Milestone Status
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
              {completedCredits >= totalDegreeCredits * 0.75
                ? 'Senior Standing - Approaching Graduation'
                : completedCredits >= totalDegreeCredits * 0.5
                ? 'Junior Standing - Advanced Curriculum'
                : completedCredits >= totalDegreeCredits * 0.25
                ? 'Sophomore Standing - Core Disciplines'
                : 'Freshman Standing - Foundational Sciences'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Degree Progress</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8' }}>
                {progressPercentage}%
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Credits Earned</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>
                {completedCredits} / {totalDegreeCredits}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #23324d', paddingBottom: '0.5rem' }}>
        <button
          className={`btn ${viewMode === 'graph' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setViewMode('graph')}
        >
          <Network size={14} />
          <span>Interactive Dependency Graph (DAG)</span>
        </button>

        <button
          className={`btn ${viewMode === 'roadmap' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setViewMode('roadmap')}
        >
          <Layers size={14} />
          <span>8-Semester Pathway Grid</span>
        </button>

        <button
          className={`btn ${viewMode === 'tracks' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setViewMode('tracks')}
        >
          <Compass size={14} />
          <span>Specialization Tracks</span>
        </button>
      </div>

      {/* VIEW MODE 1: INTERACTIVE VISUAL DAG GRAPH */}
      {viewMode === 'graph' && (
        <VisualDependencyGraph
          allCourses={allCourses}
          eligibilityList={eligibilityList}
          onSelectCourse={onSelectCourse}
        />
      )}

      {/* VIEW MODE 2: SPECIALIZATION TRACKS */}
      {viewMode === 'tracks' && (
        <div className="card" style={{ marginBottom: '2.5rem' }}>
          <div className="card-header">
            <div className="card-title">
              <Compass size={18} color="#8b5cf6" />
              <span>Key Specialization Prerequisite Tracks</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {tracks.map((track, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid #23324d',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: track.color, fontSize: '0.95rem' }}>
                    {track.title}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {track.description}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {track.chain.map((code, idx) => {
                    const found = pathSummary.allCourses?.find((c) => c.course.code === code);
                    const isDone = found?.status === 'COMPLETED';
                    const isElig = found?.status === 'ELIGIBLE';

                    return (
                      <React.Fragment key={code}>
                        <span
                          className={`chip-prereq ${
                            isDone ? 'satisfied' : isElig ? 'neutral' : 'missing'
                          }`}
                          style={{
                            cursor: 'pointer',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            borderColor: isDone ? '#10b981' : isElig ? '#38bdf8' : '#f43f5e',
                            color: isDone ? '#6ee7b7' : isElig ? '#38bdf8' : '#fda4af',
                          }}
                          onClick={() => {
                            if (found) onSelectCourse(found.course);
                          }}
                          title={`Click to view details of ${code}`}
                        >
                          {isDone ? '✓ ' : isElig ? '★ ' : '🔒 '}
                          {code}
                        </span>
                        {idx < track.chain.length - 1 && (
                          <ChevronRight size={14} color="#64748b" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW MODE 3: 8-SEMESTER ROADMAP GRID */}
      {viewMode === 'roadmap' && (
        <div className="roadmap-container">
          {semesterRoadmap.map((semGroup) => {
            const { semester, semesterName, courses, completedCourses, eligibleCourses, lockedCourses, totalCredits } = semGroup;

            return (
              <div key={semester} className="semester-track">
                <div className="semester-track-header">
                  <div className="semester-tag">
                    <div className="sem-number-bubble">{semester}</div>
                    <div>
                      <div className="sem-title">{semesterName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {totalCredits} Total Credits • {courses.length} Courses
                      </div>
                    </div>
                  </div>

                  <div className="sem-stats">
                    {completedCourses > 0 && (
                      <span style={{ color: '#34d399', fontWeight: 600 }}>
                        ✓ {completedCourses} Done
                      </span>
                    )}
                    {eligibleCourses > 0 && (
                      <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                        ★ {eligibleCourses} Eligible
                      </span>
                    )}
                    {lockedCourses > 0 && (
                      <span style={{ color: '#fb7185', fontWeight: 600 }}>
                        🔒 {lockedCourses} Locked
                      </span>
                    )}
                  </div>
                </div>

                <div className="course-grid">
                  {courses.map((item) => {
                    const { course, status } = item;

                    let borderStyle = '1px solid var(--border-light)';
                    let statusBadge = (
                      <span className="badge-status locked">
                        <Lock size={12} />
                        Locked
                      </span>
                    );

                    if (status === 'COMPLETED') {
                      borderStyle = '2px solid #10b981';
                      statusBadge = (
                        <span className="badge-status completed">
                          <CheckCircle2 size={12} />
                          Completed ({item.gradeEarned})
                        </span>
                      );
                    } else if (status === 'ELIGIBLE') {
                      borderStyle = '2px solid #0ea5e9';
                      statusBadge = (
                        <span className="badge-status eligible">
                          <Sparkles size={12} />
                          Eligible
                        </span>
                      );
                    }

                    return (
                      <div
                        key={course.id}
                        className="card"
                        style={{
                          padding: '1rem',
                          border: borderStyle,
                          cursor: 'pointer',
                          background:
                            status === 'COMPLETED'
                              ? 'rgba(16, 185, 129, 0.05)'
                              : status === 'ELIGIBLE'
                              ? 'rgba(14, 165, 233, 0.05)'
                              : 'rgba(255, 255, 255, 0.02)',
                        }}
                        onClick={() => onSelectCourse(course)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                          <span className="course-code">{course.code}</span>
                          {statusBadge}
                        </div>

                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: '0.3rem' }}>
                          {course.title}
                        </div>

                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                          {course.credits} Credits • {course.departmentCode}
                        </div>

                        {course.prerequisites && course.prerequisites.length > 0 && (
                          <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                            <span style={{ color: '#94a3b8' }}>Prereqs: </span>
                            {course.prerequisites.map((p) => p.prerequisiteCourseCode).join(', ')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
