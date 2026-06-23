import { Component, OnInit } from '@angular/core';
import { LeaveRequest } from '../../../admin/layout/models/apply-leave.model';
import { EmployeeResignationService } from '../../employee-profile/employee-services/employee-resignation.service';
import Swal from 'sweetalert2';
import { AdminService } from '../../../admin/servies/admin.service';
import { environment } from '../../../../environments/environment';
interface Weekoff {
  weekoffID: number;
  companyID: number;
  regionID: number;
  weekoffDate: string;
  isActive: boolean;
  userId: number | null;
}
@Component({
  selector: 'app-apply-leave',
  standalone: false,
  templateUrl: './apply-leave.component.html',
  styleUrl: './apply-leave.component.css'
})
export class ApplyLeaveComponent {
  Math = Math;

 canApprove: any;
  canReject: any;
  hrEmail: string = '';
  startDate: string = "";
  endDate: string = "";
  totalDays: number = 0;
  today: string = "";
  startDateError: string = "";
  endDateError: string = "";
  reason: string = "";
  leaveType: string = "";
  selectedFileName: string = "";
  reportingManager: string = '';
  isHalfDay: boolean = false;

  // LEAVE COUNTS
  sickTotal: number = 1;
  casualTotal: number = 1;

  sickUsed: number = 0;
  casualUsed: number = 0;

  sickAvailable: number = 0;
  casualAvailable: number = 0;

  leaveTypes: any[] = [];


  userId!: number;
  companyId!: number;
  regionId!: number;
  reportingManagerName: string = '';
  reportingManagerId!: number;
  selectedFile!: File | null;
  previousBalance: number = 0;
  futureLeaves: number = 0;

  usePreviousBalance: boolean = false;
  useLOP: boolean = false;
  lopDays: number = 0;
  showLopWarning: boolean = false;
  

  // Weekoff configuration (Sat/Sun default, can be loaded from server)
  weekoffDays: Set<string> = new Set();

  // Sorting
  sortColumn: keyof LeaveRequest | null = 'appliedDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Pagination
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // Filters
  searchText = '';

  // STATIC LEAVE LIST
  leaveList: LeaveRequest[] = [];
  selectedLeaveType: any = null;
  availableLeaves: number = 0;
  usedLeaves: number = 0;
  weekoffLoaded: boolean = false;
canCreate: boolean = false;

  ngOnInit(): void {
    this.today = this.formatDate(new Date());
    //   this.leaveList = [];
    // this.calculateLeaveSummary();
    //  this.loadLeaveTypes();
    // this.loadMyLeaves();

    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    if (!this.userId) {
      console.error("UserId missing in sessionStorage");
      return;
    }
    this.loadLeaveBalances();
    this.leaveList = [];
    this.calculateLeaveSummary();
    this.loadLeaveTypes();
    this.loadMyLeaves();
    this.loadReportingManager();
    this.loadWeekoffs();
     this.loadPermission();
     this.loadPermissions();

  }
  loadPermissions() {
  const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

  const applyLeaveMenu = menus.find(
    (m: any) =>
      m.menuName?.trim().toLowerCase() === "leave apply"
  );

  this.canCreate = applyLeaveMenu?.canCreate ?? false;

  console.log("Leave Apply Create Permission:", this.canCreate);
}

  constructor(private leaveService: EmployeeResignationService, private userService: AdminService) { }

