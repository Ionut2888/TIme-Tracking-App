import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, map, take, delay, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}  canActivate(): Observable<boolean> | boolean {
  // First check if token exists
  if (!this.authService.isAuthenticated()) {
    this.router.navigate(['/login']);
    return false;
  }

  // If token exists, verify it's still valid by checking current user
  return this.authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user) {
        return true;
      } else {
        // No user in the subject, force logout and redirect
        this.authService.logout(); // (optional) clear tokens, etc.
        this.router.navigate(['/login']);
        return false;
      }
    }),
    catchError((error) => {
      console.warn('Auth guard error:', error);
      // For cold start errors, we might want to show a different message
      // But for now, just redirect to login
      this.router.navigate(['/login']);
      return of(false);
    })
  );
}
}