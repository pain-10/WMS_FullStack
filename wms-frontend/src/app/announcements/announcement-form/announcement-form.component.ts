import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AnnouncementService } from '../../services/announcement.service';
import { AuthService } from '../../services/auth.service';
import { Announcement } from '../../models';

@Component({
  selector: 'app-announcement-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="animate-fade-in">
      <div class="flex items-center gap-3 mb-6">
        <button mat-icon-button routerLink="/announcements">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1 class="page-title mb-0">{{ isEditMode ? 'Edit' : 'Add' }} Announcement</h1>
          <p class="page-subtitle mt-1">{{ isEditMode ? 'Update the announcement details' : 'Create a new announcement' }}</p>
        </div>
      </div>

      @if (loading) {
        <div style="display: flex; justify-content: center; padding: 48px;">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <div class="form-container">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">
            <div class="form-section">
              <h3 class="section-title">Basic Information</h3>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Title</mat-label>
                <input matInput formControlName="title" placeholder="Enter announcement title">
                @if (form.get('title')?.hasError('required') && form.get('title')?.touched) {
                  <mat-error>Title is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width" style="min-height: 180px;">
                <mat-label>Message</mat-label>
                <textarea matInput formControlName="message" placeholder="Enter announcement message" rows="6"></textarea>
                @if (form.get('message')?.hasError('required') && form.get('message')?.touched) {
                  <mat-error>Message is required</mat-error>
                }
                @if (form.get('message')?.hasError('minlength') && form.get('message')?.touched) {
                  <mat-error>Message must be at least 10 characters</mat-error>
                }
              </mat-form-field>

              <div class="toggle-row">
                <mat-slide-toggle formControlName="isActive" color="primary">
                  Active
                </mat-slide-toggle>
                <span class="toggle-hint">
                  {{ form.get('isActive')?.value ? 'Visible to all employees' : 'Hidden from employees' }}
                </span>
              </div>
            </div>

            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="/announcements">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || submitting">
                @if (submitting) {
                  <mat-spinner diameter="20" style="display: inline-block;"></mat-spinner>
                }
                {{ isEditMode ? 'Update' : 'Create' }} Announcement
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
  styles: [`
    .form-container { max-width: 720px; }
    .form-grid { display: flex; flex-direction: column; gap: 24px; }
    .form-section { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
    .section-title { font-size: 16px; font-weight: 600; color: #1e293b; margin: 0 0 20px; }
    .full-width { width: 100%; }
    .toggle-row { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
    .toggle-hint { font-size: 13px; color: #94a3b8; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; }
  `]
})
export class AnnouncementFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private announcementService = inject(AnnouncementService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  isEditMode = false;
  loading = false;
  submitting = false;
  private announcementId?: number;

  ngOnInit(): void {
    this.initForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.announcementId = Number(id);
      this.loadAnnouncement();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]],
      isActive: [true],
    });
  }

  private loadAnnouncement(): void {
    if (!this.announcementId) return;
    this.loading = true;
    this.announcementService.getById(this.announcementId).subscribe({
      next: (item) => {
        this.form.patchValue({
          title: item.title,
          message: item.message,
          isActive: item.isActive,
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load announcement', 'Close', { duration: 3000 });
        this.router.navigate(['/announcements']);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting = true;

    const data = this.form.value;

    const request = this.isEditMode && this.announcementId
      ? this.announcementService.update({ announcementId: this.announcementId, ...data })
      : this.announcementService.create(data);

    request.subscribe({
      next: () => {
        this.snackBar.open(
          `Announcement ${this.isEditMode ? 'updated' : 'created'} successfully`,
          'Close',
          { duration: 3000 }
        );
        this.router.navigate(['/announcements']);
      },
      error: () => {
        this.submitting = false;
        this.snackBar.open('Failed to save announcement', 'Close', { duration: 3000 });
      }
    });
  }
}
