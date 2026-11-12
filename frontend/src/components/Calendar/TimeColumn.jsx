import React from 'react';
import './TimeColumn.css';

const TimeColumn = ({ hourHeight, dayStartHour, visibleHours }) => {
  return (
    <div className="time-column">
      <div className="time-column-header"></div>
      {Array.from({ length: visibleHours}, (_, i) => {
        const hour = dayStartHour + i;
        return (
          <div key={hour} className="time-slot" style={{ height: hourHeight }}>
            <span className="time-label">{String(hour).padStart(2, '0')}:00</span>
          </div>
        );
      })}
    </div>
  );
};

export default TimeColumn;
