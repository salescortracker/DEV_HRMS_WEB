import { Component } from '@angular/core';
import { HelpdeskService } from '../service/helpdesk.service';
@Component({
  selector: 'app-my-tickets',
  standalone: false,
  templateUrl: './my-tickets.component.html',
  styleUrl: './my-tickets.component.css'
})
export class MyTicketsComponent {
 userId!: number;
  companyId!: number;
  regionId!: number;
 Category: any[] = [];
 selectedCategoryId: number | null = null;
 tickets: any[] = [];
  model: any = {
    categoryId: null,
    status: '',
    fromDate: ''
  };
  filteredTicketList: any[] = [];

  // 🔹 Sorting
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  // 🔹 Pagination
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50];

constructor(private helpdeskService: HelpdeskService) {}
 ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    if (!this.userId) {
      console.error("UserId missing in sessionStorage");
      return;
    }
   
    this.loadCategory();
  
      this.loadMyTickets();
  }
 loadCategory() {
    this.helpdeskService
      .getCategory(this.companyId, this.regionId)
      .subscribe(res => {
        this.Category = res;
      });
  }
 loadMyTickets() {
    this.helpdeskService.getMyTickets(this.userId)
      .subscribe(res => {
        this.tickets = res;
        this.filteredTicketList = [...this.tickets];
      });
  }
  applyFilter(): void {
    this.filteredTicketList = this.tickets.filter(t => {

      const categoryMatch =
        !this.model.categoryId || t.categoryId == this.model.categoryId;

      const statusMatch =
        !this.model.status || t.status === this.model.status;

      const dateMatch =
        !this.model.fromDate ||
        new Date(t.createdAt).toDateString() ===
        new Date(this.model.fromDate).toDateString();

      return categoryMatch && statusMatch && dateMatch;
    });

    this.currentPage = 1;
  }

  // -------------------- SORTING --------------------
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

  // -------------------- PAGINATION --------------------
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
}
