import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  private userId = new BehaviorSubject<string | null>(null);
  userId$ = this.userId.asObservable();

  private avatarUrlSubject = new BehaviorSubject<string | null>(localStorage.getItem('user_avatar'));
  avatarUrl$ = this.avatarUrlSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedLogin = localStorage.getItem('loggedIn') === 'true';
    this.loggedIn.next(savedLogin);

    this.initializeUserInfo(); // Load thông tin khi service khởi tạo
  }

  initializeUserInfo(): void {
    const savedUserId = localStorage.getItem('userId');
    const savedUsername = localStorage.getItem('username');
    const savedAvatar = localStorage.getItem('user_avatar');

    if (savedUserId) this.userId.next(savedUserId);
    if (savedUsername) this.username.next(savedUsername);
    if (savedAvatar) this.avatarUrlSubject.next(savedAvatar);
  }

  setAvatarUrl(url: string | null): void {
    if (url) {
      localStorage.setItem('user_avatar', url);
    } else {
      localStorage.removeItem('user_avatar');
    }
    this.avatarUrlSubject.next(url);
  }

  getIsLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  getUsername(): string | null {
    return this.username.value;
  }

  getUserId(): string | null {
    return this.userId.value;
  }

  setUserInfo(userId: string, username: string): void {
    this.userId.next(userId);
    this.username.next(username);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
  }

  refreshUserInfoFromStorage(): void {
    const userId = localStorage.getItem('userId') || '';
    const username = localStorage.getItem('username') || '';
    const avatar = localStorage.getItem('user_avatar') || '';

    this.setUserInfo(userId, username);
    this.setAvatarUrl(avatar);
  }

  register(data: { username: string; email: string; password: string }): Observable<any> {
    const body = new URLSearchParams();
    body.set('user_name', data.username);
    body.set('user_password', data.password);
    body.set('user_email', data.email);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    });

    return this.http.post(`${this.apiUrl}user/signin`, body.toString(), { headers });
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    const body = new URLSearchParams();
    body.set('username', credentials.username);
    body.set('password', credentials.password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    });

    return this.http.post(`${this.apiUrl}token`, body.toString(), { headers }).pipe(
      tap((response: any) => {
        if (response && response.access_token) {
          localStorage.setItem('loggedIn', 'true');
          localStorage.setItem('access_token', response.access_token);
          this.loggedIn.next(true);

          // Gọi API /users/me để lấy thông tin người dùng chi tiết
          const authHeaders = new HttpHeaders({
            'Authorization': `Bearer ${response.access_token}`,
            'Accept': 'application/json'
          });

          this.http.get<any>(`${this.apiUrl}users/me`, { headers: authHeaders }).subscribe({
            next: (res) => {
              localStorage.setItem('userId', res.user_id);
              localStorage.setItem('username', res.username);
              localStorage.setItem('user_email', res.user_email || '');
              localStorage.setItem('user_phone', res.user_phone || '');
              localStorage.setItem('user_avatar', res.avatar || '');

              this.setUserInfo(res.user_id, res.username);
              this.setAvatarUrl(res.avatar || null);
            },
            error: (err) => {
              console.error('Lỗi khi gọi /users/me:', err);
            }
          });
        }
      })
    );
  }

  logout(): void {
  // Xóa tất cả các key liên quan
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('username');
  localStorage.removeItem('access_token');
  localStorage.removeItem('userId');
  localStorage.removeItem('user_avatar');
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_phone');
  localStorage.removeItem('displayName');

  // Reset các BehaviorSubject về null/false
  this.loggedIn.next(false);
  this.username.next(null);
  this.userId.next(null);
  this.avatarUrlSubject.next(null);
}

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getAccessToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
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
