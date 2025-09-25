import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { KeepAliveService } from './keep-alive.service';
import { environment } from '../../environments/environment';

describe('KeepAliveService', () => {
  let service: KeepAliveService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [KeepAliveService]
    });
    service = TestBed.inject(KeepAliveService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    service.stopKeepAlive();
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make ping requests', () => {
    const pingSpy = spyOn(console, 'log');
    
    service.startKeepAlive();
    
    // Verify initial ping
    const req = httpMock.expectOne(`${environment.apiUrl}/api/health`);
    expect(req.request.method).toBe('GET');
    req.flush({ status: 'ok' });
    
    expect(pingSpy).toHaveBeenCalledWith('KeepAlive service started - pinging every 25 minutes');
  });

  it('should handle ping errors gracefully', () => {
    const warnSpy = spyOn(console, 'warn');
    
    service.startKeepAlive();
    
    const req = httpMock.expectOne(`${environment.apiUrl}/api/health`);
    req.error(new ErrorEvent('Network error'));
    
    // Should fallback to time-entries endpoint
    const fallbackReq = httpMock.expectOne(`${environment.apiUrl}/api/time-entries?pagination[limit]=1`);
    fallbackReq.error(new ErrorEvent('Network error'));
    
    // Should not crash the service
    expect(service).toBeTruthy();
  });

  it('should wake up server on demand', async () => {
    const result = service.wakeUpServer();
    
    const req = httpMock.expectOne(`${environment.apiUrl}/api/health`);
    req.flush({ status: 'ok' });
    
    expect(await result).toBe(true);
  });
});