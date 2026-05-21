import { Component, OnInit } from '@angular/core';
import { HelpdeskService } from '../service/helpdesk.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { environment } from '../../../../environments/environment';
import { AdminService } from '../../../admin/servies/admin.service';

@Component({
  selector: 'app-ticket-reports',
  standalone: false,
  templateUrl: './ticket-reports.component.html',
  styleUrl: './ticket-reports.component.css'
})
export class TicketReportsComponent implements OnInit {
  filtersForm!: FormGroup;
  tickets: any[] = [];
  filteredTickets: any[] = [];
  
  // UI
  noRecordsFound = false;

  // Sorting
  sortColumn: string = 'createdDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Pagination
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // Role-based
  userRole: string = '';
  roleId: number = 0;
  isHR: boolean = false;
  isManager: boolean = false;
  userId: number = 0;
  companyId: number = 0;
  regionId: number = 0;
  companyLogoBase64: string = '';
  companyName: string = '';
  companyAddress: string = '';
  // Summary Statistics
  totalTickets: number = 0;
  openCount: number = 0;
  inProgressCount: number = 0;
  closedCount: number = 0;
  pendingCount: number = 0;
  resolvedCount: number = 0;

  statuses: string[] = ['Open', 'In Progress', 'Closed', 'Pending', 'Resolved', 'Escalated', 'Approved'];
  priorities: string[] = ['Low', 'Medium', 'High', 'Critical'];

  constructor(
    private fb: FormBuilder,
    private helpdeskService: HelpdeskService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.detectUserRole();
    this.companyId = Number(sessionStorage.getItem('CompanyId') || 0);
    this.regionId = Number(sessionStorage.getItem('RegionId') || 0);
    this.buildForm();
    this.loadCompanyDetails();
    this.loadAllTickets();
  }

  detectUserRole(): void {
    this.userId = Number(sessionStorage.getItem('UserId') || 0);
    this.roleId = Number(sessionStorage.getItem('roleId') || 0);
    this.userRole = sessionStorage.getItem('roleName') || '';
    
    this.isHR =  this.userRole.trim().toLowerCase() === 'hr' ||
                  this.userRole.trim().toLowerCase() === 'human resources';
    this.isManager = this.userRole.trim().toLowerCase() === 'manager' ||
                      this.userRole.trim().toLowerCase() === 'team lead';
    
    console.log(`User Role: ${this.userRole}, IsHR: ${this.isHR}, IsManager: ${this.isManager}`);
  }

