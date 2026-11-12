export function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Понедельник = 1
  return new Date(d.setDate(diff));
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addHours(date, hours) {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
}

export function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function formatDate(date, format) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  const monthNames = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const monthShort = monthNames[d.getMonth()];
  const dayShort = dayNames[d.getDay()];
  
  return format
    .replace('dd', day)
    .replace('MMM', monthShort)
    .replace('MM', month)
    .replace('yyyy', year)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('EEE', dayShort);
}

/**
 * Форматирует дату для datetime-local input (локальное время без таймзоны)
 * Ожидает Date объект в локальном времени
 */
export function formatForInput(date) {
  const d = new Date(date);
  // Возвращаем локальное время в формате YYYY-MM-DDTHH:MM
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Конвертирует локальную дату в UTC ISO строку для отправки на бэкенд
 * Ожидает Date объект в локальном времени
 */
export function formatForBackend(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString(); // Конвертирует в UTC с суффиксом Z
}

/**
 * Парсит UTC ISO строку с бэкенда в локальную дату для отображения
 */
export function parseFromBackend(isoString) {
  if (!isoString) return null;
  // new Date() автоматически парсит UTC и конвертирует в локальное время
  return new Date(isoString);
}

export function roundToNearestHour(date) {
  const d = new Date(date);
  d.setMinutes(0, 0, 0);
  if (d < new Date()) d.setHours(d.getHours() + 1);
  return d;
}

export function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}
