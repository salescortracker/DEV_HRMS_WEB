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
    companyLogoBase64: string = '';
    companyName: string = '';
    companyAddress: string = '';
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
  loadCompanyDetails() {
    const companyId = Number(sessionStorage.getItem('CompanyId'));
  
    this.adminService.getCompanyById(companyId).subscribe({
      next: async (company: any) => {
  
        this.companyName = company?.companyName || 'Company';
        this.companyAddress = company?.companyAddress || '';
  
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
    const defaultLogo = '/assets/images/cor-logo.png';
  
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
  const pageHeight = doc.internal.pageSize.getHeight();

  const data = this.expenses.filter(e => e.visible);

  /* ================= BORDER ================= */

  doc.setDrawColor(200, 0, 0);
  doc.setLineWidth(1);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

  let y = 15;

  /* ================= COMPANY LOGO ================= */

  if (this.companyLogoBase64) {
    doc.addImage(
      this.companyLogoBase64,
      'PNG',
      pageWidth / 2 - 20,
      8,
      40,
      15
    );
  }

  /* ================= COMPANY NAME ================= */

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(200, 0, 0);

  doc.text(
    this.companyName?.toUpperCase() || 'COMPANY',
    20,
    y
  );

  /* ================= ADDRESS ================= */

  doc.setFontSize(9);
  doc.setTextColor(100);

  let addressY = y + 6;

  if (this.companyAddress) {

    const lines = this.companyAddress.split(',');

    lines.forEach((line: string) => {
      doc.text(line.trim(), 20, addressY);
      addressY += 4;
    });
  }

  /* ================= RIGHT SIDE INFO ================= */

  doc.setTextColor(0);
  doc.setFontSize(10);

  doc.text(
    `Print Date: ${new Date().toLocaleDateString()}`,
    pageWidth - 20,
    y,
    { align: 'right' }
  );

  doc.text(
    `Expenses Report`,
    pageWidth - 20,
    y + 5,
    { align: 'right' }
  );

  /* ================= RED LINE ================= */

  const lineY = addressY + 4;

  doc.setDrawColor(200, 0, 0);
  doc.setLineWidth(0.5);

  doc.line(20, lineY, pageWidth - 20, lineY);

  /* ================= TABLE ================= */

  const rows = data.map((e: any) => [
    e.projectName,
    e.expenseCategoryName,
    e.country,
    e.amount,
    e.expenseDate
      ? new Date(e.expenseDate).toLocaleDateString()
      : '',
    e.status
  ]);

  autoTable(doc, {
    startY: lineY + 8,

    head: [[
      'Project',
      'Category',
      'Country',
      'Amount',
      'Date',
      'Status'
    ]],

    body: rows,

    styles: {
      fontSize: 8
    },

    headStyles: {
      fillColor: [200, 0, 0]
    }
  });

  /* ================= FOOTER ================= */

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(8);
  doc.setTextColor(120);

  doc.text(
    `© ${this.companyName} — System Generated Expenses Report`,
    pageWidth / 2,
    finalY,
    { align: 'center' }
  );

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
