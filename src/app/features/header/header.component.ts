import { Component, HostListener, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

import { EmployeeResignationService } from '../employee-profile/employee-services/employee-resignation.service';
import { AdminService } from '../../admin/servies/admin.service';
import { AttendanceService } from '../attendance/service/attendance.service';
import { environment } from '../../../environments/environment';

interface LocationMap {
  [key: string]: string[];
}

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {

  getUserRole(): string {
  return (this.roleName || this.role || '').toString().toLowerCase().trim();
}


  calculateEarlyLate() {
    if (
      !this.shiftStartTime ||
      !this.graceTime ||
      !this.todayClockIn ||
      this.todayClockIn === '--:--'
    ) {
      this.earlyLateStatus = '';
      return;
    }

    const [shiftH, shiftM] = this.shiftStartTime.split(':').map(Number);
    const shiftStart = new Date();
    shiftStart.setHours(shiftH, shiftM, 0, 0);

    const [gH, gM] = this.graceTime.split(':').map(Number);
    const graceEnd = new Date(shiftStart.getTime() + (gH * 60 + gM) * 60000);

    const clockIn = this.parseTime(this.todayClockIn);

    if (clockIn < shiftStart) {
      const diff = shiftStart.getTime() - clockIn.getTime();
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      this.earlyLateStatus = `Early by ${hrs}h ${mins}m`;
      return;
    }

    if (clockIn > graceEnd) {
      const diff = clockIn.getTime() - graceEnd.getTime();
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      this.earlyLateStatus = `Late by ${hrs}h ${mins}m`;
      return;
    }

    this.earlyLateStatus = 'On Time';
  }

  formatWorkedHours(): string {
    if (!this.clockInTime) {
      return '00:00:00';
    }

    const now = new Date();
    const diffMs = now.getTime() - this.clockInTime.getTime();

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return (
      String(hours).padStart(2, '0') +
      ':' +
      String(minutes).padStart(2, '0') +
      ':' +
      String(seconds).padStart(2, '0')
    );
  }

  onSuggestionClick(item: any) {
    this.userInput = item.query || item.label;

    this.sendMessage();
  }

  loadSuggestions() {
    this.http
      .get<any[]>(`${environment.baseurl}/api/chat/suggestions`)
      .subscribe({
        next: (res) => {
          this.suggestions = res || [];
        },

        error: () => {
          this.suggestions = [];
        },
      });
  }

  private getLocalCommand(input: string): 'punch_in' | 'punch_out' | null {
    const text = input.toLowerCase().trim();

    const punchInKeywords = [
      'clock in',
      'clockin',
      'punch in',
      'punchin',
      'check in',
      'checkin',
      'mark in',
    ];

    const punchOutKeywords = [
      'clock out',
      'clockout',
      'punch out',
      'punchout',
      'check out',
      'checkout',
      'mark out',
    ];

    if (punchInKeywords.some((k) => text.includes(k))) return 'punch_in';
    if (punchOutKeywords.some((k) => text.includes(k))) return 'punch_out';

    return null;
  }

  // =========================
  // FILE / USER / COMPANY
  // =========================
  selectedFile: File | null = null;
  role: string = '';
  roleName: any = '';
  userName: any = '';
  superadmin: any;
  profilePicture: string = '';
  companyLogo: string = '/assets/images/cor-logo.png';
  userId: number = Number(sessionStorage.getItem('UserId') || 0);
  employeeCode: string = sessionStorage.getItem('EmployeeCode') || '';
  companyId: number = Number(sessionStorage.getItem('CompanyId') || 0);
  regionId: number = Number(sessionStorage.getItem('RegionId') || 0);

  // =========================
  // CLOCK / ATTENDANCE
  // =========================
  isClockedIn = false;
  isMobileMenuOpen = false;
  isProfileOpen = false;
  isLocationOpen = false;
  isWFHApproved: boolean = false;

  shiftStartTime: string = '';
  showClockButton: boolean = false;
  allowedClockTimeText: string = '';

  clockStatus = 'Not Clocked In';
  // roleName: any;

  clockInDisplay = '--:--:--';
  totalHoursDisplay = '00:00:00';

  earlyLateStatus: string = '';
  graceTime: string = '';

  private clockInTime!: Date;
  private timerRef: any;

  records: any;
  attendanceRecords: any;
  todayDuration: any;
  todayClockIn: any = '--:--';
  todayClockOut: any = '--:--';
  availableActions: string[] = [];

  // =========================
  // CHATBOT
  // =========================
  isOpen: boolean = false;
  userInput = '';
  messages: any[] = [];
  menus: any[] = [];
  isTyping = false;
  suggestions: any[] = [];
  recognition: any;
  isListening: boolean = false;

  // =========================
  // LOCATION
  // =========================
  selectedRegion = 'Select Location';

  locations: LocationMap = {
    INDIA: [
      'Andhra Pradesh',
      'Telangana',
      'Tamil Nadu',
      'Karnataka',
      'Maharashtra',
      'Kerala',
    ],
    US: ['California', 'Texas', 'New York', 'Florida', 'Washington'],
    CANADA: ['Ontario', 'Quebec', 'British Columbia', 'Alberta'],
    AUSTRALIA: ['New South Wales', 'Victoria', 'Queensland'],
    DUBAI: ['Dubai City', 'Deira', 'Jumeirah'],
    SINGAPORE: ['Central', 'North-East', 'East', 'West'],
  };

  selectedCountry: keyof LocationMap = 'INDIA';
  regionList: string[] = this.locations[this.selectedCountry];

  // =========================
  // CHAT CONFIG
  // =========================
  // intentMap = [
  //   { keywords: ['leave', 'leaves'], action: 'navigate', url: '/leave-management', label: 'Leave' },
  //   { keywords: ['attendance'], action: 'navigate', url: '/attendance-list', label: 'Attendance' },
  //   { keywords: ['dashboard', 'home'], action: 'navigate', url: '/dashboard', label: 'Dashboard' },
  //   { keywords: ['expense', 'expenses'], action: 'navigate', url: '/expenses', label: 'Expenses' },
  //   { keywords: ['asset', 'assets'], action: 'navigate', url: '/asset', label: 'Assets' },
  //   { keywords: ['profile'], action: 'navigate', url: '/profile', label: 'Profile' },
  //   { keywords: ['punch in', 'clock in'], action: 'punch_in' },
  //   { keywords: ['punch out', 'clock out'], action: 'punch_out' }
  // ];

  intentMap = [
    {
      keywords: ['dashboard', 'home'],
      action: 'navigate',
      url: '/dashboard',
      label: 'Dashboard',
    },
    {
      keywords: ['expense', 'expenses'],
      action: 'navigate',
      url: '/expenses',
      label: 'Expenses',
    },
    {
      keywords: ['asset', 'assets'],
      action: 'navigate',
      url: '/asset',
      label: 'Assets',
    },
    {
      keywords: ['profile'],
      action: 'navigate',
      url: '/profile',
      label: 'Profile',
    },
    { keywords: ['punch in', 'clock in'], action: 'punch_in' },
    { keywords: ['punch out', 'clock out'], action: 'punch_out' },
  ];

  faqList = [
    {
      keywords: ['cortracker', 'about'],
      text: 'CORtracker is an enterprise software company providing ERP, CRM, supply chain, and analytics solutions.',
    },
    {
      keywords: ['services'],
      text: 'CORtracker offers ERP, CRM, supply chain, analytics, and custom software development.',
      buttons: [
        { label: 'ERP Modules', action: 'faq', value: 'erp' },
        { label: 'CRM Features', action: 'faq', value: 'crm' },
      ],
    },
    {
      keywords: ['erp'],
      text: 'ERP includes finance, HR, procurement, inventory, production, maintenance, and accounting modules.',
    },
    {
      keywords: ['crm'],
      text: 'CRM includes lead management, sales automation, customer support, marketing, and analytics.',
    },
    {
      keywords: ['culture'],
      text: 'Work culture includes good learning opportunities, but varies across roles.',
    },
    {
      keywords: ['deployment'],
      text: 'CORtracker supports both cloud-based and on-premise deployment.',
    },
    {
      keywords: ['headquarters'],
      text: 'CORtracker is headquartered in Michigan, USA.',
    },
    {
      keywords: ['india'],
      text: 'CORtracker IT Pvt Ltd is located in Jubilee Hills, Hyderabad, India.',
    },
    {
      keywords: ['technology'],
      text: 'CORtracker uses AI, IoT, big data, and automation for advanced solutions.',
    },
    {
      keywords: ['modules'],
      text: 'CORtracker ERP includes finance, HR, procurement, inventory, production, maintenance, and accounting modules.',
    },
  ];

  constructor(
    private http: HttpClient,
    private leaveService: EmployeeResignationService,
    private router: Router,
    private employeeResignationService: EmployeeResignationService,
    private adminService: AdminService,
    private ngZone: NgZone,
    private attendanceService: AttendanceService,
  ) {}

  // User Late/Early login show 
  earlyLateStatus: string = '';  // FINAL TEXT to show in UI
  graceTime: string = '';        // from API

  loading: any
  isClockedIn = false;
  isMobileMenuOpen = false;
  shiftStartTime: string = ''; // e.g. "09:00"
  showClockButton: boolean = false;
  allowedClockTimeText: string = '';
  isWFHApproved: boolean = false;

  clockStatus = 'Not Clocked In';
  clockInDisplay = '--:--:--';
  totalHoursDisplay = '00:00:00';
  employeeCode = sessionStorage.getItem('EmployeeCode');
  companyId = sessionStorage.getItem('CompanyId') as unknown as number;
  regionId = sessionStorage.getItem('RegionId') as unknown as number;
  private clockInTime!: Date;
  private timerRef: any;
  profilePicture: string = '';
  companyLogo: string = '/assets/images/cor-logo.png';
  //profilePicture: string = 'assets/images/default-profile.png';
  userId: number = Number(sessionStorage.getItem('UserId'));
  constructor(private router: Router, private employeeResignationService: EmployeeResignationService,
    private adminService: AdminService, private ngZone: NgZone, private attendanceService: AttendanceService) { }
  ngOnInit() {
    this.loadProfilePicture();
    this.loadSuggestions();

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.role = currentUser.role;
    sessionStorage.setItem('role', this.role);

    this.roleName = sessionStorage.getItem('roleName');

    if (this.roleName === 'Super Admin') {
      this.superadmin = true;
      this.companyLogo = '/assets/images/cor-logo.png';
    } else {
      this.loadEmployeeCompanyLogo();
    }

    this.userName = sessionStorage.getItem('Name');

    const savedClockIn = sessionStorage.getItem('clockInTime');
    if (savedClockIn) {
      this.clockInTime = new Date(savedClockIn);
      this.isClockedIn = true;
      this.clockStatus = 'Clocked In';
      this.clockInDisplay = this.formatTime(this.clockInTime);
      this.startTimer();
    }

    this.loadAttendance();
    this.loadUserShift();
    this.checkWFHStatus();

    this.checkWFHStatus();

    // ⏱️ Check every minute (important)
    setInterval(() => {
      this.checkClockButtonVisibility();
    }, 60000);


  }

  loadEmployeeCompanyLogo() {
    const companyId = Number(sessionStorage.getItem('CompanyId'));
    if (!companyId) return;

    this.adminService.getCompanyById(companyId).subscribe({
      next: (company: any) => {
        const logo = company?.companyLogo;

        if (logo && logo.trim() !== '') {
          if (logo.startsWith('data:')) {
            this.companyLogo = logo;
          } else {
            const logoPath = logo.replace(/\\/g, '/');
            this.companyLogo = environment.baseurl
              ? `${environment.baseurl}/${logoPath}`
              : `/${logoPath}`;
          }
        } else {
          this.companyLogo = '/assets/images/cor-logo.png';
        }
      },
      error: () => {
        this.companyLogo = '/assets/images/cor-logo.png';
      },
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  loadProfilePicture() {
    this.employeeResignationService.getProfilePicture(this.userId).subscribe({
      next: (res: string) => {
        if (res && res.trim() !== '') {
          this.profilePicture = `${environment.baseurl}/${res.replace(/\\/g, '/')}`;
        } else {
          this.profilePicture = 'assets/images/default-profile.png';
        }
      },
      error: () => {
        this.profilePicture = 'assets/images/default-profile.png';
      },
    });

    this.loadMenus();
  }

  loadMenus() {
    this.adminService.getMenus().subscribe((res) => {
      this.menus = res;
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  toggleProfileMenu(): void {
    this.isProfileOpen = !this.isProfileOpen;
  }

  closeProfileMenu(): void {
    this.isProfileOpen = false;
  }

  toggleLocationMenu(event: Event) {
    event.stopPropagation();
    this.isLocationOpen = !this.isLocationOpen;
  }

  selectCountry(country: keyof LocationMap) {
    this.selectedCountry = country;
    this.regionList = this.locations[country];
  }

  selectRegion(region: string) {
    this.selectedRegion = region;
    this.isLocationOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onGlobalClick(event: Event) {
    const target = event.target as HTMLElement;

    if (!target.closest('.profile-menu')) {
      this.isProfileOpen = false;
    }

    if (!target.closest('.location-wrapper')) {
      this.isLocationOpen = false;
    }

    if (
      !target.closest('.mobile-dropdown') &&
      !target.closest('.mobile-menu-btn')
    ) {
      this.isMobileMenuOpen = false;
    }
  }

  getSystemTime(): Date {
    return new Date();
  }

  formatTime(date: Date): string {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  getSystemTime24(): string {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }

  startTimer() {
    this.timerRef = setInterval(() => {
      const now = this.getSystemTime();
      const diff = now.getTime() - this.clockInTime.getTime();

      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      this.totalHoursDisplay =
        `${hrs.toString().padStart(2, '0')}:` +
        `${mins.toString().padStart(2, '0')}:` +
        `${secs.toString().padStart(2, '0')}`;
    }, 1000);
  }

  stopTimer() {
    if (this.timerRef) {
      clearInterval(this.timerRef);
      this.timerRef = null;
    }
  }

  // async toggleClock() {
  //   if (!this.shiftStartTime) {
  //     Swal.fire(
  //       'Not Allowed',
  //       'You are not assigned to any shift. Please contact HR.',
  //       'warning'
  //     );
  //     return;
  //   }

  //   let geoAllowed = true;

  //   if (!this.isWFHApproved) {
  //     geoAllowed = await this.checkGeoFence();
  //     if (!geoAllowed) return;
  //   }
 async toggleClock() {

  // ✅ STEP 1: CHECK SHIFT
  if (!this.shiftStartTime) {

    Swal.fire(
      'Not Allowed',
      'You are not assigned to any shift. Please contact HR.',
      'warning'
    );

    return;
  }

  //   const now = this.getSystemTime();

  //   if (!this.isClockedIn) {
  //     this.isClockedIn = true;
  //     this.clockInTime = now;
  //     sessionStorage.setItem('clockInTime', now.toISOString());

  //     this.clockStatus = 'Clocked In';
  //     this.clockInDisplay = this.formatTime(now);
  //     this.totalHoursDisplay = '00:00:00';

  //     this.startTimer();

  //     this.employeeResignationService.addClockInOut({
  //       employeeCode: this.employeeCode,
  //       employeeName: sessionStorage.getItem('Name') || '',
  //       department: 0,
  //       attendanceDate: new Date(),
  //       actionType: 'ClockIn',
  //       actionTime: this.getSystemTime24(),
  //       clockInTime: this.getSystemTime24(),
  //       clockOutTime: '',
  //       companyId: this.companyId,
  //       regionId: this.regionId
  //     }).subscribe(() => {
  //       this.loadAttendance();
  //     });

  //   } else {
  //     this.isClockedIn = false;
  //     sessionStorage.removeItem('clockInTime');
  //     this.clockStatus = 'Clocked Out';
  //     this.stopTimer();

  //     this.employeeResignationService.addClockInOut({
  //       employeeCode: this.employeeCode,
  //       employeeName: sessionStorage.getItem('Name') || '',
  //       department: 0,
  //       attendanceDate: new Date(),
  //       actionType: 'ClockOut',
  //       actionTime: this.getSystemTime24(),
  //       clockInTime: '',
  //       clockOutTime: this.getSystemTime24(),
  //       companyId: this.companyId,
  //       regionId: this.regionId
  //     }).subscribe(() => {
  //       this.loadAttendance();
  //     });
  //   }
  // }

  async toggleClock() {
    // STEP 1: CHECK SHIFT
    if (!this.shiftStartTime) {
      Swal.fire(
        'Not Allowed',
        'You are not assigned to any shift. Please contact HR.',
        'warning',
      );
      return;
    }

    // STEP 2: CHECK WFH APPROVAL
    let geoAllowed = true;

    if (!this.isWFHApproved) {
      geoAllowed = await this.checkGeoFence();
      if (!geoAllowed) return;
    }

    const now = this.getSystemTime();

    // CLOCK IN
    if (!this.isClockedIn) {
      this.isClockedIn = true;
      this.clockInTime = now;
      sessionStorage.setItem('clockInTime', now.toISOString());

      this.clockStatus = 'Clocked In';
      this.clockInDisplay = this.formatTime(now);
      this.totalHoursDisplay = '00:00:00';
  if (!this.isWFHApproved) {

    geoAllowed = await this.checkGeoFence();

    if (!geoAllowed) return;

  } else {

    console.log('✅ WFH Approved → Skipping Geo Fence');
  }

  // ✅ CURRENT TIME
  const now = this.getSystemTime();

  // =====================================================
  // ✅ CLOCK IN
  // =====================================================
  if (!this.isClockedIn) {

    this.isClockedIn = true;

    this.clockInTime = now;

    sessionStorage.setItem(
      'clockInTime',
      now.toISOString()
    );

    this.clockStatus = 'Clocked In';

    this.clockInDisplay = this.formatTime(now);

    this.totalHoursDisplay = '00:00:00';

      this.startTimer();

      this.employeeResignationService
        .addClockInOut({
          userId: Number(sessionStorage.getItem('UserId')),
          employeeCode: this.employeeCode,
          employeeName: sessionStorage.getItem('Name') || '',
          department: 0,
          attendanceDate: new Date(),
          actionType: 'ClockIn',
          actionTime: this.getSystemTime24(),
          clockInTime: this.getSystemTime24(),
          clockOutTime: '',
          totalWorkedHours: null,
          companyId: this.companyId,
          regionId: this.regionId,
        })
        .subscribe({
          next: () => {
            this.loadAttendance();

            this.addMessage('bot', `✅ Clocked in at ${this.clockInDisplay}`);
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'Clock In Failed', 'error');
          },
        });
    }

    // CLOCK OUT
    else {
      this.isClockedIn = false;
      sessionStorage.removeItem('clockInTime');
      this.clockStatus = 'Clocked Out';
      this.stopTimer();

      const formattedTotalHours = this.formatWorkedHours();

      this.employeeResignationService
        .addClockInOut({
          userId: Number(sessionStorage.getItem('UserId')),
          employeeCode: this.employeeCode,
          employeeName: sessionStorage.getItem('Name') || '',
          department: 0,
          attendanceDate: new Date(),
          actionType: 'ClockOut',
          actionTime: this.getSystemTime24(),
          clockInTime: '',
          clockOutTime: this.getSystemTime24(),
          totalWorkedHours: formattedTotalHours,
          companyId: this.companyId,
          regionId: this.regionId,
        })
        .subscribe({
          next: () => {
            this.loadAttendance();
            this.addMessage(
              'bot',
              `🕒 Total worked hours: ${formattedTotalHours}`,
            );
            Swal.fire(
              'Clock Out Successful',
              `Total Worked Hours: ${formattedTotalHours}`,
              'success',
            );
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'Clock Out Failed', 'error');
          },
        });
    }
  }
    // ✅ API CALL
    this.employeeResignationService.addClockInOut({

      userId: Number(sessionStorage.getItem('UserId')),

      employeeCode: this.employeeCode,

      employeeName: sessionStorage.getItem('Name') || '',

      department: 0,

      attendanceDate: new Date(),

      actionType: 'ClockIn',

      actionTime: this.getSystemTime24(),

      clockInTime: this.getSystemTime24(),

      clockOutTime: '',

      totalWorkedHours: null,

      companyId: this.companyId,
     
      regionId: this.regionId

    }).subscribe({

      next: () => {

        this.loadAttendance();

      },

      error: (err) => {

        console.error(err);

        Swal.fire(
          'Error',
          'Clock In Failed',
          'error'
        );
      }
    });
  }

  // =====================================================
  // ✅ CLOCK OUT
  // =====================================================
  else {

    this.isClockedIn = false;

    sessionStorage.removeItem('clockInTime');

    this.clockStatus = 'Clocked Out';

    this.stopTimer();

    // ✅ FORCE HH:mm:ss FORMAT
    const formattedTotalHours =
      this.formatWorkedHours();

    console.log(
      'Formatted Total Hours:',
      formattedTotalHours
    );

    // ✅ API CALL
    this.employeeResignationService.addClockInOut({

      userId: Number(sessionStorage.getItem('UserId')),

      employeeCode: this.employeeCode,

      employeeName: sessionStorage.getItem('Name') || '',

      department: 0,

      attendanceDate: new Date(),

      actionType: 'ClockOut',

      actionTime: this.getSystemTime24(),

      clockInTime: '',

      clockOutTime: this.getSystemTime24(),

      totalWorkedHours: formattedTotalHours,

      companyId: this.companyId,

      regionId: this.regionId

    }).subscribe({

      next: () => {

        this.loadAttendance();

        Swal.fire(
          'Clock Out Successful',
          `Total Worked Hours: ${formattedTotalHours}`,
          'success'
        );
      },

      error: (err) => {

        console.error(err);

        Swal.fire(
          'Error',
          'Clock Out Failed',
          'error'
        );
      }
    });
  }
}

// ✅ RETURNS HH:mm:ss FORMAT
formatWorkedHours(): string {

  if (!this.clockInTime) {

    return '00:00:00';
  }

  const now = new Date();

  const diffMs =
    now.getTime() -
    this.clockInTime.getTime();

  const totalSeconds =
    Math.floor(diffMs / 1000);

  const hours =
    Math.floor(totalSeconds / 3600);

  const minutes =
    Math.floor((totalSeconds % 3600) / 60);

  const seconds =
    totalSeconds % 60;

  return (
    String(hours).padStart(2, '0') + ':' +
    String(minutes).padStart(2, '0') + ':' +
    String(seconds).padStart(2, '0')
  );
}

  //================================================== Clock In Clock Out method =================================================

  checkGeoFence(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        Swal.fire('Error', 'Location not supported', 'error');
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          // put your real office coordinates here
          const officeLat = 17.459962;
          const officeLng = 78.363268;

          const allowedRadius = 300;

          const distance = this.getDistance(
            userLat,
            userLng,
            officeLat,
            officeLng,
          );

          console.log('Distance:', distance);

          if (distance <= allowedRadius) {
            resolve(true);
          } else {
            Swal.fire(
              'Access Denied',
              'You are outside office premises',
              'error',
            );
            resolve(false);
          }
        },
        () => {
          Swal.fire('Error', 'Please enable location access', 'error');
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        },
      );
    });
  }

  getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  checkWFHStatus() {
    const today = new Date().toISOString().split('T')[0];

    this.attendanceService
      .getMyRequests(this.userId, this.companyId, this.regionId)
      .subscribe((res: any[]) => {
        const approvedWFH = res.find(
          (x) =>
            x.status === 'Approved' && x.fromDate <= today && x.toDate >= today,
        );

        this.isWFHApproved = !!approvedWFH;
  //===============================  check WFH Status =================================

  checkWFHStatus() {
    const today = new Date().toISOString().split('T')[0];

    this.attendanceService
      .getMyRequests(this.userId, this.companyId, this.regionId)
      .subscribe((res: any[]) => {

        // ✅ Check if any APPROVED WFH for today
        const approvedWFH = res.find(x =>
          x.status === 'Approved' &&
          x.fromDate <= today &&
          x.toDate >= today
        );

        this.isWFHApproved = !!approvedWFH;

        console.log('WFH Approved Today:', this.isWFHApproved);
      });
  }

  loadTodayAttendance() {
    this.employeeResignationService
      .getTodayByEmployee(this.employeeCode, this.companyId, this.regionId)
      .subscribe((res) => {
        this.records = res;
      });
  }

  loadAttendance() {
    this.adminService
      .getTodayAttendance(
        String(this.employeeCode),
        this.companyId,
        this.regionId,
      )
      .subscribe((res) => {
        this.attendanceRecords = res;
        this.setTodaySummary();
        this.setAvailableActions();
        this.syncClockStateWithAPI();
      });
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
      .filter((r: any) => r.attendanceDate.startsWith(today))
      .sort((a: any, b: any) => a.actionTime.localeCompare(b.actionTime));

    const clockIns = todayRecords.filter(
      (r: any) => r.actionType === 'ClockIn',
    );
    const clockOuts = todayRecords.filter(
      (r: any) => r.actionType === 'ClockOut',
    );

    this.todayClockIn = clockIns.length ? clockIns[0].actionTime : '--:--';
    this.todayClockOut = clockOuts.length
      ? clockOuts[clockOuts.length - 1].actionTime
      : '--:--';

    if (this.todayClockIn !== '--:--' && this.todayClockOut !== '--:--') {
      const start = this.parseTime(this.todayClockIn);
      const end = this.parseTime(this.todayClockOut);
      const diffMs = end.getTime() - start.getTime();

      if (diffMs > 0) {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        this.todayDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      } else {
        this.todayDuration = '--:--';
      }
    } else {
      this.todayDuration = '--:--';
    }
  }

  setAvailableActions() {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = this.attendanceRecords
      .filter((r: any) => r.attendanceDate.startsWith(today))
      .sort((a: any, b: any) => a.actionTime.localeCompare(b.actionTime));

    if (todayRecords.length === 0) {
      this.availableActions = ['ClockIn'];
      return;
    }
  }
  loadAttendance() {
    this.adminService.getTodayAttendance(
      String(this.employeeCode),
      this.companyId,
      this.regionId
    ).subscribe(res => {
      this.attendanceRecords = res;

      this.setTodaySummary();
      this.setAvailableActions();

      // ✅ IMPORTANT FIX
      this.syncClockStateWithAPI();
      this.calculateEarlyLate();
    });
  }
  syncClockStateWithAPI() {

  syncClockStateWithAPI() {
    const today = new Date().toISOString().split('T')[0];

    const todayRecords = this.attendanceRecords
      .filter((r: any) => r.attendanceDate.startsWith(today))
      .sort((a: any, b: any) => a.actionTime.localeCompare(b.actionTime));

    if (todayRecords.length === 0) {
      this.isClockedIn = false;
      this.clockStatus = 'Not Clocked In';
      this.clockInDisplay = '--:--:--';
      this.totalHoursDisplay = '00:00:00';
      return;
    }

    const lastRecord = todayRecords[todayRecords.length - 1];

    if (lastRecord.actionType === 'ClockIn') {
      this.isClockedIn = true;
      this.clockStatus = 'Clocked In';
      this.clockInTime = this.parseTime(lastRecord.actionTime);
      this.clockInDisplay = lastRecord.actionTime;
      sessionStorage.setItem('clockInTime', this.clockInTime.toISOString());
      this.startTimer();
    } else {
      this.isClockedIn = false;
      this.clockStatus = 'Clocked Out';
      this.stopTimer();
      sessionStorage.removeItem('clockInTime');
    }
  }

  loadUserShift() {
    const companyId = Number(sessionStorage.getItem('CompanyId'));
    const regionId = Number(sessionStorage.getItem('RegionId'));

    this.employeeResignationService
      .getAllAllocations(this.userId)
      .subscribe((allocations: any[]) => {
        console.log('Allocations 👉', allocations);

        const today = new Date().toISOString().split('T')[0];

        const activeAllocation = allocations.find((a) => {
          const start = a.startDate ? a.startDate.split('T')[0] : null;
          const end = a.endDate ? a.endDate.split('T')[0] : null;

          return (
            a.isActive &&
            a.companyID == companyId &&
            a.regionID == regionId &&
            start <= today &&
            (!end || end >= today)
          );
        });

        if (!activeAllocation) {
          console.warn('No active shift found');
          this.showClockButton = false;
          return;
        }

        this.adminService
          .getShiftsForDropdown(companyId, regionId)
          .subscribe((shifts: any[]) => {
            const shift = shifts.find(
              (s) => s.shiftID == activeAllocation.shiftID,
            );

            if (!shift) {
              console.warn('Shift not found in master');
              return;
            }

            this.shiftStartTime = shift.shiftStartTime;
            console.log('Shift Start Time 👉', this.shiftStartTime);

            this.employeeResignationService
              .getShiftallocationNameForClockInOut(
                this.employeeCode || '',
                companyId,
                regionId,
              )
              .subscribe((res) => {
                console.log('Shift Extra Info 👉', res);
                this.graceTime = res.grassTime || '00:00';
                console.log('Grace Time 👉', this.graceTime);

                this.checkClockButtonVisibility();
              });
          });
      });
  }

  checkClockButtonVisibility() {
    if (!this.shiftStartTime) {
      this.showClockButton = false;
      return;
    }

    const now = new Date();
    const [hours, minutes] = this.shiftStartTime.split(':').map(Number);

    const shiftStart = new Date();
    shiftStart.setHours(hours, minutes, 0, 0);

    const allowedTime = new Date(shiftStart.getTime() - 30 * 60 * 1000);
    const shiftEndLimit = new Date(shiftStart.getTime() + 2 * 60 * 60 * 1000);

    this.allowedClockTimeText = this.formatDisplayTime(allowedTime);
    this.showClockButton = now >= allowedTime && now <= shiftEndLimit;
  }

  formatDisplayTime(date: Date): string {
    let hours = date.getHours();
    let minutes: any = date.getMinutes();

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes.toString().padStart(2, '0');

    return `${hours}:${minutes} ${ampm}`;
  }

getInitialOptions() {
  const role = this.getUserRole();


  


  if (role.includes('hr')) {
    return [
      { label: '👥 Employee Mgmt', action: 'hr_employee_mgmt' },
      { label: '✅ Approvals', action: 'hr_approvals' },
      { label: '📊 Reports', action: 'hr_reports' },
      { label: '⚙️ HR Settings', action: 'hr_settings' },
      
    ];
  }

  if (role.includes('manager')) {
    return [
      // { label: '👥 Team Info', action: 'manager_team_info' },
      { label: '📋 Team Attendance', action: 'manager_attendance' },
      { label: '📝 Team Leave', action: 'manager_leave' },
      { label: '✅ Approvals', action: 'manager_approvals' }
    ];
  }

  return [
    { label: '📊 HR Services', action: 'section_hr' },
    { label: '🏢 Company Info', action: 'section_company' }
  ];
}

  showQuickOptions() {
    this.addMessage('bot', 'Here are some things I can help you with 👇', [
      { label: 'About CORtracker', action: 'faq', value: 'cortracker' },
      { label: 'Services', action: 'faq', value: 'services' },
      { label: 'Work Culture', action: 'faq', value: 'culture' },
    ]);
  }

  getFaqResponse(input: string): any {
    input = input.toLowerCase();

    for (let faq of this.faqList) {
      for (let key of faq.keywords) {
        if (input.includes(key)) {
          return faq;
        }
      }
    }

    return null;
  }

  addMessage(
    type: string,
    text: string,
    buttons: any[] = [],
    cardType: string = 'text',
    items: any[] = [],
    fileUrl: string = '',
    workflow: any[] = [],
    extraData: any = null,
  ) {
    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    this.messages.push({
      type,
      text,
      time,
      buttons,
      cardType,
      items,
      fileUrl,
      workflow,
      extraData,
    });

    this.scrollToBottom();
  }

  sendMessage() {
    if (!this.userInput.trim() && !this.selectedFile) return;

    const input = this.userInput.trim();

    if (input) {
      this.addMessage('user', input);
    }

    this.userInput = '';
    this.isTyping = true;

    setTimeout(() => {
      this.isTyping = false;

      if (this.selectedFile) {
        this.addMessage(
          'bot',
          `📄 File "${this.selectedFile.name}" received successfully ✅`,
        );
        this.selectedFile = null;
        return;
      }
      const handledLocally = this.handleUserQuery(input);
      if (handledLocally) {
        this.isTyping = false;
        return;
      }
      this.http
        .post<any>('http://localhost:46020/api/chat', {
          message: input,
        })
        .subscribe({
          next: (res) => {
            this.isTyping = false;

            let items: string[] = [];
            let workflow: string[] = [];
            let displayText = res.text || res.title || '';

            if (res.type === 'steps' && res.text) {
              items = res.text.split('\n');
              displayText = res.title || res.text;
            }

            if (res.type === 'workflow' && res.text) {
              workflow = res.text.split('\n');
              displayText = res.title || res.text;
            }

            if (res.type === 'text') {
              displayText = res.text;
            }

            this.addMessage(
              'bot',
              displayText,
              [],
              res.type,
              items,
              res.fileUrl || '',
              workflow,
            );
          },
          error: (err) => {
            console.log(err);
            this.isTyping = false;
            this.addMessage('bot', '⚠️ Unable to connect to chatbot server.');
          },
        });
    }, 800);
  }

  handleUserQuery(input: string): boolean {
    input = input.toLowerCase().trim();

    // =========================
    // FAQ FIRST
    // =========================
    const faq = this.getFaqResponse(input);
    if (faq) {
      this.addMessage('bot', faq.text, faq.buttons || []);
      return true;
    }

    // =========================
    // LOCAL COMMANDS
    // =========================
    const localCommand = this.getLocalCommand(input);

    if (localCommand === 'punch_in') {
      if (this.isClockedIn) {
        this.addMessage('bot', '⚠️ You are already clocked in ⏱️');
        return true;
      }

      this.addMessage('bot', 'Punching you in... ⏱️');
      this.toggleClock();
      return true;
    }

    if (localCommand === 'punch_out') {
      if (!this.isClockedIn) {
        this.addMessage('bot', '⚠️ You are not clocked in');
        return true;
      }

      this.addMessage('bot', 'Punching you out... ⏱️');
      this.toggleClock();
      return true;
    }

    // =========================
    // SMART INTENT MATCHING
    // =========================
    const matchedIntent = this.intentMap.find((intent) =>
      intent.keywords.some((k) => input.includes(k)),
    );

    if (matchedIntent) {
      if (matchedIntent.action === 'navigate' && matchedIntent.url) {
        this.addMessage('bot', `${matchedIntent.label} help is available 👇`);
        return true;
      }

      if (
        matchedIntent.action === 'punch_in' ||
        matchedIntent.action === 'punch_out'
      ) {
        return true;
      }
    }

    // =========================
    // NOT HANDLED
    // =========================
    return false;
  }

  handleAction(btn: any) {



    if (btn.action === 'hr_employee_mgmt') {
  this.addMessage('bot', 'You can manage employees from the HR module.');
  return;
}

if (btn.action === 'hr_approvals') {
  this.addMessage('bot', 'You can review HR approvals here.');
  return;
}

if (btn.action === 'hr_reports') {
  this.addMessage('bot', 'You can view HR reports here.');
  return;
}

if (btn.action === 'hr_settings') {
  this.addMessage('bot', 'You can open HR settings here.');
  return;
}

if (btn.action === 'manager_team_info') {
  this.addMessage('bot', 'Here is your team information.');
  return;
}

if (btn.action === 'manager_attendance') {
  this.addMessage('bot', 'Here is team attendance.');
  return;
}

if (btn.action === 'manager_leave') {
  this.addMessage('bot', 'Here is team leave status.');
  return;
}

if (btn.action === 'manager_approvals') {
  this.addMessage('bot', 'Here are pending approvals for your team.');
  return;
}



    this.addMessage('user', btn.label);
    this.isTyping = true;

    setTimeout(() => {
      this.isTyping = false;

      // if (btn.action === 'section_hr') {
      //   this.addMessage('bot', 'Here are HR services you can access 👇', [
      //     { label: 'Leave Balance', action: 'leave_balance' },
      //     { label: 'Attendance', action: 'attendance_status' },
      //     { label: 'Job History', action: 'navigate', url: '/skills' },
      //     { label: 'Profile Info', action: 'navigate', url: '/profile' },
      //     { label: 'Salary Slips', action: 'salary_slip' },
      //   ]);
      //   return;
      // }



      if (btn.action === 'section_hr') {
  this.addMessage(
    'bot',
    'Here are HR services you can access 👇',
    [
      { label: 'Leave Balance', action: 'navigate', url: '/leave-management' },
      { label: 'Attendance', action: 'navigate', url: '/attendance-list' },
      { label: 'Salary Slips', action: 'salary_slip' },
      { label: 'Profile Info', action: 'navigate', url: '/profile' }
    ]
  );
  return;
}



      if (btn.action === 'section_company') {
        this.addMessage('bot', 'Here is company information 👇', [
          { label: 'About CORtracker', action: 'faq', value: 'cortracker' },
          { label: 'Services', action: 'faq', value: 'services' },
          { label: 'Work Culture', action: 'faq', value: 'culture' },
        ]);
        return;
      }

      if (btn.action === 'faq') {
        this.handleUserQuery(btn.value);

        if (btn.value === 'cortracker') {
          setTimeout(() => {
            this.addMessage('bot', 'Want to explore more?', [
              {
                label: 'Open Official Website',
                action: 'external',
                url: 'https://www.cortracker360.com/index.php',
              },
            ]);
          }, 500);
        }

        return;
      }

      if (btn.action === 'leave_balance') {
        this.isTyping = true;

        const userId = Number(sessionStorage.getItem('UserId'));

        this.leaveService.getMyLeaves(userId).subscribe({
          next: (data: any) => {
            this.isTyping = false;

            const leaves = Array.isArray(data) ? data : data?.data || [];

            let sickUsed = 0;
            let casualUsed = 0;

            leaves.forEach((l: any) => {
              const type = (l.leaveType || l.LeaveType || '').toLowerCase();
              const days = l.totalDays || l.TotalDays || 0;

              if (type.includes('sick')) sickUsed += days;
              if (type.includes('casual')) casualUsed += days;
            });

            const totalSick = 10;
            const totalCasual = 10;

            const sickBalance = totalSick - sickUsed;
            const casualBalance = totalCasual - casualUsed;

            this.addMessage('bot', '', [], 'leaveCard', [], '', [], {
              sick: sickBalance,
              casual: casualBalance,
            });
          },
          error: (err) => {
            console.error(err);
            this.isTyping = false;
            this.addMessage('bot', '⚠️ Unable to fetch leave balance');
          },
        });

        return;
      }

      if (btn.action === 'attendance_status') {
        this.isTyping = true;

        const employeeCode = sessionStorage.getItem('EmployeeCode') || '';
        const companyId = Number(sessionStorage.getItem('CompanyId'));
        const regionId = Number(sessionStorage.getItem('RegionId'));

        this.adminService
          .getTodayAttendance(employeeCode, companyId, regionId)
          .subscribe({
            next: (res: any[]) => {
              this.isTyping = false;

              const clockIns = res.filter((x) => x.actionType === 'ClockIn');
              const clockOuts = res.filter((x) => x.actionType === 'ClockOut');

              const checkIn =
                clockIns.length > 0 ? clockIns[0].actionTime : '--:--';
              const checkOut =
                clockOuts.length > 0
                  ? clockOuts[clockOuts.length - 1].actionTime
                  : '--:--';
              const status = checkIn !== '--:--' ? 'Present' : 'Absent';

              this.addMessage('bot', '', [], 'attendanceCard', [], '', [], {
                status,
                checkIn,
                checkOut,
                date: new Date().toLocaleDateString(),
              });
            },
            error: (err) => {
              console.error(err);
              this.isTyping = false;
              this.addMessage('bot', '⚠️ Unable to fetch attendance');
            },
          });

        return;
      }

      if (btn.action === 'salary_slip') {
        this.addMessage('bot', '', [], 'salaryCard', [], '', [], {
          month: 'May 2025',
          generatedDate: '20 May 2025',
          fileUrl: '/files/hrms_training.pptx',
        });
        return;
      }

      if (btn.action === 'navigate') {
        this.addMessage('bot', `Opening ${btn.label}...`);

        setTimeout(() => {
          this.router.navigateByUrl(btn.url);
        }, 500);

        return;
      }

      if (btn.action === 'external') {
        this.addMessage('bot', 'Opening official website... 🌐');

        setTimeout(() => {
          window.open(btn.url, '_blank');
        }, 500);

        return;
      }

      this.addMessage('bot', 'Okay 👍');
    }, 600);
  }

  resetChat() {
    this.messages = [];
    this.userInput = '';
    this.isTyping = false;

    this.addMessage(
      'bot',
      "Hi 👋 I'm your HRMS Assistant. How can I help you today?",
      this.getInitialOptions(),
    );
  }

  scrollToBottom() {
    setTimeout(() => {
      const container = document.getElementById('chatContainer');
      if (container) {
        container.scrollTop = container.scrollHeight + 500;
      }
    }, 100);
  }

toggleChat() {
  this.isOpen = !this.isOpen;

  if (this.isOpen && this.messages.length === 0) {
    const role = this.getUserRole();
    const welcomeText =
      role.includes('hr')
        ? "Hi 👋 I'm your HR assistant. I can help with employee management, approvals, reports, and settings."
        : role.includes('manager')
        ? "Hi 👋 I'm your manager assistant. I can help with team info, attendance, leave, and approvals."
        : "Hi 👋 I'm your employee assistant. I can help with leave, attendance, salary, and profile.";

    this.addMessage('bot', welcomeText, this.getInitialOptions());
  }
}

  initVoiceRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.addMessage('user', transcript);
      this.handleUserQuery(transcript.toLowerCase());
    };

    this.recognition.onerror = () => {
      this.isListening = false;
      this.addMessage('bot', '🎤 Voice error. Try again');
    };
  }

  startListening() {
    if (!this.recognition) {
      this.initVoiceRecognition();
    }

    this.recognition.start();
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  // loadUserShift() {

  //   const companyId = Number(sessionStorage.getItem('CompanyId'));
  //   const regionId = Number(sessionStorage.getItem('RegionId'));

  //   this.employeeResignationService.getAllAllocations(this.userId)
  //     .subscribe((allocations: any[]) => {

  //       console.log('Allocations 👉', allocations);

  //       const today = new Date().toISOString().split('T')[0];

  //       // ✅ STEP 1: Filter by Company + Region + Active Date
  //       const activeAllocation = allocations.find(a => {

  //         const start = a.startDate ? a.startDate.split('T')[0] : null;
  //         const end = a.endDate ? a.endDate.split('T')[0] : null;

  //         return (
  //           a.isActive &&
  //           a.companyID == companyId &&
  //           a.regionID == regionId &&
  //           start <= today &&
  //           (!end || end >= today)
  //         );
  //       });

  //       if (!activeAllocation) {
  //         console.warn('No active shift found');
  //         this.showClockButton = false;
  //         return;
  //       }

  //       console.log('Active Allocation 👉', activeAllocation);

  //       // ✅ STEP 2: Get Shift Master Details
  //       this.adminService
  //         .getShiftsForDropdown(companyId, regionId)
  //         .subscribe((shifts: any[]) => {

  //           console.log('Shifts 👉', shifts);

  //           const shift = shifts.find(s => s.shiftID == activeAllocation.shiftID);

  //           if (!shift) {
  //             console.warn('Shift not found in master');
  //             return;
  //           }

  //           // ✅ FINAL: Assign Start Time
  //           this.shiftStartTime = shift.shiftStartTime;

  //           console.log('Shift Start Time 👉', this.shiftStartTime);

  //           this.checkClockButtonVisibility();
  //         });
  //     });
  // }
  loadUserShift() {

    const companyId = Number(sessionStorage.getItem('CompanyId'));
    const regionId = Number(sessionStorage.getItem('RegionId'));

    this.employeeResignationService.getAllAllocations(this.userId)
      .subscribe((allocations: any[]) => {

        console.log('Allocations 👉', allocations);

        const today = new Date().toISOString().split('T')[0];

        // ✅ STEP 1: Filter active allocation
        const activeAllocation = allocations.find(a => {

          const start = a.startDate ? a.startDate.split('T')[0] : null;
          const end = a.endDate ? a.endDate.split('T')[0] : null;

          return (
            a.isActive &&
            a.companyID == companyId &&
            a.regionID == regionId &&
            start <= today &&
            (!end || end >= today)
          );
        });

        if (!activeAllocation) {
          console.warn('No active shift found');
          this.showClockButton = false;
          return;
        }

        console.log('Active Allocation 👉', activeAllocation);

        // ✅ STEP 2: Get Shift Master
        this.adminService
          .getShiftsForDropdown(companyId, regionId)
          .subscribe((shifts: any[]) => {

            console.log('Shifts 👉', shifts);

            const shift = shifts.find(s => s.shiftID == activeAllocation.shiftID);

            if (!shift) {
              console.warn('Shift not found in master');
              return;
            }

            // ✅ SET SHIFT START
            this.shiftStartTime = shift.shiftStartTime;

            console.log('Shift Start Time 👉', this.shiftStartTime);

            // ✅ STEP 3: GET GRACE TIME (NEW 🔥)
            this.employeeResignationService
              .getShiftallocationNameForClockInOut(
                this.employeeCode || '',   // ✅ SAFE FIX
                companyId,
                regionId
              )
              .subscribe(res => {

                console.log('Shift Extra Info 👉', res);

                this.graceTime = res.grassTime;

                console.log('Grace Time 👉', this.graceTime);

                this.checkClockButtonVisibility();
                //   this.calculateEarlyLate();
              });

          });
      });
  }


  calculateEarlyLate() {

    if (!this.shiftStartTime || !this.graceTime || !this.todayClockIn || this.todayClockIn === '--:--') {
      this.earlyLateStatus = '';
      return;
    }

    // ✅ SHIFT START
    const [shiftH, shiftM] = this.shiftStartTime.split(':').map(Number);
    const shiftStart = new Date();
    shiftStart.setHours(shiftH, shiftM, 0, 0);

    // ✅ GRACE END
    const [gH, gM] = this.graceTime.split(':').map(Number);
    const graceEnd = new Date(shiftStart.getTime() + ((gH * 60 + gM) * 60000));

    // ✅ ACTUAL CLOCK-IN (IMPORTANT 🔥)
    const clockIn = this.parseTime(this.todayClockIn);

    // =========================
    // ✅ EARLY LOGIN
    // =========================
    if (clockIn < shiftStart) {

      const diff = shiftStart.getTime() - clockIn.getTime();

      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      this.earlyLateStatus = `Early by ${hrs}h ${mins}m`;
      return;
    }

    // =========================
    // ✅ LATE LOGIN
    // =========================
    if (clockIn > graceEnd) {

      const diff = clockIn.getTime() - graceEnd.getTime();

      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      this.earlyLateStatus = `Late by ${hrs}h ${mins}m`;
      return;
    }

    // =========================
    // ✅ ON TIME
    // =========================
    this.earlyLateStatus = 'On Time';
  }

  getEarlyLateClass(): string {

    if (!this.earlyLateStatus) return '';

    const text = this.earlyLateStatus.toLowerCase();

    if (text.includes('late')) return 'badge-late';
    if (text.includes('early')) return 'badge-early';
    if (text.includes('on time')) return 'badge-ontime';

    return 'badge-default';
  }

  checkClockButtonVisibility() {
    if (!this.shiftStartTime) {
      this.showClockButton = false;
      return;
    }

    const now = new Date();

    const [hours, minutes] = this.shiftStartTime.split(':').map(Number);

    const shiftStart = new Date();
    shiftStart.setHours(hours, minutes, 0, 0);

    // ⏪ 30 mins before
    const allowedTime = new Date(shiftStart.getTime() - (30 * 60 * 1000));

    // ❌ After shift start + grace (optional)
    const shiftEndLimit = new Date(shiftStart.getTime() + (2 * 60 * 60 * 1000)); // 2 hrs buffer

    this.allowedClockTimeText = this.formatDisplayTime(allowedTime);

    // ✅ FINAL CONDITION
    this.showClockButton = now >= allowedTime && now <= shiftEndLimit;

    console.log('Now:', now);
    console.log('Allowed:', allowedTime);
    console.log('Shift Start:', shiftStart);
    console.log('Show Button:', this.showClockButton);
  }

  formatDisplayTime(date: Date): string {
    let hours = date.getHours();
    let minutes: any = date.getMinutes();

    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // 0 => 12

    minutes = minutes.toString().padStart(2, '0');

    return `${hours}:${minutes} ${ampm}`;
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.addMessage('user', `📎 ${file.name}`);
    }
  }
}
