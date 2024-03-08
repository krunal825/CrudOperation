import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
private apiUrl = 'http://localhost:3000/users';  

  constructor(private http: HttpClient) { }

 
 
  createUser(userData: any): Observable<any> {
    return this.http.post(this.apiUrl, userData).pipe(
      map(response => {
        console.log('User created successfully:', response);
        return response;
      }),
     );
  }
  
  getUserById(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}`);
  }

  // updateUser(userId: string, userData: any): Observable<any> {
  //   return this.http.put<any>(`${this.apiUrl}/${userId}`, userData);
  // }
  
  // getStatesForCountry(country: string): string[] {
  //   throw new Error('Method not implemented.');
  // }

}
