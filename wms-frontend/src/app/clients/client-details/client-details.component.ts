import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClientService } from '../../services/client.service';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { Client, Project, ProjectAllocation } from '../../models';

@Component({
  selector: 'app-client-details',
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="animate-fade-in">
      <div class="page-header">
        <button (click)="goBack()" class="btn-icon mb-2">
          <mat-icon>arrow_back</mat-icon>
        </button>
        @if (loading) {
          <div class="flex items-center gap-3">
            <mat-spinner diameter="24"></mat-spinner>
            <span class="text-surface-400">Loading...</span>
          </div>
        } @else if (client) {
          <div class="flex items-center justify-between">
            <div>
              <h1 class="page-title">{{ client.clientName }}</h1>
              <p class="page-subtitle">Client ID: {{ client.clientId }}</p>
            </div>
            <div class="flex gap-2">
              <button mat-raised-button color="primary" *ngIf="canManage" [routerLink]="['/clients/edit', client.clientId]">
                <mat-icon>edit</mat-icon>
                Edit Client
              </button>
            </div>
          </div>
        }
      </div>

      @if (loading) {
        <div class="flex justify-center p-12">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (client) {
        <div class="grid gap-6 lg:grid-cols-3">
          <div class="lg:col-span-1 space-y-6">
            <div class="card p-6">
              <h2 class="text-lg font-semibold text-surface-900 mb-4">Client Information</h2>
              <div class="space-y-4">
                <div>
                  <p class="text-xs uppercase tracking-wide text-surface-400 font-semibold">Name</p>
                  <p class="mt-1 font-medium text-surface-900">{{ client.clientName }}</p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-wide text-surface-400 font-semibold">Status</p>
                  <p class="mt-1">
                    <mat-chip [class.active-chip]="client.status" [class.inactive-chip]="!client.status">
                      {{ client.status ? 'Active' : 'Inactive' }}
                    </mat-chip>
                  </p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-wide text-surface-400 font-semibold">Location</p>
                  <p class="mt-1 text-surface-700">{{ client.clientLocation || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-wide text-surface-400 font-semibold">Phone</p>
                  <p class="mt-1 text-surface-700">{{ client.clientPhoneNumber || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-wide text-surface-400 font-semibold">Address</p>
                  <p class="mt-1 text-surface-700">{{ client.clientAddress || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <div class="card p-6">
              <h2 class="text-lg font-semibold text-surface-900 mb-4">Summary</h2>
              <div class="grid grid-cols-2 gap-4">
                <div class="rounded-2xl bg-primary-50 p-4 text-center">
                  <p class="text-2xl font-bold text-primary-600">{{ projects.length }}</p>
                  <p class="text-xs text-surface-500 mt-1">Associated Projects</p>
                </div>
                <div class="rounded-2xl bg-violet-50 p-4 text-center">
                  <p class="text-2xl font-bold text-violet-600">{{ totalEmployeesAllocated }}</p>
                  <p class="text-xs text-surface-500 mt-1">Allocated Employees</p>
                </div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-2 space-y-6">
            <div class="card p-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h2 class="text-lg font-semibold text-surface-900">Associated Projects</h2>
                  <p class="text-sm text-surface-500">{{ projects.length }} project(s) linked to this client</p>
                </div>
              </div>

              @if (projects.length === 0) {
                <div class="text-center p-8 text-surface-400">
                  <mat-icon style="font-size: 40px; width: 40px; height: 40px;">folder_off</mat-icon>
                  <p class="mt-2">No projects associated with this client</p>
                </div>
              } @else {
                <div class="space-y-3">
                  @for (project of projects; track project.projectId) {
                    <div class="project-row" [routerLink]="['/projects', project.projectId]">
                      <div class="project-icon">{{ project.projectName[0] }}</div>
                      <div class="project-info">
                        <span class="project-name">{{ project.projectName }}</span>
                        <span class="project-meta">
                          {{ project.startDate | date:'mediumDate' }}
                          @if (project.endDate) {
                            <span> - {{ project.endDate | date:'mediumDate' }}</span>
                          }
                        </span>
                      </div>
                      <mat-chip [class.active-chip]="project.status === 'Active'" [class.completed-chip]="project.status === 'Completed'">
                        {{ project.status }}
                      </mat-chip>
                      <mat-icon class="chevron">chevron_right</mat-icon>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .card { background: white; border-radius: 12px; }
    .active-chip { --mat-chip-selected-row-color: #dcfce7 !important; color: #166534 !important; }
    .inactive-chip { --mat-chip-selected-row-color: #fef2f2 !important; color: #991b1b !important; }
    .completed-chip { --mat-chip-selected-row-color: #f0f9ff !important; color: #075985 !important; }
    .project-row {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 16px; border-radius: 10px;
      background: #f8fafc; cursor: pointer;
      transition: all 0.15s;
    }
    .project-row:hover { background: #f1f5f9; }
    .project-icon {
      width: 42px; height: 42px; border-radius: 10px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 18px; font-weight: 700; flex-shrink: 0;
    }
    .project-info { flex: 1; display: flex; flex-direction: column; }
    .project-name { font-weight: 600; color: #1e293b; font-size: 14px; }
    .project-meta { font-size: 12px; color: #94a3b8; margin-top: 2px; }
    .chevron { color: #cbd5e1; }
  `]
})
export class ClientDetailsComponent implements OnInit {
  client: Client | null = null;
  projects: Project[] = [];
  allocations: ProjectAllocation[] = [];
  loading = true;
  canManage = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientService = inject(ClientService);
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.canManage = this.authService.userRole !== 'Employee';
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadData(+id);
    }
  }

  get totalEmployeesAllocated(): number {
    const projectIds = this.projects.map(p => p.projectId);
    const uniqueEmpIds = new Set(
      this.allocations
        .filter(a => projectIds.includes(a.projectId) && a.status)
        .map(a => a.empId)
    );
    return uniqueEmpIds.size;
  }

  private loadData(clientId: number): void {
    this.loading = true;
    this.clientService.getById(clientId).subscribe({
      next: (client) => {
        this.client = client;
        this.projectService.getAll().subscribe(projects => {
          this.projects = projects.filter(p => p.clientId === clientId);
          this.projectService.getAllocations().subscribe(allocs => {
            this.allocations = allocs;
            this.loading = false;
          });
        });
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/clients']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/clients']);
  }
}
