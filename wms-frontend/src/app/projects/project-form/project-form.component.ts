import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectService } from '../../services/project.service';
import { ClientService } from '../../services/client.service';
import { Project, Client } from '../../models';

@Component({
  selector: 'app-project-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="animate-fade-in max-w-3xl mx-auto">
      <div class="page-header">
        <button (click)="goBack()" class="btn-icon mb-2">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1 class="page-title">{{ isEdit ? 'Edit Project' : 'Add New Project' }}</h1>
        <p class="page-subtitle">{{ isEdit ? 'Update project details and configuration' : 'Create a new project in the system' }}</p>
      </div>

      <div class="card p-6">
        <form [formGroup]="projectForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Project Name</mat-label>
            <input matInput formControlName="projectName" placeholder="Enter project name">
            @if (projectForm.get('projectName')?.hasError('required') && projectForm.get('projectName')?.touched) {
              <mat-error>Project name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Client</mat-label>
            <mat-select formControlName="clientId">
              <mat-option [value]="null">Select Client</mat-option>
              @for (client of clients; track client.clientId) {
                <mat-option [value]="client.clientId">{{ client.clientName }}</mat-option>
              }
            </mat-select>
            @if (projectForm.get('clientId')?.hasError('required') && projectForm.get('clientId')?.touched) {
              <mat-error>Client is required</mat-error>
            }
          </mat-form-field>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <mat-form-field appearance="outline">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" formControlName="startDate" placeholder="Select start date">
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
              @if (projectForm.get('startDate')?.hasError('required') && projectForm.get('startDate')?.touched) {
                <mat-error>Start date is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>End Date</mat-label>
              <input matInput [matDatepicker]="endPicker" formControlName="endDate" placeholder="Select end date">
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="Active">Active</mat-option>
              <mat-option value="Completed">Completed</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-surface-200">
            <button mat-button type="button" (click)="goBack()">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="projectForm.invalid || submitting">
              @if (submitting) {
                <mat-spinner diameter="20" style="display: inline-block; margin-right: 8px;"></mat-spinner>
              }
              {{ isEdit ? 'Update' : 'Create' }} Project
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .card { background: white; border-radius: 12px; }
  `]
})
export class ProjectFormComponent implements OnInit {
  projectForm: FormGroup;
  clients: Client[] = [];
  isEdit = false;
  submitting = false;
  private projectId?: number;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private clientService = inject(ClientService);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.projectForm = this.fb.group({
      projectName: ['', Validators.required],
      clientId: [null, Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      status: ['Active'],
    });
  }

  ngOnInit(): void {
    this.loadClients();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.projectId = +id;
      this.loadProject(this.projectId);
    }
  }

  private loadClients(): void {
    this.clientService.getAll().subscribe(clients => {
      this.clients = clients;
    });
  }

  private loadProject(id: number): void {
    this.projectService.getById(id).subscribe({
      next: (project) => {
        this.projectForm.patchValue({
          projectName: project.projectName,
          clientId: project.clientId ?? null,
          startDate: project.startDate ? new Date(project.startDate) : '',
          endDate: project.endDate ? new Date(project.endDate) : '',
          status: project.status,
        });
      },
      error: () => {
        this.snackBar.open('Failed to load project', 'Close', { duration: 3000 });
        this.router.navigate(['/projects']);
      }
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) return;

    this.submitting = true;
    const formValue = this.projectForm.value;

    const project: Partial<Project> = {
      projectName: formValue.projectName,
      clientId: formValue.clientId,
      startDate: formValue.startDate ? new Date(formValue.startDate as Date).toISOString().split('T')[0] : undefined,
      endDate: formValue.endDate ? new Date(formValue.endDate as Date).toISOString().split('T')[0] : undefined,
      status: formValue.status,
    };

    if (this.isEdit && this.projectId) {
      this.projectService.update({ ...project, projectId: this.projectId } as Project).subscribe({
        next: () => {
          this.snackBar.open('Project updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/projects']);
        },
        error: () => {
          this.submitting = false;
          this.snackBar.open('Failed to update project', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.projectService.create(project).subscribe({
        next: () => {
          this.snackBar.open('Project created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/projects']);
        },
        error: () => {
          this.submitting = false;
          this.snackBar.open('Failed to create project', 'Close', { duration: 3000 });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }
}
