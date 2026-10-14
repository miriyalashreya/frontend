import React, { useState, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Filter, Sparkles, CheckCircle2, Lock, Info, Layers } from 'lucide-react';

export default function VisualDependencyGraph({
  allCourses,
  eligibilityList,
  onSelectCourse
}) {
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Map eligibility statuses
  const statusMap = useMemo(() => {
    const map = {};
    if (eligibilityList) {
      eligibilityList.forEach((e) => {
        map[e.course.id] = e;
      });
    }
    return map;
  }, [eligibilityList]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    if (deptFilter === 'ALL') return allCourses;
    return allCourses.filter((c) => c.departmentCode === deptFilter);
  }, [allCourses, deptFilter]);

  // Layout parameters
  const colWidth = 150;
  const colMargin = 40;
  const rowHeight = 70;
  const topPadding = 60;
  const cardWidth = 125;
  const cardHeight = 48;

  // Compute node positions: Semester columns 1 to 8
  const { nodePositions, totalWidth, totalHeight } = useMemo(() => {
    const positions = {};
    const semesterCounters = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };

    filteredCourses.forEach((c) => {
      const sem = c.semester || 1;
      const indexInSem = semesterCounters[sem] || 0;
      semesterCounters[sem] = indexInSem + 1;

      const x = colMargin + (sem - 1) * colWidth;
      const y = topPadding + indexInSem * rowHeight;

      positions[c.id] = {
        x,
        y,
        course: c,
        centerX: x + cardWidth / 2,
        centerY: y + cardHeight / 2,
        rightX: x + cardWidth,
        leftX: x,
      };
    });

    const maxRows = Math.max(...Object.values(semesterCounters), 4);
    const width = colMargin * 2 + 8 * colWidth;
    const height = topPadding + maxRows * rowHeight + 80;

    return { nodePositions: positions, totalWidth: width, totalHeight: height };
  }, [filteredCourses]);

  // Build edges
  const edges = useMemo(() => {
    const edgeList = [];
    filteredCourses.forEach((course) => {
      if (course.prerequisites) {
        course.prerequisites.forEach((p) => {
          const fromNode = nodePositions[p.prerequisiteCourseId];
          const toNode = nodePositions[course.id];

          if (fromNode && toNode) {
            edgeList.push({
              id: `${p.prerequisiteCourseId}-${course.id}`,
              fromId: p.prerequisiteCourseId,
              toId: course.id,
              from: fromNode,
              to: toNode,
              requirementType: p.requirementType,
            });
          }
        });
      }
    });
    return edgeList;
  }, [filteredCourses, nodePositions]);

  const activeId = hoveredNodeId || selectedNodeId;

  // Selected node metadata
  const selectedCourseMeta = useMemo(() => {
    if (!activeId) return null;
    const item = filteredCourses.find((c) => c.id === activeId);
    if (!item) return null;

    const prereqs = item.prerequisites?.map((p) => p.prerequisiteCourseCode) || [];
    const unlocks = filteredCourses
      .filter((c) => c.prerequisites?.some((p) => p.prerequisiteCourseId === activeId))
      .map((c) => c.code);

    const eligRecord = statusMap[activeId];

    return {
      course: item,
      status: eligRecord?.status || 'UNKNOWN',
      grade: eligRecord?.gradeEarned,
      prereqs,
      unlocks,
    };
  }, [activeId, filteredCourses, statusMap]);

  return (
    <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
      {/* Graph Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Layers size={18} color="#3b82f6" />
          <span style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>
            Interactive Prerequisite Dependency Graph (DAG)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#0f172a', padding: '0.25rem 0.65rem', borderRadius: '8px', border: '1px solid #23324d', fontSize: '0.8rem' }}>
            <Filter size={13} color="#94a3b8" />
            <select
              style={{ background: 'transparent', border: 'none', color: '#cbd5e1', outline: 'none', cursor: 'pointer' }}
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              <option value="CSE">CSE Only</option>
              <option value="MATH">MATH Only</option>
              <option value="ECE">ECE Only</option>
            </select>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.65))}
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setZoomLevel(1)}
            title="Reset Zoom"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1rem', fontSize: '0.75rem', color: '#94a3b8', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
          Completed
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#0ea5e9', display: 'inline-block' }}></span>
          Eligible Now
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f43f5e', display: 'inline-block' }}></span>
          Locked (Missing Prereq)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#cbd5e1' }}>
          💡 Click or hover any node to highlight prerequisite & unlock paths!
        </span>
      </div>

      {/* SVG Canvas Container */}
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          background: '#0a0f1d',
          border: '1px solid #1f293d',
          borderRadius: '12px',
          position: 'relative',
        }}
      >
        <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', transition: 'transform 0.15s ease' }}>
          <svg
            width={totalWidth}
            height={totalHeight}
            style={{ display: 'block' }}
          >
            <defs>
              {/* Arrow markers */}
              <marker
                id="arrow-default"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 8 5 L 0 9 z" fill="#334155" />
              </marker>

              <marker
                id="arrow-prereq"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 8 5 L 0 9 z" fill="#38bdf8" />
              </marker>

              <marker
                id="arrow-unlock"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 8 5 L 0 9 z" fill="#c084fc" />
              </marker>
            </defs>

            {/* Semester Column Headers */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
              const x = colMargin + (sem - 1) * colWidth;
              return (
                <g key={`header-${sem}`}>
                  <rect
                    x={x}
                    y={15}
                    width={cardWidth}
                    height={26}
                    rx={6}
                    fill="#111827"
                    stroke="#1e293b"
                  />
                  <text
                    x={x + cardWidth / 2}
                    y={32}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="11"
                    fontWeight="700"
                  >
                    Semester {sem}
                  </text>
                  {/* Subtle column guide line */}
                  <line
                    x1={x + cardWidth / 2}
                    y1={45}
                    x2={x + cardWidth / 2}
                    y2={totalHeight - 20}
                    stroke="rgba(255, 255, 255, 0.03)"
                    strokeDasharray="4 4"
                  />
                </g>
              );
            })}

            {/* Connecting Edges (Bezier curves) */}
            {edges.map((edge) => {
              const startX = edge.from.rightX;
              const startY = edge.from.centerY;
              const endX = edge.to.leftX;
              const endY = edge.to.centerY;
              const deltaX = Math.abs(endX - startX) * 0.5;

              const pathD = `M ${startX} ${startY} C ${startX + deltaX} ${startY}, ${endX - deltaX} ${endY}, ${endX} ${endY}`;

              const isIncomingToActive = activeId === edge.toId;
              const isOutgoingFromActive = activeId === edge.fromId;

              let strokeColor = 'rgba(100, 116, 139, 0.3)';
              let strokeWidth = 1.5;
              let marker = 'url(#arrow-default)';

              if (isIncomingToActive) {
                strokeColor = '#38bdf8'; // Prerequisite being required
                strokeWidth = 2.5;
                marker = 'url(#arrow-prereq)';
              } else if (isOutgoingFromActive) {
                strokeColor = '#c084fc'; // Unlocking future course
                strokeWidth = 2.5;
                marker = 'url(#arrow-unlock)';
              } else if (activeId) {
                strokeColor = 'rgba(71, 85, 105, 0.1)';
              }

              return (
                <path
                  key={edge.id}
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  markerEnd={marker}
                  style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                />
              );
            })}

            {/* Course Nodes */}
            {Object.values(nodePositions).map((pos) => {
              const { x, y, course } = pos;
              const elig = statusMap[course.id];
              const status = elig?.status || 'LOCKED';

              const isHovered = hoveredNodeId === course.id;
              const isSelected = selectedNodeId === course.id;
              const isHighlightTarget = activeId === course.id;

              let fillColor = '#162032';
              let strokeColor = '#23324d';
              let glowColor = 'transparent';

              if (status === 'COMPLETED') {
                fillColor = '#062d22';
                strokeColor = '#10b981';
                glowColor = 'rgba(16, 185, 129, 0.3)';
              } else if (status === 'ELIGIBLE') {
                fillColor = '#0c2d48';
                strokeColor = '#0ea5e9';
                glowColor = 'rgba(14, 165, 233, 0.35)';
              } else if (status === 'LOCKED') {
                fillColor = '#1e1b29';
                strokeColor = '#f43f5e';
              }

              if (isHighlightTarget) {
                strokeColor = '#ffffff';
              }

              return (
                <g
                  key={course.id}
                  transform={`translate(${x}, ${y})`}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredNodeId(course.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={() => {
                    setSelectedNodeId(course.id);
                    onSelectCourse(course);
                  }}
                >
                  <rect
                    width={cardWidth}
                    height={cardHeight}
                    rx={8}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isHighlightTarget ? 2.5 : 1.5}
                    filter={isHighlightTarget ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' : ''}
                  />

                  {/* Course Code */}
                  <text
                    x={10}
                    y={22}
                    fill="#ffffff"
                    fontSize="12"
                    fontWeight="800"
                    fontFamily="monospace"
                  >
                    {course.code}
                  </text>

                  {/* Status Indicator Icon */}
                  <circle
                    cx={cardWidth - 14}
                    cy={18}
                    r={5}
                    fill={
                      status === 'COMPLETED'
                        ? '#10b981'
                        : status === 'ELIGIBLE'
                        ? '#0ea5e9'
                        : '#f43f5e'
                    }
                  />

                  {/* Credits Pill */}
                  <text
                    x={10}
                    y={38}
                    fill="#94a3b8"
                    fontSize="9.5"
                    fontWeight="600"
                  >
                    {course.credits} Cr • {course.departmentCode}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Active Node Dependency Inspection Banner */}
      {selectedCourseMeta && (
        <div
          style={{
            marginTop: '1.25rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid #23324d',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="course-code" style={{ fontSize: '1.1rem' }}>
                {selectedCourseMeta.course.code}
              </span>
              <span style={{ fontWeight: 700, color: '#fff' }}>
                {selectedCourseMeta.course.title}
              </span>
              <span className={`role-pill ${selectedCourseMeta.status.toLowerCase()}`}>
                {selectedCourseMeta.status}
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.35rem' }}>
              {selectedCourseMeta.prereqs.length > 0 ? (
                <span>
                  <strong style={{ color: '#38bdf8' }}>Requires:</strong> {selectedCourseMeta.prereqs.join(', ')}
                </span>
              ) : (
                <span style={{ color: '#34d399' }}>✓ No prerequisites required</span>
              )}
              {' • '}
              {selectedCourseMeta.unlocks.length > 0 ? (
                <span>
                  <strong style={{ color: '#c084fc' }}>Unlocks ({selectedCourseMeta.unlocks.length}):</strong>{' '}
                  {selectedCourseMeta.unlocks.join(', ')}
                </span>
              ) : (
                <span>Capstone / Terminal course</span>
              )}
            </div>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onSelectCourse(selectedCourseMeta.course)}
          >
            View Full Syllabus
          </button>
        </div>
      )}
    </div>
  );
}
