import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

const user_login = true;

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonicModule,
  ],
})
export class LoginPage {
  username: string = '';
  password: string = '';
  loginError: string = '';
  submitted = false;
  loginPassword: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit() {
    this.submitted = true;
    this.loginError = '';

    if (!this.username || !this.loginPassword) {
      this.loginError = 'Vui lòng nhập đầy đủ tài khoản và mật khẩu.';
      return;
    }

    const loginData = {
      username: this.username,
      password: this.loginPassword
    };

    this.authService.login(loginData).subscribe({
      next: (res: any) => {
        alert('Đăng nhập thành công!');
        this.authService.setLoginStatus(true);
        this.authService.setUsername(this.username);
        this.router.navigate(['/tabs']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Login failed:', error);
        this.loginError = error.error?.message || 'Tài khoản hoặc mật khẩu không đúng!';
        alert(this.loginError);
      }
    });
  }

}
