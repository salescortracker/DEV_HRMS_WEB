import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TaskService } from '../service/task.service';
import { AdminService } from '../../../admin/servies/admin.service';
import { HelpdeskService } from '../../helpdesk/service/helpdesk.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-taskreport',
  standalone: false,
  templateUrl: './taskreport.component.html',
  styleUrl: './taskreport.component.css'
})
export class TaskreportComponent {
  filtersForm!: FormGroup;

  tasks: any[] = [];
  allTasks: any[] = [];
  filteredTasks: any[] = [];

  employees: any[] = [];
  priorities: any[] = [];
  taskStatuses: any[] = [];
  projects: any[] = [];
  statuses: any[] = [];


  pageSize = 10;
  pageSizeOptions = [5, 10, 20];
  currentPage = 1;
  userId!: number;
  companyId!: number;
  regionId!: number;

  companyLogoBase64: string = '';
  companyName: string = '';
  companyAddress: string = '';
  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private adminService: AdminService,
    private helpdeskService: HelpdeskService,
  ) { }

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));
    this.buildForm();
    this.loadEmployees();
    this.loadStatuses();
    this.loadPriorities();
    this.loadProjects();
    this.loadCompanyDetails();
    // this.loadTasks();

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
  loadTasks() {
    const filters = this.filtersForm.value;

    const payload = {
      employeeId: filters.employeeId || null,
      statusId: filters.statusId || null,
      priorityId: filters.priorityId || null,
      fromDate: filters.fromDate || null,
      toDate: filters.toDate || null
    };

    this.taskService
      .getTaskReport(payload, this.companyId, this.regionId)
      .subscribe((res: any) => {

        this.allTasks = res.data || res;
        this.filteredTasks = [...this.allTasks];
        this.currentPage = 1;
      });
  }
  buildForm() {
    this.filtersForm = this.fb.group({
      employeeId: [''],
      statusId: [''],
      priorityId: [''],
      fromDate: [''],
      toDate: ['']
    });

    this.filtersForm.valueChanges.subscribe(() => {
      //this.applyFilters();
    });
  }
  loadProjects(): void {

    this.adminService
      .getProjectNames(this.companyId, this.regionId)
      .subscribe((res: any) => {

        this.projects = res.data || res;

      });
  }

  loadPriorities() {
    this.helpdeskService
      .getPriorities(this.companyId, this.regionId)
      .subscribe(res => {
        this.priorities = res;
      });
  }

  loadEmployees() {
    this.adminService.getEmployees(this.companyId, this.regionId).subscribe((res: any) => {
      this.employees = res;
    });
  }

  loadStatuses() {
    this.adminService.getTaskStatusesByCompanyRegion(this.companyId, this.regionId)
      .subscribe((res: any) => {
        this.taskStatuses = res.data || res;
      });
  }

  applyFilters() {

    // const f = this.filtersForm.value;

    // this.filteredTasks = this.allTasks.filter(t => {

    //   const matchEmp =
    //     !f.employeeId || t.assignedToId == f.employeeId;

    //   const matchStatus =
    //     !f.statusId || t.statusId == f.statusId;

    //   const matchPriority =
    //     !f.priorityId || t.priorityId == f.priorityId;

    //   const matchDate =
    //     (!f.fromDate || new Date(t.startDate) >= new Date(f.fromDate)) &&
    //     (!f.toDate || new Date(t.dueDate) <= new Date(f.toDate));

    //   return matchEmp && matchStatus && matchPriority && matchDate;
    // });

    // this.currentPage = 1;
    this.loadTasks();
  }

  get paginatedTasks() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTasks.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredTasks.length / this.pageSize);
  }

  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages) {
      this.currentPage = p;
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
  }

  clearFilters() {
    this.filtersForm.reset();
    this.loadTasks();
  }

  getStatusName(id: number) {
    return this.taskStatuses.find(x => x.taskStatusId == id)?.taskStatusName;
  }

  getPriorityName(id: number) {
    return this.priorities.find(x => x.priorityId == id)?.priorityName;
  }

  getProjectName(id: number) {
    return this.projects.find(x => x.projectMasterId == id)?.projectName;
  }
  downloadPDF(): void {

    const doc = new jsPDF('p', 'mm', 'a4');

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const data = this.filteredTasks;

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
      `Task Report`,
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

    const rows = data.map((t, index) => [

      index + 1,

      t.taskName || '',

      this.getProjectName(t.projectId) || '',

      t.assignedTo || '',

      this.getPriorityName(t.priorityId) || '',

      this.getStatusName(t.statusId) || '',

      t.startDate
        ? new Date(t.startDate).toLocaleDateString()
        : '',

      t.dueDate
        ? new Date(t.dueDate).toLocaleDateString()
        : ''

    ]);

    autoTable(doc, {

      startY: lineY + 8,

      head: [[
        'S.No',
        'Task Name',
        'Project',
        'Assigned To',
        'Priority',
        'Status',
        'Start Date',
        'Due Date'
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
      `© ${this.companyName} — System Generated Task Report`,
      pageWidth / 2,
      finalY,
      { align: 'center' }
    );

    doc.save('Task_Report.pdf');
  }

  exportToExcel(): void {

    const data = this.filteredTasks.map((t, index) => ({

      'S.No': index + 1,

      'Task Name': t.taskName || '',

      'Project': this.getProjectName(t.projectId) || '',

      'Assigned To': t.assignedTo || '',

      'Priority': this.getPriorityName(t.priorityId) || '',

      'Status': this.getStatusName(t.statusId) || '',

      'Start Date': t.startDate
        ? new Date(t.startDate).toLocaleDateString()
        : '',

      'Due Date': t.dueDate
        ? new Date(t.dueDate).toLocaleDateString()
        : ''

    }));

    const ws = XLSX.utils.json_to_sheet(data);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      'Task Report'
    );

    XLSX.writeFile(
      wb,
      'task-report.xlsx'
    );
  }

}
