export interface Leave {
  leaveId: number;
  empId: number;
  firstName?: string;
  lastName?: string;
  employeeName?: string;
  leaveType: 'Sick' | 'Casual' | 'Earned';
  reason?: string;
  fromDate: string;
  toDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  appliedOn: string;
  approvedBy?: number;
  approvedOn?: string;
}

export type LeaveType = 'Sick' | 'Casual' | 'Earned';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export const LEAVE_TYPES: LeaveType[] = ['Sick', 'Casual', 'Earned'];
export const LEAVE_STATUSES: LeaveStatus[] = ['Pending', 'Approved', 'Rejected', 'Cancelled'];
