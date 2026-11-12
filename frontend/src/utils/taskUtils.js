import { isSameDay } from './dateUtils';
import { parseFromBackend } from './dateUtils';

export function timeToPixels(timeStr, hourHeight) {
  if (!timeStr) return 0;
  const date = parseFromBackend(timeStr);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return (hours * 60 + minutes) * (hourHeight / 60);
}

export function getTaskPosition(task, hourHeight, dayStartHour = 6, dayEndHour = 22) {
  if (!task.start_time || !task.end_time) return { top: 0, height: 0 };
  
  const start = parseFromBackend(task.start_time);
  const end = parseFromBackend(task.end_time);
  
  const startMinutes = (start.getHours() - dayStartHour) * 60 + start.getMinutes();
  const endMinutes = (end.getHours() - dayStartHour) * 60 + end.getMinutes();
  const durationMinutes = endMinutes - startMinutes;
  
  const top = Math.max(0, startMinutes * (hourHeight / 60));
  const height = Math.max(hourHeight * 0.5, durationMinutes * (hourHeight / 60));
  
  return { top, height };
}

export function computeDayLayout(tasks, hourHeight, dayStartHour = 0, dayEndHour = 24) {
  if (!tasks || tasks.length === 0) return [];

  // 1. Преобразуем задачи в интервалы (минуты от начала дня)
  const intervals = tasks.map((task, index) => {
    const start = parseFromBackend(task.start_time);
    const end = parseFromBackend(task.end_time);
    const startMinutes = (start.getHours() - dayStartHour) * 60 + start.getMinutes();
    const endMinutes = (end.getHours() - dayStartHour) * 60 + end.getMinutes();
    return {
      task,
      index,
      startMinutes: Math.max(0, startMinutes),
      endMinutes: Math.min((dayEndHour - dayStartHour) * 60, endMinutes),
      durationMinutes: endMinutes - startMinutes
    };
  });

  // 2. Сортируем по времени начала
  intervals.sort((a, b) => a.startMinutes - b.startMinutes);

  // 3. Определяем максимальную конкурентность (maxConcurrency) за весь день
  //    через sweep line: события начала (+1) и конца (-1)
  const events = [];
  for (const interval of intervals) {
    events.push({ time: interval.startMinutes, delta: +1 });
    events.push({ time: interval.endMinutes, delta: -1 });
  }
  events.sort((a, b) => a.time - b.time || a.delta - b.delta); // концы раньше начал при равном времени

  let current = 0;
  let maxConcurrency = 0;
  for (const e of events) {
    current += e.delta;
    if (current > maxConcurrency) maxConcurrency = current;
  }
  const laneCount = Math.max(1, maxConcurrency); // минимум 1 полоса

  // 4. Распределяем задачи по полосам (lanes) жадным алгоритмом
  const lanes = []; // lanes[i] = endMinutes последней задачи в полосе i
  const layoutMap = new Map(); // task.index -> { lane, maxLanes }

  for (const interval of intervals) {
    let assignedLane = -1;
    for (let i = 0; i < lanes.length; i++) {
      if (interval.startMinutes >= lanes[i]) {
        assignedLane = i;
        lanes[i] = interval.endMinutes;
        break;
      }
    }
    if (assignedLane === -1) {
      assignedLane = lanes.length;
      lanes.push(interval.endMinutes);
    }
    layoutMap.set(interval.index, { lane: assignedLane, maxLanes: laneCount });
  }

  // 5. Формируем итоговый layout
  return intervals.map(interval => {
    const { lane, maxLanes } = layoutMap.get(interval.index);
    const top = Math.max(0, interval.startMinutes * (hourHeight / 60));
    const height = Math.max(hourHeight * 0.5, interval.durationMinutes * (hourHeight / 60));
    
    // Все задачи имеют одинаковую ширину: 100% / maxLanes
    const width = 100 / maxLanes;
    const left = lane * width;
    
    // zIndex: левее полосы (меньше lane) — выше, чтобы при микро-наложениях границ левее задачи были поверх
    const zIndex = (maxLanes - lane) * 100 + interval.index;

    return {
      task: interval.task,
      top,
      height,
      left,
      width,
      zIndex,
      lane,
      maxLanes
    };
  });
}

export function filterWeekTasks(tasks, weekStart, weekEnd) {
  return tasks.filter(task => {
    if (!task.start_time) return false;
    const taskDate = parseFromBackend(task.start_time);
    return taskDate >= weekStart && taskDate <= weekEnd;
  });
}

export function groupTasksByDay(tasks, weekDays) {
  return weekDays.map(day => {
    const dayTasks = tasks.filter(task => {
      if (!task.start_time) return false;
      const taskDate = parseFromBackend(task.start_time);
      return isSameDay(taskDate, day);
    });
    return dayTasks.sort((a, b) => {
      const dateA = parseFromBackend(a.start_time);
      const dateB = parseFromBackend(b.start_time);
      return dateA - dateB;
    });
  });
}
