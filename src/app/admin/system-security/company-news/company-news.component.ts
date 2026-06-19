import { Component } from '@angular/core';
import { AdminService, Department, News } from '../../servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-company-news',
  standalone: false,
  templateUrl:'./company-news.component.html',
  styleUrl: './company-news.component.css'
})
export class CompanyNewsComponent {
  companies: any[] = [];
  regions: any[] = [];
  userId!: number;
  companyId!: number;
  regionId!: number;
  categories: any[] = [];
  filteredRegions: any[] = [];


  departments: Department[] = [];
  departmentIds: number[] = [];
  showDeptDropdown: boolean = false;

  // News
  newsList: News[] = [];
  news: News = this.resetNews();
  isEditMode: boolean = false;
  editIndex: number | null = null;

  // Filters
  searchText: string = '';
  searchCategory: string = '';
  startDate: string = '';
  endDate: string = '';
  paginatedNews: News[] = [];

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  pageSizeOptions: number[] = [5, 10, 20];
  filteredDepartments: Department[] = [];

  constructor(private adminService: AdminService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    if (!this.userId) return;

    this.loadCompanies();
    this.loadRegions();
    this.loadDepartments();
    this.getNewsList();
    this.loadCategories();
  }
  ngOnChanges() {
  this.setPagination();
}
  loadCompanies(): void {
    this.adminService.getCompanies(null, this.userId).subscribe({
      next: (res: any) => {
        this.companies = res;
      },
      error: () => Swal.fire('Error', 'Failed to load companies', 'error')
    });
  }

loadRegions(): void {

  this.adminService.getRegions(null, this.userId).subscribe({

    next: (res: any) => {

      this.regions = (res || []).map((r: any) => ({

        regionId: Number(r.regionID || r.regionId),

        regionName: r.regionName,

        companyID: Number(r.companyID || r.companyId)

      }));

      console.log("Regions:", this.regions);
    },

    error: () =>
      Swal.fire('Error', 'Failed to load regions', 'error')

  });
}
  onCompanyChange(): void {
    this.news.RegionId = null;

    this.filteredRegions = this.news.CompanyId
      ? this.regions.filter(r => Number(r.companyID) === Number(this.news.CompanyId))
      : [];
      this.filteredDepartments = [];
  }
  onRegionChange(): void {

  this.news.departmentIds = [];

  this.filteredDepartments = this.departments.filter(
    (d: any) =>
      Number(d.companyId) === Number(this.news.CompanyId) &&
      Number(d.regionId) === Number(this.news.RegionId)
  );

  console.log('Filtered Departments', this.filteredDepartments);
}
  loadCategories(): void {
    this.adminService.getCompanyNewsCategoryList(this.userId).subscribe({
      next: (res: any) => {
        console.log("Categories:", res);
        this.categories = res;
      },
      error: () => Swal.fire('Error', 'Failed to load categories', 'error')
    });
  }
  getDepartmentName(departmentIds?: number[] | null): string {
  if (!departmentIds || departmentIds.length === 0) return '-';

  const names = this.departments
    .filter(d => departmentIds.includes(d.departmentId))
    .map(d => d.departmentName);

  return names.join(', ');
}
  // -----------------------------
  // Load Departments
  // -----------------------------
  loadDepartments() {
    this.spinner.show();
    this.adminService.getDepartments(this.userId).subscribe({
      next: (data: any) => {
        // Only active departments
        this.departments = data.data.data.filter((d: any) => d.isActive);
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error loading departments', err);
        Swal.fire('Error', 'Failed to load departments', 'error');
        this.spinner.hide();
      }
    });
  }
  onDepartmentChange(event: any, id: number) {
  if (!this.news.departmentIds) {
    this.news.departmentIds = [];
  }

  if (event.target.checked) {
    this.news.departmentIds.push(id);
  } else {
    this.news.departmentIds =
      this.news.departmentIds.filter(x => x !== id);
  }
}

toggleAllDepartments(event: any) {
  if (event.target.checked) {
    this.news.departmentIds = this.filteredDepartments.map(d => d.departmentId);
  } else {
    this.news.departmentIds = [];
  }
}

