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
  reportTasks: any[] = [];
  allReportTasks: any[] = [];

  selectedEmployee = '';
  selectedStatus = '';
  selectedPriority = '';
  fromDate = '';
  toDate = '';
  userId!: number;
  companyId!: number;
  regionId!: number;

  constructor(private adminService: AdminService, private helpdeskService: HelpdeskService, private service: AdminService
    , private taskService: TaskService
  ) { }

  ngOnInit() {
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));
    this.loadTaskReport();
    this.loadEmployees();
    this.loadTaskStatuses();
    this.loadPriorities();
    this.loadProjects();
    this.loadCompanyDetails();
    // this.loadTasks();
  }
  loadTaskReport() {

    this.taskService
      .getTasks(this.userId)
      .subscribe((res: any) => {
        console.log('Tasks:', res.data);

        this.allReportTasks = res.data || [];
        this.reportTasks = [...this.allReportTasks];

      });

  }
  searchReport() {

    this.reportTasks =
      this.allReportTasks.filter(task => {

        const employeeMatch =
          !this.selectedEmployee ||
          task.assignedTo === this.selectedEmployee;

        const statusMatch =
          !this.selectedStatus ||
          task.statusId == this.selectedStatus;

        const priorityMatch =
          !this.selectedPriority ||
          task.priorityId == this.selectedPriority;

        let dateMatch = true;

        if (this.fromDate) {
          dateMatch =
            dateMatch &&
            new Date(task.startDate) >=
            new Date(this.fromDate);
        }

        if (this.toDate) {
          dateMatch =
            dateMatch &&
            new Date(task.dueDate) <=
            new Date(this.toDate);
        }

        return (
          employeeMatch &&
          statusMatch &&
          priorityMatch &&
          dateMatch
        );

      });

  }
  clearFilters() {

    this.selectedEmployee = '';
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.fromDate = '';
    this.toDate = '';

    this.reportTasks =
      [...this.allReportTasks];

  }
  // Dropdown Data
  employees: any[] = [];
  taskStatuses: any[] = [];
  priorities: any[] = [];
  projects: any[] = [];

  // Employee Name
  getEmployeeName(employeeId: number): string {
    const employee = this.employees.find(x => x.employeeId === employeeId);
    return employee ? employee.employeeName : '-';
  }

  // Project Name
  getProjectName(projectId: number): string {

    const project = this.projects.find(
      x => x.projectMasterId == projectId
    );

    return project ? project.projectName : '-';

  }


  // Priority Name
  getPriorityName(priorityId: number): string {
    const priority = this.priorities.find(x => x.priorityId === priorityId);
    return priority ? priority.priorityName : '-';
  }

  // Status Name
  getStatusName(statusId: number): string {

    const status = this.taskStatuses.find(
      x => x.taskStatusId == statusId
    );

    return status ? status.taskStatusName : '-';

  }
  loadEmployees() {
    this.adminService.getEmployees(this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {
          this.employees = Array.isArray(res) ? res : res?.data || [];
        },
        error: (err) => console.error(err)
      });
  }

  loadTaskStatuses() {
    this.adminService
      .getTaskStatusesByCompanyRegion(this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {
          console.log('Statuses:', res.data);
          this.taskStatuses = res.data || res;
        },
        error: (err) => console.error(err)
      });
  }
  loadPriorities() {
    this.helpdeskService
      .getPriorities(this.companyId, this.regionId)
      .subscribe(res => {
        this.priorities = res;
      });
  }

  loadProjects(): void {
    this.service.getProjectNames(this.companyId, this.regionId)
      .subscribe(res => {
        console.log('Projects:', res.data);
        if (res.success && res.data) {
          this.projects = res.data;
        }
      });
  }

  exportToExcel(): void {

    const data = this.reportTasks.map((task: any) => ({
      'Task Name': task.taskName || '',
      'Project': this.getProjectName(task.projectId),
      'Assigned To': task.assignedTo || '',
      'Priority': this.getPriorityName(task.priorityId),
      'Status': this.getStatusName(task.statusId),
      'Start Date': task.startDate || '',
      'Due Date': task.dueDate || ''
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Task Report');

    XLSX.writeFile(wb, 'TaskReport.xlsx');
  }
  downloadPdf(): void {

    const doc = new jsPDF('p', 'mm', 'a4');

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

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

      const lines =
        this.companyAddress.split(',');

      lines.forEach((line) => {

        doc.text(
          line.trim(),
          20,
          addressY
        );

        addressY += 4;

      });
    }

    /* ================= RIGHT SIDE ================= */

    doc.setTextColor(0);
    doc.setFontSize(10);

    doc.text(
      `Print Date: ${new Date().toLocaleDateString()}`,
      pageWidth - 20,
      y,
      { align: 'right' }
    );

    doc.text(
      'Task Report',
      pageWidth - 20,
      y + 5,
      { align: 'right' }
    );

    /* ================= RED LINE ================= */

    const lineY = addressY + 4;

    doc.setDrawColor(200, 0, 0);
    doc.setLineWidth(0.5);

    doc.line(
      20,
      lineY,
      pageWidth - 20,
      lineY
    );

    /* ================= TABLE ================= */

    const rows = this.reportTasks.map((task: any) => [

      task.taskName || '',
      this.getProjectName(task.projectId),
      task.assignedTo || '',
      this.getPriorityName(task.priorityId),
      this.getStatusName(task.statusId),

      task.startDate
        ? new Date(task.startDate).toLocaleDateString()
        : '',

      task.dueDate
        ? new Date(task.dueDate).toLocaleDateString()
        : ''

    ]);

    autoTable(doc, {

      startY: lineY + 8,

      head: [[
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

    const finalY =
      (doc as any).lastAutoTable.finalY + 10;

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
  companyLogoBase64: string = '';
  companyName: string = '';
  companyAddress: string = '';
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

}
