import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { EmployeeService } from '../services/employee.service';
import { LeaveService } from '../services/leave.service';
import { ProjectService } from '../services/project.service';
import { AttendanceService } from '../services/attendance.service';
import { AuthService } from '../services/auth.service';
import { AnnouncementService } from '../services/announcement.service';
import {
  Announcement,
  Attendance,
  Employee,
  Leave,
  Project,
  ProjectAllocation,
} from '../models';
import { API_BASE_URL } from '../config/api.config';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, BaseChartDirective],
  template: `
    <div class="animate-fade-in space-y-8">
      @if (isEmployeeDashboard) {
        <section class="bg-gradient-to-r from-surface-900 via-slate-800 to-primary-900 rounded-3xl p-8 relative overflow-hidden shadow-xl">
          <div class="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.18),_transparent_40%)]"></div>
          <div class="relative z-10 grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
            <div>
              <span class="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                Employee Dashboard
              </span>
              <h1 class="mt-4 text-3xl font-bold text-white">Welcome back, {{ displayName }}</h1>
              <p class="mt-3 max-w-2xl text-slate-200">
                Your workspace shows only your personal attendance, leave, projects, and announcements.
              </p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/90 backdrop-blur">
              <p class="text-sm text-white/60">Current role</p>
              <p class="mt-1 text-lg font-semibold">{{ currentRole }}</p>
              <p class="mt-2 text-sm text-white/70">{{ employeeProfile?.departmentName || 'Department not assigned' }}</p>
            </div>
          </div>
        </section>

        <section>
          <div class="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 class="text-xl font-semibold text-surface-900">My Summary</h2>
              <p class="text-sm text-surface-500">A quick view of your personal workload and attendance.</p>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div class="stat-card">
              <div class="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm text-surface-500">Today's attendance</p>
                <p class="text-2xl font-bold text-surface-900">{{ todayAttendanceLabel }}</p>
                <p class="text-xs text-surface-400 mt-1">{{ todayAttendanceSubtext }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8m-8 4h8m-8 4h5m6-10v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm text-surface-500">Total leaves remaining</p>
                <p class="text-2xl font-bold text-surface-900">{{ remainingLeaves }}</p>
                <p class="text-xs text-surface-400 mt-1">Based on the current leave allowance</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                <svg class="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm text-surface-500">Assigned projects</p>
                <p class="text-2xl font-bold text-surface-900">{{ assignedProjects.length }}</p>
                <p class="text-xs text-surface-400 mt-1">Active allocations only</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h1m4 0h1m-6 4h6M7 8h10M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm text-surface-500">Announcements</p>
                <p class="text-2xl font-bold text-surface-900">{{ employeeAnnouncements.length }}</p>
                <p class="text-xs text-surface-400 mt-1">Active announcements</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div class="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 class="text-xl font-semibold text-surface-900">Quick Actions</h2>
              <p class="text-sm text-surface-500">Jump straight to your most common actions.</p>
            </div>
          </div>
          <div class="grid gap-4 md:grid-cols-3">
            @for (action of employeeQuickActions; track action.title) {
              <a [routerLink]="action.route" class="card group border border-surface-200 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <span [class]="action.accent + ' inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide'">{{ action.label }}</span>
                    <h3 class="mt-3 text-lg font-semibold text-surface-900">{{ action.title }}</h3>
                    <p class="mt-2 text-sm text-surface-500">{{ action.description }}</p>
                  </div>
                  <svg class="h-5 w-5 text-surface-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            }
          </div>
        </section>

        <section class="grid gap-6 xl:grid-cols-2">
          <div class="card p-6">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 class="text-lg font-semibold text-surface-900">Attendance history</h2>
                <p class="text-sm text-surface-500">Your most recent check-ins and check-outs.</p>
              </div>
            </div>
            <div class="overflow-hidden rounded-2xl border border-surface-100">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Mode</th>
                  </tr>
                </thead>
                <tbody>
                  @for (record of personalAttendanceHistory; track record.attendanceId) {
                    <tr>
                      <td class="text-surface-600 text-sm">{{ record.attendanceDate | date:'mediumDate' }}</td>
                      <td class="text-surface-600 text-sm">{{ record.checkIn | date:'shortTime' }}</td>
                      <td class="text-surface-600 text-sm">{{ record.checkOut ? (record.checkOut | date:'shortTime') : 'In progress' }}</td>
                      <td><span [class]="getWorkModeBadge(record.workMode)">{{ record.workMode }}</span></td>
                    </tr>
                  }
                  @if (personalAttendanceHistory.length === 0) {
                    <tr>
                      <td colspan="4" class="px-4 py-8 text-center text-sm text-surface-500">No attendance history found.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <div class="card p-6">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 class="text-lg font-semibold text-surface-900">Leave history</h2>
                <p class="text-sm text-surface-500">Track your recent leave requests and outcomes.</p>
              </div>
            </div>
            <div class="space-y-3">
              @for (leave of personalLeaveHistory; track leave.leaveId) {
                <div class="rounded-2xl border border-surface-100 bg-surface-50 p-4">
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <p class="font-medium text-surface-900">{{ leave.leaveType }} leave</p>
                      <p class="text-sm text-surface-500">{{ leave.fromDate | date:'mediumDate' }} - {{ leave.toDate | date:'mediumDate' }}</p>
                      <p class="mt-1 text-sm text-surface-600">{{ leave.reason || 'No reason provided' }}</p>
                    </div>
                    <span [class]="getStatusBadge(leave.status)">{{ leave.status }}</span>
                  </div>
                </div>
              }
              @if (personalLeaveHistory.length === 0) {
                <div class="rounded-2xl border border-dashed border-surface-200 p-8 text-center text-sm text-surface-500">No leave history found.</div>
              }
            </div>
          </div>

          <div class="card p-6">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 class="text-lg font-semibold text-surface-900">Announcements</h2>
                <p class="text-sm text-surface-500">Company updates visible to all employees.</p>
              </div>
              <span class="badge-info">{{ employeeAnnouncements.length }} active</span>
            </div>
            <div class="space-y-3">
              @for (announcement of employeeAnnouncements; track announcement.announcementId) {
                <div class="rounded-2xl border border-surface-100 bg-white p-4">
                  <div class="flex items-start justify-between gap-3">
                    <h3 class="font-medium text-surface-900">{{ announcement.title }}</h3>
                    <span class="text-xs text-surface-400">{{ announcement.createdOn | date:'mediumDate' }}</span>
                  </div>
                  <p class="mt-2 text-sm text-surface-600">{{ announcement.message }}</p>
                </div>
              }
            </div>
          </div>

          <div class="card p-6">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 class="text-lg font-semibold text-surface-900">Profile</h2>
                <p class="text-sm text-surface-500">Your personal details from the workforce directory.</p>
              </div>
            </div>
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-2xl bg-surface-50 p-4">
                <p class="text-xs uppercase tracking-wide text-surface-400">Name</p>
                <p class="mt-1 font-medium text-surface-900">{{ displayName }}</p>
              </div>
              <div class="rounded-2xl bg-surface-50 p-4">
                <p class="text-xs uppercase tracking-wide text-surface-400">Role</p>
                <p class="mt-1 font-medium text-surface-900">{{ currentRole }}</p>
              </div>
              <div class="rounded-2xl bg-surface-50 p-4">
                <p class="text-xs uppercase tracking-wide text-surface-400">Department</p>
                <p class="mt-1 font-medium text-surface-900">{{ employeeProfile?.departmentName || 'N/A' }}</p>
              </div>
              <div class="rounded-2xl bg-surface-50 p-4">
                <p class="text-xs uppercase tracking-wide text-surface-400">Email</p>
                <p class="mt-1 font-medium text-surface-900">{{ employeeProfile?.email || 'N/A' }}</p>
              </div>
            </div>
          </div>
        </section>
      } @else {
        <section class="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-8 relative overflow-hidden shadow-xl">
          <div class="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4"></div>
          <div class="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-white/5 translate-y-1/2"></div>
          <div class="relative z-10">
            <span class="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              Admin Dashboard
            </span>
            <h1 class="mt-4 text-3xl font-bold text-white">Welcome back, {{ displayName }}!</h1>
            <p class="mt-3 max-w-2xl text-primary-100">
              Manage the system with live workforce metrics, charts, and operational controls.
            </p>
          </div>
        </section>

        <section>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div class="stat-card">
              <div class="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm text-surface-500">Total Employees</p>
                <p class="text-2xl font-bold text-surface-900">{{ totalEmployees }}</p>
                <p class="text-xs text-accent-600 mt-1">{{ activeEmployees }} active</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm text-surface-500">Present Today</p>
                <p class="text-2xl font-bold text-surface-900">{{ presentToday }}</p>
                <p class="text-xs text-yellow-600 mt-1">{{ wfoToday }} WFO / {{ wfhToday }} WFH</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm text-surface-500">Active Projects</p>
                <p class="text-2xl font-bold text-surface-900">{{ activeProjects }}</p>
                <p class="text-xs text-surface-400 mt-1">Of {{ totalProjects }} total</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <div>
                <p class="text-sm text-surface-500">Total Clients</p>
                <p class="text-2xl font-bold text-surface-900">{{ totalClients }}</p>
                <p class="text-xs text-surface-400 mt-1">Active accounts</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm text-surface-500">Pending Leaves</p>
                <p class="text-2xl font-bold text-surface-900">{{ pendingLeaves }}</p>
                <p class="text-xs text-amber-600 mt-1">Needs approval</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div class="mb-4">
            <h2 class="text-xl font-semibold text-surface-900">Charts</h2>
            <p class="text-sm text-surface-500">System-wide trends and distributions from database.</p>
          </div>
          <div class="grid gap-6 lg:grid-cols-2">
            <div class="card p-6">
              <h3 class="text-lg font-semibold text-surface-900 mb-4">Attendance</h3>
              <div class="chart-container">
                <canvas baseChart
                  [data]="attendanceChartData"
                  [options]="attendanceChartOptions"
                  [type]="'doughnut'">
                </canvas>
              </div>
            </div>
            <div class="card p-6">
              <h3 class="text-lg font-semibold text-surface-900 mb-4">Department Distribution</h3>
              <div class="chart-container">
                <canvas baseChart
                  [data]="departmentChartData"
                  [options]="departmentChartOptions"
                  [type]="'pie'">
                </canvas>
              </div>
            </div>
            <div class="card p-6">
              <h3 class="text-lg font-semibold text-surface-900 mb-4">Leave Statistics</h3>
              <div class="chart-container">
                <canvas baseChart
                  [data]="leaveChartData"
                  [options]="leaveChartOptions"
                  [type]="'doughnut'">
                </canvas>
              </div>
            </div>
            <div class="card p-6">
              <h3 class="text-lg font-semibold text-surface-900 mb-4">Project Status</h3>
              <div class="chart-container">
                <canvas baseChart
                  [data]="projectChartData"
                  [options]="projectChartOptions"
                  [type]="'doughnut'">
                </canvas>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div class="mb-4">
            <h2 class="text-xl font-semibold text-surface-900">Management</h2>
            <p class="text-sm text-surface-500">Core admin workflows for running the system.</p>
          </div>
          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            @for (tile of managementTiles; track tile.title) {
              @if (tile.route) {
                <a [routerLink]="tile.route" class="card group border border-surface-200 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg">
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <span [class]="tile.badge + ' inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide'">{{ tile.badge }}</span>
                      <h3 class="mt-3 text-lg font-semibold text-surface-900">{{ tile.title }}</h3>
                      <p class="mt-2 text-sm text-surface-500">{{ tile.description }}</p>
                    </div>
                    <svg class="h-5 w-5 text-surface-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              } @else {
                <div class="card border border-surface-200 p-5">
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <span [class]="tile.badge + ' inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide'">{{ tile.badge }}</span>
                      <h3 class="mt-3 text-lg font-semibold text-surface-900">{{ tile.title }}</h3>
                      <p class="mt-2 text-sm text-surface-500">{{ tile.description }}</p>
                    </div>
                    <span class="text-xs text-surface-400">Coming soon</span>
                  </div>
                </div>
              }
            }
          </div>
        </section>

        <section class="card p-6">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold text-surface-900">Recent Announcements</h2>
              <p class="text-sm text-surface-500">System-wide updates from the database.</p>
            </div>
            <span class="badge-info">{{ announcements.length }} active</span>
          </div>
          <div class="grid gap-3 lg:grid-cols-2">
            @for (announcement of announcements; track announcement.announcementId) {
              <div class="rounded-2xl border border-surface-100 bg-surface-50 p-4">
                <div class="flex items-start justify-between gap-3">
                  <h3 class="font-medium text-surface-900">{{ announcement.title }}</h3>
                  <span class="text-xs text-surface-400">{{ announcement.createdOn | date:'mediumDate' }}</span>
                </div>
                <p class="mt-2 text-sm text-surface-600">{{ announcement.message }}</p>
              </div>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    .chart-container { position: relative; width: 100%; height: 280px; }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser = '';
  displayName = '';
  currentRole = '';
  isEmployeeDashboard = false;
  announcements: Announcement[] = [];
  employeeAnnouncements: Announcement[] = [];
  personalAttendanceHistory: Attendance[] = [];
  personalLeaveHistory: Leave[] = [];
  assignedProjects: Array<ProjectAllocation & { projectName: string }> = [];
  employeeProfile: Employee | null = null;
  todayAttendanceLabel = 'Not checked in';
  todayAttendanceSubtext = 'No check-in recorded yet';
  remainingLeaves = 0;

  totalEmployees = 0;
  activeEmployees = 0;
  totalProjects = 0;
  activeProjects = 0;
  totalClients = 0;
  pendingLeaves = 0;
  presentToday = 0;
  absentToday = 0;
  wfoToday = 0;
  wfhToday = 0;
  todayAttendanceCount = 0;

  managementTiles: ManagementTile[] = [
    { title: 'Employee CRUD', description: 'Create, update, search, and deactivate employee records.', route: '/employees', badge: 'Employees', accent: 'bg-primary-100 text-primary-700' },
    { title: 'Project management', description: 'Track projects, assignments, and delivery status.', route: '/projects', badge: 'Projects', accent: 'bg-amber-100 text-amber-700' },
    { title: 'Client management', description: 'Manage client profiles, contact details, and status.', route: '/clients', badge: 'Clients', accent: 'bg-violet-100 text-violet-700' },
    { title: 'Announcements', description: 'Publish updates and company-wide notices.', route: '/announcements', badge: 'Updates', accent: 'bg-emerald-100 text-emerald-700' },
    { title: 'Reports', description: 'Review organization-wide operational reports.', route: '/reports', badge: 'Reports', accent: 'bg-red-100 text-red-700' },
  ];

  employeeQuickActions: QuickAction[] = [
    { title: 'Check In', description: 'Go to your attendance page and mark your check-in for the day.', route: '/attendance', label: 'Attendance', accent: 'bg-primary-100 text-primary-700' },
    { title: 'Check Out', description: 'Open your attendance page to complete your workday entry.', route: '/attendance', label: 'Attendance', accent: 'bg-amber-100 text-amber-700' },
    { title: 'Apply Leave', description: 'Submit a new leave request from your leave page.', route: '/leave/apply', label: 'Leave', accent: 'bg-violet-100 text-violet-700' },
  ];

  attendanceChartData: ChartConfiguration<'doughnut'>['data'] = { labels: ['Present', 'Absent', 'WFH', 'WFO'], datasets: [{ data: [0, 0, 0, 0], backgroundColor: ['rgba(34, 197, 94, 0.85)', 'rgba(239, 68, 68, 0.85)', 'rgba(251, 191, 36, 0.85)', 'rgba(99, 102, 241, 0.85)'], borderWidth: 0, spacing: 4 }] };
  attendanceChartOptions: ChartOptions<'doughnut'> = { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } } };

  departmentChartData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [{ data: [], backgroundColor: ['rgba(99, 102, 241, 0.8)', 'rgba(236, 72, 153, 0.8)', 'rgba(34, 197, 94, 0.8)', 'rgba(251, 191, 36, 0.8)', 'rgba(168, 85, 247, 0.8)'], borderWidth: 0 }] };
  departmentChartOptions: ChartOptions<'pie'> = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16 } } } };

  leaveChartData: ChartConfiguration<'doughnut'>['data'] = { labels: ['Approved', 'Pending', 'Rejected'], datasets: [{ data: [0, 0, 0], backgroundColor: ['rgba(34, 197, 94, 0.85)', 'rgba(251, 191, 36, 0.85)', 'rgba(239, 68, 68, 0.85)'], borderWidth: 0, spacing: 4 }] };
  leaveChartOptions: ChartOptions<'doughnut'> = { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } } };

  projectChartData: ChartConfiguration<'doughnut'>['data'] = { labels: ['Active', 'Completed'], datasets: [{ data: [0, 0], backgroundColor: ['rgba(34, 197, 94, 0.85)', 'rgba(99, 102, 241, 0.85)'], borderWidth: 0, spacing: 4 }] };
  projectChartOptions: ChartOptions<'doughnut'> = { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } } };

  private http = inject(HttpClient);
  private attendanceService = inject(AttendanceService);
  private employeeService = inject(EmployeeService);
  private leaveService = inject(LeaveService);
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);
  private announcementService = inject(AnnouncementService);

  private employees: Employee[] = [];

  constructor() {
    this.currentUser = this.authService.currentUserValue?.username || 'User';
    this.currentRole = this.authService.currentUserValue?.roleName || 'Employee';
    this.displayName = this.currentUser;
    this.isEmployeeDashboard = this.currentRole === 'Employee';
  }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    if (this.isEmployeeDashboard) {
      this.loadEmployeeStats();
      return;
    }
    this.loadAdminStats();
  }

  private loadAdminStats(): void {
    this.http.get<any>(`${API_BASE_URL}/api/dashboard`).pipe(
      catchError(() => of(null))
    ).subscribe(dashboard => {
      if (dashboard) {
        this.totalEmployees = dashboard.totalEmployees || 0;
        this.activeEmployees = dashboard.activeEmployees || 0;
        this.totalProjects = dashboard.totalProjects || 0;
        this.activeProjects = dashboard.activeProjects || 0;
        this.totalClients = dashboard.totalClients || 0;
        this.pendingLeaves = dashboard.pendingLeaves || 0;
        this.presentToday = dashboard.presentToday || 0;
        this.absentToday = dashboard.absentToday || 0;
        this.wfoToday = dashboard.wfoToday || 0;
        this.wfhToday = dashboard.wfhToday || 0;
        this.todayAttendanceCount = dashboard.todayAttendanceCount || 0;
      }

      forkJoin({
        employees: this.employeeService.getAll(),
        leaves: this.leaveService.getAll(),
        projects: this.projectService.getAll(),
        announcements: this.announcementService.getAll(),
      }).subscribe({
        next: (data) => {
          this.employees = data.employees;
          this.announcements = data.announcements;

          if (!dashboard) {
            this.totalEmployees = data.employees.length;
            this.activeEmployees = data.employees.filter(e => e.status === 'Active').length;
            this.totalProjects = data.projects.length;
            this.activeProjects = data.projects.filter(p => p.status === 'Active').length;
            this.pendingLeaves = data.leaves.filter(l => l.status === 'Pending').length;
          }

          this.buildAdminChartData(data.employees, data.leaves, data.projects);
          this.displayName = this.resolveDisplayName();
        }
      });
    });
  }

  private loadEmployeeStats(): void {
    const employeeId = this.authService.currentUserValue?.userId || 0;

    forkJoin({
      employee: this.employeeService.getById(employeeId).pipe(catchError(() => of(null))),
      projects: this.projectService.getByEmployee(employeeId).pipe(catchError(() => of([]))),
      attendance: this.attendanceService.getByEmployee(employeeId).pipe(catchError(() => of([] as Attendance[]))),
      leaves: this.leaveService.getByEmployee(employeeId).pipe(catchError(() => of([] as Leave[]))),
      announcements: this.announcementService.getAll().pipe(catchError(() => of([] as Announcement[]))),
    }).subscribe(({ employee, projects, attendance, leaves, announcements }: { employee: Employee | null; projects: Project[]; attendance: Attendance[]; leaves: Leave[]; announcements: Announcement[] }) => {
      this.employeeProfile = employee;
      this.announcements = announcements;
      this.employeeAnnouncements = announcements.filter(a => a.isActive);
      this.personalAttendanceHistory = attendance
        .sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate))
        .slice(0, 5);
      this.personalLeaveHistory = leaves
        .sort((a, b) => (b.appliedOn || '').localeCompare(a.appliedOn || ''))
        .slice(0, 5);
      this.assignedProjects = projects.map(p => ({
        allocationId: p.projectId,
        empId: employeeId,
        projectId: p.projectId,
        assignedOn: p.startDate || '',
        createDate: '',
        createdBy: '',
        status: p.status === 'Active',
        projectName: p.projectName,
      }));

      const approvedLeaveCount = leaves.filter(l => l.status === 'Approved').length;
      this.remainingLeaves = Math.max(12 - approvedLeaveCount, 0);

      const today = new Date().toISOString().split('T')[0];
      const todayRecord = attendance.find(r => r.attendanceDate === today) || null;
      this.todayAttendanceLabel = todayRecord ? (todayRecord.checkOut ? 'Completed' : 'Checked in') : 'Not checked in';
      this.todayAttendanceSubtext = todayRecord && todayRecord.checkIn
        ? `Checked in at ${new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
        : 'No check-in recorded yet';

      this.displayName = employee ? `${employee.firstName} ${employee.lastName}` : this.currentUser;
    });
  }

  private buildAdminChartData(employees: Employee[], leaves: Leave[], projects: Project[]): void {
    if (this.presentToday > 0 || this.absentToday > 0) {
      this.attendanceChartData = {
        labels: ['Present', 'Absent', 'WFH', 'WFO'],
        datasets: [{
          ...this.attendanceChartData.datasets[0],
          data: [
            this.presentToday || 0,
            this.absentToday || 0,
            this.wfhToday || 0,
            this.wfoToday || 0,
          ],
        }],
      };
    }

    const departmentDistribution = new Map<string, number>();
    employees.forEach(emp => {
      const key = emp.departmentName || 'Unassigned';
      departmentDistribution.set(key, (departmentDistribution.get(key) || 0) + 1);
    });

    if (departmentDistribution.size > 0) {
      this.departmentChartData = {
        labels: Array.from(departmentDistribution.keys()),
        datasets: [{ ...this.departmentChartData.datasets[0], data: Array.from(departmentDistribution.values()) }],
      };
    }

    const leaveDistribution = new Map<string, number>();
    leaves.forEach(l => leaveDistribution.set(l.status, (leaveDistribution.get(l.status) || 0) + 1));

    this.leaveChartData = {
      labels: ['Approved', 'Pending', 'Rejected'],
      datasets: [{
        ...this.leaveChartData.datasets[0],
        data: ['Approved', 'Pending', 'Rejected'].map(label => leaveDistribution.get(label) || 0),
      }],
    };

    const activeCount = projects.filter(p => p.status === 'Active').length;
    const completedCount = projects.filter(p => p.status === 'Completed').length;
    this.projectChartData = {
      labels: ['Active', 'Completed'],
      datasets: [{
        ...this.projectChartData.datasets[0],
        data: [activeCount, completedCount],
      }],
    };
  }

  private resolveDisplayName(): string {
    const currentEmployee = this.employees.find(e => e.employeeId === (this.authService.currentUserValue?.userId || 0));
    return currentEmployee ? `${currentEmployee.firstName} ${currentEmployee.lastName}` : this.currentUser;
  }

  getWorkModeBadge(mode: string): string {
    switch (mode) {
      case 'WFO': return 'badge-success';
      case 'WFH': return 'badge-info';
      case 'Hybrid': return 'badge-warning';
      default: return 'badge-neutral';
    }
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'Approved': return 'badge-success';
      case 'Pending': return 'badge-warning';
      case 'Rejected': return 'badge-danger';
      default: return 'badge-neutral';
    }
  }
}

interface EmployeeTask {
  title: string;
  due: string;
  status: string;
}

interface ManagementTile {
  title: string;
  description: string;
  route?: string;
  badge: string;
  accent: string;
}

interface QuickAction {
  title: string;
  description: string;
  route: string;
  label: string;
  accent: string;
}
