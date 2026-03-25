import { Component, HostListener, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import Swal from 'sweetalert2';
import { filter } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {

  private inactivityTimer: any;
  private warningTimer: any;

  private readonly INACTIVITY_TIME = 20 * 60 * 1000;
  private readonly WARNING_TIME = 30 * 1000;

  private isBrowser: boolean;

  constructor(
    public router: Router,   // ✅ changed to public (needed in HTML)
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {

    if (!this.isBrowser) return;

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {

        if (sessionStorage.getItem('UserId')) {
          this.resetTimer();
        }
      });
  }

  // ✅ ADD THIS METHOD (CHATBOT VISIBILITY CONTROL)
  // showChatbot(): boolean {

  //   if (!this.isBrowser) return false;

  //   // show only when user logged in AND inside admin pages
  //   return !!sessionStorage.getItem('UserId') &&
  //          this.router.url.includes('admin');
  // }

  showChatbot(): boolean {
  if (!this.isBrowser) return false;

  // show chatbot for all logged-in users
  return !!sessionStorage.getItem('UserId');
}




  @HostListener('document:mousemove')
  @HostListener('document:keydown')
  @HostListener('document:click')
  resetTimer() {

    if (!this.isBrowser) return;

    if (!sessionStorage.getItem('UserId')) return;

    this.clearTimers();

    this.inactivityTimer = setTimeout(() => {
      this.showWarningPopup();
    }, this.INACTIVITY_TIME);
  }

  showWarningPopup() {

    if (!this.isBrowser) return;

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
        this.logout();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.resetTimer();
      }
    });

    this.warningTimer = setTimeout(() => {
      this.logout();
    }, this.WARNING_TIME);
  }

  logout() {

    if (!this.isBrowser) return;

    this.clearTimers();
    sessionStorage.clear();
    this.router.navigate(['/']);
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
  }
}