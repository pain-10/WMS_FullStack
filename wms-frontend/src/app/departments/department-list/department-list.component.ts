import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DepartmentService } from '../../services/department.service';
import { Department } from '../../models';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="page-header flex items-center justify-between">
        <div>
          <h1 class="page-title">Departments</h1>
          <p class="page-subtitle">Manage organizational departments</p>
        </div>
        <button (click)="openModal()" class="btn-primary" id="add-dept-btn">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Add Department
        </button>
      </div>

      <!-- Department Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div *ngFor="let dept of departments; let i = index"
             class="card p-6 hover:border-primary-300 cursor-pointer group animate-slide-up"
             [style.animation-delay]="(i * 0.05) + 's'">
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                 [style.background]="getDeptColor(i)">
              {{ dept.departmentName[0] }}
            </div>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button (click)="editDept(dept); $event.stopPropagation()" class="btn-icon" title="Edit">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button (click)="deleteDept(dept.departmentId); $event.stopPropagation()" class="btn-icon text-red-400 hover:text-red-600 hover:bg-red-50" title="Delete">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
          <h3 class="text-lg font-semibold text-surface-900 mb-1">{{ dept.departmentName }}</h3>
          <p class="text-sm text-surface-500 mb-3">{{ dept.description || 'No description' }}</p>
          <div class="flex items-center gap-2 text-xs text-surface-400">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Created {{ dept.createdOn | date:'mediumDate' }}
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div *ngIf="showModal" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="p-6 border-b border-surface-200">
            <h2 class="text-xl font-semibold text-surface-900">{{ editing ? 'Edit Department' : 'Add Department' }}</h2>
          </div>
          <form [formGroup]="deptForm" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
            <div>
              <label class="input-label">Department Name</label>
              <input formControlName="departmentName" class="input-field" placeholder="Enter department name">
              <p class="input-error" *ngIf="deptForm.get('departmentName')?.touched && deptForm.get('departmentName')?.hasError('required')">Required</p>
            </div>
            <div>
              <label class="input-label">Description</label>
              <textarea formControlName="description" class="input-field" rows="3" placeholder="Enter department description..."></textarea>
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <button type="button" (click)="closeModal()" class="btn-secondary">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="deptForm.invalid">
                {{ editing ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DepartmentListComponent implements OnInit {
  departments: Department[] = [];
  showModal = false;
  editing: Department | null = null;
  deptForm: FormGroup;

  private colors = [
    'linear-gradient(135deg, #6366f1, #4f46e5)',
    'linear-gradient(135deg, #ec4899, #db2777)',
    'linear-gradient(135deg, #22c55e, #16a34a)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
    'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    'linear-gradient(135deg, #0ea5e9, #0284c7)',
    'linear-gradient(135deg, #ef4444, #dc2626)',
    'linear-gradient(135deg, #14b8a6, #0d9488)',
  ];

    private departmentService = inject(DepartmentService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.deptForm = this.fb.group({
      departmentName: ['', Validators.required],
      description: [''],
  });
  }

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.departmentService.getAll().subscribe((d: Department[]) => this.departments = d);
  }

  getDeptColor(index: number): string {
    return this.colors[index % this.colors.length];
  }

  openModal(): void {
    this.editing = null;
    this.deptForm.reset();
    this.showModal = true;
  }

  editDept(dept: Department): void {
    this.editing = dept;
    this.deptForm.patchValue({ departmentName: dept.departmentName, description: dept.description });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editing = null;
  }

  onSubmit(): void {
    if (this.deptForm.invalid) return;
    if (this.editing) {
      this.departmentService.update({ ...this.editing, ...this.deptForm.value }).subscribe(() => {
        this.loadDepartments();
        this.closeModal();
      });
    } else {
      this.departmentService.create(this.deptForm.value).subscribe(() => {
        this.loadDepartments();
        this.closeModal();
      });
    }
  }

  deleteDept(id: number): void {
    if (confirm('Are you sure you want to delete this department?')) {
      this.departmentService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Department deleted', 'Close', { duration: 3000 });
          this.loadDepartments();
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Failed to delete department', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
