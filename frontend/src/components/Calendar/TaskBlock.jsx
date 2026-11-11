import React, { useState, useRef, useEffect } from 'react';
import { formatDate } from '../../utils/dateUtils';
import './TaskBlock.css';

const TaskBlock = ({ task, top, height, zIndex, isMultiDay, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);
  const blockRef = useRef(null);

  // Минимальная высота для отображения (30px)
  const MIN_HEIGHT = 30;
  const isSmall = height < MIN_HEIGHT;
  const displayHeight = isSmall ? MIN_HEIGHT : height;

  // Позиция тултипа
  useEffect(() => {
    if (showTooltip && tooltipRef.current && blockRef.current) {
      const rect = blockRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const containerRect = blockRef.current.closest('.day-column').getBoundingClientRect();
      
      // Позиционируем тултип справа от задачи
      tooltipRef.current.style.top = `${rect.top - containerRect.top - 4}px`;
      tooltipRef.current.style.left = `${rect.right - containerRect.left + 8}px`;
      
      // Проверяем, не выходит ли за границы экрана
      if (rect.right - containerRect.left + tooltipRect.width + 16 > containerRect.width) {
        tooltipRef.current.style.left = `${rect.left - containerRect.left - tooltipRect.width - 8}px`;
        tooltipRef.current.classList.add('tooltip-left');
      } else {
        tooltipRef.current.classList.remove('tooltip-left');
      }
    }
  }, [showTooltip, height]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (isSmall) setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTooltip(false);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onClick(task);
  };

  const startTime = formatDate(new Date(task.start_time), 'HH:mm');
  const endTime = formatDate(new Date(task.end_time), 'HH:mm');
  const duration = Math.round((new Date(task.end_time) - new Date(task.start_time)) / 60000);

  return (
    <>
      <div
        ref={blockRef}
        className={`task-block ${isSmall ? 'task-small' : ''} ${isHovered ? 'task-hovered' : ''}`}
        style={{ 
          top: `${top}px`, 
          height: `${displayHeight}px`, 
          zIndex: isHovered ? 100 : zIndex 
        }}
        onClick={handleClick}
        onDoubleClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={isSmall ? undefined : `${startTime} — ${endTime} • ${task.title}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(e); } }}
        aria-label={`${task.title}, ${startTime} — ${endTime}${isMultiDay ? ', многосуточная' : ''}`}
      >
        {!isSmall && (
          <>
            {/*
            <div className="task-block-time">{startTime} — {endTime}</div>
            */}
            <div className="task-block-title">{task.title}</div>
          </>
        )}
        {isSmall && (
          <div className="task-small-content">
            {/*
            <span className="task-small-time">{startTime}</span>
            */}
            <span className="task-small-title">{task.title}</span>
          </div>
        )}
        {isMultiDay && <span className="multi-day-badge" aria-label="Многосуточная задача">⟶</span>}
      </div>

      {showTooltip && (
        <div 
          ref={tooltipRef} 
          className="task-tooltip"
          role="tooltip"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="tooltip-header">
            <span className="tooltip-time">{startTime} — {endTime}</span>
            <span className="tooltip-duration">{duration} мин</span>
          </div>
          <div className="tooltip-title">{task.title}</div>
          {task.comment && <div className="tooltip-comment">{task.comment}</div>}
          {isMultiDay && <span className="tooltip-multiday">Многосуточная задача</span>}
        </div>
      )}
    </>
  );
};

export default TaskBlock;
