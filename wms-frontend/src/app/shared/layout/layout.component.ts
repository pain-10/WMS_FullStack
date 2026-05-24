import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserLogin } from '../../models';
import { NotificationPanelComponent } from '../../notifications/notification-panel/notification-panel.component';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NotificationPanelComponent],
  template: `
    <!-- Sidebar -->
    <aside
      class="fixed top-0 left-0 z-40 h-screen transition-all duration-300"
      [class.w-64]="!sidebarCollapsed"
      [class.w-20]="sidebarCollapsed"
    >
      <div class="h-full flex flex-col bg-surface-900 border-r border-surface-800">
        <!-- Logo Area -->
        <div class="flex items-center gap-3 px-5 h-16 border-b border-surface-800">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <span class="text-white font-bold text-lg tracking-tight" *ngIf="!sidebarCollapsed">WMS</span>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <ng-container *ngIf="isEmployeeSidebar; else adminNav">
            <a *ngFor="let item of employeeNavItems" [routerLink]="item.route" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }" class="sidebar-link">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path [attr.d]="item.icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
              </svg>
              <span *ngIf="!sidebarCollapsed">{{ item.label }}</span>
            </a>
          </ng-container>
          <ng-template #adminNav>
            <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="sidebar-link">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
              <span *ngIf="!sidebarCollapsed">Dashboard</span>
            </a>

            <a routerLink="/notifications" routerLinkActive="active" class="sidebar-link">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span *ngIf="!sidebarCollapsed">Notifications</span>
            </a>

            <a routerLink="/employees" routerLinkActive="active" class="sidebar-link">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
              <span *ngIf="!sidebarCollapsed">Employees</span>
            </a>

            <a routerLink="/attendance" routerLinkActive="active" class="sidebar-link">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span *ngIf="!sidebarCollapsed">Attendance</span>
            </a>

            <a routerLink="/leave-approvals" routerLinkActive="active" class="sidebar-link">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span *ngIf="!sidebarCollapsed">Leave Approvals</span>
            </a>

            <a routerLink="/projects" routerLinkActive="active" class="sidebar-link">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span *ngIf="!sidebarCollapsed">Projects</span>
            </a>

            <a routerLink="/clients" routerLinkActive="active" class="sidebar-link">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
              <span *ngIf="!sidebarCollapsed">Clients</span>
            </a>

            <a routerLink="/announcements" routerLinkActive="active" class="sidebar-link">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h10M7 16h6"/>
              </svg>
              <span *ngIf="!sidebarCollapsed">Announcements</span>
            </a>

            <a routerLink="/reports" routerLinkActive="active" class="sidebar-link">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-6m4 6V7m4 10v-3m-12 3V5h16v14H5z"/>
              </svg>
              <span *ngIf="!sidebarCollapsed">Reports</span>
            </a>

            <a routerLink="/audit-logs" routerLinkActive="active" class="sidebar-link">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6M7 4h10l3 3v13H4V4h3z"/>
              </svg>
              <span *ngIf="!sidebarCollapsed">Audit Logs</span>
            </a>

            <a routerLink="/settings" routerLinkActive="active" class="sidebar-link">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317a1.724 1.724 0 012.35 0l.53.54a1.724 1.724 0 002.438 0l.54-.54a1.724 1.724 0 012.35 0l.77.77a1.724 1.724 0 010 2.35l-.54.54a1.724 1.724 0 000 2.438l.54.54a1.724 1.724 0 010 2.35l-.77.77a1.724 1.724 0 01-2.35 0l-.54-.54a1.724 1.724 0 00-2.438 0l-.54.54a1.724 1.724 0 01-2.35 0l-.77-.77a1.724 1.724 0 010-2.35l.54-.54a1.724 1.724 0 000-2.438l-.54-.54a1.724 1.724 0 010-2.35l.77-.77z"/>
              </svg>
              <span *ngIf="!sidebarCollapsed">Settings</span>
            </a>
          </ng-template>
        </nav>

        <!-- Sidebar Toggle -->
        <div class="p-3 border-t border-surface-800 space-y-2">
          <button (click)="logout()" class="sidebar-link w-full justify-start text-red-300 hover:bg-red-500/10 hover:text-red-200">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span *ngIf="!sidebarCollapsed">Logout</span>
          </button>
          <button (click)="sidebarCollapsed = !sidebarCollapsed" class="sidebar-link w-full justify-center">
            <svg class="w-5 h-5 transition-transform" [class.rotate-180]="sidebarCollapsed" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="transition-all duration-300" [class.ml-64]="!sidebarCollapsed" [class.ml-20]="sidebarCollapsed">
      <!-- Top Header -->
      <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-surface-200">
        <div class="flex items-center justify-between h-16 px-6">
          <!-- Search Bar -->
          <div class="relative w-96">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" placeholder="Search employees, projects..." class="input-field pl-10 bg-surface-50 border-surface-200 text-sm py-2">
          </div>

          <!-- Right Actions -->
          <div class="flex items-center gap-3">
            <app-notification-panel></app-notification-panel>

            <!-- User Menu -->
            <div class="flex items-center gap-3 pl-3 border-l border-surface-200">
              <div class="text-right">
                <p class="text-sm font-semibold text-surface-900">{{ currentUser?.username || 'User' }}</p>
                <p class="text-xs text-surface-500">{{ currentUser?.roleName || 'Role' }}</p>
              </div>
              <div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                {{ (currentUser?.username || 'U')[0] | uppercase }}
              </div>
              <button *ngIf="!isEmployeeSidebar" (click)="logout()" class="btn-icon text-surface-400 hover:text-red-500" title="Logout">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-6">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: []
})
export class LayoutComponent {
  sidebarCollapsed = false;
  currentUser: UserLogin | null;

  employeeNavItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { label: 'Notifications', route: '/notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { label: 'My Attendance', route: '/my-attendance', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'My Timesheet', route: '/my-timesheet', icon: 'M9 17v-6m4 6V7m4 10v-3m-12 3V5h16v14H5z' },
    { label: 'My Leave', route: '/my-leave', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { label: 'My Projects', route: '/my-projects', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'Reports', route: '/reports', icon: 'M9 17v-6m4 6V7m4 10v-3m-12 3V5h16v14H5z' },
    { label: 'Announcements', route: '/employee-announcements', icon: 'M7 8h10M7 12h10M7 16h6' },
    { label: 'Profile', route: '/profile', icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-8 8a8 8 0 1116 0H4z' },
  ];

    private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.currentUser = this.authService.currentUserValue;
  }

  get isEmployeeSidebar(): boolean {
    return (this.currentUser?.roleName ?? '').toLowerCase() === 'employee';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