  validateLeaveLimit() {
    let available = 0;
    if (this.leaveType === "Sick Leave") {
      available = this.sickAvailable;
    }

    if (this.leaveType === "Casual Leave") {
      available = this.casualAvailable;
    }
     this.leavedays= this.leaveList.reduce((sum, l) => sum + l.totalDays, 0);


    // If half day -> allow only if available >= 0.5
    if (this.isHalfDay) {
      if (this.availableLeaves < 0.5) {
        Swal.fire("Not Allowed", "You do not have enough leave balance.", "warning");
        this.totalDays = 0;
        this.endDate = "";
      }
      return;
    }

    // If applying full leave days
    if (this.totalDays > this.availableLeaves) {
      Swal.fire(
        "Not Allowed",
        `You only have ${this.availableLeaves} days available.`,
        "warning"
      );

      this.totalDays = 0;
      this.endDate = "";
    }
  }
  loadPermission() {
  const userId = Number(sessionStorage.getItem("UserId"));
  const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

  // ✅ Get "Leave Approve" menu (child menu)
  const approvalMenu = menus.find(
    (m: any) => m.menuName?.trim().toLowerCase() === "leave approve"
  );

  const menuId = approvalMenu?.menuId || 0;

  // ✅ Set from session
  this.canApprove = approvalMenu?.canEdit ?? false;   // Approve action
  this.canReject = approvalMenu?.canDelete ?? false;  // Reject action

  console.log("Approval Menu:", approvalMenu);
  console.log("canApprove:", this.canApprove);
  console.log("canReject:", this.canReject);

  // ✅ OPTIONAL API (combine, don’t override)
  this.userService.getPermission(userId, menuId, 'edit').subscribe({
    next: (res: boolean) => {
      console.log("API Approve Permission:", res);
      this.canApprove = this.canApprove && res;
    },
    error: () => {
      this.canApprove = false;
    }
  });

  this.userService.getPermission(userId, menuId, 'delete').subscribe({
    next: (res: boolean) => {
      console.log("API Reject Permission:", res);
      this.canReject = this.canReject && res;
    },
    error: () => {
      this.canReject = false;
    }
  });
}

  // FORMAT DATE
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  loadReportingManager() {
    if (!this.userId) return;

    this.leaveService.getReportingManager(this.userId).subscribe({
      next: (data: any) => {
        console.log("Manager API response =>", data);

        this.reportingManagerName = data.managerName;
        this.reportingManagerId = data.managerId;
      },
      error: (err) => {
        console.error('Reporting manager load error', err);
      }
    });
  }

  viewDocument(filePath: string | undefined): void {
    if (!filePath) {
      Swal.fire('Error', 'No file path available.', 'error');
      return;
    }

    const fullPath = `${environment.apiUrl}${environment.leaveDocumentPath}${filePath}`;
    window.open(fullPath, '_blank');
  }
private normalizeDay(day: string): string {
  return (day || '')
    .toLowerCase()
    .trim();
}

  // Load the company/region weekoff configuration (e.g., Mon/Wed, Sat/Sun, etc.)
 private loadWeekoffs() {
  if (!this.companyId || !this.regionId) return;

  this.userService.getWeekoffs(this.companyId, this.regionId).subscribe({
    next: (res: any) => {

      const data: Weekoff[] = res?.data || [];

      this.weekoffDays = new Set(
        data
          .filter(x => x.isActive)
          .map(x => this.normalizeDay(x.weekoffDate))
      );
      this.weekoffLoaded = true;

      console.log("Weekoff Set READY:", Array.from(this.weekoffDays));
    },
    error: () => {
      this.weekoffDays = new Set();
    }
  });
}
private getDayName(date: Date): string {
  return this.normalizeDay(
    date.toLocaleDateString('en-US', { weekday: 'long' })
  );
}
 