  buildForm(): void {
    this.filtersForm = this.fb.group({
      ticketNumber: [''],
      status: [''],
      priority: [''],
      assignedTo: [''],
      fromDate: [''],
      toDate: ['']
    });

    this.filtersForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadAllTickets(): void {
    debugger;
    let ticketRequest;

    if (this.isHR) {
      console.log('Loading all tickets for HR user');
      const companyId = Number(sessionStorage.getItem('CompanyId') || 0);
      const regionId = Number(sessionStorage.getItem('RegionId') || 0);
      ticketRequest = this.helpdeskService.getAllTicketReports(companyId, regionId);
    } else if (this.isManager) {
      console.log('Loading manager tickets for:', this.userId);
      ticketRequest = this.helpdeskService.getManagerTicketReports(this.userId);
    } else {
      console.log('Unknown role, loading manager tickets');
      ticketRequest = this.helpdeskService.getManagerTicketReports(this.userId);
    }

    ticketRequest.subscribe({
      next: (res) => {
        console.log('Ticket data loaded:', res);
        this.processTickets(res);
      },
      error: (err) => {
        console.error('Error loading tickets:', err);
        this.noRecordsFound = true;
      }
    });
  }

  processTickets(res: any): void {
    if (!res || !Array.isArray(res)) {
      console.warn('Invalid response format');
      this.noRecordsFound = true;
      return;
    }

    this.tickets = res.map((t: any) => ({
      ...t,
      visible: true,
      createdDate: t.createdDate ? new Date(t.createdDate) : new Date(),
      ticketNumberNorm: (t.ticketNumber || '').toLowerCase().trim(),
      assignedToNorm: (t.assignedTo || '').toLowerCase().trim()
    }));

    this.noRecordsFound = false;
    this.currentPage = 1;
    this.applyFilters();
  }

  loadCompanyDetails(): void {
    if (!this.companyId) {
      this.setDefaultLogo();
      return;
    }

    this.adminService.getCompanyById(this.companyId).subscribe({
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
            try {
              this.companyLogoBase64 = await this.getBase64ImageFromURL(fullUrl);
            } catch {
              this.setDefaultLogo();
            }
          }
        } else {
          this.setDefaultLogo();
        }
      },
      error: () => this.setDefaultLogo()
    });
  }

  setDefaultLogo(): void {
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

  applyFilters(): void {
    const f = this.filtersForm.value;
    const ticketNumber = f.ticketNumber?.trim().toLowerCase() || null;
    const status = f.status || null;
    const priority = f.priority || null;
    const assignedTo = f.assignedTo?.trim().toLowerCase() || null;
    const fromDate = f.fromDate ? new Date(f.fromDate) : null;
    const toDate = f.toDate ? new Date(f.toDate) : null;

    let visibleCount = 0;

    this.tickets.forEach(t => {
      const tDate = new Date(t.createdDate);
      const tDateOnly = new Date(tDate.getFullYear(), tDate.getMonth(), tDate.getDate());
      const fromDateOnly = fromDate ? new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()) : null;
      const toDateOnly = toDate ? new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate()) : null;

      let matchesFromDate = true;
      let matchesToDate = true;

      if (fromDateOnly) {
        matchesFromDate = tDateOnly >= fromDateOnly;
      }
      if (toDateOnly) {
        matchesToDate = tDateOnly <= toDateOnly;
      }

      t.visible =
        (!ticketNumber || t.ticketNumberNorm.includes(ticketNumber)) &&
        (!status || t.status === status) &&
        (!priority || t.priority === priority) &&
        (!assignedTo || t.assignedToNorm.includes(assignedTo)) &&
        matchesFromDate &&
        matchesToDate;

      if (t.visible) visibleCount++;
    });

    this.filteredTickets = this.tickets.filter(t => t.visible);
    this.calculateSummary();
    this.sortData();
    this.noRecordsFound = visibleCount === 0;
    this.currentPage = 1;
  }

  calculateSummary(): void {
    this.totalTickets = this.filteredTickets.length;
    this.openCount = this.filteredTickets.filter(t => t.status === 'Open').length;
    this.inProgressCount = this.filteredTickets.filter(t => t.status === 'In Progress').length;
    this.closedCount = this.filteredTickets.filter(t => t.status === 'Closed').length;
    this.pendingCount = this.filteredTickets.filter(t => t.status === 'Pending').length;
    this.resolvedCount = this.filteredTickets.filter(t => t.status === 'Resolved').length;
  }

  sortData(): void {
    if (!this.sortColumn) return;

    this.filteredTickets.sort((a, b) => {
      const aVal: any = a[this.sortColumn];
      const bVal: any = b[this.sortColumn];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number') {
        comparison = (aVal as number) - (bVal as number);
      } else if (aVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  sort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortData();
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

 

 
// 👉 Total Pages
get totalPages(): number {
  return Math.ceil(this.filteredTickets.length / this.pageSize);
}

// 👉 Paged Tickets
get paginatedTickets(): any[] {

  const startIndex =
    (this.currentPage - 1) * this.pageSize;

  return this.filteredTickets.slice(
    startIndex,
    startIndex + this.pageSize
  );
}

// 👉 Change Page
changePage(page: number): void {

  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
  }

}

// 👉 Change Page Size
changePageSize(size: number): void {

  this.pageSize = size;
  this.currentPage = 1;

}

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.currentPage;
    
    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.filtersForm.reset();
    this.applyFilters();
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'open':
        return 'badge-primary';
      case 'in progress':
        return 'badge-warning';
      case 'closed':
        return 'badge-success';
      case 'resolved':
        return 'badge-success';
      case 'pending':
        return 'badge-info';
      case 'escalated':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'badge-danger';
      case 'high':
        return 'badge-warning';
      case 'medium':
        return 'badge-info';
      case 'low':
        return 'badge-secondary';
      default:
        return 'badge-secondary';
    }
  }

   downloadPDF(): void {
  
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
  
    const data = this.filteredTickets.map(t => ({
      ticketNumber: t.ticketNumber,
      description: t.description,
      status: t.status,
      priority: t.priority,
      assignedTo: t.assignedTo,
      createdDate: t.createdDate ? new Date(t.createdDate).toLocaleDateString() : '',
      category: t.category || ''
    }));

    /* ================= BORDER ================= */
    doc.setDrawColor(200, 0, 0);
    doc.setLineWidth(1);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
  
    let y = 15;
  
    /* ================= COMPANY LOGO ================= */
    if (this.companyLogoBase64) {
      doc.addImage(this.companyLogoBase64, 'PNG', pageWidth / 2 - 20, 8, 40, 15);
    }
  
    /* ================= COMPANY NAME ================= */
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(200, 0, 0);
    doc.text(this.companyName?.toUpperCase() || 'COMPANY', 20, y);
  
    /* ================= ADDRESS ================= */
    doc.setFontSize(9);
    doc.setTextColor(100);
  
    let addressY = y + 6;   // 👈 moved slightly down for better spacing
  
    if (this.companyAddress) {
      const lines = this.companyAddress.split(',');
  
      lines.forEach((l) => {
        doc.text(l.trim(), 20, addressY);
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
      `Ticket Reports`,
      pageWidth - 20,
      y + 5,
      { align: 'right' }
    );
  
    /* ================= RED LINE (FIXED POSITION) ================= */
    const lineY = addressY + 4; // 👈 KEY FIX: line goes below address
  
    doc.setDrawColor(200, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(20, lineY, pageWidth - 20, lineY);
  
    /* ================= TABLE ================= */
  
    const rows = data.map(ts => [
      ts.ticketNumber,
      ts.description,
      ts.status,
      ts.priority,
      ts.assignedTo,
      ts.createdDate,
      ts.category
    ]);
  
    autoTable(doc, {
      startY: lineY + 8, // 👈 table starts below line
      head: [['Ticket Number', 'Description', 'Status', 'Priority', 'Assigned To', 'Created Date', 'Category']],
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [200, 0, 0] }
    });
  
    /* ================= FOOTER ================= */
    const finalY = (doc as any).lastAutoTable.finalY + 10;
  
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      `© ${this.companyName} — System Generated Ticket Reports`,
      pageWidth / 2,
      finalY,
      { align: 'center' }
    );
  
    doc.save('Ticket_Reports.pdf');
  }

  exportToExcel(): void {
    const data = this.filteredTickets.map(t => ({
      'Ticket Number': t.ticketNumber,
      'Description': t.description,
      'Status': t.status,
      'Priority': t.priority,
      'Assigned To': t.assignedTo,
      'Created Date': t.createdDate ? new Date(t.createdDate).toLocaleDateString() : '',
      'Category': t.category || ''
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ticket Reports');
    this.saveExcelFile(wb, 'Ticket_Reports');
  }

  saveExcelFile(workbook: XLSX.WorkBook, fileName: string): void {
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, `${fileName}_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
  }
}
