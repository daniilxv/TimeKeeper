import React from 'react';
import WeekNav from './WeekNav';
import ViewToggle from './ViewToggle';
import SettingsPanel from './SettingsPanel';
import './Header.css';

const Header = ({ 
  weekLabel, 
  onPrevWeek, onNextWeek, onToday, 
  viewMode, onViewModeChange, 
  onCreateTask, onLogout, onConnectGoogle,
  onDisconnectGoogle,
  googleConnected,
  checkingGoogle,
  dayStartHour, dayEndHour, onTimeRangeChange,
  onOpenSettings
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
        
        {/* Кнопка Google Calendar */}
        <button 
          onClick={onConnectGoogle} 
          className={`google-btn ${googleConnected ? 'connected' : ''}`}
          title={googleConnected ? "Google Календарь подключен" : "Подключить Google Календарь"}
          disabled={checkingGoogle}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-2.21 5.39-7.84 5.39-4.84 0-8.74-4.01-8.74-8.94s3.9-8.94 8.74-8.94c2.75 0 4.62 1.17 5.66 2.16l2.6-2.6C19.67 1.5 16.1 0 12.48 0 5.6 0 0 5.6 0 12.48s5.6 12.48 12.48 12.48c7.2 0 12.1-5.1 12.1-12.2 0-.82-.09-1.45-.2-2.05h-11.9z"/>
          </svg>
          {googleConnected ? 'Подключено' : 'Google'}
        </button>

        {/* Кнопка настроек ВРЕМЕНИ (часы) */}
        <button 
          onClick={() => setSettingsOpen(true)} 
          className="settings-btn time-settings-btn"
          aria-label="Настройки времени"
          title="Настройки отображаемых часов"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>

        {/* Кнопка ОСНОВНЫХ НАСТРОЕК (шестеренка) — ЭТОТ БЫЛ ПРОПУЩЕН */}
        <button 
          className="icon-btn main-settings-btn" 
          onClick={onOpenSettings}
          aria-label="Настройки приложения"
          title="Настройки (Google Calendar, уведомления, тема)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
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