 private isWeekoffDate(date: Date): boolean {
  const dayName = this.getDayName(date);

  return this.weekoffDays.has(dayName);
}
checkLOP() {

  this.lopDays = 0;
  this.showLopWarning = false;

  if (!this.leaveType || this.totalDays <= 0) {
    return;
  }

  // Casual Leave special logic
  if (this.leaveType === 'Casual Leave') {

    const usableLeaves =
      this.availableLeaves - this.futureLeaves;

    if (this.totalDays > usableLeaves) {

      this.lopDays =
        this.totalDays - usableLeaves;

      this.showLopWarning = true;
    }

    return;
  }

  // Other leave types
  if (this.totalDays > this.availableLeaves) {

    this.lopDays =
      this.totalDays - this.availableLeaves;

    this.showLopWarning = true;
  }
}
  loadLeaveTypes() {
    this.leaveService.getLeaveTypes(this.companyId, this.regionId).subscribe({
      next: (data: any) => {
        this.leaveTypes = data ? data.data : [];

        // Auto set total days
        const sick = this.leaveTypes.find(x => x.leaveTypeName === 'Sick Leave');
        const casual = this.leaveTypes.find(x => x.leaveTypeName === 'Casual Leave');

        this.sickTotal = sick?.leaveDays || 0;
        this.casualTotal = casual?.leaveDays || 0;

        this.calculateLeaveSummary();
      },
      error: (err) => {
        console.error('Leave types load error', err);
      }
    });
  }
  users: any;
  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        this.users = res.map((u: any) => ({
          ...u,
          reportingTo: u.ReportingTo ?? 0  // ✅ map correct API field to frontend field
        }));


      },
      error: () => this.showError('Failed to load users.')
    });
  }

  showError(msg: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: msg,
      timer: 2500,
      showConfirmButton: false
    });
  }

  loadMyLeaves() {
    this.leaveService.getMyLeaves(this.userId).subscribe({
      next: (data) => {
        this.leaveList = data
        .slice()
        .map(x => {
          // If it's a half-day leave, show 0.5 days; otherwise use the totalDays value
          const isHalfDay = x.isHalfDay ?? false;
          const totalDays = isHalfDay ? 0.5 : (x.totalDays ?? 0);
          
          return {
            appliedDate: x.appliedDate,
            leaveType: x.leaveTypeName || '',
            fromDate: x.startDate,
            toDate: x.endDate,
            totalDays: totalDays,
            reason: x.reason,
            fileName: x.fileName,
            status: x.status,
            isHalfDay: isHalfDay,
            leaveRequestId: x.leaveRequestId || x.LeaveRequestId || 0
          };
        })
        // Sort by LeaveRequestId descending (newest first) - most reliable
        .sort((a, b) => (b.leaveRequestId || 0) - (a.leaveRequestId || 0));

        this.calculateLeaveSummary();
        if (this.leaveType) {
          this.onLeaveTypeChange();
        }

      },
      error: (err) => {
        console.error("Load leaves failed", err);
      }
    });
  }
  getRemaining(balance: any): number {
  return (
    Number(balance.allocatedLeaves || 0) -
    Number(balance.approvedLeaves || 0)
  );
}
leaveBalances: any[] = [];
loadLeaveBalances() {

  this.leaveService.getLeaveBalance(this.userId).subscribe({
    next: (res: any[]) => {

      console.log("Leave balances:", res);

      this.leaveBalances = res;
    },
    error: (err) => {
      console.error(err);
    }
  });
}
shouldCountLeaveForBalance(leave: LeaveRequest): boolean {
  // Rejected leaves don't count
  if (leave.status === 'Rejected') {
    return false;
  }
  
  // For pending leaves, only count if toDate is today or in the future
  if (leave.status === 'Pending') {
    const toDate = new Date(leave.toDate);
    const todayDate = new Date(this.today);
    return !isNaN(toDate.getTime()) && toDate >= todayDate;
  }
  
  // Approved leaves always count
  return true;
}
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;  // 👈 only file name saved
    }
  }
  onHalfDayChange() {
    if (this.isHalfDay) {
      this.totalDays = 0.5;
      this.validateLeaveLimit();
      // If half day selected, force same date
      if (this.startDate) {
        this.endDate = this.startDate;
      }
    } else {
      this.calculateTotalDays();
    }
    this.checkLOP();
  }

  onLeaveTypeChange() {

  const balance = this.leaveBalances.find(
    x => x.leaveTypeName === this.leaveType
  );

  if (!balance) return;

  this.availableLeaves = Number(balance.remainingLeaves ?? 0);
  this.usedLeaves =
    Number(balance.approvedLeaves ?? 0) +
    Number(balance.pendingLeaves ?? 0);

  // ❌ REMOVE these (they don't exist in API)
  const currentMonth = new Date().getMonth() + 1; // Jan=1, Jun=6

// Casual Leave ki matrame
if (this.leaveType === 'Casual Leave') {

  const approved = Number(balance.approvedLeaves ?? 0);

  // June ante 6 leaves earned avvali
  const eligibleTillCurrentMonth = currentMonth;

  // Previous balance
  if (approved < eligibleTillCurrentMonth) {
    this.previousBalance =
      eligibleTillCurrentMonth - approved;
  } else {
    this.previousBalance = 0;
  }

  // Future leaves (remaining months in year)
  this.futureLeaves = 12 - currentMonth;

} else {

  this.previousBalance = 0;
  this.futureLeaves = 0;
}

  this.checkLOP();
}

 leavedays:any;
  calculateLeaveSummary() {
    // Properly account for half-day leaves in summary
    this.leavedays = this.leaveList
      .filter(l => this.shouldCountLeaveForBalance(l))
      .reduce((sum, l) => sum + (l.isHalfDay ? 0.5 : l.totalDays), 0);

    this.sickUsed = this.leaveList
      .filter(l => l.leaveType === "Sick Leave" && this.shouldCountLeaveForBalance(l))
      .reduce((sum, l) => sum + (l.isHalfDay ? 0.5 : l.totalDays), 0);

    this.casualUsed = this.leaveList
      .filter(l => l.leaveType === "Casual Leave" && this.shouldCountLeaveForBalance(l))
      .reduce((sum, l) => sum + (l.isHalfDay ? 0.5 : l.totalDays), 0);

    this.sickAvailable = this.sickTotal - this.sickUsed;
    this.casualAvailable = this.casualTotal - this.casualUsed;
  }


  private getHrEmailList(): string[] {
    if (!this.hrEmail) return [];

    return this.hrEmail
      .split(/[;,\s]+/)
      .map(email => email.trim())
      .filter(email => email.length > 0);
  }

  private isValidEmail(email: string): boolean {
    const normalized = email.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(normalized);
  }

  private validateHrEmails(): boolean {
    const emails = this.getHrEmailList();
    if (emails.length === 0) {
      return true;
    }

    const invalidEmails = emails.filter(email => !this.isValidEmail(email));
    if (invalidEmails.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid HR Email',
        text: `Please enter valid HR email address(es): ${invalidEmails.join(', ')}`
      });
      return false;
    }

    return true;
  }
  private isDateRangeHasWeekoff(start: Date, end: Date): boolean {

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {

    const current = new Date(d);

    if (this.isWeekoffDate(current)) {
      return true; // ❌ contains Friday/Saturday
    }
  }

  return false;
}

  // START DATE CHANGE
