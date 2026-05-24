import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Employee } from '../models/employee.model';
import { API_BASE_URL } from '../../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http = inject(HttpClient);

  getAll(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${API_BASE_URL}/api/employee`);
  }

  getById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${API_BASE_URL}/api/employee/${id}`);
  }

  create(employee: Partial<Employee>): Observable<Employee> {
    return this.http.post<Employee>(`${API_BASE_URL}/api/employee`, employee);
  }

  update(employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${API_BASE_URL}/api/employee/${employee.employeeId}`, employee);
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete(`${API_BASE_URL}/api/employee/${id}`, { responseType: 'text' }).pipe(
      map(() => true)
    );
  }
}
