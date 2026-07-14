import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AdminService } from '../../../admin/servies/admin.service';
import { EmployeeResignationService } from '../../employee-profile/employee-services/employee-resignation.service';
import { AttendanceService } from '../service/attendance.service';
import { timeEnd } from 'node:console';

interface AttendanceRecord {
  attendanceDate: string;
  employeeName: string;
  department: string;
  actionType: string;
  actionTime: string;
}
@Component({
  selector: 'app-clockin-clockout',
  standalone: false,
  templateUrl: './clockin-clockout.component.html',
  styleUrl: './clockin-clockout.component.css'
})
export class ClockinClockoutComponent implements OnInit, OnDestroy {
  shiftStartTime: string = ''; // e.g. "09:00"
  earlyLateStatus: string = '';  // FINAL TEXT to show in UI
  graceTime: string = '';        // from API
  lastClockOut: string | null = null;
  isClockedIn = false;
  attendanceForm!: FormGroup;
  attendanceRecords: AttendanceRecord[] = [];
  
  currentUser: any;
  loading = false;
  lateLoginText: string = '';
  message = '';
  todayClockIn = '--:--';
  todayClockOut = '--:--';
  availableActions: string[] = [];
  todayDuration = '--:--';
  currentDate = new Date();
  records: any[] = [];
  private destroy$ = new Subject<void>();

  fromDate: string = '';
  toDate: string = '';

