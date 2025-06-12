import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    FormsModule,
    CommonModule
  ]
})
export class ProfilePage implements OnInit {
  isEditing = false;

  user = {
    username: '',
    id: '',
    phone: '',
    email: '',
    avatar: '',
    displayName: '',
  };

  avatarPreview: string | ArrayBuffer | null = null;
  selectedAvatarFile: File | null = null;

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit() {
    this.fetchUserInfo();
  }

  fetchUserInfo() {
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>('https://mymaps-app.onrender.com/users/me', { headers }).subscribe({
      next: (res) => {
        // Gán dữ liệu trả về
        this.user.id = res.user_id;
        this.user.username = res.username;
        this.user.displayName = res.username;
        this.user.email = res.user_email || '';
        this.user.phone = res.user_phone || '';
        this.user.avatar = res.avatar || '';

        this.avatarPreview = this.user.avatar;

        // Đồng bộ với AuthService
        this.authService.setUserInfo(res.user_id, res.username);
        this.authService.setAvatarUrl(this.user.avatar);

        // Lưu localStorage
        localStorage.setItem('username', this.user.username);
        localStorage.setItem('userId', this.user.id);
        localStorage.setItem('displayName', this.user.username);
        localStorage.setItem('user_email', this.user.email);
        localStorage.setItem('user_phone', this.user.phone);
        localStorage.setItem('user_avatar', this.user.avatar);
      },
      error: (err) => {
        console.error('Lỗi lấy thông tin người dùng:', err);
      }
    });
  }

  toggleEdit() {
    if (this.isEditing) {
      this.saveProfile();
    }
    this.isEditing = !this.isEditing;
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedAvatarFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
  const headers = this.authService.getAuthHeaders();
  const updatedData = {
    user_email: this.user.email,
    user_phone: this.user.phone,
    avatar: this.user.avatar, // có thể thêm nếu backend hỗ trợ
  };

  this.http.put('https://mymaps-app.onrender.com/users/me', updatedData, { headers }).subscribe({
    next: (res) => {
      alert('Cập nhật thành công');
      this.isEditing = false;

      // Lưu localStorage
      localStorage.setItem('user_email', this.user.email);
      localStorage.setItem('user_phone', this.user.phone);
      localStorage.setItem('user_avatar', this.user.avatar);
    },
    error: (err) => {
      console.error('Lỗi cập nhật thông tin:', err);
      alert('Cập nhật thất bại');
    }
  });
}

}