onStartDateChange() {

  if (!this.weekoffLoaded) {
    console.warn("Weekoff not loaded yet");
    return;
  }

  this.startDateError = "";

  if (!this.startDate) return;

  const date = new Date(this.startDate);

  if (this.isWeekoffDate(date)) {
    this.startDateError = "Weekoff day not allowed (" + this.getDayName(date) + ")";
    this.startDate = "";
    return;
  }

  this.calculateTotalDays();
}

  // END DATE CHANGE
onEndDateChange() {

  this.endDateError = "";

  if (!this.endDate) return;

  const endDateObj = new Date(this.endDate);

  const dayName = this.getDayName(endDateObj);

  if (this.weekoffDays.has(dayName)) {

    this.endDateError =
      `You cannot apply leave on weekoff day (${dayName})`;

    this.endDate = "";
    return;
  }

  this.calculateTotalDays();
}

 calculateTotalDays() {

  if (this.isHalfDay) {
    this.totalDays = 0.5;
    return;
  }

  if (!this.startDate || !this.endDate) {
    this.totalDays = 0;
    return;
  }

  const start = new Date(this.startDate);
  const end = new Date(this.endDate);

  let total = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {

    const current = new Date(d);

    // Skip dynamic weekoffs
    if (!this.isWeekoffDate(current)) {
      total++;
    }
  }

  this.totalDays = total;
  this.checkLOP();
}

  // Check if there's a rejected leave on the same dates
  private hasRejectedLeaveOnDates(startDate: string, endDate: string): boolean {
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    return this.leaveList.some(leave => {
      if (leave.status !== 'Rejected') return false;

      const existingStart = new Date(leave.fromDate);
      const existingEnd = new Date(leave.toDate);

      // Check if date ranges overlap
      return newStart <= existingEnd && newEnd >= existingStart;
    });
  }

  // --------------------- CREATE (SUBMIT LEAVE) ---------------------
  onSubmit() {
    let finalReason = this.reason;

  if (this.usePreviousBalance) {
    finalReason += ' | Previous Balance Used';
  }

  if (this.useLOP && this.lopDays > 0) {
    finalReason += ` | LOP Days : ${this.lopDays}`;
  }
    if (!this.leaveType || !this.startDate || !this.endDate || !this.reason) {
      alert("Please fill all required fields.");
      return;
    }

    // Check if there's a rejected leave on the same dates
    const hasRejectedLeave = this.hasRejectedLeaveOnDates(this.startDate, this.endDate);

    let available = this.leaveType === "Sick Leave" ? this.sickAvailable : this.casualAvailable;

this.checkLOP();

if (this.lopDays > 0) {

  Swal.fire({
    icon: 'warning',
    title: 'LOP Leave',
    text: `${this.lopDays} day(s) will be marked as Loss Of Pay (LOP).`,
    confirmButtonText: 'Continue'
  });
}

    const selected = this.leaveTypes.find(x => x.leaveTypeName === this.leaveType);
    const leaveTypeId = selected?.leaveTypeID;

    if (!leaveTypeId) {
      alert("Invalid Leave Type");
      return;
    }

    if (!this.validateHrEmails()) {
      return;
    }

    // If there's a rejected leave on these dates, show confirmation
    if (hasRejectedLeave) {
      Swal.fire({
        title: 'Reapply for Previously Rejected Leave?',
        text: 'A leave request on these dates was previously rejected. Do you want to submit a new request?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Submit Again',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.submitLeaveRequest();
          this.loadLeaveBalances();
        }
      });
    } else {
      this.submitLeaveRequest();
    }
  }

  // Separate method to handle the actual leave submission
  private submitLeaveRequest(): void {
    const selected = this.leaveTypes.find(x => x.leaveTypeName === this.leaveType);
    const leaveTypeId = selected?.leaveTypeID;

    const formData = new FormData();
    const finalTotalDays = this.totalDays - this.lopDays;

    formData.append("UserId", this.userId.toString());
    formData.append("CompanyId", this.companyId.toString());
    formData.append("RegionId", this.regionId.toString());
    formData.append("LeaveTypeId", leaveTypeId!.toString());
    formData.append("IsHalfDay", this.isHalfDay.toString());
    formData.append("StartDate", this.startDate);
    formData.append("EndDate", this.endDate);
    formData.append("TotalDays", finalTotalDays.toString());
    formData.append("Reason", this.reason);
    formData.append("ReportingManagerId", this.reportingManagerId.toString());
    formData.append("HrEmail", this.hrEmail);
    formData.append("LOPDays", this.lopDays.toString());

    if (this.selectedFile) {
      formData.append("SupportingDocument", this.selectedFile);
    }

    this.leaveService.submitLeave(formData).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Leave Submitted!',
          text: 'Your leave request was submitted successfully.',
          timer: 1500,
          showConfirmButton: false
        });


        // ✅ Reload list from DB
        this.loadMyLeaves();
