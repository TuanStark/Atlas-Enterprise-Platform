export function parseTimeToDate(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(1970, 0, 1, hours, minutes, 0, 0);
  return date;
}

export function formatDateToTimeStr(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function calculateMinutesDifference(start: Date, end: Date): number {
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  return endMinutes - startMinutes;
}
