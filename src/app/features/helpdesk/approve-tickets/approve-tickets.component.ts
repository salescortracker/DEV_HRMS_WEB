import { Component } from '@angular/core';
import { HelpdeskService } from '../service/helpdesk.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-approve-tickets',
  standalone: false,
  templateUrl: './approve-tickets.component.html',
  styleUrl: './approve-tickets.component.css'
})
export class ApproveTicketsComponent {
    userId!: number;
  companyId!: number;
  regionId!: number;

  tickets: any[] = [];
  allTickets: any[] = [];
  employees: any[] = [];
  filteredTicketList: any[] = [];
  selectedEmployeeId: string = '';
  model: any = {
    employeeId: '',
    status: '',
    fromDate: '',
    toDate: ''
  };

  // 🔹 Sorting
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  // 🔹 Pagination
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(private helpdeskService: HelpdeskService) { }

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    if (!this.userId) {
      console.error("UserId missing in sessionStorage");
      return;
    }
    this.loadManagerTickets();
    this.loadEmployees();
  }
  loadManagerTickets() {
    this.helpdeskService.getManagerTickets(this.userId)
      .subscribe(res => {
        this.tickets = res;
        this.allTickets = res;
        this.filteredTicketList = [...res];
      });
  }

  loadEmployees() {
    this.helpdeskService.getEmployeesByManager(this.userId)
      .subscribe(res => this.employees = res);
  }
  applyFilter(): void {
    this.filteredTicketList = this.allTickets.filter(t => {

      const employeeMatch =
        !this.model.employeeId || t.userId == this.model.employeeId;

      const statusMatch =
        !this.model.status || t.status === this.model.status;

      const fromDateMatch =
        !this.model.fromDate ||
        new Date(t.createdAt) >= new Date(this.model.fromDate);

      const toDateMatch =
        !this.model.toDate ||
        new Date(t.createdAt) <= new Date(this.model.toDate);

      return employeeMatch && statusMatch && fromDateMatch && toDateMatch;
    });

    this.currentPage = 1;
  }

  resetFilter(): void {
    this.model = {
      employeeId: '',
      status: '',
      fromDate: '',
      toDate: ''
    };
    this.filteredTicketList = [...this.allTickets];
    this.currentPage = 1;
  }

  // ================= SORTING =================
  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  getSortedTickets(): any[] {
    let data = [...this.filteredTicketList];

    if (this.sortColumn) {
      data.sort((a, b) => {
        const valA = (a[this.sortColumn!] ?? '').toString().toLowerCase();
        const valB = (b[this.sortColumn!] ?? '').toString().toLowerCase();

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }

  // ================= PAGINATION =================
  paginatedTickets(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.getSortedTickets().slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTicketList.length / this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  // ================= CHECKBOX =================
  toggleAll(event: any) {
    const checked = event.target.checked;
    this.paginatedTickets().forEach(t => {
      if (t.status === 'Open') {
        t.selected = checked;
      }
    });
  }


  // ================= ACTIONS =================
  approveSelected() {
    this.confirmAction("approve", "Approved");
  }

  rejectSelected() {
    this.confirmAction("reject", "Rejected");
  }

  private confirmAction(action: string, status: string) {
    const selectedTickets = this.filteredTicketList.filter(
      t => t.selected && t.status === 'Open'
    );

    if (selectedTickets.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No tickets selected',
        text: 'Please select only Open tickets.'
      });
      return;
    }

    Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to ${action} ${selectedTickets.length} ticket(s)?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: action === 'approve' ? '#198754' : '#dc3545',
      confirmButtonText: `Yes, ${action}!`,
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.updateStatus(status);
      }
    });
  }

  private updateStatus(status: string) {
    const selectedTickets = this.filteredTicketList.filter(t => t.selected);

    const requests = selectedTickets.map(t => {
      const payload = {
        ticketId: t.ticketId,
        status: status,
        managerComments: t.managerComments,
        managerId: this.userId
      };
      return this.helpdeskService.updateTicketStatus(payload);
    });

    Promise.all(requests.map(r => r.toPromise()))
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Selected tickets ${status.toLowerCase()} successfully`
        });
        this.loadManagerTickets();
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Something went wrong while updating tickets.'
        });
      });
  }
}
