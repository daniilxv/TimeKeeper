import { useState, useCallback, useEffect } from 'react';
import api from '../api';
import { parseFromBackend } from '../utils/dateUtils';

export function useTasks(initialTasks = []) {
  const [tasks, setTasks] = useState(initialTasks);
  const [categories, setCategories] = useState([]);

  const fetchTasks = useCallback(async () => {
    try {
      const [localResponse, googleResponse] = await Promise.allSettled([
        api.get('/tasks'),
        api.get('/tasks/google')
      ]);

      let allTasks = [];
      
      if (localResponse.status === 'fulfilled') {
        allTasks = [...allTasks, ...localResponse.value.data];
      }
      
      if (googleResponse.status === 'fulfilled') {
        allTasks = [...allTasks, ...googleResponse.value.data];
      }

      const tasksWithCategories = allTasks.map(task => {
        if (task.category_id) {
          const category = categories.find(c => c.id === task.category_id);
          return { ...task, category };
        }
        return task;
      });

      setTasks(tasksWithCategories);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  }, [categories]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  const createTask = useCallback(async (taskData) => {
    const response = await api.post('/tasks', taskData);
    const newTask = response.data;
    if (newTask.category_id) {
      const category = categories.find(c => c.id === newTask.category_id);
      newTask.category = category;
    }
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, [categories]);

  const updateTask = useCallback(async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    const updatedTask = response.data;
    if (updatedTask.category_id) {
      const category = categories.find(c => c.id === updatedTask.category_id);
      updatedTask.category = category;
    }
    setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    return updatedTask;
  }, [categories]);

  const deleteTask = useCallback(async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  return {
    tasks,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    categories,
    fetchCategories
  };
}
