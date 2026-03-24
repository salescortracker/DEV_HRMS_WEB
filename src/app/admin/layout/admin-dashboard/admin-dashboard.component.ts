import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { EmployeePayRollService } from '../../../employee-pay-roll.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
   
  userId!: number;

  employees: any[] = [];
  payrollList: any[] = [];
  departments: any[] = [];

  totalPayrollAmount = 0;
  today: Date = new Date();
  stats: any[] = [];

  performanceChart: any;
  deptChart: any;

  constructor(private payrollService: EmployeePayRollService) {}

  /* ================= INIT ================= */

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem('UserId'));
    this.loadDepartments();
    this.loadEmployees();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initPerformanceChart();
    }, 500);
  }

  /* ================= LOAD DEPARTMENTS ================= */

  loadDepartments() {
    this.payrollService.getDepartments(this.userId)
      .subscribe((res: any) => {

        // Handles both API types
        if (res?.success) {
          this.departments = res.data || [];
        } else {
          this.departments = res || [];
        }

        this.prepareStats();
      });
  }

  /* ================= LOAD EMPLOYEES ================= */

  loadEmployees() {
    this.payrollService.getEmployees(this.userId)
      .subscribe(res => {

        this.employees = res || [];

        // Load payroll AFTER employees loaded
        this.loadPayroll();

        this.prepareStats();
        this.initDeptChart(); // Chart depends on employees
      });
  }

  /* ================= LOAD PAYROLL ================= */

  getMonthName(monthNumber: number): string {
  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1] || '';
}

loadPayroll() {

  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  this.payrollService
    .getPayrollByMonth(month, year, this.userId)
    .subscribe(res => {

      // 🔥 Create employee lookup map
      const employeeMap: any = {};

      this.employees.forEach(emp => {
        employeeMap[Number(emp.userId)] = emp;
      });

      // 🔥 Map payroll data
      this.payrollList = (res || []).map(p => {

        const payrollUserId = Number(p.userId ?? p.employeeId);

        const emp = employeeMap[payrollUserId];

        return {
          ...p,
          fullName: emp?.fullName || '-',
          employeeCode: emp?.employeeCode || '-',
          monthName: this.getMonthName(p.month)
        };
      });

      this.totalPayrollAmount = this.payrollList
        .reduce((sum, p) => sum + (p.netSalary || 0), 0);

      this.prepareStats();
    });
}

  /* ================= PREPARE STATS ================= */

  prepareStats() {

    this.stats = [
      {
        title: 'Employees',
        value: this.employees.length || 0,
        icon: 'fa-users',
        color: '#922b21'
      },
      {
        title: 'Departments',
        value: this.departments.length || 0,
        icon: 'fa-building',
        color: '#1e88e5'
      },
      {
        title: 'Payroll (This Month)',
        value: '₹' + (this.totalPayrollAmount || 0).toLocaleString(),
        icon: 'fa-indian-rupee-sign',
        color: '#43a047'
      },
      {
        title: 'Pending Payroll',
        value: this.payrollList.filter(p => p.status !== 'Processed').length,
        icon: 'fa-clock',
        color: '#f39c12'
      }
    ];
  }

  /* ================= PERFORMANCE CHART ================= */

  initPerformanceChart() {

    if (this.performanceChart) {
      this.performanceChart.destroy();
    }

    this.performanceChart = new Chart('performanceChart', {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Attendance %',
            data: [94, 96, 92, 97],
            borderColor: '#922b21',
            fill: false,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  /* ================= DEPARTMENT CHART ================= */

  initDeptChart() {

    if (this.deptChart) {
      this.deptChart.destroy();
    }

    const deptCounts: any = {};

    this.employees.forEach(emp => {
      const dept = emp.departmentName || 'Others';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    this.deptChart = new Chart('deptChart', {
      type: 'doughnut',
      data: {
        labels: Object.keys(deptCounts),
        datasets: [
          {
            data: Object.values(deptCounts),
            backgroundColor: [
              '#922b21',
              '#1e88e5',
              '#43a047',
              '#fbc02d',
              '#8e24aa'
            ]
          }
        ]
      },
      options: {
        responsive: true,
        cutout: '70%',
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }
}
