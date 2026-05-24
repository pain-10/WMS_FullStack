export type NotificationType =
  | 'LeaveApproved'
  | 'LeaveRejected'
  | 'ProjectAssigned'
  | 'NewAnnouncement'
  | 'AttendanceReminder'
  | 'EmployeeAdded'
  | 'ProjectUpdated';

export interface AppNotification {
  notificationId: number;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  employeeId?: number;
  relatedId?: number;
}

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  LeaveApproved: 'check_circle',
  LeaveRejected: 'cancel',
  ProjectAssigned: 'assignment_ind',
  NewAnnouncement: 'campaign',
  AttendanceReminder: 'alarm',
  EmployeeAdded: 'person_add',
  ProjectUpdated: 'update',
};

export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  LeaveApproved: 'text-emerald-600 bg-emerald-100',
  LeaveRejected: 'text-red-600 bg-red-100',
  ProjectAssigned: 'text-violet-600 bg-violet-100',
  NewAnnouncement: 'text-blue-600 bg-blue-100',
  AttendanceReminder: 'text-amber-600 bg-amber-100',
  EmployeeAdded: 'text-primary-600 bg-primary-100',
  ProjectUpdated: 'text-cyan-600 bg-cyan-100',
};
