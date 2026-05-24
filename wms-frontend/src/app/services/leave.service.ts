import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Leave } from '../models';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private http = inject(HttpClient);

  getAll(): Observable<Leave[]> {
    return this.http.get<any[]>(`${API_BASE_URL}/api/leave`).pipe(
      map(leaves => leaves.map(l => this.mapLeave(l)))
    );
  }

  getByEmployee(empId: number): Observable<Leave[]> {
    return this.http.get<any[]>(`${API_BASE_URL}/api/leave/${empId}`).pipe(
      map(leaves => leaves.map(l => this.mapLeave(l)))
    );
  }

  getPending(): Observable<Leave[]> {
    return this.getAll().pipe(map(leaves => leaves.filter(leave => leave.status === 'Pending')));
  }

  apply(leave: Partial<Leave>): Observable<Leave> {
    return this.http.post<any>(`${API_BASE_URL}/api/leave`, {
      employeeId: leave.empId,
      leaveType: leave.leaveType,
      startDate: leave.fromDate,
      endDate: leave.toDate,
      reason: leave.reason,
    }).pipe(map(l => this.mapLeave(l)));
  }

  approve(leaveId: number, approvedBy: number): Observable<Leave> {
    return this.http.put<any>(`${API_BASE_URL}/api/leave/status/${leaveId}`, { status: 'Approved', approvedBy }).pipe(map(l => this.mapLeave(l)));
  }

  reject(leaveId: number, approvedBy: number): Observable<Leave> {
    return this.http.put<any>(`${API_BASE_URL}/api/leave/status/${leaveId}`, { status: 'Rejected', approvedBy }).pipe(map(l => this.mapLeave(l)));
  }

  cancel(leaveId: number): Observable<boolean> {
    return this.http.put(`${API_BASE_URL}/api/leave/cancel/${leaveId}`, null, { responseType: 'text' }).pipe(
      map(() => true)
    );
  }

  private mapLeave(l: any): Leave {
    const name = l.employeeName || '';
    const parts = name.split(' ');
    return {
      leaveId: l.leaveId,
      empId: l.employeeId,
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
      employeeName: name,
      leaveType: l.leaveType,
      reason: l.reason || '',
      fromDate: l.startDate ? l.startDate.split('T')[0] : '',
      toDate: l.endDate ? l.endDate.split('T')[0] : '',
      status: l.status,
      appliedOn: l.appliedOn,
      approvedBy: l.approvedBy,
      approvedOn: l.approvedOn,
    };
  }
}
