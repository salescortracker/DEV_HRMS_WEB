import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../admin/servies/admin.service';
import Swal from 'sweetalert2';
interface NewsItem {
  Title: string;
  Category: string;
  Description: string;
  Date: Date;
  departmentId: number;
}
@Component({
  selector: 'app-comany-news',
  standalone: false,
  templateUrl: './comany-news.component.html',
  styleUrl: './comany-news.component.css'
})
export class ComanyNewsComponent {
  usersList: any[] = [];
  newsList: NewsItem[] = []
  filteredNewsList: NewsItem[] = []

  searchCategory: string = ''
  searchDate: string = ''

  userDepartmentId: number = 0
  userId: number = 0
  categories: any[] = [];
  userCompanyId: number = 0;
  userRegionId: number = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {

    this.userId = Number(sessionStorage.getItem("UserId"))
    this.userDepartmentId = Number(sessionStorage.getItem("DepartmentId"))
    this.userCompanyId = Number(sessionStorage.getItem("CompanyId"));
    this.userRegionId = Number(sessionStorage.getItem("RegionId"));

    this.getNews()
 this.loadUsers();
 this.loadCategories();
  }
  loadUsers() {
  this.adminService.getAllUsers().subscribe({
    next: (res: any[]) => {
      this.usersList = res;
      console.log('Users List:', this.usersList);
    },
    error: (err) => {
      console.error('Error loading users', err);
    }
  });
}
loadCategories(): void {

  const companyId = Number(sessionStorage.getItem("CompanyId"));
  const regionId = Number(sessionStorage.getItem("RegionId"));

  this.adminService.getCategoriesByCompanyRegion(companyId, regionId).subscribe({
    next: (res: any) => {
      console.log("Categories:", res);
      this.categories = res;
    },
    error: () => Swal.fire('Error', 'Failed to load categories', 'error')
  });

}
  // -----------------------------
  // Get News
  // -----------------------------
  getNews() {

    this.adminService.getTodayNews(this.userId).subscribe((res: any[]) => {

      console.log("API Response:", res)

      this.newsList = res.map(n => ({
        Title: n.title,
        Category: n.category,
        Description: n.description,
        Date: new Date(n.postedDate),
        departmentId: Number(n.departmentId)
      }))

      // Show today's news automatically
      this.filterTodayNews()

    })

  }

  // -----------------------------
  // Show Today's News
  // -----------------------------
  filterTodayNews() {

  const today = new Date().toDateString();

  this.filteredNewsList = this.newsList.filter(n => {

    const newsDate = new Date(n.Date).toDateString();

    return (
      n.departmentId === this.userDepartmentId &&
      newsDate === today
    );

  });

}

  // -----------------------------
  // Apply Filter
  // -----------------------------
 applyFilter() {

  this.filteredNewsList = this.newsList.filter(n => {

    const newsDate = new Date(n.Date).toDateString();

    const matchDept = n.departmentId === this.userDepartmentId;

    const matchCategory = this.searchCategory
      ? n.Category === this.searchCategory
      : true;

    const matchDate = this.searchDate
      ? new Date(this.searchDate).toDateString() === newsDate
      : true;

    return matchDept && matchCategory && matchDate;

  });

}
 }
