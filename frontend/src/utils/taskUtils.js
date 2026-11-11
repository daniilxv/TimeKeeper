import { isSameDay } from './dateUtils';

export function timeToPixels(timeStr, hourHeight) {
  if (!timeStr) return 0;
  const date = new Date(timeStr);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return (hours * 60 + minutes) * (hourHeight / 60);
}

export function getTaskPosition(task, hourHeight, dayStartHour = 6, dayEndHour = 22) {
  if (!task.start_time || !task.end_time) return { top: 0, height: 0 };
  
  const start = new Date(task.start_time);
  const end = new Date(task.end_time);
  
  const startMinutes = (start.getHours() - dayStartHour) * 60 + start.getMinutes();
  const endMinutes = (end.getHours() - dayStartHour) * 60 + end.getMinutes();
  const durationMinutes = endMinutes - startMinutes;
  
  const top = Math.max(0, startMinutes * (hourHeight / 60));
  const height = Math.max(hourHeight * 0.5, durationMinutes * (hourHeight / 60));
  
  return { top, height };
}

export function filterWeekTasks(tasks, weekStart, weekEnd) {
  return tasks.filter(task => {
    if (!task.start_time) return false;
    const taskDate = new Date(task.start_time);
    return taskDate >= weekStart && taskDate <= weekEnd;
  });
}

export function groupTasksByDay(tasks, weekDays) {
  return weekDays.map(day => {
    const dayTasks = tasks.filter(task => isSameDay(new Date(task.start_time), day));
    return dayTasks.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  });
}
