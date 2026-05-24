import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Leave } from '../models/leave.model';

export interface LeaveDetailsData {
  leave: Leave;
}

@Component({
  selector: 'app-leave-details',
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
        <div>
          <h2>Leave Details</h2>
          <span class="text-muted">Leave ID: {{ leave.leaveId }}</span>
        </div>
        <button mat-icon-button (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="details-body">
        <div class="section">
          <h3>Employee Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Name</span>
              <span class="info-value">{{ leave.employeeName || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Employee ID</span>
              <span class="info-value">{{ leave.empId }}</span>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="section">
          <h3>Leave Details</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Leave Type</span>
              <span class="info-value">
                <mat-chip [class.sick]="leave.leaveType === 'Sick'" [class.casual]="leave.leaveType === 'Casual'" [class.earned]="leave.leaveType === 'Earned'">
                  {{ leave.leaveType }}
                </mat-chip>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Status</span>
              <span class="info-value">
                <mat-chip [class.approved]="leave.status === 'Approved'" [class.pending]="leave.status === 'Pending'" [class.rejected]="leave.status === 'Rejected'" [class.cancelled]="leave.status === 'Cancelled'">
                  {{ leave.status }}
                </mat-chip>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">From Date</span>
              <span class="info-value">{{ leave.fromDate | date:'mediumDate' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">To Date</span>
              <span class="info-value">{{ leave.toDate | date:'mediumDate' }}</span>
            </div>
            <div class="info-item full-width">
              <span class="info-label">Reason</span>
              <span class="info-value">{{ leave.reason || 'No reason provided' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Applied On</span>
              <span class="info-value">{{ leave.appliedOn | date:'mediumDate' }}</span>
            </div>
            @if (leave.approvedOn) {
              <div class="info-item">
                <span class="info-label">{{ leave.status === 'Approved' ? 'Approved' : 'Rejected' }} On</span>
                <span class="info-value">{{ leave.approvedOn | date:'mediumDate' }}</span>
              </div>
            }
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
      padding: 20px 24px; border-bottom: 1px solid #e2e8f0;
    }
    .details-header h2 { margin: 0; font-size: 20px; font-weight: 600; color: #0f172a; }
    .text-muted { color: #94a3b8; font-size: 14px; }
    .details-body { padding: 24px; max-height: 60vh; overflow-y: auto; }
    .section { margin-bottom: 16px; }
    .section h3 { margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #334155; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .info-item { display: flex; flex-direction: column; gap: 4px; }
    .info-item.full-width { grid-column: 1 / -1; }
    .info-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
    .info-value { font-size: 14px; color: #1e293b; font-weight: 500; }
    .divider { height: 1px; background: #e2e8f0; margin: 16px 0; }
    .details-footer {
      display: flex; align-items: center; justify-content: flex-end;
      padding: 16px 24px; border-top: 1px solid #e2e8f0;
    }
    .sick { --mat-chip-selected-row-color: #fef2f2 !important; color: #991b1b !important; }
    .casual { --mat-chip-selected-row-color: #dbeafe !important; color: #1e40af !important; }
    .earned { --mat-chip-selected-row-color: #dcfce7 !important; color: #166534 !important; }
    .approved { --mat-chip-selected-row-color: #dcfce7 !important; color: #166534 !important; }
    .pending { --mat-chip-selected-row-color: #fef3c7 !important; color: #92400e !important; }
    .rejected { --mat-chip-selected-row-color: #fef2f2 !important; color: #991b1b !important; }
    .cancelled { --mat-chip-selected-row-color: #f1f5f9 !important; color: #64748b !important; }
  `]
})
export class LeaveDetailsComponent {
  leave: Leave = inject(MAT_DIALOG_DATA).leave;
  private dialogRef = inject(MatDialogRef<LeaveDetailsComponent>);

  onClose(): void {
    this.dialogRef.close();
  }
}
