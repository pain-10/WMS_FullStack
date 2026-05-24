import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Project, ProjectAllocation } from '../../models';

export interface ProjectDetailsData {
  project: Project;
  allocations: ProjectAllocation[];
}

@Component({
  selector: 'app-project-details',
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
          <div class="project-icon">{{ project.projectName[0] }}</div>
          <div>
            <h2>{{ project.projectName }}</h2>
            <span class="text-muted">Project ID: {{ project.projectId }}</span>
          </div>
        </div>
        <button mat-icon-button (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="details-body">
        <div class="section">
          <h3>Project Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Client</span>
              <span class="info-value">{{ project.clientName || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status</span>
              <span class="info-value">
                <mat-chip [class.active-chip]="project.status === 'Active'" [class.completed-chip]="project.status === 'Completed'">
                  {{ project.status }}
                </mat-chip>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Start Date</span>
              <span class="info-value">{{ project.startDate | date:'mediumDate' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">End Date</span>
              <span class="info-value">{{ project.endDate ? (project.endDate | date:'mediumDate') : 'Ongoing' }}</span>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="section">
          <h3>Assigned Employees ({{ data.allocations.length }})</h3>
          @if (data.allocations.length === 0) {
            <div class="empty-state">
              <mat-icon>people_outline</mat-icon>
              <p>No employees assigned to this project</p>
            </div>
          } @else {
            <div class="employee-list">
              @for (alloc of data.allocations; track alloc.allocationId) {
                <div class="employee-row">
                  <div class="emp-avatar">{{ alloc.employeeName ? (alloc.employeeName[0]) : '?' }}</div>
                  <div class="emp-info">
                    <span class="emp-name">{{ alloc.employeeName || 'Employee #' + alloc.empId }}</span>
                    <span class="emp-date">Assigned: {{ alloc.assignedOn | date:'mediumDate' }}</span>
                  </div>
                  <mat-chip [class.active-chip]="alloc.status" [class.inactive-chip]="!alloc.status">
                    {{ alloc.status ? 'Active' : 'Inactive' }}
                  </mat-chip>
                </div>
              }
            </div>
          }
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
    .project-icon {
      width: 56px; height: 56px; border-radius: 12px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 24px; font-weight: 700;
    }
    .text-muted { color: #94a3b8; font-size: 14px; }
    .details-body { padding: 24px; max-height: 50vh; overflow-y: auto; }
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
    .completed-chip { --mat-chip-selected-row-color: #f0f9ff !important; color: #075985 !important; }
    .inactive-chip { --mat-chip-selected-row-color: #fef2f2 !important; color: #991b1b !important; }
    .empty-state {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 32px; color: #94a3b8;
    }
    .empty-state mat-icon { font-size: 40px; width: 40px; height: 40px; }
    .empty-state p { margin: 0; font-size: 14px; }
    .employee-list { display: flex; flex-direction: column; gap: 8px; }
    .employee-row {
      display: flex; align-items: center; gap: 12px;
      padding: 12px; border-radius: 8px; background: #f8fafc;
    }
    .emp-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 14px; font-weight: 600; flex-shrink: 0;
    }
    .emp-info { flex: 1; display: flex; flex-direction: column; }
    .emp-name { font-weight: 500; color: #1e293b; font-size: 14px; }
    .emp-date { font-size: 12px; color: #94a3b8; }
  `]
})
export class ProjectDetailsComponent {
  data: ProjectDetailsData = inject(MAT_DIALOG_DATA);
  project: Project = this.data.project;
  private dialogRef = inject(MatDialogRef<ProjectDetailsComponent>);

  onClose(): void {
    this.dialogRef.close();
  }
}
