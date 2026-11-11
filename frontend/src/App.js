import React, { useState, useEffect, useCallback, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';
import AuthPage from './components/AuthPage';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tasks, setTasks] = useState([]);
  // Обновленное состояние формы с новыми полями
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    start_time: '', 
    end_time: '', 
    comment: '' 
  });

  const fetchTasks = useCallback(async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks', error);
      logout();
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token, fetchTasks]);

  const handleLogin = useCallback((accessToken) => {
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
  }, []);

  const handleCreateTask = useCallback(async (e) => {
    e.preventDefault();
    try {
      // Формируем payload, преобразуя даты в ISO строку, если они есть
      const payload = {
        ...newTask,
        start_time: newTask.start_time ? new Date(newTask.start_time).toISOString() : null,
        end_time: newTask.end_time ? new Date(newTask.end_time).toISOString() : null,
        comment: newTask.comment || null
      };
      
      const response = await api.post('/tasks', payload);
      setTasks(prev => [...prev, response.data]);
      // Сброс формы
      setNewTask({ title: '', description: '', start_time: '', end_time: '', comment: '' });
    } catch (error) {
      alert('Error creating task: ' + (error.response?.data?.detail || error.message));
    }
  }, [newTask]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setTasks([]);
  }, []);

  // Защищенный маршрут
  const ProtectedRoute = useCallback(({ children }) => {
    return token ? children : <Navigate to="/login" replace />;
  }, [token]);

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={<AuthPage onLogin={handleLogin} />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainApp 
                  token={token}
                  tasks={tasks}
                  newTask={newTask}
                  handleCreateTask={handleCreateTask}
                  logout={logout}
                  setNewTask={setNewTask}
                />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

// Основной интерфейс задач
const MainApp = memo(({ token, tasks, newTask, handleCreateTask, logout, setNewTask }) => {
  // Обработчики изменений полей формы
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  }, [setNewTask]);

  // Форматирование даты для отображения
  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('ru-RU', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <h1>Task Manager</h1>
        </div>
        <button onClick={logout} className="logout-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Выйти
        </button>
      </header>

      <main className="app-main">
        <section className="task-form-section">
          <h2>Создать новую задачу</h2>
          <form onSubmit={handleCreateTask} className="task-form">
            <div className="form-row">
              <input 
                name="title"
                placeholder="Название задачи" 
                value={newTask.title} 
                onChange={handleChange}
                required 
              />
              <input 
                name="description"
                placeholder="Описание" 
                value={newTask.description} 
                onChange={handleChange}
                required 
              />
            </div>
            
            <div className="form-row datetime-row">
              <div className="form-group">
                <label htmlFor="start_time">Начало</label>
                <input 
                  type="datetime-local"
                  id="start_time"
                  name="start_time"
                  value={newTask.start_time} 
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="end_time">Окончание</label>
                <input 
                  type="datetime-local"
                  id="end_time"
                  name="end_time"
                  value={newTask.end_time} 
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group comment-group">
              <label htmlFor="comment">Комментарий (Markdown)</label>
              <textarea 
                id="comment"
                name="comment"
                placeholder="Поддерживается Markdown: **жирный**, *курсив*, `код`, списки..."
                value={newTask.comment} 
                onChange={handleChange}
                rows="4"
              />
            </div>
            
            <button type="submit" className="add-task-btn">Добавить задачу</button>
          </form>
        </section>

        <section className="tasks-section">
          <h2>Мои задачи</h2>
          {tasks.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p>У вас пока нет задач</p>
              <span>Создайте свою первую задачу выше</span>
            </div>
          ) : (
            <ul className="tasks-list">
              {tasks.map(task => (
                <li key={task.id} className="task-item">
                  <div className="task-content">
                    <div className="task-header">
                      <h3>{task.title}</h3>
                      <span className="task-id">#{task.id}</span>
                    </div>
                    <p className="task-description">{task.description}</p>
                    
                    {/* Отображение времени */}
                    {(task.start_time || task.end_time) && (
                      <div className="task-datetime">
                        {task.start_time && (
                          <span className="datetime-badge start">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            Начало: {formatDateTime(task.start_time)}
                          </span>
                        )}
                        {task.end_time && (
                          <span className="datetime-badge end">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            Конец: {formatDateTime(task.end_time)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Отображение комментария с Markdown */}
                    {task.comment && (
                      <div className="task-comment">
                        <h4>Комментарий:</h4>
                        <ReactMarkdown className="markdown-body">{task.comment}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
});

export default App;
