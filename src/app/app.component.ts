import { Component, HostListener, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationStart,NavigationEnd } from '@angular/router';
import Swal from 'sweetalert2';
import { filter } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
 private inactivityTimer: any;
  private warningTimer: any;
  private isBrowser: boolean;
  private sessionExpired = false;
  private sessionCheckTimer: any;
  private readonly INACTIVITY_TIME = 20 * 60 * 1000; // 5 minutes
  private readonly WARNING_TIME = 30 * 1000; // 30 seconds

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
     this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkSession();
      });
  }
 checkSession() {
  const user = sessionStorage.getItem('UserId');

  const url = this.router.url;

  const publicRoutes = [
    '/login',
    '/Welcomedemo',
    '/job-application',
    '/offer-documents'
  ];

  const isPublic = publicRoutes.some(route =>
    url.startsWith(route)
  );

  if (!user && !isPublic && !this.sessionExpired) {
    this.logout(false);
}
}


  ngOnInit() {

    // Start timer whenever route changes (after login)
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {

        if (sessionStorage.getItem('UserId')) {
          this.resetTimer();
        }
      });
      if (this.isBrowser) {
  window.addEventListener('storage', this.handleStorageChange);
  this.sessionCheckTimer = setInterval(() => {

      const browserSessionId =
          localStorage.getItem('BrowserSessionId');


        const myBrowserSessionId =
    sessionStorage.getItem('BrowserSessionId');


      if (
  !this.sessionExpired &&
  browserSessionId &&
          myBrowserSessionId &&
          browserSessionId !== myBrowserSessionId
) {

  this.sessionExpired = true;

  Swal.fire({
    icon: 'warning',
    title: 'Session Expired',
    text: 'Another user logged in from this browser.',
    allowOutsideClick: false,
    confirmButtonText: 'Logout'
  }).then(() => {
    this.logout(false);
  });

}
    }, 2000);
}
  }
  handleStorageChange = (event: StorageEvent) => {
    debugger;

  console.log("Storage Changed");

  console.log("Old Tab Session:",
    sessionStorage.getItem('BrowserSessionId')
  );

  console.log("New LocalStorage Value:",
    event.newValue
  );


  if(event.key === 'BrowserSessionId') {

    const myBrowserSessionId =
      sessionStorage.getItem('BrowserSessionId');

    const latestBrowserSessionId =
      event.newValue;


    if(
      myBrowserSessionId &&
      latestBrowserSessionId &&
      myBrowserSessionId !== latestBrowserSessionId
    ){

      Swal.fire({
        icon:'warning',
        title:'Logged Out',
        text:'Another login happened in this browser.',
        allowOutsideClick:false
      }).then(()=>{
          this.logout(false);
      });

    }
  }
};

  // Detect user activity globally
  @HostListener('document:mousemove')
  @HostListener('document:keydown')
  @HostListener('document:click')
  resetTimer() {

    if (!sessionStorage.getItem('UserId')) return;

    this.clearTimers();

    this.inactivityTimer = setTimeout(() => {
      this.showWarningPopup();
    }, this.INACTIVITY_TIME);
  }

showWarningPopup() {

  Swal.fire({
    title: 'Session Timeout Warning',
    text: 'No action done for last 20 minutes. You will be logged out in 30 seconds.',
    icon: 'warning',
    timer: this.WARNING_TIME,
    timerProgressBar: true,
    showCancelButton: true,
    confirmButtonText: 'Logout',
    cancelButtonText: 'Stay Logged In',
    allowOutsideClick: false,
    allowEscapeKey: false
  }).then((result) => {

    if (result.isConfirmed) {
      // User clicked Logout
      this.logout();
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      // User clicked Stay Logged In
      this.resetTimer();
    }
  });

  // Auto logout after 30 seconds if no button clicked
  this.warningTimer = setTimeout(() => {
    this.logout();
  }, this.WARNING_TIME);
}

  logout(clearGlobal: boolean = true) {
    debugger;

  this.clearTimers();

  Swal.close();

  if (clearGlobal) {
    localStorage.removeItem('Token');
  }

  sessionStorage.clear();

  this.router.navigate(['/login']);
}

  clearTimers() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
    }
  }

  ngOnDestroy() {
    
    this.clearTimers();
     if (this.sessionCheckTimer) {
    clearInterval(this.sessionCheckTimer);
  }

  if (this.isBrowser) {
    window.removeEventListener('storage', this.handleStorageChange);
  }
  }
}
