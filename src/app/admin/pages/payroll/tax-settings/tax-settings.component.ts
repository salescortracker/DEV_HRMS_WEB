import { Component, OnInit } from '@angular/core';
import { EmployeePayRollService } from '../../../../employee-pay-roll.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tax-settings',
  standalone: false,
  templateUrl: './tax-settings.component.html',
  styleUrl: './tax-settings.component.css'
})
export class TaxSettingsComponent implements OnInit {
  userId!: number;
  companyId: number | null = null;
  regionId: number | null = null;

  structure: any;
  structures: any[] = [];
  salaryComponents: any[] = [];

  companies: any[] = [];
  regions: any[] = [];

  companyMap: { [key: string]: string } = {};
  regionMap: { [key: string]: string } = {};

  isEditMode = false;
  searchText = '';
  currentPage = 1;
  pageSize = 5;
  filteredRegions: any[] = [];

  departments: any[] = [];
  designations: any[] = [];
  filteredDepartments: any[] = [];
  filteredDesignations: any[] = [];

  departmentMap: { [key: number]: string } = {};
  designationMap: { [key: number]: string } = {};

  constructor(private payrollService: EmployeePayRollService) { }

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem('UserId'));
    this.companyId = sessionStorage.getItem('CompanyId') ? Number(sessionStorage.getItem('CompanyId')) : null;
    this.regionId = sessionStorage.getItem('RegionId') ? Number(sessionStorage.getItem('RegionId')) : null;

    this.structure = this.getEmptyStructure();
    this.structure.companyId = this.companyId;
    this.structure.regionId = this.regionId;

    this.loadDepartments();
    this.loadDesignations();
    this.loadStructures();
    this.loadSalaryComponents();
    this.loadCompanies();
    this.loadRegions();
  }

  getEmptyStructure() {
    return {
      structureName: '',
      departmentId: null,
      designationId: null,
      gradeId: null,
      gradeName: '',
      isActive: true,
      companyId: null,
      regionId: null,
      components: []
    };
  }

  loadStructures() {
    this.payrollService.getAllSalaryStructures(this.userId).subscribe((res: any) => {
      console.log('Salary Structures API Response:', res);
      this.structures = (res || []).map((s: any) => ({
        ...s,
        regionId: Number(s.regionId),
        companyId: Number(s.companyId)
      }));
      console.log('Normalized Structures:', this.structures);
    });
  }

  loadSalaryComponents() {
    this.payrollService.getComponents(this.userId).subscribe((res: any) => (this.salaryComponents = res || []));
  }

  loadCompanies() {
    this.payrollService.getCompanies(this.userId).subscribe((res: any) => {
      this.companies = res || [];
      this.companies.forEach(c => {
        this.companyMap[c.companyId] = c.companyName;
      });
      this.syncDependentDropdowns();
    });
  }

  loadRegions() {
    this.payrollService.getRegions(this.userId).subscribe((res: any) => {
      if (res && Array.isArray(res)) {
        this.regions = res.map((r: any) => ({
          regionId: Number(r.regionID ?? r.regionId ?? r.RegionID ?? r.RegionId),
          regionName: r.regionName,
          companyID: Number(r.companyID ?? r.companyId ?? r.CompanyID ?? r.CompanyId)
        }));

        this.regionMap = {};
        this.regions.forEach(r => {
          this.regionMap[r.regionId] = r.regionName;
        });
      } else {
        this.regions = [];
      }

      this.syncDependentDropdowns();
      console.log('Region Map:', this.regionMap);
    });
  }

  onCompanyChange() {
    this.structure.regionId = null;
    this.structure.departmentId = null;
    this.structure.designationId = null;
    this.structure.gradeId = null;
    this.structure.gradeName = '';
    this.syncDependentDropdowns();
  }

  onRegionChange() {
    this.structure.departmentId = null;
    this.structure.designationId = null;
    this.structure.gradeId = null;
    this.structure.gradeName = '';
    this.syncDependentDropdowns();
  }

  onDepartmentChange() {
    this.structure.designationId = null;
    this.structure.gradeId = null;
    this.structure.gradeName = '';
    this.syncDependentDropdowns();
  }

  private syncDependentDropdowns() {
    this.filteredRegions = this.structure.companyId
      ? this.regions.filter(r => Number(r.companyID) === Number(this.structure.companyId))
      : [];

    this.filteredDepartments = this.departments.filter((d: any) =>
      Number(d.companyID ?? d.companyId ?? d.CompanyID ?? d.CompanyId) === Number(this.structure.companyId) &&
      Number(d.regionID ?? d.regionId ?? d.RegionID ?? d.RegionId) === Number(this.structure.regionId)
    );

    this.filteredDesignations = this.structure.departmentId
      ? this.designations.filter((d: any) =>
          Number(d.departmentId ?? d.departmentID ?? d.DepartmentId ?? d.DepartmentID) === Number(this.structure.departmentId)
        )
      : [];


       // Designations based on Company + Region + Department
  this.filteredDesignations = this.designations.filter((d: any) =>
    Number(d.companyId) === Number(this.structure.companyId) &&
    Number(d.regionId) === Number(this.structure.regionId) &&
    Number(d.departmentId) === Number(this.structure.departmentId)
    );
  }

  private normalizeSelectedValues() {
    this.structure.companyId = this.structure.companyId ? Number(this.structure.companyId) : null;
    this.structure.regionId = this.structure.regionId ? Number(this.structure.regionId) : null;
    this.structure.departmentId = this.structure.departmentId ? Number(this.structure.departmentId) : null;
    this.structure.designationId = this.structure.designationId ? Number(this.structure.designationId) : null;
    this.structure.gradeId = this.structure.gradeId ? Number(this.structure.gradeId) : null;
  }

  loadDepartments() {
    this.payrollService.getDepartments(this.userId).subscribe((res: any) => {
      console.log('Departments API:', res);

      if (res && res.success && Array.isArray(res.data.data)) {
        this.departments = res.data.data;
        this.departments.forEach((d: any) => {
          this.departmentMap[d.departmentId] = d.description;
        });
      } else {
        this.departments = [];
      }

      this.syncDependentDropdowns();
    });
  }

  loadDesignations() {
    this.payrollService.getDesignations(this.userId).subscribe((res: any) => {
      const data = Array.isArray(res)
        ? res
        : (res?.data?.data ?? res?.data ?? res ?? []);

      this.designations = Array.isArray(data)
        ? data.map((d: any) => ({
            designationId: Number(d.designationID ?? d.designationId ?? d.DesignationID ?? d.DesignationId),
            designationName: d.designationName ?? d.DesignationName ?? '',
            gradeId: d.gradeID ?? d.gradeId ?? d.GradeID ?? d.GradeId,
            gradeName: d.gradeName ?? d.GradeName ?? '',
            companyId: d.companyId ?? d.companyID ?? d.CompanyId ?? d.CompanyID,
            regionId: d.regionId ?? d.regionID ?? d.RegionId ?? d.RegionID,
            departmentId: d.departmentId ?? d.departmentID ?? d.DepartmentId ?? d.DepartmentID
          }))
        : [];

      this.syncDependentDropdowns();
    });
  }

  addComponent() {
    this.structure.components.push({
      componentId: null,
      value: null,
      calculationType: ''
    });
  }

  removeComponent(index: number) {
    this.structure.components.splice(index, 1);
  }

  onSubmit() {
    this.normalizeSelectedValues();

    console.log('Final Payload:', this.structure);

    Swal.fire({
      title: 'Processing...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const request$ = this.isEditMode && this.structure.structureId
      ? this.payrollService.updateSalaryStructure(this.structure.structureId, this.userId, this.structure)
      : this.payrollService.createSalaryStructure(this.userId, this.structure);

    request$.subscribe(() => {
      Swal.close();
      Swal.fire(this.isEditMode ? 'Updated!' : 'Created!', '', 'success');
      this.loadStructures();
      this.resetForm();
    });
  }

  editStructure(s: any) {
    this.payrollService.getSalaryStructureById(s.structureId, this.userId).subscribe((res: any) => {
      console.log('Edit Response:', res);

      res.companyId = res.companyId ? Number(res.companyId) : null;
      res.regionId = res.regionId ? Number(res.regionId) : null;
      res.departmentId = res.departmentId ? Number(res.departmentId) : null;
      res.designationId = res.designationId ? Number(res.designationId) : null;
      res.gradeId = res.gradeId ? Number(res.gradeId) : null;

      this.structure = res;
      this.syncDependentDropdowns();

      const selectedDesignation = this.designations.find(
        d => Number(d.designationId) === Number(this.structure.designationId)
      );

      if (selectedDesignation) {
        this.structure.gradeId = selectedDesignation.gradeId;
        this.structure.gradeName = selectedDesignation.gradeName;
      }

      console.log('Filtered Regions:', this.filteredRegions);
      console.log('Final Structure:', this.structure);

      this.isEditMode = true;
    });
  }

  deleteStructure(s: any) {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        this.payrollService.deleteSalaryStructure(s.structureId, this.userId).subscribe(() => {
          Swal.fire('Deleted!', '', 'success');
          this.loadStructures();
        });
      }
    });
  }

  resetForm() {
    this.structure = this.getEmptyStructure();
    this.structure.companyId = this.companyId;
    this.structure.regionId = this.regionId;
    this.syncDependentDropdowns();
    this.isEditMode = false;
  }

  filteredStructures() {
    return this.structures.filter(s => s.structureName?.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  paginatedStructures() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredStructures().slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredStructures().length / this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
      console.log('Page:', this.currentPage);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  onSearchChange() {
    this.currentPage = 1;
  }

  onDesignationChange() {
    const selected = this.designations.find(
      d => Number(d.designationId) === Number(this.structure.designationId)
    );

    if (selected) {
      this.structure.gradeId = selected.gradeId;
      this.structure.gradeName = selected.gradeName;
    } else {
      this.structure.gradeId = null;
      this.structure.gradeName = '';
    }

    console.log('Selected Designation:', selected);
  }
}
