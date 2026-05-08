import { Component, OnInit } from '@angular/core';
import { RecruitmentService } from '../service/recruitment.service';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
export interface JobApplication {
  applicationId: number;
  candidateName: string;
  email: string;
  phone: string;
  jobTitle: string;
  experienceYears: number;
  technology: string;
  resumeUrl: string;
  status: string;
  appliedDate: Date;
}

@Component({
  selector: 'app-application-resumes',
  standalone: false,
  templateUrl: './application-resumes.component.html',
  styleUrl: './application-resumes.component.css'
})
export class ApplicationResumesComponent implements OnInit {
  applications: JobApplication[] = [];
  filteredData: JobApplication[] = [];

  searchText: string = '';

  // 🔹 Sorting
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // 🔹 Pagination
  currentPage = 1;
  pageSize = 5;
  pageSizes = [5, 10, 20];
  totalPages = 1;

  constructor(private service: RecruitmentService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  // ===== LOAD DATA =====
  loadApplications() {
    this.service.getJobApplications()
      .subscribe(res => {
        this.applications = res;
        this.applyFilters();
      });
  }

  // ===== FILTER + SORT =====
  applyFilters() {

    this.filteredData = [...this.applications];

    // Search
    if (this.searchText) {

      const search = this.searchText.toLowerCase();

      this.filteredData = this.filteredData.filter(x =>
        x.candidateName?.toLowerCase().includes(search) ||
        x.phone?.toLowerCase().includes(search) ||
        x.technology?.toLowerCase().includes(search)
      );
    }

  // ===== SORT =====
  if (this.sortColumn) {

      this.filteredData.sort((a: any, b: any) => {

        let valA = a[this.sortColumn];
        let valB = b[this.sortColumn];

        if (valA == null) return -1;
        if (valB == null) return 1;

        if (typeof valA === 'string') {

          return this.sortDirection === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        return this.sortDirection === 'asc'
          ? valA - valB
          : valB - valA;
      });
    }

    this.totalPages =
      Math.ceil(this.filteredData.length / this.pageSize);

    this.currentPage = 1;
  }
  sort(column: string) {

    if (this.sortColumn === column) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    } else {

      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.applyFilters();
  }

  // ===== PAGINATION =====
  pagedData() {

    const start =
      (this.currentPage - 1) * this.pageSize;

    return this.filteredData.slice(
      start,
      start + this.pageSize
    );
  }

  changePage(page: number) {

    if (page < 1 || page > this.totalPages)
      return;

    this.currentPage = page;
  }

  changePageSize() {

    this.currentPage = 1;

    this.totalPages =
      Math.ceil(this.filteredData.length / this.pageSize);
  }

 downloadResume(path: string) {

  if (!path) return;

  const baseUrl = environment.apiUrl.replace('/api', '');

  const cleanBase = baseUrl.endsWith('/')
    ? baseUrl.slice(0, -1)
    : baseUrl;

  const cleanPath = path.startsWith('/')
    ? path.substring(1)
    : path;

  const url = `${cleanBase}/${cleanPath}`;

  window.open(url, '_blank');
}

}
