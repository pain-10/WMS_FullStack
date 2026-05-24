import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ProfileService } from '../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { Profile } from '../models/profile.model';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatChipsModule,
  ],
  template: `
    <div class="animate-fade-in">
      <div class="flex items-center gap-3 mb-6">
        <button mat-icon-button routerLink="/dashboard"><mat-icon>arrow_back</mat-icon></button>
        <div>
          <h1 class="page-title mb-0">Profile</h1>
          <p class="page-subtitle mt-1">{{ isOwnProfile ? 'Your personal employee record' : 'Employee profile details' }}</p>
        </div>
      </div>

      @if (loading) {
        <div style="display: flex; justify-content: center; padding: 80px;">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      } @else if (profile) {
        <div class="profile-container">
          <div class="profile-header">
            <div class="header-bg"></div>
            <div class="header-content">
              <div class="avatar">
                @if (profile.profilePicture) {
                  <img [src]="profile.profilePicture" alt="Profile" class="avatar-img">
                } @else {
                  <span class="avatar-initials">{{ profile.firstName[0] }}{{ profile.lastName[0] }}</span>
                }
              </div>
              <div class="header-info">
                <h2>{{ profile.firstName }} {{ profile.lastName }}</h2>
                <p class="role-dept">{{ profile.roleName }} @ {{ profile.departmentName }}</p>
                <div class="status-row">
                  <mat-chip [class.chip-active]="profile.status === 'Active'" [class.chip-inactive]="profile.status !== 'Active'">
                    {{ profile.status }}
                  </mat-chip>
                  <span class="emp-id">ID: {{ profile.employeeId }}</span>
                </div>
              </div>
              <div class="header-actions">
                <button mat-stroked-button [routerLink]="['/profile/edit']">
                  <mat-icon>edit</mat-icon> Edit Profile
                </button>
                <button mat-stroked-button [routerLink]="['/profile/change-password']">
                  <mat-icon>lock</mat-icon> Change Password
                </button>
              </div>
            </div>
          </div>

          <div class="profile-body">
            <div class="info-section">
              <h3 class="section-title">Personal Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">First Name</span>
                  <span class="info-value">{{ profile.firstName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Last Name</span>
                  <span class="info-value">{{ profile.lastName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Gender</span>
                  <span class="info-value">{{ profile.gender === 'M' ? 'Male' : profile.gender === 'F' ? 'Female' : 'Other' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Date of Birth</span>
                  <span class="info-value">{{ profile.dob | date:'mediumDate' }}</span>
                </div>
              </div>
            </div>

            <div class="info-section">
              <h3 class="section-title">Contact Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Email</span>
                  <span class="info-value">{{ profile.email }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Phone Number</span>
                  <span class="info-value">{{ profile.phoneNumber }}</span>
                </div>
              </div>
            </div>

            <div class="info-section">
              <h3 class="section-title">Employment Details</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Department</span>
                  <span class="info-value">{{ profile.departmentName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Role</span>
                  <span class="info-value">{{ profile.roleName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Date of Joining</span>
                  <span class="info-value">{{ profile.doj | date:'mediumDate' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Status</span>
                  <span class="info-value">
                    <mat-chip [class.chip-active]="profile.status === 'Active'" [class.chip-inactive]="profile.status !== 'Active'">
                      {{ profile.status }}
                    </mat-chip>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-container { max-width: 900px; margin: 0 auto; }
    .profile-header { position: relative; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); margin-bottom: 24px; }
    .header-bg { height: 100px; background: linear-gradient(135deg, #6366f1, #8b5cf6); }
    .header-content { padding: 0 28px 28px; margin-top: -48px; display: flex; gap: 24px; align-items: flex-end; flex-wrap: wrap; }
    .avatar { width: 96px; height: 96px; border-radius: 16px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; border: 4px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); flex-shrink: 0; }
    .avatar-img { width: 100%; height: 100%; border-radius: 12px; object-fit: cover; }
    .avatar-initials { font-size: 28px; font-weight: 700; color: white; }
    .header-info { flex: 1; }
    .header-info h2 { font-size: 22px; font-weight: 700; color: #1e293b; margin: 0; }
    .role-dept { color: #64748b; font-size: 14px; margin-top: 2px; }
    .status-row { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
    .emp-id { font-size: 12px; color: #94a3b8; }
    .chip-active { --mat-chip-selected-row-color: #dcfce7 !important; color: #166534 !important; }
    .chip-inactive { --mat-chip-selected-row-color: #fef2f2 !important; color: #991b1b !important; }
    .header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .profile-body { display: flex; flex-direction: column; gap: 20px; }
    .info-section { background: white; border-radius: 12px; padding: 24px 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
    .section-title { font-size: 15px; font-weight: 600; color: #1e293b; margin: 0 0 16px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
    .info-item { display: flex; flex-direction: column; gap: 2px; }
    .info-label { font-size: 12px; font-weight: 500; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { font-size: 14px; color: #1e293b; font-weight: 500; }
  `]
})
export class ProfileViewComponent implements OnInit {
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  profile: Profile | null = null;
  loading = true;
  isOwnProfile = true;

  ngOnInit(): void {
    const routeId = this.route.snapshot.paramMap.get('id');
    const employeeId = routeId ? Number(routeId) : undefined;
    if (!routeId) {
      this.isOwnProfile = true;
    } else {
      this.isOwnProfile = employeeId === this.authService.currentUserValue?.userId;
    }
    this.profileService.getProfile(employeeId).subscribe({
      next: (p) => { this.profile = p; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }
}
