import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { Platform, AlertController, IonRouterOutlet } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Location } from '@angular/common';
import { App } from '@capacitor/app';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,

})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  appPages: any[] = [];

  @ViewChild(IonRouterOutlet, { static: true }) routerOutlet!: IonRouterOutlet;

  constructor(
    public authService: AuthService,
    private platform: Platform,
    private alertController: AlertController,
    private location: Location,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private menu: MenuController,
  ) {
    this.initializeApp();
    this.backButtonEvent();
  }

  onMenuClosed() {
  const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      activeElement.blur();
    }
  }


  // Hiển thị thông báo BackButton
  initializeApp() {
    this.platform.ready().then(() => {
      if(this.platform.is('capacitor')) {
        StatusBar.setStyle({ style : Style.Default }).catch(() => {});
        SplashScreen.hide().catch(() => {});
      }
    });
  }

  backButtonEvent() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      if (!this.routerOutlet.canGoBack) {
        this.backButtonAlert();
      } else {
        this.location.back();
      }
    })
  }

  async backButtonAlert() {
    const alert = await this.alertController.create({
      message: 'Bạn muốn thoát khỏi ứng dụng?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Thoát',
          handler: () => {
            App.exitApp();
          },
        },
      ],
    });

    await alert.present();
  }

  // Update Menu khi đăng nhập thành công
  updateMenu() {
    console.log('Cập nhật Menu Bar:', this.isLoggedIn);
    this.appPages = this.isLoggedIn
      ? [
          { title: 'Hồ sơ', url: 'profile', icon: 'person'},
          { title: 'Cài đặt', url: 'profile', icon: 'person'},
          { title: 'Đăng xuất', url: '', icon: 'log-out', action: 'logout'},
        ]
      : [
          { title: 'Đăng ký', url: 'register', icon: 'person-add'},
          { title: 'Đăng nhập', url: 'login', icon: 'log-in'}
        ];
  }

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe((status) => {
      console.log('Status thay đổi:', status);
      this.isLoggedIn = status;
      this.updateMenu();
      this.cdr.detectChanges();
    });
  }

  trackByFn(index: number, item: any): any {
    return item.url
  }

    logout() {
    this.menu.close().then(() => {
      this.authService.logout();
      this.router.navigate(['/login']);
    });
  }
}
