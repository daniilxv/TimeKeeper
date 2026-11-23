import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './CategoriesPage.css';

const CategoriesPage = ({ onBack }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: '#3498db' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      setError('Ошибка загрузки категорий: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
        setSuccess('Категория обновлена');
      } else {
        await api.post('/categories', formData);
        setSuccess('Категория создана');
      }
      setFormData({ name: '', color: '#3498db' });
      setEditingCategory(null);
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      setError('Ошибка: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, color: category.color });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить эту категорию?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setSuccess('Категория удалена');
      fetchCategories();
    } catch (err) {
      setError('Ошибка удаления: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setFormData({ name: '', color: '#3498db' });
    setShowForm(false);
  };

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/');
  };

  if (loading) return <div className="categories-loading">Загрузка...</div>;

  return (
    <div className="categories-page">
      <div className="categories-header">
        <button className="back-btn" onClick={handleBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Назад
        </button>
        <h1>Категории задач</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="categories-toolbar">
        <button className="btn btn-primary" onClick={() => { setEditingCategory(null); setFormData({ name: '', color: '#3498db' }); setShowForm(true); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Новая категория
        </button>
      </div>

      {showForm && (
        <div className="category-form-card">
          <h3>{editingCategory ? 'Редактировать' : 'Создать'} категорию</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Название</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                maxLength={50}
                placeholder="Например: Работа, Личное, Учеба"
              />
            </div>
            <div className="form-group">
              <label>Цвет</label>
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                />
                <span className="color-preview" style={{ backgroundColor: formData.color }}></span>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">{editingCategory ? 'Сохранить' : 'Создать'}</button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>Отмена</button>
            </div>
          </form>
        </div>
      )}

      <div className="categories-list">
        {categories.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
            </svg>
            <p>Категорий пока нет</p>
            <button className="btn btn-primary" onClick={() => { setEditingCategory(null); setFormData({ name: '', color: '#3498db' }); setShowForm(true); }}>
              Создать первую категорию
            </button>
          </div>
        ) : (
          <ul>
            {categories.map(cat => (
              <li key={cat.id} className="category-item">
                <div className="category-color" style={{ backgroundColor: cat.color }}></div>
                <div className="category-info">
                  <span className="category-name">{cat.name}</span>
                  <span className="category-color-hex">{cat.color}</span>
                </div>
                <div className="category-actions">
                  <button className="icon-btn" onClick={() => handleEdit(cat)} aria-label="Редактировать">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button className="icon-btn danger" onClick={() => handleDelete(cat.id)} aria-label="Удалить">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
