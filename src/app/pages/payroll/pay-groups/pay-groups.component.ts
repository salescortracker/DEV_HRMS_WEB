import { Component, OnInit } from '@angular/core';
import { EmployeePayRollService } from '../../../employee-pay-roll.service';
import Swal from 'sweetalert2';
import { AdminService } from '../../../admin/servies/admin.service';
@Component({
  selector: 'app-pay-groups',
  standalone: false,
  templateUrl: './pay-groups.component.html',
  styleUrl: './pay-groups.component.css'
})
export class PayGroupsComponent {
 userId!: number;
  companyId!: string;
  regionId!: string;

  salary: any;
  salaries: any[] = [];

  employees: any[] = [];
  filteredEmployees: any[] = [];
  structures: any[] = [];

  companies: any[] = [];
  regions: any[] = [];

  companyMap: { [key: string]: string } = {};
  regionMap: { [key: string]: string } = {};

  searchText = '';


  filteredRegions: any[] = [];
  constructor(private payrollService: EmployeePayRollService, private admin: AdminService) { }

  // ================= Init =================

  ngOnInit(): void {

    this.userId = Number(sessionStorage.getItem('UserId'));
    this.companyId = sessionStorage.getItem('CompanyId') || '';
    this.regionId = sessionStorage.getItem('RegionId') || '';

    this.salary = this.getEmptySalary();

    this.loadCompanies();
    this.loadRegions();
    this.loadStructures();
    this.loadAllAssignedSalaries();
  }

  // ================= Empty Model =================

  getEmptySalary() {
    return {
      employeeId: null,
      structureId: null,
      effectiveFrom: null,   // 🔥 must match DTO name
      ctc: null,             // 🔥 must match DTO
      companyId: this.companyId,
      regionId: this.regionId,
      isActive: true
    };
  }

  //================ Load Salries ==========================

  loadAllAssignedSalaries() {
    this.payrollService.getAllAssignedSalaries(this.userId)
      .subscribe({
        next: (res:any) => {
          console.log("loadAllAssignedSalaries:", res);   // 🔥 ADD THIS
          this.salaries = res || [];

            this.currentPage = 1; 
        },
        error: (err:any) => {
          console.error(err);
        }
      });
  }

  getEmployeeName(employeeId: number): string {
    const emp = this.employees.find(e => e.userId == employeeId);
    return emp ? emp.fullName : '';
  }

  getStructureName(structureId: number): string {
    const structure = this.structures.find(s => s.structureId == structureId);
    return structure ? structure.structureName : '';
  }

  // ================= Dropdown Loads =================

  loadCompanies() {
  this.payrollService.getCompanies(this.userId)
    .subscribe((res: any) => {

      this.companies = (res || []).filter((c: any) => c.isActive);

      this.companyMap = {};

      this.companies.forEach(c => {
        this.companyMap[c.companyId] = c.companyName;
      });
    });
}

loadRegions() {
  this.payrollService.getRegions(this.userId)
    .subscribe((res: any) => {

      const raw = res?.data ?? res ?? [];

      this.regions = raw
        .filter((r: any) => r.isActive)
        .map((r: any) => ({
          regionId: String(r.regionID),
          regionName: r.regionName,
          companyId: String(r.companyID),
          isActive: r.isActive
        }));

      this.regionMap = {};

      this.regions.forEach(r => {
        this.regionMap[String(r.regionId)] = r.regionName;
      });

      this.applyEmployeeFilter();
    });
}
onCompanyChange() {

  this.salary.regionId = null;
  this.salary.employeeId = null;

  this.filteredRegions = this.regions.filter(r =>
    Number(r.companyId) === Number(this.salary.companyId)
  );

  // Clear employees until region selected
  this.filteredEmployees = [];
}

onRegionChange() {

  this.salary.employeeId = null;

  if (this.salary.companyId && this.salary.regionId) {
    this.loadEmployees();
  }
  else {
    this.filteredEmployees = [];
  }
}
 loadEmployees() {

  const companyId = Number(this.salary.companyId);
  const regionId = Number(this.salary.regionId);

  this.admin.getUsersByCompanyRegion(companyId, regionId)
    .subscribe({
      next: (res: any[]) => {
        //  this.employees = res; 

        this.filteredEmployees = res.filter(x => x.status === 'Active');

        console.log(this.filteredEmployees);
      },
      error: (err) => {
        console.error(err);
          // this.employees = [];
        this.filteredEmployees = [];
      }
    });
}

  private applyEmployeeFilter() {
    this.filteredEmployees = this.employees.filter(e => {
      const matchesCompany = !this.salary?.companyId || Number(e.companyId) === Number(this.salary.companyId);
      const matchesRegion = !this.salary?.regionId || Number(e.regionId) === Number(this.salary.regionId);
      return matchesCompany && matchesRegion;
    });
  }

  loadStructures() {
  this.payrollService.getAllSalaryStructures(this.userId)
    .subscribe((res: any) => {

      this.structures = (res || []).filter((s: any) => s.isActive);

    });
}

  // ================= Assign Salary =================

  onSubmit() {

    if (!this.salary.employeeId || !this.salary.structureId) {
      Swal.fire('Error', 'Select Employee and Structure', 'error');
      return;
    }

    const payload = {
      employeeId: Number(this.salary.employeeId),
      structureId: Number(this.salary.structureId),
      effectiveFrom: this.salary.effectiveFrom,  // 🔥 correct name
      ctc: Number(this.salary.ctc || 0),
      isActive: true
    };

    console.log("Sending Payload:", payload);

    Swal.fire({
      title: 'Processing...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.payrollService.assignSalary(this.userId, payload)
      .subscribe({
        next: () => {
          Swal.close();
          Swal.fire('Assigned!', 'Salary assigned successfully', 'success');
          this.loadAllAssignedSalaries();
          this.getEmployeeSalary(payload.employeeId);
          this.resetForm();
        },
        error: (err:any) => {
          Swal.close();
          console.error(err);
          Swal.fire('Error', 'Something went wrong', 'error');
        }
      });
  }

  // ================= Get Employee Salary =================

  getEmployeeSalary(employeeId: number) {

    this.payrollService.getEmployeeSalary(
      employeeId,
      this.userId
    ).subscribe((res:any) => {
      this.salaries = res || [];
    });
  }

  // ================= When Employee Changes =================

  onEmployeeChange() {
    if (this.salary.employeeId) {
      this.getEmployeeSalary(this.salary.employeeId);
    }
  }

  // ================= Reset =================

  resetForm() {
    this.salary = this.getEmptySalary();
    this.filteredEmployees = [...this.employees];
  }

  // ================= Search Filter =================

  filteredSalaries() {
    return this.salaries.filter(s =>
      s.structureName?.toLowerCase()
        .includes(this.searchText.toLowerCase())
    );
  }

  //====================== Pagination Code ========================

currentPage = 1;
pageSize = 5;

get paginatedSalaries() {
  const start = (this.currentPage - 1) * this.pageSize;
  return this.salaries.slice(start, start + this.pageSize);
}

get totalPages() {
  return Math.ceil(this.salaries.length / this.pageSize);
}

changePage(page: number) {
  this.currentPage = page;
}
}
