import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { AuthService } from './services/auth.service';
import { KeepAliveService } from './services/keep-alive.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidenavComponent, ChatbotComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'tt-project';
  authService = inject(AuthService);
  private keepAliveService = inject(KeepAliveService);

  ngOnInit(): void {
    // Start the keep-alive service when the app initializes
    this.keepAliveService.startKeepAlive();
    console.log('Time Tracking App initialized with keep-alive service');
  }
}
