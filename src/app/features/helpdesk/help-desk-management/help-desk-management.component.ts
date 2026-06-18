import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-help-desk-management',
  standalone: false,
  templateUrl: './help-desk-management.component.html',
  styleUrl: './help-desk-management.component.css'
})
export class HelpDeskManagementComponent implements OnInit {

  canViewRaiseTicket = false;
  canViewMyTickets = false;
  canViewTicketApproval = false;
  canViewTicketReports = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadTabPermissions();

    // Optional default navigation
    // if (this.canViewRaiseTicket) {
    //   this.router.navigate(['/help-desk/raise-ticket']);
    // }
    // else if (this.canViewMyTickets) {
    //   this.router.navigate(['/help-desk/my-tickets']);
    // }
    // else if (this.canViewTicketApproval) {
    //   this.router.navigate(['/help-desk/ticket-approval']);
    // }
    // else if (this.canViewTicketReports) {
    //   this.router.navigate(['/help-desk/ticket-reports']);
    // }
  }

  loadTabPermissions(): void {

    const menus = JSON.parse(sessionStorage.getItem('Menus') || '[]');

    const raiseTicket = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'raise ticket'
    );

    const myTickets = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'my tickets'
    );

    const ticketApproval = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'ticket approval'
    );

    const ticketReports = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'ticket reports'
    );

    this.canViewRaiseTicket = raiseTicket?.canView ?? false;
    this.canViewMyTickets = myTickets?.canView ?? false;
    this.canViewTicketApproval = ticketApproval?.canView ?? false;
    this.canViewTicketReports = ticketReports?.canView ?? false;
  }
}
