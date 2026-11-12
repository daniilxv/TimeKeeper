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

  // 1. Преобразуем задачи в интервалы
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

  // 2. Сортируем по времени начала (а при равном начале — по длительности/концу)
  intervals.sort((a, b) => a.startMinutes - b.startMinutes || b.endMinutes - a.endMinutes);

  // 3. Группируем в кластеры перекрытий
  const clusters = [];
  let currentCluster = [];
  let clusterMaxEnd = -Infinity;

  for (const interval of intervals) {
    if (currentCluster.length === 0) {
      currentCluster.push(interval);
      clusterMaxEnd = interval.endMinutes;
    } else if (interval.startMinutes < clusterMaxEnd) {
      currentCluster.push(interval);
      clusterMaxEnd = Math.max(clusterMaxEnd, interval.endMinutes);
    } else {
      clusters.push(currentCluster);
      currentCluster = [interval];
      clusterMaxEnd = interval.endMinutes;
    }
  }
  if (currentCluster.length > 0) clusters.push(currentCluster);

  // 4. Распределяем по полосам (lanes) и вычисляем реальное число активных колонок
  const layoutMap = new Map(); // task.index -> { lane, colSpan, maxLanes }

  for (const cluster of clusters) {
    const lanes = []; // Хранит время окончания последней задачи в полосе i
    const clusterItems = [];

    // Сначала раскидываем все задачи кластера по базовым lane
    for (const interval of cluster) {
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
      clusterItems.push({ interval, lane: assignedLane });
    }

    const totalLanes = lanes.length;

    // Шаг интеллектуального расширения (Compaction / Span Expansion):
    // Проверяем, может ли задача занять больше колонок вправо, если там пусто
    for (const item of clusterItems) {
      let span = 1;
      // Пробуем расширяться вправо на каждую следующую колонку
      for (let nextLane = item.lane + 1; nextLane < totalLanes; nextLane++) {
        // Проверяем, есть ли в колонке `nextLane` хоть одна задача, пересекающаяся по времени с текущей
        const hasConflict = clusterItems.some(other => {
          if (other.lane !== nextLane) return false;
          // Условие пересечения интервалов
          return (
            other.interval.startMinutes < item.interval.endMinutes &&
            other.interval.endMinutes > item.interval.startMinutes
          );
        });

        if (hasConflict) {
           break; // Наткнулись на занятое пространство, дальше расширяться нельзя
        } else {
           span++; // Колонка свободна в этот промежуток, забираем её себе!
        }
      }

      layoutMap.set(item.interval.index, {
        lane: item.lane,
        colSpan: span,
        maxLanes: totalLanes
      });
    }
  }

  // 5. Формируем итоговый layout
  return intervals.map(interval => {
    const { lane, colSpan, maxLanes } = layoutMap.get(interval.index);

    // Базовая ширина одной колонки в процентах
    const columnWidth = 100 / maxLanes;

    const width = columnWidth * colSpan;
    const left = columnWidth * lane;

    const top = Math.max(0, interval.startMinutes * (hourHeight / 60));
    const height = Math.max(hourHeight * 0.5, interval.durationMinutes * (hourHeight / 60));

    // zIndex: чем левее и шире элемент, тем ниже он должен быть (или наоборот, по вкусу)
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
