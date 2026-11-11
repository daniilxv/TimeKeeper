import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import Header from './components/Header/Header';
import CalendarView from './components/Calendar/CalendarView';
import TaskModal from './components/TaskModal/TaskModal';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { useCalendar } from './hooks/useCalendar';
import './App.css';

function App() {
  const { token, login, logout, isAuthenticated } = useAuth();
  const { tasks, fetchTasks, createTask, updateTask, deleteTask } = useTasks();
  const calendar = useCalendar(tasks);

  useEffect(() => {
    if (token) fetchTasks();
  }, [token, fetchTasks]);

  const handleModalSave = async (formData) => {
    try {
      const payload = {
        ...formData,
        start_time: formData.start_time ? new Date(formData.start_time).toISOString() : null,
        end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null,
        comment: formData.comment || null
      };
      if (calendar.selectedTask?.id) {
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
    if (!calendar.selectedTask) return;
    if (!window.confirm('Удалить эту задачу?')) return;
    try {
      await deleteTask(calendar.selectedTask.id);
      calendar.closeTaskModal();
    } catch (error) { alert('Error deleting: ' + error.message); }
  };

  const ProtectedRoute = ({ children }) => isAuthenticated ? children : <Navigate to="/login" replace />;

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="app">
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
                    dayStartHour={calendar.dayStartHour}
                    dayEndHour={calendar.dayEndHour}
                    onTimeRangeChange={(start, end) => {
                      calendar.setDayStartHour(start);
                      calendar.setDayEndHour(end);
                    }}
                  />
                  <main className="app-main">
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
                  </main>
                  {calendar.selectedTask && (
                    <TaskModal
                      task={calendar.selectedTask}
                      onClose={calendar.closeTaskModal}
                      onSave={handleModalSave}
                      onDelete={handleDelete}
                      canDelete={!!calendar.selectedTask.id}
                    />
                  )}
                </div>
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
