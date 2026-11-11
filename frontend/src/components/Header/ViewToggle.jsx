import React from 'react';

const ViewToggle = ({ mode, onChange }) => (
  <div className="view-toggle" role="group" aria-label="Вид календаря">
    <button 
      className={mode === 'week' ? 'active' : ''} 
      onClick={() => onChange('week')}
      aria-label="Неделя" aria-pressed={mode === 'week'}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="4" x2="16" y2="22"/><line x1="8" y1="4" x2="8" y2="22"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    </button>
    <button 
      className={mode === 'day' ? 'active' : ''} 
      onClick={() => onChange('day')}
      aria-label="День" aria-pressed={mode === 'day'}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="4" x2="12" y2="22"/></svg>
    </button>
  </div>
);

export default ViewToggle;
