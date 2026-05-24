export interface Employee {
  employeeId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: 'M' | 'F' | 'O';
  dob: string;
  doj: string;
  departmentId: number;
  roleId: number;
  status: 'Active' | 'Inactive';
  createdOn: string;
  updatedOn?: string;
  departmentName?: string;
  roleName?: string;
}

export interface Department {
  departmentId: number;
  departmentName: string;
  description?: string;
  createdOn: string;
}

export interface Role {
  roleId: number;
  roleName: string;
  description?: string;
}

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
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: string;
  approvedBy?: number;
  approvedOn?: string;
}

export interface Project {
  projectId: number;
  projectName: string;
  description?: string;
  clientId?: number;
  startDate?: string;
  endDate?: string;
  status: 'Active' | 'Completed';
  clientName?: string;
}

export interface Client {
  clientId: number;
  clientName: string;
  clientAddress?: string;
  clientPhoneNumber?: string;
  clientLocation?: string;
  status: boolean;
}

export interface Announcement {
  announcementId: number;
  title: string;
  message: string;
  createdBy: number;
  createdByName?: string;
  createdOn: string;
  updatedOn?: string;
  isActive: boolean;
}

export interface ProjectAllocation {
  allocationId: number;
  empId: number;
  projectId: number;
  assignedOn: string;
  createDate: string;
  createdBy: string;
  status: boolean;
  updatedBy?: string;
  updatedDate?: string;
  employeeName?: string;
  projectName?: string;
}

export interface UserLogin {
  userId: number;
  username: string;
  roleId: number;
  roleName?: string;
  token?: string;
  lastLogin?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalDepartments: number;
  totalProjects: number;
  activeProjects: number;
  pendingLeaves: number;
  todayAttendance: number;
  attendancePercentage: number;
}
