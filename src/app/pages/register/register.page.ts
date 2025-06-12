import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, RouterModule] 
})
export class RegisterPage {
  username: string = '';
  email: string = '';
  password: string = '';
  password2: string = '';
  submitted = false;
  registerError: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.submitted = true;
    this.registerError = '';

    if (
      this.username &&
      this.isValidEmail(this.email) &&
      this.password.length >= 8 &&
      this.password === this.password2
    ) {

      const payload = {
        username: this.username,
        email: this.email,
        password: this.password
      };

      this.authService.register({
        username: this.username,
        email: this.email,
        password: this.password
      }).subscribe({
        next: () => {
          alert('Đăng ký tài khoản thành công!');
          this.router.navigate(['/login']);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 400) {
            this.registerError = err.error?.message || 'Tài khoản đã tồn tại hoặc dữ liệu không hợp lệ.';
          } else {
            this.registerError = 'Lỗi máy chủ hoặc kết nối. Vui lòng thử lại.';
          }
          alert(this.registerError);
        }
      });
    } else {
      this.registerError = 'Vui lòng kiểm tra lại thông tin nhập vào.';
      alert(this.registerError);
    }
  }

  isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  }
}
