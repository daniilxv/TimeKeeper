import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import Header from './components/Header/Header';
import CalendarView from './components/Calendar/CalendarView';
import TaskModal from './components/TaskModal/TaskModal';
import SettingsPage from './components/SettingsPage';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { useCalendar } from './hooks/useCalendar';
import api from './api';
import './App.css';

// Обертка для маршрутов, чтобы иметь доступ к useNavigate
function RoutesWrapper({ 
  token, login, logout, isAuthenticated,
  tasks, fetchTasks, createTask, updateTask, deleteTask,
  calendar,
  googleConnected, setGoogleConnected,
  checkingGoogle, setCheckingGoogle,
  showSettings, setShowSettings
}) {
  const navigate = useNavigate();

  const checkGoogleConnection = async () => {
    try {
      const response = await api.get('/auth/google/status');
      setGoogleConnected(response.data.connected);
    } catch (error) {
      console.error('Failed to check Google connection:', error);
      setGoogleConnected(false);
    } finally {
      setCheckingGoogle(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const response = await api.get('/auth/google');
      window.location.href = response.data.url;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error';
      alert('Ошибка при подключении Google Календаря: ' + errorMessage);
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!window.confirm('Отключить Google Календарь?')) return;
    try {
      await api.post('/auth/google/disconnect');
      setGoogleConnected(false);
    } catch (error) {
      if (error.response?.status === 404) {
        alert('Функция отключения пока не реализована на сервере.');
      } else {
        alert('Ошибка: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const handleModalSave = async (formData) => {
    try {
      const payload = {
        ...formData,
        start_time: formData.start_time ? new Date(formData.start_time).toISOString() : null,
        end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null,
        comment: formData.comment || null
      };
      if (calendar.selectedTask?.id) {
        if (calendar.selectedTask.id.toString().startsWith('google_')) {
          alert('Нельзя редактировать мероприятия из Google Календаря');
          return;
        }
        await updateTask(calendar.selectedTask.id, payload);
      } else {
        await createTask(payload);
      }
      calendar.closeTaskModal();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.detail || error.message));
    }
  };

const handleDelete = async () => {
    if (!calendar.selectedTask || !calendar.selectedTask.id) {
      // Если это новая задача (ещё не создана в БД), просто закрываем модалку
      calendar.closeTaskModal();
      return;
    }

    if (calendar.selectedTask.id.toString().startsWith('google_')) {
      alert('Нельзя удалить мероприятие из Google Календаря через это приложение');
      return;
    }

    if (!window.confirm('Удалить эту задачу?')) return;

    try {
      await deleteTask(calendar.selectedTask.id);
      calendar.closeTaskModal();
    } catch (error) {
      alert('Error deleting: ' + error.message);
    }
  };

  const ProtectedRoute = ({ children }) => isAuthenticated ? children : <Navigate to="/login" replace />;

  return (
    <Routes>
      <Route path="/login" element={<AuthPage onLogin={login} />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <div className="app-inner">
              <Header
                weekLabel={calendar.weekLabel}
                onPrevWeek={calendar.goToPrevWeek}
                onNextWeek={calendar.goToNextWeek}
                onToday={calendar.goToToday}
                viewMode={calendar.viewMode}
                onViewModeChange={calendar.setViewMode}
                onCreateTask={() => calendar.openTaskModal()}
                onLogout={logout}
                onConnectGoogle={handleConnectGoogle}
                onDisconnectGoogle={handleDisconnectGoogle}
                googleConnected={googleConnected}
                checkingGoogle={checkingGoogle}
                dayStartHour={calendar.dayStartHour}
                dayEndHour={calendar.dayEndHour}
                onTimeRangeChange={(start, end) => {
                  calendar.setDayStartHour(start);
                  calendar.setDayEndHour(end);
                }}
                onOpenSettings={() => setShowSettings(true)}
              />
              <main className="app-main">
                {showSettings ? (
                  <SettingsPage onBack={() => setShowSettings(false)} />
                ) : (
                  <CalendarView
                    weekDays={calendar.weekDays}
                    tasksByDay={calendar.tasksByDay}
                    hourHeight={60}
                    dayStartHour={calendar.dayStartHour}
                    dayEndHour={calendar.dayEndHour}
                    visibleHours={calendar.visibleHours}
                    onSlotClick={calendar.handleSlotClick}
                    getTaskPosition={calendar.getTaskPosition}
                    onTaskClick={calendar.openTaskModal}
                  />
                )}
              </main>
              {calendar.selectedTask && !showSettings && (
                <TaskModal
                  task={calendar.selectedTask}
                  onClose={calendar.closeTaskModal}
                  onSave={handleModalSave}
                  onDelete={handleDelete}
                  canDelete={!calendar.selectedTask.id?.toString().startsWith('google_')}
                />
              )}
            </div>
          </ProtectedRoute>
        } 
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <div className="app-inner">
              <Header
                weekLabel={calendar.weekLabel}
                onPrevWeek={calendar.goToPrevWeek}
                onNextWeek={calendar.goToNextWeek}
                onToday={calendar.goToToday}
                viewMode={calendar.viewMode}
                onViewModeChange={calendar.setViewMode}
                onCreateTask={() => calendar.openTaskModal()}
                onLogout={logout}
                onConnectGoogle={handleConnectGoogle}
                onDisconnectGoogle={handleDisconnectGoogle}
                googleConnected={googleConnected}
                checkingGoogle={checkingGoogle}
                dayStartHour={calendar.dayStartHour}
                dayEndHour={calendar.dayEndHour}
                onTimeRangeChange={(start, end) => {
                  calendar.setDayStartHour(start);
                  calendar.setDayEndHour(end);
                }}
                onOpenSettings={() => setShowSettings(true)}
              />
              <main className="app-main">
                <SettingsPage onBack={() => navigate('/')} />
              </main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const { token, login, logout, isAuthenticated } = useAuth();
  const { tasks, fetchTasks, createTask, updateTask, deleteTask } = useTasks();
  const calendar = useCalendar(tasks);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [checkingGoogle, setCheckingGoogle] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (token) {
      fetchTasks();
      checkGoogleConnection();
    }
  }, [token, fetchTasks]);

  const checkGoogleConnection = async () => {
    try {
      const response = await api.get('/auth/google/status');
      setGoogleConnected(response.data.connected);
    } catch (error) {
      console.error('Failed to check Google connection:', error);
      setGoogleConnected(false);
    } finally {
      setCheckingGoogle(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('google_connected') === 'true') {
      checkGoogleConnection();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="app">
        <RoutesWrapper
          token={token}
          login={login}
          logout={logout}
          isAuthenticated={isAuthenticated}
          tasks={tasks}
          fetchTasks={fetchTasks}
          createTask={createTask}
          updateTask={updateTask}
          deleteTask={deleteTask}
          calendar={calendar}
          googleConnected={googleConnected}
          setGoogleConnected={setGoogleConnected}
          checkingGoogle={checkingGoogle}
          setCheckingGoogle={setCheckingGoogle}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
        />
      </div>
    </Router>
  );
}

export default App;
