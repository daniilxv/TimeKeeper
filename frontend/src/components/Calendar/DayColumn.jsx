import React from 'react';
import TaskBlock from './TaskBlock';
import { isSameDay } from '../../utils/dateUtils';
import './DayColumn.css';

const DayColumn = ({ 
  day, dayIndex, tasks, hourHeight, dayStartHour, dayEndHour, visibleHours, 
  isToday, onSlotClick, getTaskPosition, onTaskClick 
}) => {
  visibleHours = visibleHours + 1;
  return (
    <div 
      className={`day-column ${isToday ? 'today' : ''}`}
      role="gridcell"
      onClick={(e) => onSlotClick(e, day, dayStartHour, hourHeight)}
      style={{ minHeight: `${visibleHours * hourHeight}px` }}
    >
      <div className="hour-grid" aria-hidden="true">
        {Array.from({ length: visibleHours}, (_, i) => (
          <div key={i} className="hour-line" style={{ height: hourHeight }}></div>
        ))}
      </div>
      <div className="tasks-layer">
        {tasks.map((task, taskIndex) => {
          const { top, height } = getTaskPosition(task, hourHeight, dayStartHour, dayEndHour);
          const isMultiDay = task.end_time && !isSameDay(new Date(task.start_time), new Date(task.end_time));
          return (
            <TaskBlock
              key={task.id}
              task={task}
              top={top}
              height={height}
              zIndex={taskIndex + 1}
              isMultiDay={isMultiDay}
              onClick={onTaskClick}
            />
          );
        })}
      </div>
      <div className="empty-space" style={{ height: `${visibleHours * hourHeight}px` }} />
    </div>
  );
};

export default DayColumn;
