import React from 'react';
import TimeColumn from './TimeColumn';
import DayColumn from './DayColumn';
import { formatDate, isSameDay } from '../../utils/dateUtils';
import './CalendarView.css';

const CalendarView = ({ 
  weekDays, tasksByDay, hourHeight, dayStartHour, dayEndHour, visibleHours,
  onSlotClick, getTaskPosition, onTaskClick
}) => {
  return (
    <div className="calendar-container" role="grid">
      <TimeColumn hourHeight={hourHeight} dayStartHour={dayStartHour} visibleHours={visibleHours} />
      <div className="days-container">
        <div className="days-header" role="row">
          {weekDays.map((day, dayIndex) => (
            <div 
              key={dayIndex} 
              className={`day-header ${isSameDay(day, new Date()) ? 'today' : ''}`}
              role="columnheader"
              onClick={() => onSlotClick({ 
                currentTarget: { getBoundingClientRect: () => ({ top: 0 }) } 
              }, day, dayStartHour, hourHeight)}
            >
              <div className="day-name">{formatDate(day, 'EEE')}</div>
              <div className="day-number">{formatDate(day, 'dd')}</div>
              <div className="day-month">{formatDate(day, 'MMM')}</div>
            </div>
          ))}
        </div>
        <div className="days-grid" role="row">
          {weekDays.map((day, dayIndex) => (
            <DayColumn
              key={dayIndex}
              day={day}
              dayIndex={dayIndex}
              tasks={tasksByDay[dayIndex]}
              hourHeight={hourHeight}
              dayStartHour={dayStartHour}
              dayEndHour={dayEndHour}
              visibleHours={visibleHours}
              isToday={isSameDay(day, new Date())}
              onSlotClick={onSlotClick}
              getTaskPosition={getTaskPosition}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
