import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../config/api.config';

export interface TimesheetRow {
  employeeName: string;
  employeeId: number;
  attendanceDate: string;
  checkInTime: string;
  checkOutTime: string;
  workingHours: number;
  workMode: string;
  period: string;
}

export interface TimesheetFilter {
  employeeId?: number;
  employeeName?: string;
  departmentId?: number;
  fromDate?: string;
  toDate?: string;
  period?: string;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);

  exportToCsv(filename: string, headers: string[], rows: any[][]): void {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => this.escapeCsv(cell)).join(',')),
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  printReport(reportTitle: string): void {
    window.print();
  }

  private escapeCsv(value: unknown): string {
    const str = value == null ? '' : String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  getTimesheetReport(filter: TimesheetFilter): Observable<TimesheetRow[]> {
    let params = new HttpParams();
    if (filter.employeeId) params = params.set('employeeId', filter.employeeId);
    if (filter.employeeName) params = params.set('employeeName', filter.employeeName);
    if (filter.departmentId) params = params.set('departmentId', filter.departmentId);
    if (filter.fromDate) params = params.set('fromDate', filter.fromDate);
    if (filter.toDate) params = params.set('toDate', filter.toDate);
    if (filter.period) params = params.set('period', filter.period);
    return this.http.get<TimesheetRow[]>(`${API_BASE_URL}/api/report/timesheet`, { params });
  }

  exportPdf(filter: TimesheetFilter): void {
    let params = this.buildParams(filter);
    const url = `${API_BASE_URL}/api/report/timesheet/export/pdf?${params.toString()}`;
    window.open(url, '_blank');
  }

  exportExcel(filter: TimesheetFilter): void {
    let params = this.buildParams(filter);
    const url = `${API_BASE_URL}/api/report/timesheet/export/excel?${params.toString()}`;
    window.open(url, '_blank');
  }

  private buildParams(filter: TimesheetFilter): HttpParams {
    let params = new HttpParams();
    if (filter.employeeId) params = params.set('employeeId', filter.employeeId);
    if (filter.employeeName) params = params.set('employeeName', filter.employeeName);
    if (filter.departmentId) params = params.set('departmentId', filter.departmentId);
    if (filter.fromDate) params = params.set('fromDate', filter.fromDate);
    if (filter.toDate) params = params.set('toDate', filter.toDate);
    if (filter.period) params = params.set('period', filter.period);
    return params;
  }
}
