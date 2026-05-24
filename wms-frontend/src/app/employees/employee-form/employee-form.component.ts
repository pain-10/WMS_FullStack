import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Employee, GENDERS, STATUS_OPTIONS } from '../models/employee.model';
import { EmployeeService } from '../services/employee.service';
import { DepartmentService } from '../../services/department.service';
import { Department } from '../models/employee.model';

export interface EmployeeFormData {
  employee?: Employee;
}

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
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
    <div class="form-dialog">
      <div class="form-header">
        <h2>{{ isEdit ? 'Edit Employee' : 'Add New Employee' }}</h2>
        <button mat-icon-button (click)="onCancel()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()">
        <div class="form-body">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="firstName" placeholder="Enter first name">
              @if (employeeForm.get('firstName')?.hasError('required') && employeeForm.get('firstName')?.touched) {
                <mat-error>First name is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="lastName" placeholder="Enter last name">
              @if (employeeForm.get('lastName')?.hasError('required') && employeeForm.get('lastName')?.touched) {
                <mat-error>Last name is required</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" placeholder="name@company.com" type="email">
              @if (employeeForm.get('email')?.hasError('required') && employeeForm.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (employeeForm.get('email')?.hasError('email') && employeeForm.get('email')?.touched) {
                <mat-error>Enter a valid email address</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phoneNumber" placeholder="Enter phone number">
              @if (employeeForm.get('phoneNumber')?.hasError('required') && employeeForm.get('phoneNumber')?.touched) {
                <mat-error>Phone number is required</mat-error>
              }
              @if (employeeForm.get('phoneNumber')?.hasError('pattern') && employeeForm.get('phoneNumber')?.touched) {
                <mat-error>Enter a valid 10-digit phone number</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Gender</mat-label>
              <mat-select formControlName="gender">
                <mat-option value="">Select Gender</mat-option>
                @for (g of genders; track g) {
                  <mat-option [value]="g">{{ g === 'M' ? 'Male' : g === 'F' ? 'Female' : 'Other' }}</mat-option>
                }
              </mat-select>
              @if (employeeForm.get('gender')?.hasError('required') && employeeForm.get('gender')?.touched) {
                <mat-error>Gender is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date of Birth</mat-label>
              <input matInput [matDatepicker]="dobPicker" formControlName="dob" placeholder="Select date">
              <mat-datepicker-toggle matSuffix [for]="dobPicker"></mat-datepicker-toggle>
              <mat-datepicker #dobPicker></mat-datepicker>
              @if (employeeForm.get('dob')?.hasError('required') && employeeForm.get('dob')?.touched) {
                <mat-error>Date of birth is required</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Date of Joining</mat-label>
              <input matInput [matDatepicker]="dojPicker" formControlName="doj" placeholder="Select date">
              <mat-datepicker-toggle matSuffix [for]="dojPicker"></mat-datepicker-toggle>
              <mat-datepicker #dojPicker></mat-datepicker>
              @if (employeeForm.get('doj')?.hasError('required') && employeeForm.get('doj')?.touched) {
                <mat-error>Date of joining is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Department</mat-label>
              <mat-select formControlName="departmentId">
                <mat-option value="">Select Department</mat-option>
                @for (dept of departments; track dept.departmentId) {
                  <mat-option [value]="dept.departmentId">{{ dept.departmentName }}</mat-option>
                }
              </mat-select>
              @if (employeeForm.get('departmentId')?.hasError('required') && employeeForm.get('departmentId')?.touched) {
                <mat-error>Department is required</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Role</mat-label>
              <mat-select formControlName="roleId">
                <mat-option value="">Select Role</mat-option>
                @for (role of roles; track role.roleId) {
                  <mat-option [value]="role.roleId">{{ role.roleName }}</mat-option>
                }
              </mat-select>
              @if (employeeForm.get('roleId')?.hasError('required') && employeeForm.get('roleId')?.touched) {
                <mat-error>Role is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                @for (s of statusOptions; track s) {
                  <mat-option [value]="s">{{ s }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        <div class="form-footer">
          <button mat-button type="button" (click)="onCancel()">Cancel</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="employeeForm.invalid || submitting">
            @if (submitting) {
              <mat-spinner diameter="20" style="display: inline-block; margin-right: 8px;"></mat-spinner>
            }
            {{ isEdit ? 'Update' : 'Create' }} Employee
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-dialog { overflow: hidden; }
    .form-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px; border-bottom: 1px solid #e2e8f0;
    }
    .form-header h2 { margin: 0; font-size: 20px; font-weight: 600; color: #0f172a; }
    .form-body { padding: 24px; max-height: 60vh; overflow-y: auto; }
    .form-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
      margin-bottom: 4px;
    }
    .form-footer {
      display: flex; align-items: center; justify-content: flex-end; gap: 12px;
      padding: 16px 24px; border-top: 1px solid #e2e8f0;
    }
  `]
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  departments: Department[] = [];
  isEdit = false;
  submitting = false;
  genders = GENDERS;
  statusOptions = STATUS_OPTIONS;

  roles = [
    { roleId: 1, roleName: 'Admin' },
    { roleId: 2, roleName: 'Manager' },
    { roleId: 3, roleName: 'Employee' },
  ];

  data: EmployeeFormData = inject(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<EmployeeFormComponent>);

  constructor() {
    this.employeeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      gender: ['', Validators.required],
      dob: ['', Validators.required],
      doj: ['', Validators.required],
      departmentId: ['', Validators.required],
      roleId: ['', Validators.required],
      status: ['Active'],
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
    if (this.data?.employee) {
      this.isEdit = true;
      this.employeeForm.patchValue({
        firstName: this.data.employee.firstName,
        lastName: this.data.employee.lastName,
        email: this.data.employee.email,
        phoneNumber: this.data.employee.phoneNumber,
        gender: this.data.employee.gender,
        dob: new Date(this.data.employee.dob),
        doj: new Date(this.data.employee.doj),
        departmentId: this.data.employee.departmentId,
        roleId: this.data.employee.roleId,
        status: this.data.employee.status,
      });
    }
  }

  private loadDepartments(): void {
    this.departmentService.getAll().subscribe(depts => {
      this.departments = depts;
    });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) return;

    this.submitting = true;
    const formValue = this.employeeForm.value;

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    if (this.isEdit && this.data?.employee) {
      const updated: Employee = {
        ...this.data.employee,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phoneNumber: formValue.phoneNumber,
        gender: formValue.gender,
        dob: formatDate(new Date(formValue.dob)),
        doj: formatDate(new Date(formValue.doj)),
        departmentId: +formValue.departmentId,
        roleId: +formValue.roleId,
        status: formValue.status,
      };

      this.employeeService.update(updated).subscribe({
        next: () => {
          this.snackBar.open('Employee updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.submitting = false;
          this.snackBar.open('Failed to update employee', 'Close', { duration: 3000 });
        }
      });
    } else {
      const newEmployee: Partial<Employee> = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phoneNumber: formValue.phoneNumber,
        gender: formValue.gender,
        dob: formatDate(new Date(formValue.dob)),
        doj: formatDate(new Date(formValue.doj)),
        departmentId: +formValue.departmentId,
        roleId: +formValue.roleId,
        status: formValue.status,
      };

      this.employeeService.create(newEmployee).subscribe({
        next: () => {
          this.snackBar.open('Employee created successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.submitting = false;
          this.snackBar.open('Failed to create employee', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
