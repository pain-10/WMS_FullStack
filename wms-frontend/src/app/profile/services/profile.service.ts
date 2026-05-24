import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Profile, PasswordChangeRequest } from '../models/profile.model';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { API_BASE_URL } from '../../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);

  getProfile(employeeId?: number): Observable<Profile> {
    const id = employeeId ?? this.authService.currentUserValue?.userId ?? 0;
    return this.employeeService.getById(id).pipe(
      map(emp => ({
        employeeId: emp.employeeId,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        phoneNumber: emp.phoneNumber,
        gender: emp.gender,
        dob: emp.dob,
        doj: emp.doj,
        departmentId: emp.departmentId,
        roleId: emp.roleId,
        status: emp.status,
        departmentName: emp.departmentName,
        roleName: emp.roleName,
      }))
    );
  }

  updateProfile(profile: Partial<Profile>): Observable<Profile> {
    return this.http.put<Profile>(`${API_BASE_URL}/api/employee/${profile.employeeId}`, profile);
  }

  changePassword(request: PasswordChangeRequest): Observable<any> {
    const userId = this.authService.currentUserValue?.userId;
    return this.http.put(`${API_BASE_URL}/api/auth/change-password`, {
      employeeId: userId,
      currentPassword: request.currentPassword,
      newPassword: request.newPassword,
    });
  }

  isAdmin(): boolean {
    return this.authService.currentUserValue?.roleName === 'Admin';
  }
}
