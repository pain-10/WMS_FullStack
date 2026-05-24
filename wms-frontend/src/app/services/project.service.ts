import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Project, ProjectAllocation } from '../models';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private http = inject(HttpClient);

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(`${API_BASE_URL}/api/project`);
  }

  getById(id: number): Observable<Project> {
    return this.http.get<Project>(`${API_BASE_URL}/api/project/${id}`);
  }

  getByEmployee(employeeId: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${API_BASE_URL}/api/project/employee/${employeeId}`);
  }

  create(project: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(`${API_BASE_URL}/api/project`, {
      projectName: project.projectName,
      description: project.description || '',
      startDate: project.startDate,
      endDate: project.endDate,
      clientId: project.clientId,
      status: project.status || 'Active',
    });
  }

  update(project: Project): Observable<Project> {
    return this.http.put<Project>(`${API_BASE_URL}/api/project/${project.projectId}`, {
      projectName: project.projectName,
      description: project.description || '',
      startDate: project.startDate,
      endDate: project.endDate,
      clientId: project.clientId,
      status: project.status,
    });
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete(`${API_BASE_URL}/api/project/${id}`, { responseType: 'text' }).pipe(
      map(() => true)
    );
  }

  removeAllocation(id: number): Observable<boolean> {
    return this.http.delete(`${API_BASE_URL}/api/allocation/${id}`, { responseType: 'text' }).pipe(
      map(() => true)
    );
  }

  getAllocations(): Observable<ProjectAllocation[]> {
    return this.http.get<any[]>(`${API_BASE_URL}/api/allocation`).pipe(
      map(items => items.map(a => ({
        allocationId: a.allocationId,
        empId: a.employeeId,
        projectId: a.projectId,
        assignedOn: a.assignedOn,
        createDate: a.createDate,
        createdBy: a.createdBy,
        status: a.status,
        updatedBy: a.updatedBy,
        updatedDate: a.updatedDate,
        employeeName: a.employeeName || '',
        projectName: a.projectName || '',
      })))
    );
  }

  allocateEmployee(allocation: Partial<ProjectAllocation>): Observable<ProjectAllocation> {
    return this.http.post<any>(`${API_BASE_URL}/api/allocation`, {
      employeeId: allocation.empId,
      projectId: allocation.projectId,
    }).pipe(
      map(a => ({
        allocationId: a.allocationId,
        empId: a.employeeId,
        projectId: a.projectId,
        assignedOn: a.assignedOn,
        createDate: a.createDate,
        createdBy: a.createdBy,
        status: a.status,
        updatedBy: a.updatedBy,
        updatedDate: a.updatedDate,
        employeeName: a.employeeName || '',
        projectName: a.projectName || '',
      }))
    );
  }
}
