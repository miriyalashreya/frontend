import React from 'react';
import { 
  Compass, 
  LayoutDashboard, 
  CheckSquare, 
  ShieldCheck, 
  GitFork, 
  CalendarPlus, 
  Settings, 
  FileCheck2,
  GraduationCap,
  LogIn,
  LogOut
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  usersList,
  onSwitchUser,
  onOpenAuthModal,
  onLogout
}) {
  return (
    <header className="navbar">
      <div className="brand" onClick={() => setActiveTab('dashboard')}>
        <div className="brand-icon">
          <Compass size={24} />
        </div>
        <div>
          <div className="brand-title">CoursePath</div>
          <div className="brand-subtitle">Prerequisite & Course Planning</div>
        </div>
      </div>

      <nav className="nav-links">
        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <CheckSquare size={16} />
          <span>Completed Courses</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'eligibility' ? 'active' : ''}`}
          onClick={() => setActiveTab('eligibility')}
        >
          <ShieldCheck size={16} />
          <span>Eligibility Check</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'path' ? 'active' : ''}`}
          onClick={() => setActiveTab('path')}
        >
          <GitFork size={16} />
          <span>Course Path (DAG)</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'planner' ? 'active' : ''}`}
          onClick={() => setActiveTab('planner')}
        >
          <CalendarPlus size={16} />
          <span>Semester Planner</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <FileCheck2 size={16} />
          <span>Degree Audit</span>
        </button>

        {currentUser?.role === 'ADMIN' && (
          <button
            className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <Settings size={16} />
            <span>Admin Portal</span>
          </button>
        )}
      </nav>

      <div className="user-controls">
        {/* Quick Demo Persona Switcher */}
        <div className="demo-switcher" title="Switch demo profile to test different roles">
          <GraduationCap size={14} color="#60a5fa" />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Demo:</span>
          <select
            className="demo-select"
            value={currentUser?.id || ''}
            onChange={(e) => onSwitchUser(Number(e.target.value))}
          >
            {usersList.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName} ({u.role})
              </option>
            ))}
          </select>
        </div>

        {currentUser ? (
          <div className="user-badge" style={{ cursor: 'pointer' }} onClick={onOpenAuthModal} title="Click to sign in with a different account">
            <div className="user-avatar">
              {currentUser?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="user-name">{currentUser?.fullName}</div>
            </div>
            <span className={`role-pill ${currentUser?.role?.toLowerCase()}`}>
              {currentUser?.role}
            </span>
          </div>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={onOpenAuthModal}>
            <LogIn size={14} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
