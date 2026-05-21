import { Component } from '@angular/core';
import { Expense, ExpensesService } from '../expenses.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { environment } from '../../../../environments/environment';
import { AdminService } from '../../../admin/servies/admin.service';

@Component({
  selector: 'app-all-expenses',
  standalone: false,
  templateUrl: './all-expenses.component.html',
  styleUrl: './all-expenses.component.css'
})
export class AllExpensesComponent {
filtersForm!: FormGroup;
userId!: number;
  expenses: any[] = [];
  categories: any[] = [];
  countries: string[] = [];
  statuses: string[] = ['Pending', 'Approved', 'Rejected', 'Reimbursed'];
companyId!: number;
regionId!: number;
  // UI
  noRecordsFound = false;

  // Sorting
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  pageSize = 10;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50];
  companyLogoBase64: string = '';
companyName: string = '';
companyAddress: string = '';

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpensesService,
    private adminService: AdminService
  ) {}

  // ============================================================
  // 🔹 INIT
  // ============================================================
  ngOnInit(): void {
      this.userId = sessionStorage.getItem('UserId') ? Number(sessionStorage.getItem('UserId'))
      : 0;
      this.companyId = sessionStorage.getItem('CompanyId') ? Number(sessionStorage.getItem('CompanyId')) : 0;
      this.regionId = sessionStorage.getItem('RegionId') ? Number(sessionStorage.getItem('RegionId')) : 0;
    this.buildForm();
    //this.loadCategories();
    this.loadAllExpenses();
    this.loadCompanyDetails();
  }

  // ============================================================
  // 🔹 BUILD FILTER FORM
  // ============================================================
  buildForm(): void {
    this.filtersForm = this.fb.group({
      project: [''],
      categoryId: [''],
      country: [''],
      status: ['']
    });
  }

  // ============================================================
  // 🔹 LOAD ALL EXPENSES (ONLY API CHANGE)
  // ============================================================
  loadAllExpenses(): void {
        debugger;

  const companyId = this.companyId;
  const regionId = this.regionId;

    this.expenseService.getAllExpenses(companyId, regionId).subscribe(res => {
          debugger;

      if (res.success) {
        this.expenses = res.data.map((e: any) => ({
          ...e,
          visible: true,
          expenseCategoryId: Number(e.expenseCategoryId),
          projectNorm: e.projectName?.toLowerCase().trim() || '',
          countryNorm: e.country?.toLowerCase().trim() || ''
        }));

        this.countries = [
          ...new Set(this.expenses.map(x => x.countryNorm))
        ];

        this.noRecordsFound = false;
        this.currentPage = 1;
      }
    });
  }
  loadCompanyDetails() {
  const companyId = Number(sessionStorage.getItem('CompanyId'));

  this.adminService.getCompanyById(companyId).subscribe({
    next: async (company: any) => {

      this.companyName = company?.companyName || 'Company';
      this.companyAddress = company?.companyAddress || 'Hyderabad';

      const logo = company?.companyLogo;

      if (logo && logo.trim() !== '') {

        if (logo.startsWith('data:')) {
          this.companyLogoBase64 = logo;
        } else {
          const logoPath = logo.replace(/\\/g, '/');
          const fullUrl = `${environment.baseurl}/${logoPath}`;

          this.companyLogoBase64 =
            await this.getBase64ImageFromURL(fullUrl);
        }

      } else {
        this.setDefaultLogo();
      }
    },
    error: () => this.setDefaultLogo()
  });
}

setDefaultLogo() {
  const defaultLogo = 'assets/images/default-logo.png';

  this.getBase64ImageFromURL(defaultLogo)
    .then(base64 => this.companyLogoBase64 = base64)
    .catch(() => this.companyLogoBase64 = '');
}

