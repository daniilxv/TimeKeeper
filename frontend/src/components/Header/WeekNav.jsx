import React from 'react';

const WeekNav = ({ onPrev, onNext, onToday }) => (
  <>
    <button onClick={onPrev} className="nav-btn" aria-label="Предыдущая неделя">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <button onClick={onNext} className="nav-btn" aria-label="Следующая неделя">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
    <button onClick={onToday} className="today-btn">Сегодня</button>
  </>
);

export default WeekNav;
