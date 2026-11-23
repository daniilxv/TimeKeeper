import React, { useState, useEffect, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { formatForInput, formatForBackend, parseFromBackend, roundToNearestHour, addHours } from '../../utils/dateUtils';
import MarkdownPreview from './MarkdownPreview';
import './TaskModal.css';

const parseTaskDate = (dateStr) => {
  if (!dateStr) return null;
  return parseFromBackend(dateStr);
};

const TaskModal = memo(({ task = {}, onClose, onSave, onDelete, canDelete, categories = [] }) => {
  const currentTask = task || {};

  const getInitialTime = (dateStr, fallbackFn) => {
    if (!dateStr) return formatForInput(fallbackFn());
    const localDate = parseTaskDate(dateStr);
    return formatForInput(localDate);
  };

  const [formData, setFormData] = useState({
    title: currentTask.title || '',
    start_time: getInitialTime(currentTask.start_time, roundToNearestHour),
    end_time: getInitialTime(currentTask.end_time, () => addHours(roundToNearestHour(new Date()), 1)),
    comment: currentTask.comment || '',
    category_id: currentTask.category_id || ''
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        start_time: getInitialTime(task.start_time, roundToNearestHour),
        end_time: getInitialTime(task.end_time, () => addHours(roundToNearestHour(new Date()), 1)),
        comment: task.comment || '',
        category_id: task.category_id || ''
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? null : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      start_time: formData.start_time ? formatForBackend(new Date(formData.start_time)) : null,
      end_time: formData.end_time ? formatForBackend(new Date(formData.end_time)) : null,
      comment: formData.comment || null,
      category_id: formData.category_id || null
    };
    onSave(payload);
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
            <label htmlFor="category_id">Категория</label>
            <select id="category_id" name="category_id" value={formData.category_id || ''} onChange={handleChange}>
              <option value="">Без категории</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id} style={{ borderLeft: `3px solid ${cat.color}` }}>
                  {cat.name}
                </option>
              ))}
            </select>
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
            <div className={!currentTask.id ? "modal-actions" : "modal-actions-right"}>
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
