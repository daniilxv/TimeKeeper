import React, { useState, useEffect, useCallback, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';
import AuthPage from './components/AuthPage';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });

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
      const response = await api.post('/tasks', newTask);
      setTasks(prev => [...prev, response.data]);
      setNewTask({ title: '', description: '' });
    } catch (error) {
      alert('Error creating task');
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

// Основной интерфейс задач - мемоизируем компонент
const MainApp = memo(({ token, tasks, newTask, handleCreateTask, logout, setNewTask }) => {
  // Локальные обработчики ввода, чтобы не создавать новые функции на каждом рендере
  const handleTitleChange = useCallback((e) => {
    setNewTask(prev => ({ ...prev, title: e.target.value }));
  }, [setNewTask]);

  const handleDescriptionChange = useCallback((e) => {
    setNewTask(prev => ({ ...prev, description: e.target.value }));
  }, [setNewTask]);

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
                placeholder="Название задачи" 
                value={newTask.title} 
                onChange={handleTitleChange}
                required 
              />
              <input 
                placeholder="Описание" 
                value={newTask.description} 
                onChange={handleDescriptionChange}
                required 
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
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                  </div>
                  <span className="task-id">#{task.id}</span>
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
