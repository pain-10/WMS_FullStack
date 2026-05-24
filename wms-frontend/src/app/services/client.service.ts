import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Client } from '../models';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);

  getAll(): Observable<Client[]> {
    return this.http.get<Client[]>(`${API_BASE_URL}/api/client`);
  }

  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${API_BASE_URL}/api/client/${id}`);
  }

  create(client: Partial<Client>): Observable<Client> {
    return this.http.post<Client>(`${API_BASE_URL}/api/client`, {
      clientName: client.clientName,
      clientAddress: client.clientAddress || '',
      clientPhoneNumber: client.clientPhoneNumber || '',
      clientLocation: client.clientLocation || '',
      status: client.status ?? true,
    });
  }

  update(client: Client): Observable<Client> {
    return this.http.put<Client>(`${API_BASE_URL}/api/client/${client.clientId}`, {
      clientName: client.clientName,
      clientAddress: client.clientAddress || '',
      clientPhoneNumber: client.clientPhoneNumber || '',
      clientLocation: client.clientLocation || '',
      status: client.status,
    });
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete(`${API_BASE_URL}/api/client/${id}`, { responseType: 'text' }).pipe(
      map(() => true)
    );
  }
}
