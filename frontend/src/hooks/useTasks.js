import { useState, useCallback } from 'react';
import api from '../api';

export function useTasks(initialTasks = []) {
  const [tasks, setTasks] = useState(initialTasks);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks', error);
      throw error;
    }
  }, []);

  const createTask = useCallback(async (taskData) => {
    const response = await api.post('/tasks', taskData);
    setTasks(prev => [...prev, response.data]);
    return response.data;
  }, []);

  const updateTask = useCallback(async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    setTasks(prev => prev.map(t => t.id === id ? response.data : t));
    return response.data;
  }, []);

  const deleteTask = useCallback(async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  return { tasks, setTasks, fetchTasks, createTask, updateTask, deleteTask };
}
