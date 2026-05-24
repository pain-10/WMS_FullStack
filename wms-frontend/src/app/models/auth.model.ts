export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: 'M' | 'F' | 'O' | string;
  dob: string;
  doj: string;
  username: string;
  password: string;
  departmentId: number;
  roleId?: number; // optional on client; will default to Employee (3)
}

export interface AuthResponse {
  employeeId: number;
  username: string;
  role: string;
  token: string;
  expiresAt: string;
}
