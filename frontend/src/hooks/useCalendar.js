import { useState, useCallback, useMemo } from 'react';
import { 
  getWeekStart, addDays, getWeekDays, formatDate, roundToNearestHour, formatForInput, addHours, parseFromBackend
} from '../utils/dateUtils';
import { filterWeekTasks, groupTasksByDay, getTaskPosition } from '../utils/taskUtils';

export function useCalendar(tasks) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));
  const [viewMode, setViewMode] = useState('week');
  const [selectedTask, setSelectedTask] = useState(null);
  // Настраиваемый временной диапазон (0-24 по умолчанию)
  const [dayStartHour, setDayStartHour] = useState(0);
  const [dayEndHour, setDayEndHour] = useState(24);

  // Навигация
  const goToPrevWeek = useCallback(() => setCurrentWeekStart(prev => addDays(prev, -7)), []);
  const goToNextWeek = useCallback(() => setCurrentWeekStart(prev => addDays(prev, 7)), []);
  const goToToday = useCallback(() => setCurrentWeekStart(getWeekStart(new Date())), []);

  // Вычисляемые значения
  const weekDays = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart]);
  const weekLabel = useMemo(() => 
    `${formatDate(currentWeekStart, 'dd MMM')} — ${formatDate(addDays(currentWeekStart, 6), 'dd MMM yyyy')}`, 
    [currentWeekStart]
  );

  // Фильтрация и группировка задач
  const weekEnd = useMemo(() => addDays(currentWeekStart, 6), [currentWeekStart]);
  const weekTasks = useMemo(() => filterWeekTasks(tasks, currentWeekStart, weekEnd), [tasks, currentWeekStart, weekEnd]);
  const tasksByDay = useMemo(() => groupTasksByDay(weekTasks, weekDays), [weekTasks, weekDays]);

  // Видимые часы (вычисляется из диапазона)
  const visibleHours = dayEndHour - dayStartHour;

  // Модалка
  const openTaskModal = useCallback((task = null, defaultStart = null, defaultEnd = null) => {
    if (task) {
      setSelectedTask({ ...task });
    } else {
      const start = defaultStart || roundToNearestHour(new Date());
      const end = defaultEnd || addHours(start, 1);
      setSelectedTask({
        id: null, title: '',
        start_time: formatForInput(start),
        end_time: formatForInput(end),
        comment: '', owner: '', created_at: new Date().toISOString()
      });
    }
  }, []);

  const closeTaskModal = useCallback(() => setSelectedTask(null), []);

  // Хелпер для клика по пустому слоту
  const handleSlotClick = useCallback((e, day, dayStartHour, hourHeight) => {
    if (e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hour = dayStartHour + y / hourHeight;
    const date = new Date(day);
    date.setHours(Math.floor(hour), Math.round((hour % 1) * 60), 0, 0);
    openTaskModal(null, date, addHours(date, 1));
  }, [openTaskModal]);

  return {
    // State
    currentWeekStart, viewMode, selectedTask,
    dayStartHour, dayEndHour, visibleHours,
    // Computed
    weekDays, weekLabel, weekTasks, tasksByDay,
    // Actions
    goToPrevWeek, goToNextWeek, goToToday,
    setViewMode, openTaskModal, closeTaskModal, handleSlotClick,
    setDayStartHour, setDayEndHour,
    // Utils
    getTaskPosition: (task, hourHeight, dayStartHour, dayEndHour) => 
      getTaskPosition(task, hourHeight, dayStartHour, dayEndHour)
  };
}
