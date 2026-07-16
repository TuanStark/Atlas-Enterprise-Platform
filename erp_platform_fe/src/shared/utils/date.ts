import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';

// Configure dayjs for Vietnamese locale
dayjs.locale('vi');
dayjs.extend(relativeTime);

/**
 * Date formatting utilities — Vietnamese locale support
 */

/** Format date to DD/MM/YYYY */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  return dayjs(date).format('DD/MM/YYYY');
}

/** Format date to DD/MM/YYYY HH:mm */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  return dayjs(date).format('DD/MM/YYYY HH:mm');
}

/** Format date to HH:mm */
export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  return dayjs(date).format('HH:mm');
}

/** Get relative time (e.g., "3 phút trước", "2 ngày trước") */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  return dayjs(date).fromNow();
}

/** Format month-year (e.g., "Tháng 7, 2024") */
export function formatMonthYear(date: string | Date | null | undefined): string {
  if (!date) return '-';
  return dayjs(date).format('MMMM, YYYY');
}

/** Check if date is today */
export function isToday(date: string | Date): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

/** Get start of month */
export function startOfMonth(date?: string | Date): Date {
  return dayjs(date).startOf('month').toDate();
}

/** Get end of month */
export function endOfMonth(date?: string | Date): Date {
  return dayjs(date).endOf('month').toDate();
}

export { dayjs };