  employeeCode = sessionStorage.getItem('EmployeeCode');
  companyId = sessionStorage.getItem('CompanyId') as unknown as number;
  regionId = sessionStorage.getItem('RegionId') as unknown as number;
  clockInRecords: any[] = [];
clockOutRecords: any[] = [];
firstClockIn: any;
  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private employeeResignationService: EmployeeResignationService,
    private attendanceService: AttendanceService
  ) { }

  ngOnInit(): void {
    this.loadSessionUser();
    this.initForm();
    this.patchEmployeeData();

    this.attendanceService.attendanceRefresh$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAttendance();
      });

    this.loadAttendance();
    this.getshiftallocationName();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm() {
    this.attendanceForm = this.fb.group({
      employeeCode: [{ value: '', disabled: true }, Validators.required],
      employeeName: [{ value: '', disabled: true }, Validators.required],
      department: [{ value: '', disabled: true }, Validators.required],
      clockType: ['', Validators.required],
      time: ['', Validators.required]
    });
  }

  patchEmployeeData() {
    if (!this.currentUser) return;
    this.attendanceForm.patchValue({
      employeeCode: this.currentUser.employeeCode,
      employeeName: this.currentUser.fullName,
      department: this.currentUser.roleId,
    });
  }
  setAvailableActions() {
    const today = new Date().toISOString().split('T')[0];

    const todayRecords = this.attendanceRecords
  .filter(r => {

    const recDate = new Date(r.attendanceDate)
      .toISOString()
      .split('T')[0];

    return recDate === today;
  })
  .sort((a, b) => a.actionTime.localeCompare(b.actionTime));

    // FIRST record of the day
    if (todayRecords.length === 0) {
      this.availableActions = ['ClockIn'];
      this.attendanceForm.patchValue({ clockType: 'ClockIn' });
      return;
    }

    // LAST record decides next action
    const lastAction = todayRecords[todayRecords.length - 1].actionType;

    if (lastAction === 'ClockIn') {
      this.availableActions = ['ClockOut'];
      this.attendanceForm.patchValue({ clockType: 'ClockOut' });
    } else {
      this.availableActions = ['ClockIn'];
      this.attendanceForm.patchValue({ clockType: 'ClockIn' });
    }
  }


  onSubmit() {
    // if (this.attendanceForm.invalid) return;
    if (this.attendanceForm.invalid) {
      this.attendanceForm.markAllAsTouched();
      return;
    }
    const form = this.attendanceForm.getRawValue();
    const payload = {
      regionId: this.currentUser.regionId,
      companyId: this.currentUser.companyId,
      employeeCode: String(this.currentUser.userId),
      employeeName: form.employeeName,
      // department: form.department,
      department: String(form.department), // OR actual department name
      attendanceDate: new Date(),
      actionType: form.clockType,
      actionTime: form.time
    };

    this.loading = true;
    this.message = '';
    this.adminService.createClockInOut(payload)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.message = 'Attendance saved successfully';
          this.attendanceForm.patchValue({ clockType: '', time: '' });
          this.loadAttendance();
          this.ngOnInit();
        },
        error: () => this.message = 'Failed to save attendance'
      });
  }

  loadAttendance() {
    this.adminService.getTodayAttendance(
      String(this.currentUser.employeeCode),
      this.currentUser.companyId,
      this.currentUser.regionId
    ).subscribe(res => {
      this.attendanceRecords = res;

      this.setTodaySummary();
      //this.setAvailableActions();

      // ✅ call here
      this.calculateLateLogin();
    });
  }
  calculateStatus() {
debugger;
  const refTime = this.getReferenceTime();

  if (!refTime || !this.shiftStartTime || !this.graceTime) {
    this.earlyLateStatus = '';
    return;
  }

  const time = this.parseTime(refTime);

  const [sH, sM] = this.shiftStartTime.split(':').map(Number);

  const shiftStart = new Date();
  shiftStart.setHours(sH, sM, 0, 0);

  // On Time Window = 5 mins
  const onTimeEnd = new Date(
    shiftStart.getTime() + (5 * 60000)
  );

  // Grace Window
  const [gH, gM] = this.graceTime.split(':').map(Number);

  const graceEnd = new Date(
    shiftStart.getTime() + ((gH * 60) + gM) * 60000
  );

  // EARLY
  if (time < shiftStart) {

    const mins = Math.floor(
      (shiftStart.getTime() - time.getTime()) / 60000
    );

    this.earlyLateStatus = `Early by ${this.formatDuration(mins)}`;
  }
   // ON TIME (0-5 mins)
  else if (time <= onTimeEnd && time==time) {

    this.earlyLateStatus = 'On Time';
  }
// GRACE
  else if (time <= onTimeEnd) {

    const mins = Math.floor(
      (time.getTime() - shiftStart.getTime()) / 60000
    );

    this.earlyLateStatus = `Grace ${this.formatDuration(mins)}`;
  }
 

  

  // LATE
  else {

    const mins = Math.floor(
      (time.getTime() - onTimeEnd.getTime()) / 60000
    );

    this.earlyLateStatus = `Late by ${this.formatDuration(mins)}`;
  }
}

  getEarlyLateClass(): string {

  if (!this.earlyLateStatus) {
    return '';
  }

  const status = this.earlyLateStatus.toLowerCase();

  if (status.includes('on time')) {
    return 'status-ontime';
  }

  if (status.includes('early')) {
    return 'status-early';
  }

  if (status.includes('grace')) {
    return 'status-grace';
  }

  if (status.includes('late')) {
    return 'status-late';
  }

  return '';
}


  parseTime(time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d;
  }

  setTodaySummary() {
    const today = new Date().toISOString().split('T')[0];

    const todayRecords = this.attendanceRecords
      .filter(r => r.attendanceDate.startsWith(today))
      .sort((a, b) => a.actionTime.localeCompare(b.actionTime));

    this.clockInRecords = todayRecords.filter(r => r.actionType === 'ClockIn');
this.clockOutRecords = todayRecords.filter(r => r.actionType === 'ClockOut');

    // First ClockIn
    const sortedClockIns = this.clockInRecords
  .sort((a, b) => a.actionTime.localeCompare(b.actionTime));

this.firstClockIn = sortedClockIns.length ? sortedClockIns[0] : null;
this.todayClockIn = this.firstClockIn ? this.firstClockIn.actionTime : '--:--';
const lastClockOut = this.clockOutRecords.length
  ? this.clockOutRecords[this.clockOutRecords.length - 1]
  : null;

this.todayClockOut = lastClockOut ? lastClockOut.actionTime : '--:--';

    // 🟢 Calculate duration
    let totalMs = 0;
let lastIn: Date | null = null;

for (let r of todayRecords) {

  const time = this.parseTime(r.actionTime);

  if (r.actionType === 'ClockIn') {
    lastIn = time;
  }

  else if (r.actionType === 'ClockOut' && lastIn) {
    totalMs += (time.getTime() - lastIn.getTime());
    lastIn = null;
  }
}

// 🔥 if still clocked in (no final logout)
if (lastIn) {
  totalMs += (new Date().getTime() - lastIn.getTime());
}

// convert to HH:mm
const hours = Math.floor(totalMs / 3600000);
const minutes = Math.floor((totalMs % 3600000) / 60000);

this.todayDuration =
  `${hours.toString().padStart(2, '0')}:` +
  `${minutes.toString().padStart(2, '0')}`;
    this.calculateLateLogin();
  }

  shiftAllocationName: string = '';
  ShiftstartTime: string = '';
  ShiftendTime: string = '';
  getshiftallocationName() {
    this.employeeCode = sessionStorage.getItem('EmployeeCode') as string;
    const companyId = Number(sessionStorage.getItem('CompanyId'));
    const regionId = Number(sessionStorage.getItem('RegionId'));

    this.employeeResignationService
      .getShiftallocationNameForClockInOut(this.employeeCode, companyId, regionId)
      .subscribe(res => {
        this.shiftAllocationName = res.shiftName;
        this.ShiftstartTime = res.shiftStartTime;
        this.ShiftendTime = res.shiftEndTime;

        this.graceTime = res.grassTime; // ✅ FIXED HERE

        console.log('Grace Time:', this.graceTime);

        this.calculateLateLogin();
      });
  }

  loadSessionUser() {
    const user = sessionStorage.getItem('currentUser');
    if (user) this.currentUser = JSON.parse(user);
  }
  loadAll() {
    this.employeeResignationService.getClockInOutAll().subscribe(res => {
      this.records = res;
    });
  }

  loadTodayAttendance() {
    this.employeeResignationService
      .getTodayByEmployee(this.employeeCode, this.companyId, this.regionId)
      .subscribe(res => {
        this.records = res;
      });
  }
  getSystemTime24(): string {
    const now = new Date(); // USER SYSTEM TIME
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;   // HH:mm
  }
  
  clockIn() {

    const time = this.getSystemTime24();

    const payload = {
      employeeCode: this.employeeCode,
      employeeName: sessionStorage.getItem('Name') || '',
      department: 0,

      attendanceDate: new Date(),

      actionType: this.todayClockIn === '--:--' ? 'ClockIn' : 'ClockOut',

      actionTime: time,

      companyId: this.companyId,
      regionId: this.regionId
    };

    this.employeeResignationService.addClockInOut(payload)
  .subscribe(() => {

    this.loadAttendance(); 

    this.loadTodayAttendance();

  });
  }

  delete(id: number) {
    this.employeeResignationService.deleteClockInOut(id).subscribe(() => {
      this.loadAll();
    });
  }
 formatDuration(totalMinutes: number): string {

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }

  if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
}
  
 getReferenceTime(): string | null {

  if (this.isClockedIn) {
    return this.firstClockIn;   // 🟢 running state
  }

  return this.lastClockOut;     // 🔴 completed state
}
calculateLateLogin() {

    const refTime = this.getReferenceTime();
  if (!this.firstClockIn || !this.ShiftstartTime || !this.graceTime) {
    this.lateLoginText = '';
    return;
  }

  const clockIn = this.parseTime(this.firstClockIn.actionTime);

  const [sH, sM] = this.ShiftstartTime.split(':').map(Number);
  const shiftStart = new Date();
  shiftStart.setHours(sH, sM, 0, 0);

  const onTimeEnd = new Date(
    shiftStart.getTime() + (5 * 60000)
  );
  const [gH, gM] = this.graceTime.split(':').map(Number);
  const graceEnd = new Date(
    shiftStart.getTime() + ((gH * 60) + gM) * 60000
  );

  // EARLY
  if (clockIn < shiftStart) {

    const mins = Math.floor(
      (shiftStart.getTime() - clockIn.getTime()) / 60000
    );

    this.lateLoginText = `Early by ${this.formatDuration(mins)}`;
  }

  // ON TIME (includes grace)
  else if (clockIn <= onTimeEnd && clockIn == clockIn) {

    this.lateLoginText = 'On Time';
  }
// GRACE (after 5 mins and before grace end)
else if (clockIn <= graceEnd) {

  const mins = Math.floor(
    (graceEnd.getTime() - clockIn.getTime()) / 60000
  );

  this.lateLoginText = `Grace ${this.formatDuration(mins)}`;
}
  // LATE
  else if (clockIn <= onTimeEnd) {

  const mins = Math.floor(
    (clockIn.getTime() - shiftStart.getTime()) / 60000
  );

  this.lateLoginText = `Grace ${this.formatDuration(mins)}`;
}

// LATE
else {

  const mins = Math.floor(
    (clockIn.getTime() - graceEnd.getTime()) / 60000
  );

  this.lateLoginText = `Late by ${this.formatDuration(mins)}`;
}
}
  // getStatusClass(): string {

  //   if (!this.lateLoginText) return '';

  //   const text = this.lateLoginText.toLowerCase();

  //   if (text.includes('late')) return 'badge-late';
  //   if (text.includes('early')) return 'badge-early';
  //   if (text.includes('on time')) return 'badge-ontime';

  //   return 'badge-default';
  // }

  getStatusClass(): string {

  if (!this.lateLoginText) {
    return '';
  }

  const status = this.lateLoginText.toLowerCase();

  if (status.includes('late')) {
    return 'status-late';
  }

  if (status.includes('grace')) {
    return 'status-late';   // Same style as Late
  }

  if (status.includes('early')) {
    return 'status-early';
  }

  if (status.includes('on time')) {
    return 'status-ontime';
  }

  return '';
}

  searchAttendance() {

    if (!this.fromDate || !this.toDate) {

      this.loadAttendance();

      return;

    }

    this.adminService.getAttendanceByDateRange(
      String(this.currentUser.employeeCode),
      this.currentUser.companyId,
      this.currentUser.regionId,
      this.fromDate,
      this.toDate
    )
      .subscribe(res => {

        this.attendanceRecords = res;

      });

  }
}
