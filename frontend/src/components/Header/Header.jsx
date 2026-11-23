import React, { useState } from 'react';
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
  onOpenSettings,
  showCategories,
  setShowCategories,
  categories,
  onOpenCategories
}) => {
  const [showTimeRange, setShowTimeRange] = useState(false);

  return (
    <header className="app-header">
      <div className="header-left">
        <WeekNav onPrev={onPrevWeek} onNext={onNextWeek} onToday={onToday} />
        <h1 className="week-title">{weekLabel}</h1>
      </div>
      <div className="header-right">
        <ViewToggle mode={viewMode} onChange={onViewModeChange} />
        
        {/* Кнопка Google Calendar */}
        {checkingGoogle ? (
          <div className="icon-btn loading" aria-label="Проверка подключения Google">
            <div className="spinner"></div>
          </div>
        ) : googleConnected ? (
          <button 
            className="icon-btn connected" 
            onClick={onDisconnectGoogle} 
            aria-label="Отключить Google Календарь"
            title="Google Календарь подключен"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>
        ) : (
          <button 
            className="icon-btn" 
            onClick={onConnectGoogle} 
            aria-label="Подключить Google Календарь"
            title="Подключить Google Календарь"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>
        )}

        {/* Кнопка категорий */}
        <button 
          className={`icon-btn ${showCategories ? 'active' : ''}`}
          onClick={onOpenCategories}
          aria-label="Категории"
          aria-pressed={showCategories}
          title="Категории задач"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
          </svg>
        </button>

        {/* Кнопка настроек ВРЕМЕНИ (часы) */}
        <button 
          className="icon-btn time-settings-btn"
          onClick={() => setShowTimeRange(!showTimeRange)} 
          aria-label="Настройки времени"
          title="Настройки отображаемых часов"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </button>

        {/* Кнопка ОСНОВНЫХ НАСТРОЕК (шестеренка) */}
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Создать
        </button>
        <button onClick={onLogout} className="logout-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Выйти
        </button>
      </div>
      {showTimeRange && (
        <SettingsPanel
          isOpen={showTimeRange}
          onClose={() => setShowTimeRange(false)}
          dayStartHour={dayStartHour}
          dayEndHour={dayEndHour}
          onChange={onTimeRangeChange}
        />
      )}
    </header>
  );
};

export default Header;
