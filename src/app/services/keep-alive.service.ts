import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KeepAliveService {
  private pingInterval?: number;
  private readonly PING_INTERVAL = 25 * 60 * 1000; // 25 minutes in milliseconds
  private readonly PING_ENDPOINT = `${environment.apiUrl}/api/health`;

  constructor(private http: HttpClient) {}

  /**
   * Start the keep-alive ping service
   */
  startKeepAlive(): void {
    // Clear any existing interval
    this.stopKeepAlive();

    // Initial ping
    this.ping();

    // Set up recurring pings
    this.pingInterval = window.setInterval(() => {
      this.ping();
    }, this.PING_INTERVAL);

    console.log('KeepAlive service started - pinging every 25 minutes');
  }

  /**
   * Stop the keep-alive ping service
   */
  stopKeepAlive(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = undefined;
      console.log('KeepAlive service stopped');
    }
  }

  /**
   * Perform a single ping to keep the server awake
   */
  private ping(): void {
    const timestamp = new Date().toISOString();
    
    // Try the health endpoint first, fallback to a simple API call
    this.http.get(this.PING_ENDPOINT).pipe(
      catchError(() => {
        // If health endpoint doesn't exist, try a simple API call
        return this.http.get(`${environment.apiUrl}/api/time-entries?pagination[limit]=1`).pipe(
          catchError(() => of(null))
        );
      })
    ).subscribe({
      next: () => {
        console.log(`[${timestamp}] Keep-alive ping successful`);
      },
      error: (error) => {
        console.warn(`[${timestamp}] Keep-alive ping failed:`, error?.message || 'Unknown error');
      }
    });
  }

  /**
   * Manual ping method that can be called when the app detects a sleeping server
   */
  wakeUpServer(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log('Attempting to wake up server...');
      
      this.http.get(this.PING_ENDPOINT).pipe(
        catchError(() => {
          // Fallback to any available endpoint
          return this.http.get(`${environment.apiUrl}/api/time-entries?pagination[limit]=1`).pipe(
            catchError(() => of(null))
          );
        })
      ).subscribe({
        next: () => {
          console.log('Server wake-up successful');
          resolve(true);
        },
        error: () => {
          console.warn('Server wake-up failed');
          resolve(false);
        }
      });
    });
  }
}