getBase64ImageFromURL(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = err => reject(err);
  });
}

  // ============================================================
  // 🔹 LOAD CATEGORIES
  // ============================================================
  // loadCategories(): void {
  //   this.expenseService.getExpenseCategories().subscribe(res => {
  //     if (res.success) {
  //       this.categories = res.data;
  //     }
  //   });
  // }

  // ============================================================
  // 🔹 APPLY FILTERS (SAME AS APPROVE)
  // ============================================================
  applyFilters(): void {
    const f = this.filtersForm.value;

    const project = f.project?.trim().toLowerCase();
    const categoryId = f.categoryId ? Number(f.categoryId) : null;
    const country = f.country?.toLowerCase();
    const status = f.status;

    let visibleCount = 0;

    this.expenses.forEach(e => {
      e.visible =
        (!project || e.projectNorm.includes(project)) &&
        (!categoryId || e.expenseCategoryId === categoryId) &&
        (!country || e.countryNorm === country) &&
        (!status || e.status === status);

      if (e.visible) visibleCount++;
    });

    this.noRecordsFound = visibleCount === 0;
    this.currentPage = 1;
  }

  // ============================================================
  // 🔹 SORT (SAME AS APPROVE)
  // ============================================================
  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  // ============================================================
  // 🔹 FILTERED + SORTED + PAGINATED DATA
  // ============================================================
  get pagedExpenses(): any[] {
    let data = this.expenses.filter(e => e.visible);

    if (this.sortColumn) {
      data = data.sort((a, b) => {
        const valA = a[this.sortColumn!];
        const valB = b[this.sortColumn!];

        if (valA == null) return 1;
        if (valB == null) return -1;

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    return data.slice(startIndex, startIndex + this.pageSize);
  }

  // ============================================================
  // 🔹 PAGINATION HELPERS
  // ============================================================
  get totalPages(): number {
    return Math.ceil(
      this.expenses.filter(e => e.visible).length / this.pageSize
    );
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

 downloadPDF(): void {

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  // 🔴 BORDER
  doc.setDrawColor(200, 0, 0);
  doc.rect(5, 5, pageWidth - 10, 287 - 10);

  // 🔥 HEADER LOGO
  if (this.companyLogoBase64) {
    doc.addImage(this.companyLogoBase64, 'PNG', pageWidth / 2 - 20, 10, 40, 15);
  }

  // 🔥 COMPANY NAME
  doc.setFontSize(16);
  doc.setTextColor(200, 0, 0);
  doc.text(this.companyName || 'Company', 20, 30);

  // 🔥 ADDRESS
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(this.companyAddress || '', 20, 36);

  // 🔥 TABLE DATA
  const data = this.expenses.filter(e => e.visible);

  const rows = data.map(e => [
    e.projectName,
    e.expenseCategoryName,
    e.country,
    e.amount,
    e.expenseDate,
    e.status
  ]);

  autoTable(doc, {
    startY: 50,
    head: [['Project', 'Category', 'Country', 'Amount', 'Date', 'Status']],
    body: rows
  });

  doc.save('Expenses_Report.pdf');
}

exportToExcel(): void {
  // 👉 Take only filtered data (same as table)
  const exportData = this.expenses
    .filter(e => e.visible)
    .map(e => ({
      Project: e.projectName,
      Category: e.expenseCategoryName,
      Country: e.country,
      Amount: e.amount,
      Currency: e.currencyCode,
      // Date: this.formatDate(e.expenseDate),
      Status: e.status
    }));

  if (exportData.length === 0) {
    alert('No data to export');
    return;
  }

  // 👉 Convert to worksheet
  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

  // 👉 Create workbook
  const workbook: XLSX.WorkBook = {
    Sheets: { 'Expenses': worksheet },
    SheetNames: ['Expenses']
  };

  // 👉 Generate Excel file
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  this.saveExcelFile(excelBuffer, 'All_Expenses');
}

saveExcelFile(buffer: any, fileName: string): void {
  const data = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  saveAs(data, fileName + '_' + new Date().getTime() + '.xlsx');
}

}