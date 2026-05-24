import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Employee } from '../../models';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h1 class="page-title">Profile</h1>
          <p class="page-subtitle">Your personal employee record.</p>
        </div>
        <a routerLink="/dashboard" class="btn-secondary">Back to Dashboard</a>
      </div>

      @if (profile) {
        <div class="card p-6">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xl font-bold">
                {{ profile.firstName[0] }}{{ profile.lastName[0] }}
              </div>
              <h2 class="mt-4 text-2xl font-bold text-surface-900">{{ profile.firstName }} {{ profile.lastName }}</h2>
              <p class="text-surface-500">{{ profile.roleName }} · {{ profile.departmentName }}</p>
            </div>
            <div class="grid gap-3 sm:grid-cols-2 lg:w-[28rem]">
              <div class="rounded-2xl bg-surface-50 p-4">
                <p class="text-xs uppercase tracking-wide text-surface-400">Employee ID</p>
                <p class="mt-1 font-medium text-surface-900">{{ profile.employeeId }}</p>
              </div>
              <div class="rounded-2xl bg-surface-50 p-4">
                <p class="text-xs uppercase tracking-wide text-surface-400">Status</p>
                <p class="mt-1 font-medium text-surface-900">{{ profile.status }}</p>
              </div>
              <div class="rounded-2xl bg-surface-50 p-4">
                <p class="text-xs uppercase tracking-wide text-surface-400">Email</p>
                <p class="mt-1 font-medium text-surface-900">{{ profile.email }}</p>
              </div>
              <div class="rounded-2xl bg-surface-50 p-4">
                <p class="text-xs uppercase tracking-wide text-surface-400">Phone</p>
                <p class="mt-1 font-medium text-surface-900">{{ profile.phoneNumber }}</p>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ProfileComponent implements OnInit {
  profile: Employee | null = null;

  private authService = inject(AuthService);
  private employeeService = inject(EmployeeService);

  ngOnInit(): void {
    const employeeId = this.authService.currentUserValue?.userId || 0;
    this.employeeService.getById(employeeId).subscribe((employee: Employee | undefined) => {
      this.profile = employee || null;
    });
  }
}
