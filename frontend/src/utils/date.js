export const DAY_MS = 24 * 60 * 60 * 1000;

const normalizeDate = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const toDateInputValue = (date) => {
  const normalized = normalizeDate(date);
  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, '0');
  const day = String(normalized.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDate = (value) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);

export const formatNumber = (value) =>
  new Intl.NumberFormat('ru-RU').format(value);

export const isWithinNextDays = (dateValue, days, baseDate = new Date()) => {
  const target = normalizeDate(dateValue);
  const base = normalizeDate(baseDate);
  const diffDays = Math.round((target - base) / DAY_MS);
  return diffDays >= 0 && diffDays <= days;
};

export const sameDate = (left, right) =>
  normalizeDate(left).getTime() === normalizeDate(right).getTime();

export const createRelativeDate = (offsetDays = 0, baseDate = new Date()) =>
  toDateInputValue(addDays(baseDate, offsetDays));

