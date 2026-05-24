import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: '',
    loadComponent: () => import('./shared/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'my-attendance',
        loadComponent: () => import('./employee/my-attendance/my-attendance.component').then(m => m.MyAttendanceComponent),
        data: { roles: ['Employee'] },
      },
      {
        path: 'my-leave',
        loadComponent: () => import('./employee/my-leave/my-leave.component').then(m => m.MyLeaveComponent),
        data: { roles: ['Employee'] },
      },
      {
        path: 'my-projects',
        loadComponent: () => import('./employee/my-projects/my-projects.component').then(m => m.MyProjectsComponent),
        data: { roles: ['Employee'] },
      },
      {
        path: 'employee-announcements',
        loadComponent: () => import('./employee/announcements/employee-announcements.component').then(m => m.EmployeeAnnouncementsComponent),
        data: { roles: ['Employee'] },
      },
      {
        path: 'notifications',
        loadComponent: () => import('./notifications/notification-list/notification-list.component').then(m => m.NotificationListComponent),
        data: { roles: ['Admin', 'Manager', 'Employee'] },
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile-view/profile-view.component').then(m => m.ProfileViewComponent),
        data: { roles: ['Admin', 'Manager', 'Employee'] },
      },
      {
        path: 'profile/edit',
        loadComponent: () => import('./profile/profile-edit/profile-edit.component').then(m => m.ProfileEditComponent),
        data: { roles: ['Admin', 'Manager', 'Employee'] },
      },
      {
        path: 'profile/change-password',
        loadComponent: () => import('./profile/change-password/change-password.component').then(m => m.ChangePasswordComponent),
        data: { roles: ['Admin', 'Manager', 'Employee'] },
      },
      {
        path: 'employees',
        loadComponent: () => import('./employees/employee-list/employee-list.component').then(m => m.EmployeeListComponent),
        data: { roles: ['Admin', 'Manager'] },
      },
      {
        path: 'employees/add',
        loadComponent: () => import('./employees/employee-form/employee-form.component').then(m => m.EmployeeFormComponent),
        data: { roles: ['Admin', 'Manager'] },
      },
      {
        path: 'employees/edit/:id',
        loadComponent: () => import('./employees/employee-form/employee-form.component').then(m => m.EmployeeFormComponent),
        data: { roles: ['Admin', 'Manager'] },
      },
      {
        path: 'employees/:id',
        loadComponent: () => import('./employees/employee-details/employee-details.component').then(m => m.EmployeeDetailsComponent),
        data: { roles: ['Admin', 'Manager'] },
      },
      {
        path: 'attendance',
        loadComponent: () => import('./attendance/attendance.component').then(m => m.AttendanceComponent),
        data: { roles: ['Admin', 'Manager', 'Employee'] },
      },
      {
        path: 'attendance/checkin',
        loadComponent: () => import('./attendance/checkin/checkin.component').then(m => m.CheckinComponent),
        data: { roles: ['Admin', 'Manager', 'Employee'] },
      },
      {
        path: 'attendance/timesheet',
        loadComponent: () => import('./attendance/timesheet/timesheet.component').then(m => m.TimesheetComponent),
        data: { roles: ['Admin', 'Manager'] },
      },
      {
        path: 'leave',
        loadComponent: () => import('./leaves/leave-list/leave-list.component').then(m => m.LeaveListComponent),
        data: { roles: ['Admin', 'Manager', 'Employee'] },
      },
      {
        path: 'leave/apply',
        loadComponent: () => import('./leaves/apply-leave/apply-leave.component').then(m => m.ApplyLeaveComponent),
        data: { roles: ['Admin', 'Manager', 'Employee'] },
      },
      {
        path: 'leave-approvals',
        redirectTo: 'leave',
        pathMatch: 'full',
      },
      {
        path: 'departments',
        loadComponent: () => import('./departments/department-list/department-list.component').then(m => m.DepartmentListComponent),
        data: { roles: ['Admin', 'Manager'] },
      },
      {
        path: 'projects/add',
        loadComponent: () => import('./projects/project-form/project-form.component').then(m => m.ProjectFormComponent),
        data: { roles: ['Admin', 'Manager'] },
      },
      {
        path: 'projects/edit/:id',
        loadComponent: () => import('./projects/project-form/project-form.component').then(m => m.ProjectFormComponent),
        data: { roles: ['Admin', 'Manager'] },
      },
      {
        path: 'projects/allocation',
        loadComponent: () => import('./projects/project-allocation/project-allocation.component').then(m => m.ProjectAllocationComponent),
        data: { roles: ['Admin', 'Manager'] },
      },
      {
        path: 'projects/:id',
        loadComponent: () => import('./projects/project-details/project-details.component').then(m => m.ProjectDetailsComponent),
        data: { roles: ['Admin', 'Manager'] },
      },
      {
        path: 'projects',
        loadComponent: () => import('./projects/project-list/project-list.component').then(m => m.ProjectListComponent),
        data: { roles: ['Admin', 'Manager'] },
      },
      {
        path: 'clients/add',
        loadComponent: () => import('./clients/client-form/client-form.component').then(m => m.ClientFormComponent),
        data: { roles: ['Admin', 'Manager'] },
      },
      {
        path: 'clients/edit/:id',
        loadComponent: () => import('./clients/client-form/client-form.component').then(m => m.ClientFormComponent),
        data: { roles: ['Admin', 'Manager'] },
      },
      {
        path: 'clients/:id',
        loadComponent: () => import('./clients/client-details/client-details.component').then(m => m.ClientDetailsComponent),
        data: { roles: ['Admin', 'Manager', 'Employee'] },
      },
      {
        path: 'clients',
        loadComponent: () => import('./clients/client-list/client-list.component').then(m => m.ClientListComponent),
        data: { roles: ['Admin', 'Manager', 'Employee'] },
      },
      {
        path: 'announcements',
        loadComponent: () => import('./announcements/announcement-list/announcement-list.component').then(m => m.AnnouncementListComponent),
        data: { roles: ['Admin', 'Manager'] },
      },
      {
        path: 'announcements/add',
        loadComponent: () => import('./announcements/announcement-form/announcement-form.component').then(m => m.AnnouncementFormComponent),
        data: { roles: ['Admin', 'Manager'] },
      },
      {
        path: 'announcements/edit/:id',
        loadComponent: () => import('./announcements/announcement-form/announcement-form.component').then(m => m.AnnouncementFormComponent),
        data: { roles: ['Admin', 'Manager'] },
      },
      {
        path: 'announcements/:id',
        loadComponent: () => import('./announcements/announcement-details/announcement-details.component').then(m => m.AnnouncementDetailsComponent),
        data: { roles: ['Admin', 'Manager'] },
      },
      {
        path: 'reports',
        loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent),
        data: { roles: ['Admin', 'Manager', 'Employee'] },
      },
      {
        path: 'reports/employee',
        loadComponent: () => import('./reports/employee-report/employee-report.component').then(m => m.EmployeeReportComponent),
        data: { roles: ['Admin', 'Manager'] },
      },
      {
        path: 'reports/attendance',
        loadComponent: () => import('./reports/attendance-report/attendance-report.component').then(m => m.AttendanceReportComponent),
        data: { roles: ['Admin', 'Manager', 'Employee'] },
      },
      {
        path: 'reports/leave',
        loadComponent: () => import('./reports/leave-report/leave-report.component').then(m => m.LeaveReportComponent),
        data: { roles: ['Admin', 'Manager', 'Employee'] },
      },
      {
        path: 'reports/project',
        loadComponent: () => import('./reports/project-report/project-report.component').then(m => m.ProjectReportComponent),
        data: { roles: ['Admin', 'Manager', 'Employee'] },
      },
      {
        path: 'reports/timesheet',
        loadComponent: () => import('./reports/timesheet-report/timesheet-report.component').then(m => m.TimesheetReportComponent),
        data: { roles: ['Admin', 'Manager'] },
      },
      {
        path: 'my-timesheet',
        loadComponent: () => import('./employee/my-timesheet/my-timesheet.component').then(m => m.MyTimesheetComponent),
        data: { roles: ['Employee'] },
      },
      {
        path: 'audit-logs',
        loadComponent: () => import('./admin/admin-section/admin-section.component').then(m => m.AdminSectionComponent),
        data: {
          roles: ['Admin', 'Manager'],
          title: 'Audit Logs',
          description: 'Inspect administrative activity and security events.',
          points: ['User activity', 'Role changes', 'System events'],
        },
      },
      {
        path: 'settings',
        loadComponent: () => import('./admin/admin-section/admin-section.component').then(m => m.AdminSectionComponent),
        data: {
          roles: ['Admin', 'Manager'],
          title: 'Settings',
          description: 'Configure system preferences and operational defaults.',
          points: ['Profile settings', 'System preferences', 'Access controls'],
        },
      },
    ],
  },
  { path: '**', redirectTo: 'auth/login' },
];