this.loadLeaveBalances();
        // ✅ Reset form
        this.leaveType = "";
        this.startDate = "";
        this.endDate = "";
        this.totalDays = 0;
        this.reason = "";
        this.selectedFileName = "";
        this.selectedFile = null;
        this.isHalfDay = false;
      },
      error: (err: any) => {
        console.error("Submit failed", err);
        
        // Check for duplicate leave error
        const errorMessage = err?.error?.message || err?.error?.error || '';
        if (errorMessage.toLowerCase().includes('duplicate') || 
            errorMessage.toLowerCase().includes('already exists') ||
            errorMessage.toLowerCase().includes('already applied')) {
          
          // Check if there's a rejected leave on these dates - allow reapplication
          if (this.hasRejectedLeaveOnDates(this.startDate, this.endDate)) {
            Swal.fire({
              title: 'Reapply for Rejected Leave?',
              text: 'A leave request on these dates was previously rejected. Would you like to submit a new request?',
              icon: 'question',
              showCancelButton: true,
              confirmButtonText: 'Yes, Submit Again',
              cancelButtonText: 'Cancel'
            }).then((result) => {
              if (result.isConfirmed) {
                // Retry submission - the backend should allow this
                this.submitLeaveRequest();
              }
            });
          } else {
            Swal.fire('Duplicate Leave', 'You have already applied for leave on these dates. Please choose different dates.', 'warning');
          }
        } else {
          Swal.fire('Error', 'Error while submitting leave.', 'error');
        }
      }
    });
  }

  resetForm(): void {
    this.leaveType = "";
    this.startDate = "";
    this.endDate = "";
    this.totalDays = 0;
    this.reason = "";
    this.selectedFileName = "";
    this.selectedFile = null;
    this.isHalfDay = false;

    Swal.fire({
      icon: 'info',
      title: 'Form Reset',
      timer: 1000,
      showConfirmButton: false
    });
  }

  // Sorting
  sortBy(column: keyof LeaveRequest): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  // Sorted list
  getSortedLeaves(): LeaveRequest[] {
    let data = [...this.leaveList];

    if (this.sortColumn) {
      data.sort((a, b) => {
        const valA = (a[this.sortColumn!] ?? '') as any;
        const valB = (b[this.sortColumn!] ?? '') as any;

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }

  // Pagination + Data
  filteredLeaves(): LeaveRequest[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.getSortedLeaves().slice(startIndex, startIndex + this.pageSize);
  }

  // Page Count
  get totalPages(): number {
    return Math.ceil(this.leaveList.length / this.pageSize);
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
