import { Component, OnInit } from '@angular/core';
import { TabLabels } from '../tab-labels'; // đường dẫn có thể là './tab-labels' nếu ở cùng thư mục
import { AuthService } from '../service/auth.service';
import { BaseLayoutComponent } from '../base-layout/base-layout.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    BaseLayoutComponent,
    IonicModule,
    FormsModule,
  ]
})

export class Tab2Page implements OnInit {
  tab1 = TabLabels.tab1;
  tab2 = TabLabels.tab2;
  tab3 = TabLabels.tab3;
  token: string | null = null;
  

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.token = this.authService.getAccessToken();
    console.log('Token:', this.token);
  }

}
