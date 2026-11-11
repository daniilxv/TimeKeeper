import React, { useState, useEffect } from 'react';
import './SettingsPanel.css';

const SettingsPanel = ({ isOpen, onClose, dayStartHour, dayEndHour, onChange }) => {
  const [startHour, setStartHour] = useState(dayStartHour);
  const [endHour, setEndHour] = useState(dayEndHour);

  useEffect(() => {
    setStartHour(dayStartHour);
    setEndHour(dayEndHour);
  }, [dayStartHour, dayEndHour]);

  const handleApply = () => {
    if (startHour < endHour) {
      onChange(startHour, endHour);
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter') handleApply();
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose} onKeyDown={handleKeyDown} tabIndex={0} autoFocus>
      <div className="settings-panel" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="settings-header">
          <h2 id="settings-title">Настройки отображения</h2>
          <button onClick={onClose} className="settings-close" aria-label="Закрыть">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="settings-content">
          <div className="setting-group">
            <label htmlFor="start-hour">Начало дня</label>
            <select id="start-hour" value={startHour} onChange={e => setStartHour(Number(e.target.value))}>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
              ))}
            </select>
          </div>
          <div className="setting-group">
            <label htmlFor="end-hour">Конец дня</label>
            <select id="end-hour" value={endHour} onChange={e => setEndHour(Number(e.target.value))}>
              {Array.from({ length: 25 }, (_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
              ))}
            </select>
          </div>
          <div className="setting-hint">
            Показывать часы с <strong>{String(startHour).padStart(2, '0')}:00</strong> по <strong>{String(endHour).padStart(2, '0')}:00</strong> ({endHour - startHour} ч.)
          </div>
        </div>
        <div className="settings-actions">
          <button onClick={onClose} className="btn-secondary">Отмена</button>
          <button onClick={handleApply} className="btn-primary" disabled={startHour >= endHour}>Применить</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
