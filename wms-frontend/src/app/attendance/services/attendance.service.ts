import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Attendance } from '../models/attendance.model';
import { API_BASE_URL } from '../../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private http = inject(HttpClient);

  getAll(): Observable<Attendance[]> {
    return this.http.get<any[]>(`${API_BASE_URL}/api/attendance`).pipe(
      map(records => records.map(r => this.mapAttendance(r)))
    );
  }

  getByEmployee(empId: number): Observable<Attendance[]> {
    return this.http.get<any[]>(`${API_BASE_URL}/api/attendance/${empId}`).pipe(
      map(records => records.map(r => this.mapAttendance(r)))
    );
  }

  checkIn(employeeId: number, workMode: string): Observable<Attendance> {
    return this.http.post<any>(`${API_BASE_URL}/api/attendance/checkin`, {
      employeeId,
      workMode,
    }).pipe(map(r => this.mapAttendance(r)));
  }

  checkOut(employeeId: number): Observable<Attendance> {
    return this.http.post<any>(`${API_BASE_URL}/api/attendance/checkout`, {
      employeeId,
    }).pipe(map(r => this.mapAttendance(r)));
  }

  private mapAttendance(a: any): Attendance {
    const emp = a.employee || {};
    const firstName = emp.firstName || '';
    const lastName = emp.lastName || '';

    const checkIn = a.checkIn || a.checkInTime || '';
    const checkOut = a.checkOut || a.checkOutTime || null;

    let totalHours = a.totalHours ?? a.workingHours ?? null;
    if (totalHours != null) {
      totalHours = Math.round(totalHours * 100) / 100;
    } else if (checkIn && checkOut) {
      totalHours = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 3600000 * 100) / 100;
    }

    return {
      attendanceId: a.attendanceId,
      empId: a.employeeId,
      firstName,
      lastName,
      employeeName: (firstName + ' ' + lastName).trim() || a.employeeName || '',
      checkIn,
      checkOut,
      totalHours,
      workMode: a.workMode || 'WFO',
      attendanceDate: a.attendanceDate ? a.attendanceDate.split('T')[0] : '',
    };
  }
}
