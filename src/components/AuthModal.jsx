import React, { useState } from 'react';
import { X, Lock, User, Mail, GraduationCap, Building, KeyRound, LogIn, UserPlus } from 'lucide-react';
import { api } from '../api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, departments, showToast }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    studentId: '',
    departmentId: '',
    currentSemester: 1,
    role: 'STUDENT',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        const payload = {
          ...formData,
          departmentId: formData.departmentId ? Number(formData.departmentId) : departments[0]?.id,
          currentSemester: Number(formData.currentSemester),
        };
        const res = await api.register(payload);
        showToast('Registration successful! Welcome to CoursePath.', 'success');
        onLoginSuccess(res.user);
        onClose();
      } else {
        const res = await api.login(formData.username, formData.password);
        showToast(`Welcome back, ${res.user.fullName}!`, 'success');
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: '#2563eb', padding: '0.5rem', borderRadius: '8px', color: '#fff' }}>
              {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
              {isRegister ? 'Student Registration' : 'Student & Staff Login'}
            </h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Sarah Connor"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. sarah.connor@coursepath.edu"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Student ID</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. CS-2025-099"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <select
                    className="form-control"
                    value={formData.currentSemester}
                    onChange={(e) => setFormData({ ...formData, currentSemester: e.target.value })}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-control"
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Username *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your username"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #23324d', fontSize: '0.85rem', color: '#94a3b8' }}>
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                style={{ background: 'transparent', border: 'none', color: '#60a5fa', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setIsRegister(false)}
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                style={{ background: 'transparent', border: 'none', color: '#60a5fa', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setIsRegister(true)}
              >
                Register as Student
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
