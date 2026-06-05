import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../admin/servies/admin.service';


@Component({
  selector: 'app-superadmin-usersfulldetails',
  standalone: false,
  templateUrl: './superadmin-usersfulldetails.component.html',
  styleUrl: './superadmin-usersfulldetails.component.css'
})
export class SuperadminUsersfulldetailsComponent implements OnInit {

  collapsed = false;

  submenus: any[] = [];

  subscriptionUsers: any[] = [];

  paginatedUsers: any[] = [];

  today: Date = new Date();

  // pagination
  pageSize = 5;
  currentPage = 1;
  totalPages = 0;
  totalPagesArray: number[] = [];

  constructor(
    private adminService: AdminService
  ) { }

  ngOnInit(): void {

    this.loadSubscriptionUsers();

  }

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  onMenuSelected(menu: any) {
    this.submenus = menu;
  }

  loadSubscriptionUsers() {

    this.adminService
      .getALLSubcriptionUsers()
      .subscribe({

        next: (res: any) => {

          console.log('getALLSubcriptionUsers',res);

          this.subscriptionUsers = res;

          this.totalPages = Math.ceil(
            this.subscriptionUsers.length / this.pageSize
          );

          this.totalPagesArray = Array(this.totalPages)
            .fill(0)
            .map((x, i) => i + 1);

          this.updatePagination();

        },

        error: (err) => {
          console.log(err);
        }

      });

  }

  updatePagination() {

    const start = (this.currentPage - 1) * this.pageSize;

    const end = start + this.pageSize;

    this.paginatedUsers =
      this.subscriptionUsers.slice(start, end);

  }

  changePage(page: number) {

    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;

    this.updatePagination();

  }
}
