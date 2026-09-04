/** Shared models for the barber-schedule feature's sub-components. */

export interface ScheduleDay {
  weekday: number;
  label: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface BlockedPeriod {
  id: string;
  startsAt: string;
  endsAt: string;
  reason?: string;
}
