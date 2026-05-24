import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from '../../services/project.service';
import { EmployeeService } from '../../services/employee.service';
import { Project, ProjectAllocation, Employee } from '../../models';

@Component({
  selector: 'app-project-allocation',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="animate-fade-in">
      <div class="page-header">
        <button (click)="goBack()" class="btn-icon mb-2">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1 class="page-title">Project Allocation</h1>
        <p class="page-subtitle">Assign and manage employee allocations across projects</p>
      </div>

      <div class="card p-6 mb-6">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Select Project</mat-label>
          <mat-select [formControl]="projectControl" (selectionChange)="onProjectChange($event.value)">
            <mat-option [value]="null">Choose a project</mat-option>
            @for (project of projects; track project.projectId) {
              <mat-option [value]="project">
                {{ project.projectName }} <span style="color: #94a3b8;">- {{ project.clientName || 'No client' }}</span>
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      @if (!selectedProject) {
        <div class="card p-12 text-center" style="color: #94a3b8;">
          <mat-icon style="font-size: 56px; width: 56px; height: 56px; margin-bottom: 12px;">group_add</mat-icon>
          <p style="font-size: 16px; font-weight: 500; color: #64748b;">Select a project to manage allocations</p>
          <p style="font-size: 14px; margin-top: 4px;">Assign employees or remove existing allocations</p>
        </div>
      } @else {
        <div class="grid gap-6 lg:grid-cols-2">
          <div class="card p-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-lg font-semibold text-surface-900">Assigned Employees</h2>
                <p class="text-sm text-surface-500">{{ assignedEmployees.length }} currently assigned</p>
              </div>
            </div>

            @if (loadingAllocations) {
              <div class="flex justify-center p-8">
                <mat-spinner diameter="32"></mat-spinner>
              </div>
            } @else if (assignedEmployees.length === 0) {
              <div class="text-center p-8 text-surface-400">
                <mat-icon style="font-size: 40px; width: 40px; height: 40px;">person_off</mat-icon>
                <p class="mt-2">No employees assigned</p>
              </div>
            } @else {
              <div class="space-y-2 max-h-96 overflow-y-auto">
                @for (emp of assignedEmployees; track emp.employeeId) {
                  <div class="allocation-row">
                    <div class="emp-avatar">{{ emp.firstName[0] }}{{ emp.lastName[0] }}</div>
                    <div class="emp-info">
                      <span class="emp-name">{{ emp.firstName }} {{ emp.lastName }}</span>
                      <span class="emp-dept">{{ emp.departmentName }}</span>
                    </div>
                    <button mat-icon-button color="warn" (click)="removeAllocation(emp)" matTooltip="Remove from project">
                      <mat-icon>remove_circle</mat-icon>
                    </button>
                  </div>
                }
              </div>
            }
          </div>

          <div class="card p-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-lg font-semibold text-surface-900">Available Employees</h2>
                <p class="text-sm text-surface-500">{{ availableEmployees.length }} unassigned</p>
              </div>
            </div>

            @if (loadingEmployees) {
              <div class="flex justify-center p-8">
                <mat-spinner diameter="32"></mat-spinner>
              </div>
            } @else if (availableEmployees.length === 0) {
              <div class="text-center p-8 text-surface-400">
                <mat-icon style="font-size: 40px; width: 40px; height: 40px;">group</mat-icon>
                <p class="mt-2">All employees are assigned to this project</p>
              </div>
            } @else {
              <div style="margin-bottom: 12px;">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Search employees</mat-label>
                  <input matInput [formControl]="searchControl" placeholder="Type to filter...">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
              </div>

              <div class="space-y-2 max-h-72 overflow-y-auto">
                @for (emp of filteredAvailableEmployees; track emp.employeeId) {
                  <div class="allocation-row" [class.selected]="isSelected(emp)" (click)="toggleSelect(emp)">
                    <div class="emp-avatar">{{ emp.firstName[0] }}{{ emp.lastName[0] }}</div>
                    <div class="emp-info">
                      <span class="emp-name">{{ emp.firstName }} {{ emp.lastName }}</span>
                      <span class="emp-dept">{{ emp.departmentName }}</span>
                    </div>
                    <mat-checkbox [checked]="isSelected(emp)" (click)="$event.stopPropagation()" (change)="toggleSelect(emp)"></mat-checkbox>
                  </div>
                }
              </div>

              @if (selectedEmployees.length > 0) {
                <div class="mt-4 pt-4 border-t border-surface-200">
                  <button mat-raised-button color="primary" (click)="assignSelected()" [disabled]="assigning">
                    @if (assigning) {
                      <mat-spinner diameter="20" style="display: inline-block; margin-right: 8px;"></mat-spinner>
                    }
                    Assign Selected ({{ selectedEmployees.length }})
                  </button>
                </div>
              }
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .card { background: white; border-radius: 12px; }
    .allocation-row {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px; border-radius: 8px;
      background: #f8fafc; cursor: pointer;
      transition: background 0.15s;
    }
    .allocation-row:hover { background: #f1f5f9; }
    .allocation-row.selected { background: #eef2ff; outline: 2px solid #6366f1; }
    .emp-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 12px; font-weight: 600; flex-shrink: 0;
    }
    .emp-info { flex: 1; display: flex; flex-direction: column; }
    .emp-name { font-weight: 500; color: #1e293b; font-size: 14px; }
    .emp-dept { font-size: 12px; color: #94a3b8; }
  `]
})
export class ProjectAllocationComponent implements OnInit {
  projects: Project[] = [];
  allEmployees: Employee[] = [];
  selectedProject: Project | null = null;
  assignedEmployees: Employee[] = [];
  availableEmployees: Employee[] = [];
  selectedEmployees: Employee[] = [];
  filteredAvailableEmployees: Employee[] = [];
  allocations: ProjectAllocation[] = [];

  loadingAllocations = false;
  loadingEmployees = false;
  assigning = false;

  projectControl = new FormControl<any>(null);
  searchControl = new FormControl('');

  private projectService = inject(ProjectService);
  private employeeService = inject(EmployeeService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadProjects();
    this.loadEmployees();

    this.searchControl.valueChanges.subscribe(value => {
      const q = (value || '').toLowerCase();
      this.filteredAvailableEmployees = this.availableEmployees.filter(emp =>
        emp.firstName.toLowerCase().includes(q) ||
        emp.lastName.toLowerCase().includes(q) ||
        (emp.departmentName || '').toLowerCase().includes(q)
      );
    });
  }

  private loadProjects(): void {
    this.projectService.getAll().subscribe(projects => {
      this.projects = projects;
    });
  }

  private loadEmployees(): void {
    this.loadingEmployees = true;
    this.employeeService.getAll().subscribe({
      next: (employees) => {
        this.allEmployees = employees.filter(e => e.status === 'Active');
        this.loadingEmployees = false;
        if (this.selectedProject) {
          this.updateEmployeeLists();
        }
      },
      error: () => {
        this.loadingEmployees = false;
      }
    });
  }

  onProjectChange(project: Project | null): void {
    this.selectedProject = project;
    this.selectedEmployees = [];
    if (!project) {
      this.assignedEmployees = [];
      this.availableEmployees = [];
      return;
    }
    this.loadAllocationsForProject(project.projectId);
  }

  private loadAllocationsForProject(projectId: number): void {
    this.loadingAllocations = true;
    this.projectService.getAllocations().subscribe({
      next: (allocs) => {
        this.allocations = allocs.filter(a => a.projectId === projectId);
        this.updateEmployeeLists();
        this.loadingAllocations = false;
      },
      error: () => {
        this.loadingAllocations = false;
        this.snackBar.open('Failed to load allocations', 'Close', { duration: 3000 });
      }
    });
  }

  private updateEmployeeLists(): void {
    const assignedIds = this.allocations.filter(a => a.status).map(a => a.empId);
    this.assignedEmployees = this.allEmployees.filter(e => assignedIds.includes(e.employeeId));
    this.availableEmployees = this.allEmployees.filter(e => !assignedIds.includes(e.employeeId));
    this.filteredAvailableEmployees = [...this.availableEmployees];
    this.selectedEmployees = [];
  }

  toggleSelect(emp: Employee): void {
    const idx = this.selectedEmployees.findIndex(e => e.employeeId === emp.employeeId);
    if (idx >= 0) {
      this.selectedEmployees.splice(idx, 1);
    } else {
      this.selectedEmployees.push(emp);
    }
  }

  isSelected(emp: Employee): boolean {
    return this.selectedEmployees.some(e => e.employeeId === emp.employeeId);
  }

  assignSelected(): void {
    if (!this.selectedProject || this.selectedEmployees.length === 0) return;

    this.assigning = true;
    let completed = 0;
    const total = this.selectedEmployees.length;

    this.selectedEmployees.forEach(emp => {
      this.projectService.allocateEmployee({
        empId: emp.employeeId,
        projectId: this.selectedProject!.projectId,
        createdBy: 'Admin',
        status: true,
      }).subscribe({
        next: () => {
          completed++;
          if (completed === total) {
            this.assigning = false;
            this.snackBar.open(`${total} employee(s) assigned successfully`, 'Close', { duration: 3000 });
            this.loadAllocationsForProject(this.selectedProject!.projectId);
          }
        },
        error: () => {
          completed++;
          if (completed === total) {
            this.assigning = false;
            this.snackBar.open('Some assignments failed', 'Close', { duration: 3000 });
            this.loadAllocationsForProject(this.selectedProject!.projectId);
          }
        }
      });
    });
  }

  removeAllocation(emp: Employee): void {
    if (!this.selectedProject) return;

    const allocation = this.allocations.find(a => a.empId === emp.employeeId && a.projectId === this.selectedProject!.projectId);
    if (!allocation) return;

    if (!confirm(`Remove ${emp.firstName} ${emp.lastName} from ${this.selectedProject.projectName}?`)) return;

    this.projectService.removeAllocation(allocation.allocationId).subscribe({
      next: () => {
        this.snackBar.open('Employee removed from project', 'Close', { duration: 3000 });
        this.loadAllocationsForProject(this.selectedProject!.projectId);
      },
      error: () => {
        this.snackBar.open('Failed to remove allocation', 'Close', { duration: 3000 });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }
}