  // -----------------------------
  // Load News
  // -----------------------------
  getNewsList() {
    this.spinner.show();
    this.adminService.getAllNews(this.userId).subscribe({
      next: (res) => {
        console.log("API Response:", res);
        this.newsList = res.map((item: any) => ({

          NewsId: Number(item.newsId),

          CompanyId: item.companyId
            ? Number(item.companyId)
            : null,

          RegionId: item.regionId
            ? Number(item.regionId)
            : null,

          departmentIds: item.departmentIds?.length
            ? item.departmentIds
            : item.departmentId
              ? [item.departmentId]
              : [],

          Title: item.title,

          userId: item.userId,

          Category: item.category ?? '',

          Description: item.description,

          Date: item.postedDate
            ? new Date(item.postedDate)
            : new Date(),

          PublishedDate: item.postedDate
            ? new Date(item.postedDate).toISOString().split('T')[0]
            : '',

          Attachment: null,

          // ✅ IMPORTANT
          AttachmentName:
            item.attachmentName ||
            item.AttachmentName ||
            '',

          AttachmentUrl:
            item.attachmentUrl ||
            item.AttachmentUrl ||
            ''

        }));
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error fetching news list', err);
        Swal.fire('Error', 'Failed to load news', 'error');
        this.spinner.hide();
      }
    });
    this.currentPage = 1;   
      this.setPagination();   

      this.spinner.hide();
  }

  // -----------------------------
  // Reset form
  // -----------------------------
  resetNews(): News {
    return {
      NewsId: undefined,
      userId: this.userId,

      CompanyId: this.companyId,
      RegionId: null,

      departmentIds: [],

      Title: '',
      Category: '',
      Description: '',

      Date: new Date(),
      PublishedDate: new Date().toISOString().split('T')[0],

      Attachment: null,
      AttachmentName: '',
      AttachmentUrl: ''
    };
  }

  resetForm() {
    this.news = this.resetNews();
    this.isEditMode = false;
    this.editIndex = null;
  }

  // -----------------------------
  // File Selection
  // -----------------------------
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) this.news.Attachment = file;
  }

  // -----------------------------
  // Add / Update News
  // -----------------------------
onSubmit() {
   if (
    !this.news.CompanyId ||
    !this.news.RegionId ||
    !this.news.Title?.trim() ||
    !this.news.departmentIds.length ||
    !this.news.PublishedDate ||
    !this.news.Category ||
    !this.news.Description?.trim()
  ) {
    Swal.fire(
      'Validation',
      'Please fill all mandatory fields',
      'warning'
    );
    return;
  }

  const formData = new FormData();

  formData.append('NewsId', String(this.news.NewsId ?? 0));

  formData.append('UserId', String(this.userId));

  formData.append(
    'CompanyId',
    String(this.news.CompanyId ?? '')
  );

  formData.append(
    'RegionId',
    String(this.news.RegionId ?? '')
  );

  formData.append('Title', this.news.Title);

  formData.append('Description', this.news.Description);

  formData.append('Category', this.news.Category);

  this.news.departmentIds.forEach(id => {
  formData.append('DepartmentIds', id.toString());
});

  formData.append(
    'PostedDate',
    this.news.PublishedDate ?? ''
  );

  formData.append(
    'CreatedBy',
    String(this.userId)
  );

  if (this.news.Attachment) {

    formData.append(
      'Attachment',
      this.news.Attachment
    );
  }

  this.spinner.show();

  const request$ = this.isEditMode
    ? this.adminService.updateNews(this.news.NewsId!, formData)
    : this.adminService.saveNews(formData);

  request$.subscribe({
    next: () => {

      Swal.fire(
        'Success',
        'News saved successfully',
        'success'
      );

      this.resetForm();
      
      this.getNewsList();

      this.spinner.hide();
    },

    error: (err) => {

      console.error(err);

      Swal.fire(
        'Error',
        'Failed to save news',
        'error'
      );

      this.spinner.hide();
    }
  });
}


  formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  // -----------------------------
  // Edit News
  // -----------------------------
