import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Department } from '../models';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private http = inject(HttpClient);

  getAll(): Observable<Department[]> {
    return this.http.get<Department[]>(`${API_BASE_URL}/api/department`);
  }

  getById(id: number): Observable<Department> {
    return this.http.get<Department>(`${API_BASE_URL}/api/department/${id}`);
  }

  create(department: Partial<Department>): Observable<Department> {
    return this.http.post<Department>(`${API_BASE_URL}/api/department`, department);
  }

  update(department: Department): Observable<Department> {
    return this.http.put<Department>(`${API_BASE_URL}/api/department/${department.departmentId}`, department);
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete(`${API_BASE_URL}/api/department/${id}`, { responseType: 'text' }).pipe(
      map(() => true)
    );
  }
}
