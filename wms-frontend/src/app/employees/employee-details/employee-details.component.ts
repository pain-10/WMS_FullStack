import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Employee } from '../models/employee.model';

export interface EmployeeDetailsData {
  employee: Employee;
}

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
  ],
  template: `
    <div class="details-dialog">
      <div class="details-header">
        <div class="header-left">
          <div class="avatar-large">{{ employee.firstName[0] }}{{ employee.lastName[0] }}</div>
          <div>
            <h2>{{ employee.firstName }} {{ employee.lastName }}</h2>
            <span class="text-muted">Employee ID: {{ employee.employeeId }}</span>
          </div>
        </div>
        <button mat-icon-button (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="details-body">
        <div class="section">
          <h3>Personal Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Email</span>
              <span class="info-value">{{ employee.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Phone</span>
              <span class="info-value">{{ employee.phoneNumber || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Gender</span>
              <span class="info-value">{{ employee.gender === 'M' ? 'Male' : employee.gender === 'F' ? 'Female' : 'Other' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Date of Birth</span>
              <span class="info-value">{{ employee.dob | date:'mediumDate' }}</span>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="section">
          <h3>Employment Details</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Department</span>
              <span class="info-value">{{ employee.departmentName || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Role</span>
              <span class="info-value">{{ employee.roleName || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status</span>
              <span class="info-value">
                <mat-chip [class.active-chip]="employee.status === 'Active'" [class.inactive-chip]="employee.status !== 'Active'">
                  {{ employee.status }}
                </mat-chip>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Date of Joining</span>
              <span class="info-value">{{ employee.doj | date:'mediumDate' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="details-footer">
        <button mat-raised-button color="primary" (click)="onClose()">Close</button>
      </div>
    </div>
  `,
  styles: [`
    .details-dialog { overflow: hidden; }
    .details-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 24px; border-bottom: 1px solid #e2e8f0;
    }
    .header-left { display: flex; align-items: center; gap: 16px; }
    .header-left h2 { margin: 0; font-size: 20px; font-weight: 600; color: #0f172a; }
    .avatar-large {
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 20px; font-weight: 700;
    }
    .text-muted { color: #94a3b8; font-size: 14px; }
    .details-body { padding: 24px; }
    .section { margin-bottom: 16px; }
    .section h3 {
      margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #334155;
    }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .info-item { display: flex; flex-direction: column; gap: 4px; }
    .info-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
    .info-value { font-size: 14px; color: #1e293b; font-weight: 500; }
    .divider { height: 1px; background: #e2e8f0; margin: 16px 0; }
    .details-footer {
      display: flex; align-items: center; justify-content: flex-end;
      padding: 16px 24px; border-top: 1px solid #e2e8f0;
    }
    .active-chip { --mat-chip-selected-row-color: #dcfce7 !important; color: #166534 !important; }
    .inactive-chip { --mat-chip-selected-row-color: #fef2f2 !important; color: #991b1b !important; }
  `]
})
export class EmployeeDetailsComponent {
  employee: Employee = inject(MAT_DIALOG_DATA).employee;
  private dialogRef = inject(MatDialogRef<EmployeeDetailsComponent>);

  onClose(): void {
    this.dialogRef.close();
  }
}