editNews(n: News) {
  this.showDeptDropdown = false;

  this.isEditMode = true;

  this.editIndex = this.newsList.indexOf(n);

  this.news = {
    ...n,

    CompanyId: n.CompanyId
      ? Number(n.CompanyId)
      : null,

    RegionId: n.RegionId
      ? Number(n.RegionId)
      : null,

    departmentIds: n.departmentIds?.length
  ? [...n.departmentIds]
  : [],

    AttachmentName: n.AttachmentName || '',

    AttachmentUrl: n.AttachmentUrl || ''
  };

  this.news.PublishedDate = n.Date
    ? new Date(n.Date).toISOString().split('T')[0]
    : '';

  this.filteredRegions = this.regions.filter(r =>
    Number(r.companyID) === Number(this.news.CompanyId)
  );

  // ✅ IMPORTANT FIX
  setTimeout(() => {
  this.news.RegionId = Number(n.RegionId);

  // 🔥 IMPORTANT FIX
  this.filteredDepartments = this.departments.filter(
    (d: any) =>
      Number(d.companyId) === Number(this.news.CompanyId) &&
      Number(d.regionId) === Number(this.news.RegionId)
  );
}, 0);

  console.log("EDIT NEWS:", this.news);

  console.log("FILTERED REGIONS:", this.filteredRegions);
}

  // -----------------------------
  // Delete News
  // -----------------------------
  confirmDelete(n: News) {
    if (!n.NewsId) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the news',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it'
    }).then(result => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.adminService.deleteNews(n.NewsId!, this.userId).subscribe({
          next: (res) => {
            Swal.fire('Deleted', 'News deleted successfully', 'success');
            this.getNewsList();
            this.spinner.hide();
          },
          error: (err) => {
            console.error('Error deleting news', err);
            Swal.fire('Error', 'Failed to delete news', 'error');
            this.spinner.hide();
          }
        });
      }
    });
    this.getNewsList();
  }

  // -----------------------------
  // Filtered News
  // -----------------------------
  filteredNews(): News[] {

  return this.newsList.filter(n => {

    const matchesText =
      (n.Title || '')
      .toLowerCase()
      .includes(this.searchText.toLowerCase());

    const matchesCategory =
      this.searchCategory
        ? n.Category === this.searchCategory
        : true;

    const matchesStart =
      this.startDate
        ? new Date(n.Date) >= new Date(this.startDate)
        : true;

    const matchesEnd =
      this.endDate
        ? new Date(n.Date) <= new Date(this.endDate)
        : true;

    return matchesText &&
           matchesCategory &&
           matchesStart &&
           matchesEnd;
  });
}
onPageSizeChange(): void {
  this.currentPage = 1;
  this.setPagination();
}
onFilterChange() {
  this.currentPage = 1;
  this.setPagination();
}
setPagination(): void {

  const filtered = this.filteredNews();

  this.totalPages =
    Math.ceil(filtered.length / this.pageSize) || 1;

  if (this.currentPage > this.totalPages) {
    this.currentPage = this.totalPages;
  }

  const start =
    (this.currentPage - 1) * this.pageSize;

  const end = start + this.pageSize;

  this.paginatedNews =
    filtered.slice(start, end);
}

changePage(page: number): void {

  if (page < 1 || page > this.totalPages) {
    return;
  }

  this.currentPage = page;

  this.setPagination();
}

nextPage(): void {

  if (this.currentPage < this.totalPages) {

    this.currentPage++;

    this.setPagination();
  }
}

prevPage(): void {

  if (this.currentPage > 1) {

    this.currentPage--;

    this.setPagination();
  }
}
}
