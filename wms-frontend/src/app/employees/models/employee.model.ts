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
}

export const GENDERS = ['M', 'F', 'O'] as const;

export const STATUS_OPTIONS = ['Active', 'Inactive'] as const;
