import React from 'react';
import { 
  FileCheck2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Printer, 
  Clock, 
  GraduationCap, 
  Award,
  ChevronRight
} from 'lucide-react';

export default function DegreeAuditView({
  currentUser,
  pathSummary,
  courses,
  completedCourses,
  onSelectCourse,
  setActiveTab
}) {
  if (!pathSummary) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading degree audit...</div>;
  }

  const { completedCredits, totalDegreeCredits, progressPercentage, cumulativeGpa } = pathSummary;
  const targetDegreeCredits = 120; // Standard undergraduate accreditation requirement

  // Completed map
  const completedMap = {};
  completedCourses.forEach((c) => {
    completedMap[c.courseCode] = c;
  });

  // Categories
  const categories = [
    {
      name: '1. Foundational Mathematics & Sciences (Min 14 Credits)',
      requiredCredits: 14,
      requiredCodes: ['MATH101', 'MATH102', 'PHY101', 'MATH201'],
    },
    {
      name: '2. Core Software & Programming Foundations (Min 12 Credits)',
      requiredCredits: 12,
      requiredCodes: ['CS101', 'CS102', 'CS201'],
    },
    {
      name: '3. Core Computer Systems & Architecture (Min 14 Credits)',
      requiredCredits: 14,
      requiredCodes: ['CS103', 'CS203', 'CS205', 'CS301'],
    },
    {
      name: '4. Advanced Algorithms & Intelligence (Min 12 Credits)',
      requiredCredits: 12,
      requiredCodes: ['CS204', 'CS302', 'CS303', 'CS305'],
    },
    {
      name: '5. Senior Engineering Capstone & Culmination (Min 12 Credits)',
      requiredCredits: 12,
      requiredCodes: ['CS206', 'CS498', 'CS499', 'CS405'],
    },
  ];

  // Calculate audit results
  const auditResults = categories.map((cat) => {
    const list = cat.requiredCodes.map((code) => {
      const course = courses.find((c) => c.code === code);
      const isDone = !!completedMap[code];
      const record = completedMap[code];
      return {
        code,
        course,
        isDone,
        grade: record?.grade || null,
        credits: course?.credits || 4,
      };
    });

    const earnedCredits = list.filter((l) => l.isDone).reduce((sum, l) => sum + l.credits, 0);
    const isSatisfied = earnedCredits >= cat.requiredCredits;

    return {
      ...cat,
      courses: list,
      earnedCredits,
      isSatisfied,
    };
  });

  // Bottleneck check for student
  const criticalBottlenecks = ['CS101', 'CS102', 'CS201', 'CS205'];
  const missingBottlenecks = criticalBottlenecks.filter((code) => !completedMap[code]);

  // Projected semesters to graduation
  const remainingCredits = Math.max(targetDegreeCredits - completedCredits, 0);
  const estimatedSemestersRemaining = Math.ceil(remainingCredits / 15);

  const handlePrintAudit = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Degree Audit - ${currentUser?.fullName}</title>
          <style>
            body { font-family: sans-serif; padding: 2rem; color: #111; line-height: 1.5; }
            h1 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 0.5rem; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; margin-bottom: 1.5rem; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
            th { background-color: #f3f4f6; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .satisfied { background: #dcfce7; color: #15803d; }
            .unsatisfied { background: #fee2e2; color: #b91c1c; }
          </style>
        </head>
        <body>
          <h1>CoursePath - Official Degree Audit Report</h1>
          <p><strong>Student Name:</strong> ${currentUser?.fullName}</p>
          <p><strong>Student ID:</strong> ${currentUser?.studentId || 'N/A'}</p>
          <p><strong>Degree:</strong> Bachelor of Science in Computer Science & Engineering</p>
          <p><strong>Cumulative GPA:</strong> ${cumulativeGpa.toFixed(2)} / 4.00</p>
          <p><strong>Total Credits Completed:</strong> ${completedCredits} / ${targetDegreeCredits} Credits</p>

          <h2>Core Curricular Requirements Checklist</h2>
          ${auditResults
            .map(
              (cat) => `
            <h3>${cat.name} (${cat.earnedCredits} / ${cat.requiredCredits} Credits) - ${
                cat.isSatisfied ? '<span class="badge satisfied">SATISFIED</span>' : '<span class="badge unsatisfied">INCOMPLETE</span>'
              }</h3>
            <table>
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Credits</th>
                  <th>Status</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                ${cat.courses
                  .map(
                    (c) => `
                  <tr>
                    <td><strong>${c.code}</strong></td>
                    <td>${c.course?.title || c.code}</td>
                    <td>${c.credits}</td>
                    <td>${c.isDone ? 'COMPLETED' : 'PENDING'}</td>
                    <td>${c.grade || '-'}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          `
            )
            .join('')}

          <p style="margin-top: 2rem; font-size: 0.85rem; color: #666;">Generated on ${new Date().toLocaleDateString()} via CoursePath Academic System</p>
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
          <h1>Academic Degree Audit & Graduation Readiness</h1>
          <p>
            Detailed verification of graduation requirements for Bachelor of Science in Computer Science & Engineering. Evaluates core disciplines, credits earned, and prerequisite blockers.
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handlePrintAudit}>
            <Printer size={16} />
            <span>Export Official Audit</span>
          </button>
          <button className="btn btn-primary" onClick={() => setActiveTab('planner')}>
            <span>Plan Next Semester</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Graduation Projection Overview Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              Degree Completion
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>
              {completedCredits} / {targetDegreeCredits}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
              Credits Completed towards 120 cr B.S. Degree
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              Cumulative GPA
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24' }}>
              {cumulativeGpa > 0 ? cumulativeGpa.toFixed(2) : '3.80'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
              Academic standing: Excellent (Good Standing)
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              Estimated Semesters Left
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>
              ~{estimatedSemestersRemaining} Semesters
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
              At standard 15 credits/semester pace
            </div>
          </div>
        </div>
      </div>

      {/* Bottleneck Warning Banner */}
      {missingBottlenecks.length > 0 && (
        <div
          className="card"
          style={{
            marginBottom: '2rem',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <AlertTriangle size={20} color="#ef4444" />
            <span style={{ fontWeight: 700, color: '#fca5a5', fontSize: '1rem' }}>
              Critical Prerequisite Bottleneck Advisory
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            You have not yet completed the following foundational bottleneck course(s):{' '}
            <strong style={{ color: '#fff' }}>{missingBottlenecks.join(', ')}</strong>. Delaying these courses will prevent unlocking multiple advanced subjects in upcoming semesters!
          </p>
        </div>
      )}

      {/* Categorized Degree Requirements */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {auditResults.map((category, index) => (
          <div key={index} className="card">
            <div className="card-header" style={{ marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                  {category.name}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  Progress: {category.earnedCredits} / {category.requiredCredits} Credits Earned
                </div>
              </div>

              <div>
                {category.isSatisfied ? (
                  <span className="badge-status completed">
                    <CheckCircle2 size={13} />
                    Requirement Satisfied
                  </span>
                ) : (
                  <span className="badge-status locked">
                    <XCircle size={13} />
                    Incomplete ({category.requiredCredits - category.earnedCredits} Cr Remaining)
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
              {category.courses.map((item) => (
                <div
                  key={item.code}
                  style={{
                    background: item.isDone ? 'rgba(16, 185, 129, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${item.isDone ? 'rgba(16, 185, 129, 0.3)' : '#23324d'}`,
                    borderRadius: '8px',
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: item.course ? 'pointer' : 'default',
                  }}
                  onClick={() => {
                    if (item.course) onSelectCourse(item.course);
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className="course-code">{item.code}</span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({item.credits} cr)</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600, marginTop: '0.2rem' }}>
                      {item.course?.title || item.code}
                    </div>
                  </div>

                  <div>
                    {item.isDone ? (
                      <span className="chip-prereq satisfied">
                        Grade {item.grade}
                      </span>
                    ) : (
                      <span className="chip-prereq missing">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
