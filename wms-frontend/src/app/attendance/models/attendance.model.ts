export interface Attendance {
  attendanceId: number;
  empId: number;
  firstName: string;
  lastName: string;
  employeeName: string;
  checkIn: string;
  checkOut?: string;
  totalHours?: number;
  workMode: 'WFO' | 'WFH' | 'Hybrid';
  attendanceDate: string;
}

export type WorkMode = 'WFO' | 'WFH' | 'Hybrid';

export const WORK_MODES: WorkMode[] = ['WFO', 'WFH', 'Hybrid'];
