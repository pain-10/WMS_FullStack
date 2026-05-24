import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models';

@Component({
  selector: 'app-client-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
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
        <h1 class="page-title">{{ isEdit ? 'Edit Client' : 'Add New Client' }}</h1>
        <p class="page-subtitle">{{ isEdit ? 'Update client details and account status' : 'Register a new client in the system' }}</p>
      </div>

      <div class="card p-6">
        <form [formGroup]="clientForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Client Name</mat-label>
            <input matInput formControlName="clientName" placeholder="Enter client name">
            @if (clientForm.get('clientName')?.hasError('required') && clientForm.get('clientName')?.touched) {
              <mat-error>Client name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Client Address</mat-label>
            <textarea matInput formControlName="clientAddress" placeholder="Enter client address" rows="2"></textarea>
            @if (clientForm.get('clientAddress')?.hasError('required') && clientForm.get('clientAddress')?.touched) {
              <mat-error>Client address is required</mat-error>
            }
          </mat-form-field>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <mat-form-field appearance="outline">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="clientPhoneNumber" placeholder="Enter 10-digit phone number" maxlength="10">
              @if (clientForm.get('clientPhoneNumber')?.hasError('required') && clientForm.get('clientPhoneNumber')?.touched) {
                <mat-error>Phone number is required</mat-error>
              }
              @if (clientForm.get('clientPhoneNumber')?.hasError('pattern') && clientForm.get('clientPhoneNumber')?.touched) {
                <mat-error>Enter a valid 10-digit phone number</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Location</mat-label>
              <input matInput formControlName="clientLocation" placeholder="Enter location">
              @if (clientForm.get('clientLocation')?.hasError('required') && clientForm.get('clientLocation')?.touched) {
                <mat-error>Location is required</mat-error>
              }
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option [value]="true">Active</mat-option>
              <mat-option [value]="false">Inactive</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-surface-200">
            <button mat-button type="button" (click)="goBack()">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="clientForm.invalid || submitting">
              @if (submitting) {
                <mat-spinner diameter="20" style="display: inline-block; margin-right: 8px;"></mat-spinner>
              }
              {{ isEdit ? 'Update' : 'Create' }} Client
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
export class ClientFormComponent implements OnInit {
  clientForm: FormGroup;
  isEdit = false;
  submitting = false;
  private clientId?: number;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientService = inject(ClientService);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.clientForm = this.fb.group({
      clientName: ['', Validators.required],
      clientAddress: ['', Validators.required],
      clientPhoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      clientLocation: ['', Validators.required],
      status: [true],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.clientId = +id;
      this.loadClient(this.clientId);
    }
  }

  private loadClient(id: number): void {
    this.clientService.getById(id).subscribe({
      next: (client) => {
        this.clientForm.patchValue({
          clientName: client.clientName,
          clientAddress: client.clientAddress || '',
          clientPhoneNumber: client.clientPhoneNumber || '',
          clientLocation: client.clientLocation || '',
          status: client.status,
        });
      },
      error: () => {
        this.snackBar.open('Failed to load client', 'Close', { duration: 3000 });
        this.router.navigate(['/clients']);
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) return;

    this.submitting = true;
    const formValue = this.clientForm.value;

    if (this.isEdit && this.clientId) {
      const updated: Client = {
        clientId: this.clientId,
        clientName: formValue.clientName,
        clientAddress: formValue.clientAddress,
        clientPhoneNumber: formValue.clientPhoneNumber,
        clientLocation: formValue.clientLocation,
        status: formValue.status,
      };

      this.clientService.update(updated).subscribe({
        next: () => {
          this.snackBar.open('Client updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/clients']);
        },
        error: () => {
          this.submitting = false;
          this.snackBar.open('Failed to update client', 'Close', { duration: 3000 });
        }
      });
    } else {
      const newClient: Partial<Client> = {
        clientName: formValue.clientName,
        clientAddress: formValue.clientAddress,
        clientPhoneNumber: formValue.clientPhoneNumber,
        clientLocation: formValue.clientLocation,
        status: formValue.status,
      };

      this.clientService.create(newClient).subscribe({
        next: () => {
          this.snackBar.open('Client created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/clients']);
        },
        error: () => {
          this.submitting = false;
          this.snackBar.open('Failed to create client', 'Close', { duration: 3000 });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/clients']);
  }
}
