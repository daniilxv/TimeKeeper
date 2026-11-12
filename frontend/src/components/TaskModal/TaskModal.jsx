import React, { useState, useEffect, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { formatForInput, roundToNearestHour, addHours } from '../../utils/dateUtils';
import MarkdownPreview from './MarkdownPreview';
import './TaskModal.css';

const TaskModal = memo(({ task = {}, onClose, onSave, onDelete, canDelete }) => {
  const currentTask = task || {};

  const [formData, setFormData] = useState({
    title: currentTask.title || '',
    start_time: currentTask.start_time ? formatForInput(new Date(currentTask.start_time)) : formatForInput(roundToNearestHour(new Date())),
    end_time: currentTask.end_time ? formatForInput(new Date(currentTask.end_time)) : formatForInput(addHours(roundToNearestHour(new Date()), 1)),
    comment: currentTask.comment || ''
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        start_time: task.start_time ? formatForInput(new Date(task.start_time)) : formatForInput(roundToNearestHour(new Date())),
        end_time: task.end_time ? formatForInput(new Date(task.end_time)) : formatForInput(addHours(roundToNearestHour(new Date()), 1)),
        comment: task.comment || ''
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="modal-title">{currentTask.id ? 'Редактировать задачу' : 'Новая задача'}</h2>
          <button onClick={onClose} className="modal-close" aria-label="Закрыть">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Название *</label>
            <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} required placeholder="Название задачи" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_time">Начало *</label>
              <input id="start_time" name="start_time" type="datetime-local" value={formData.start_time} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="end_time">Окончание *</label>
              <input id="end_time" name="end_time" type="datetime-local" value={formData.end_time} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="comment">Комментарий (Markdown)</label>
            <textarea id="comment" name="comment" value={formData.comment} onChange={handleChange} placeholder="**Жирный**, *курсив*, `код`, списки..." rows="4" />
          </div>
          {formData.comment && <MarkdownPreview content={formData.comment} />}
          <div className="modal-actions">
            {canDelete && (
              <button type="button" onClick={onDelete} className={`btn-danger ${!currentTask.id ? 'is-hidden' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                Удалить
              </button>
            )}
            <div className={!currentTask.id ? "modal-actions":"modal-actions-right"}>
              <button type="button" onClick={onClose} className="btn-secondary">Отмена</button>
              <button type="submit" className="btn-primary">{currentTask.id ? 'Сохранить' : 'Создать'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
});

export default TaskModal;