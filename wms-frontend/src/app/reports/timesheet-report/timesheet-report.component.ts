import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportService, TimesheetFilter, TimesheetRow } from '../services/report.service';
import { DepartmentService } from '../../services/department.service';
import { Department } from '../../models';

@Component({
  selector: 'app-timesheet-report',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div class="animate-fade-in">
      <div class="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-8 relative overflow-hidden shadow-xl mb-8">
        <div class="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4"></div>
        <div class="relative z-10">
          <span class="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            Reports
          </span>
          <h1 class="mt-4 text-3xl font-bold text-white">Employee Timesheet Report</h1>
          <p class="mt-3 max-w-2xl text-primary-100">
            View and export attendance timesheets with daily, weekly, or monthly periods.
          </p>
        </div>
      </div>

      <div class="card bg-white rounded-2xl border border-surface-200 p-6 mb-6">
        <div class="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Employee Name</label>
            <input type="text" [(ngModel)]="filter.employeeName" (input)="onFilterChange()"
                   class="input-field w-full border-surface-300 rounded-lg px-3 py-2 text-sm" placeholder="Search name...">
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Employee ID</label>
            <input type="number" [(ngModel)]="filter.employeeId" (input)="onFilterChange()"
                   class="input-field w-full border-surface-300 rounded-lg px-3 py-2 text-sm" placeholder="ID">
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Department</label>
            <select [(ngModel)]="filter.departmentId" (change)="onFilterChange()"
                    class="input-field w-full border-surface-300 rounded-lg px-3 py-2 text-sm">
              <option [ngValue]="undefined">All Departments</option>
              <option *ngFor="let d of departments" [ngValue]="d.departmentId">{{ d.departmentName }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">From</label>
            <input type="date" [(ngModel)]="filter.fromDate" (change)="onFilterChange()"
                   class="input-field w-full border-surface-300 rounded-lg px-3 py-2 text-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">To</label>
            <input type="date" [(ngModel)]="filter.toDate" (change)="onFilterChange()"
                   class="input-field w-full border-surface-300 rounded-lg px-3 py-2 text-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Period</label>
            <select [(ngModel)]="filter.period" (change)="onFilterChange()"
                    class="input-field w-full border-surface-300 rounded-lg px-3 py-2 text-sm">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
        <div class="flex gap-3 mt-4">
          <button (click)="exportPdf()" [disabled]="loading"
                  class="btn bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
              Export PDF
            </span>
          </button>
          <button (click)="exportExcel()" [disabled]="loading"
                  class="btn bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Export Excel
            </span>
          </button>
          <button (click)="loadReport()" [disabled]="loading"
                  class="btn bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ml-auto">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              Generate Report
            </span>
          </button>
        </div>
      </div>

      @if (loading) {
        <div class="flex justify-center py-16">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (records.length > 0) {
        <div class="card bg-white rounded-2xl border border-surface-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-surface-50 border-b border-surface-200">
                  <th class="text-left px-4 py-3 font-semibold text-surface-700">Employee Name</th>
                  <th class="text-left px-4 py-3 font-semibold text-surface-700">Employee ID</th>
                  <th class="text-left px-4 py-3 font-semibold text-surface-700">Date</th>
                  <th class="text-left px-4 py-3 font-semibold text-surface-700">Check In</th>
                  <th class="text-left px-4 py-3 font-semibold text-surface-700">Check Out</th>
                  <th class="text-right px-4 py-3 font-semibold text-surface-700">Hours</th>
                  <th class="text-left px-4 py-3 font-semibold text-surface-700">Work Mode</th>
                  <th class="text-left px-4 py-3 font-semibold text-surface-700">Period</th>
                </tr>
              </thead>
              <tbody>
                @for (row of records; track $index) {
                  <tr class="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                    <td class="px-4 py-3 font-medium text-surface-900">{{ row.employeeName }}</td>
                    <td class="px-4 py-3 text-surface-600">{{ row.employeeId }}</td>
                    <td class="px-4 py-3 text-surface-600">{{ row.attendanceDate | date:'mediumDate' }}</td>
                    <td class="px-4 py-3 text-surface-600">{{ row.checkInTime }}</td>
                    <td class="px-4 py-3 text-surface-600">{{ row.checkOutTime || '-' }}</td>
                    <td class="px-4 py-3 text-right font-mono text-surface-900">{{ row.workingHours.toFixed(2) }}</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                            [class.bg-blue-100]="row.workMode === 'WFO'"
                            [class.text-blue-800]="row.workMode === 'WFO'"
                            [class.bg-purple-100]="row.workMode === 'WFH'"
                            [class.text-purple-800]="row.workMode === 'WFH'"
                            [class.bg-amber-100]="row.workMode === 'Hybrid'"
                            [class.text-amber-800]="row.workMode === 'Hybrid'">
                        {{ row.workMode || '-' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-surface-500 text-xs">{{ row.period }}</td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr class="bg-surface-50 font-semibold">
                  <td colspan="5" class="px-4 py-3 text-right text-surface-700">Total Hours:</td>
                  <td class="px-4 py-3 text-right text-surface-900 font-mono">{{ totalHours.toFixed(2) }}</td>
                  <td colspan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      } @else if (!loading) {
        <div class="text-center py-16 text-surface-400">
          <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-6m4 6V7m4 10v-3m-12 3V5h16v14H5z"/>
          </svg>
          <p class="text-lg font-medium">No records found</p>
          <p class="text-sm mt-1">Apply filters and click "Generate Report" to view data.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class TimesheetReportComponent implements OnInit {
  private reportService = inject(ReportService);
  private departmentService = inject(DepartmentService);
  private snackBar = inject(MatSnackBar);

  departments: Department[] = [];
  records: TimesheetRow[] = [];
  loading = false;
  totalHours = 0;

  filter: TimesheetFilter = {
    employeeName: '',
    employeeId: undefined,
    departmentId: undefined,
    fromDate: this.toDateStr(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
    toDate: this.toDateStr(new Date()),
    period: 'daily',
  };

  ngOnInit(): void {
    this.departmentService.getAll().subscribe(d => this.departments = d);
  }

  onFilterChange(): void {
    if (this.filter.employeeName === '') this.filter.employeeName = undefined;
  }

  loadReport(): void {
    this.loading = true;
    this.reportService.getTimesheetReport(this.filter).subscribe({
      next: (data) => {
        this.records = data;
        this.totalHours = data.reduce((s, r) => s + r.workingHours, 0);
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load report', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  exportPdf(): void {
    this.reportService.exportPdf(this.filter);
  }

  exportExcel(): void {
    this.reportService.exportExcel(this.filter);
  }

  private toDateStr(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
