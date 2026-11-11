import React from 'react';
import WeekNav from './WeekNav';
import ViewToggle from './ViewToggle';
import SettingsPanel from './SettingsPanel';
import './Header.css';

const Header = ({ 
  weekLabel, 
  onPrevWeek, onNextWeek, onToday, 
  viewMode, onViewModeChange, 
  onCreateTask, onLogout,
  dayStartHour, dayEndHour, onTimeRangeChange
}) => {
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  return (
    <header className="app-header">
      <div className="header-left">
        <WeekNav onPrev={onPrevWeek} onNext={onNextWeek} onToday={onToday} />
        <h1 className="week-title">{weekLabel}</h1>
      </div>
      <div className="header-right">
        <ViewToggle mode={viewMode} onChange={onViewModeChange} />
        <button 
          onClick={() => setSettingsOpen(true)} 
          className="settings-btn"
          aria-label="Настройки времени"
          title="Настройки отображаемых часов"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
        <button onClick={onCreateTask} className="create-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Создать
        </button>
        <button onClick={onLogout} className="logout-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Выйти
        </button>
      </div>
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        dayStartHour={dayStartHour}
        dayEndHour={dayEndHour}
        onChange={onTimeRangeChange}
      />
    </header>
  );
};

export default Header;
