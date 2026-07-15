export interface ShiftReadModel {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  startTime: string; // "HH:mm" e.g., "08:00"
  endTime: string; // "HH:mm" e.g., "17:00"
  breakMinutes: number;
  isFlexible: boolean;
  createdAt: Date;
  updatedAt: Date;
}
