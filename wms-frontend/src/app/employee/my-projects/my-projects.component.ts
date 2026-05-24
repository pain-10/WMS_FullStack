import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectAllocation, Project } from '../../models';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';

interface AssignedProjectView extends ProjectAllocation {
  projectName: string;
  clientName?: string;
  startDate?: string;
  endDate?: string;
  projectStatus?: Project['status'];
}

@Component({
  selector: 'app-my-projects',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h1 class="page-title">My Projects</h1>
          <p class="page-subtitle">Projects currently assigned to you.</p>
        </div>
        <a routerLink="/dashboard" class="btn-secondary">Back to Dashboard</a>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <div class="stat-card">
          <div class="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm text-surface-500">Active allocations</p>
            <p class="text-2xl font-bold text-surface-900">{{ projects.length }}</p>
            <p class="text-xs text-surface-400 mt-1">Projects assigned to your account</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <div>
            <p class="text-sm text-surface-500">In progress</p>
            <p class="text-2xl font-bold text-surface-900">{{ activeCount }}</p>
            <p class="text-xs text-surface-400 mt-1">Active project work</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm text-surface-500">Latest assignment</p>
            <p class="text-2xl font-bold text-surface-900">{{ latestProject || 'N/A' }}</p>
            <p class="text-xs text-surface-400 mt-1">Most recent active project</p>
          </div>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        @for (project of projects; track project.allocationId) {
          <div class="card p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-lg font-semibold text-surface-900">{{ project.projectName }}</h2>
                <p class="text-sm text-surface-500 mt-1">{{ project.clientName || 'No client assigned' }}</p>
              </div>
              <span [class]="project.projectStatus === 'Active' ? 'badge-success' : 'badge-neutral'">{{ project.projectStatus || 'Active' }}</span>
            </div>
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div class="rounded-2xl bg-surface-50 p-4">
                <p class="text-xs uppercase tracking-wide text-surface-400">Start</p>
                <p class="mt-1 font-medium text-surface-900">{{ project.startDate ? (project.startDate | date:'mediumDate') : 'TBD' }}</p>
              </div>
              <div class="rounded-2xl bg-surface-50 p-4">
                <p class="text-xs uppercase tracking-wide text-surface-400">End</p>
                <p class="mt-1 font-medium text-surface-900">{{ project.endDate ? (project.endDate | date:'mediumDate') : 'TBD' }}</p>
              </div>
            </div>
          </div>
        }
        @if (projects.length === 0) {
          <div class="lg:col-span-2 rounded-3xl border border-dashed border-surface-200 p-10 text-center text-surface-500">
            No projects are currently assigned to you.
          </div>
        }
      </div>
    </div>
  `
})
export class MyProjectsComponent implements OnInit {
  projects: AssignedProjectView[] = [];
  activeCount = 0;
  latestProject = '';

  private authService = inject(AuthService);
  private projectService = inject(ProjectService);

  ngOnInit(): void {
    const employeeId = this.authService.currentUserValue?.userId || 0;
    this.projectService.getByEmployee(employeeId).subscribe((projects: Project[]) => {
      this.projects = projects
        .map(project => ({
          allocationId: project.projectId,
          empId: employeeId,
          projectId: project.projectId,
          assignedOn: project.startDate || new Date().toISOString(),
          createDate: project.startDate || new Date().toISOString(),
          createdBy: '',
          status: project.status === 'Active',
          projectName: project.projectName,
          clientName: project.clientName,
          startDate: project.startDate,
          endDate: project.endDate,
          projectStatus: project.status,
        }))
        .sort((a, b) => b.assignedOn.localeCompare(a.assignedOn));

      this.activeCount = this.projects.filter(project => project.status).length;
      this.latestProject = this.projects[0]?.projectName || '';
    });
  }
}
