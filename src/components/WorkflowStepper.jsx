import React from 'react';
import { UserCheck, CheckSquare, ShieldCheck, Sparkles, GitFork, CalendarPlus, ChevronRight } from 'lucide-react';

const steps = [
  { id: 'dashboard', label: '1. Student Login', icon: UserCheck },
  { id: 'completed', label: '2. Completed Courses', icon: CheckSquare },
  { id: 'eligibility', label: '3. Prerequisite Check', icon: ShieldCheck },
  { id: 'eligibility-only', label: '4. Eligible Courses', icon: Sparkles },
  { id: 'path', label: '5. Course Path', icon: GitFork },
  { id: 'planner', label: '6. Semester Plan', icon: CalendarPlus },
];

export default function WorkflowStepper({ activeTab, setActiveTab }) {
  const getStepStatus = (stepId, index) => {
    const order = ['dashboard', 'completed', 'eligibility', 'eligibility-only', 'path', 'planner'];
    const currentIndex = order.indexOf(activeTab === 'eligibility' ? 'eligibility' : activeTab);
    
    if (activeTab === stepId || (activeTab === 'eligibility' && stepId === 'eligibility-only')) {
      return 'active';
    }
    if (index < currentIndex) {
      return 'completed';
    }
    return '';
  };

  return (
    <div className="workflow-bar">
      <div className="workflow-steps">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const status = getStepStatus(step.id, idx);

          return (
            <React.Fragment key={step.id}>
              <div
                className={`workflow-step ${status}`}
                onClick={() => {
                  if (step.id === 'eligibility-only') {
                    setActiveTab('eligibility');
                  } else {
                    setActiveTab(step.id);
                  }
                }}
                title={`Go to ${step.label}`}
              >
                <div className="step-num">
                  <Icon size={14} />
                </div>
                <span className="step-label">{step.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <ChevronRight size={14} className="step-arrow" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
