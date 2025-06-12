import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://mymaps-app.onrender.com/';

  private loggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.loggedIn.asObservable();

  private username = new BehaviorSubject<string | null>(null);
  username$ = this.username.asObservable();

  constructor(private http: HttpClient) {
    const savedLogin = localStorage.getItem('loggedIn') === 'true';
    this.loggedIn.next(savedLogin);

    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      this.username.next(savedUsername);
    }
  }

  getIsLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  getUsername(): string | null {
    return this.username.value;
  }

  register(data: { username: string; email: string; password: string }): Observable<any> {
    const payload = {
      user_name: data.username,
      email: data.email,
      user_password: data.password
    };
    return this.http.post(`${this.apiUrl}/register`, payload);
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    const payload = {
      user_name: credentials.username,
      user_password: credentials.password
    };
    return this.http.post(`${this.apiUrl}/login`, payload).pipe(
      tap((response: any) => {
        if (response && response.success && response.message === 'Đăng nhập thành công!') {
          this.setLoginStatus(true);
          this.setUsername(credentials.username);
        }
      })
    );
  }

  logout(): void {
    this.setLoginStatus(false);
    this.setUsername(null);
  }

  setLoginStatus(status: boolean): void {
    this.loggedIn.next(status);
    localStorage.setItem('loggedIn', status.toString());
  }

  setUsername(username: string | null): void {
    this.username.next(username);
    if (username) {
      localStorage.setItem('username', username);
    } else {
      localStorage.removeItem('username');
    }
  }
}
