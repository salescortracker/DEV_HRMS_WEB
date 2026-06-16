import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { RecruitmentService } from '../service/recruitment.service';

@Component({
  selector: 'app-onboarding',
  standalone: false,
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.css'
})
export class OnboardingComponent {
  showEmployeeModal = false;
  candidates: any[] = [];
  pageSizeOptions = [5, 10, 20, 50];
  tabs = ['Resume Upload', 'Screening', 'Interview', 'Appointment', 'Offer', 'Onboarding', 'Application Resumes'];
  totalStages = this.tabs.length;
  topSortColumn: string | null = null;
  topSortDirection: 'asc' | 'desc' = 'asc';
  screeningCandidates: any[] = [];

  screeningSelectedCandidates: any[] = [];
  departments: any[] = [];
 designations: any[] = [];
  candidate: any = {
    department: '',
    designation: '',
  };
  topPageSize = 5;
  topCurrentPage = 1;

  globalFilter = '';
  filterStage: any = '';
  onboardForm: any = { candidate: null, joiningDate: '', docsCollected: false, bgCheck: 'Pending', laptop: false, buddy: '' };
  userId!: number;
  companyId!: number;
  regionId!: number;
  selectedEmployeeCandidate: any = null;
 onDesignationChange() {
    const selected = this.designations.find(
      d => d.designationId == this.candidate.designationId
    );

    if (selected) {
      this.candidate.department = selected.departmentName || 'Not Assigned';
      this.candidate.designation = selected.designationName; // VERY IMPORTANT
    } else {
      this.candidate.department = '';
      this.candidate.designation = '';
    }
  }
  selectAllOnboarding(event: any) {

  const checked = event.target.checked;

  this.candidates.forEach(c => {
    c.selected = checked;
  });

}
openEmployeeModal() {

  const selected = this.candidates.filter(x => x.selected);

  if (selected.length === 0) {
    Swal.fire('Warning', 'Please select candidate', 'warning');
    return;
  }

  if (selected.length > 1) {
    Swal.fire('Warning', 'Please select only one candidate', 'warning');
    return;
  }

  this.selectedEmployeeCandidate = selected[0];
  this.showEmployeeModal = true;
}

closeEmployeeModal() {
  this.showEmployeeModal = false;
}
  constructor(private recruitmentService: RecruitmentService) { }
  ngOnInit(): void {

    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    if (!this.userId) {
      console.error("UserId missing in sessionStorage");
      return;
    }
    this.loadOnboardedCandidates();
     this.loadDesignations();
     this.loadDepartments();

  }

    loadDesignations() {
    this.recruitmentService
      .getRecruitmentDesignations(this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {
          this.designations = res;
        },
        error: () => {
          Swal.fire('Error', 'Failed to load designations', 'error');
        }
      });
  }
  loadDepartments() {
  this.recruitmentService
    .getRecruitmentDepartments(this.companyId, this.regionId)
    .subscribe({
      next: (res: any) => {
        this.departments = res;
      },
      error: () => {
        Swal.fire('Error', 'Failed to load departments', 'error');
      }
    });
}
  loadOnboardedCandidates() {
    this.recruitmentService.getOnboardedCandidates(this.companyId, this.regionId)
      .subscribe({
        next: (res:any) => {
          this.candidates = res.map((x:any) => ({
            candidateId: x.candidateId,
            name: x.name,
            stage: x.stage,
            onboarding: {
              joiningDate: x.joiningDate,
              docsCollected: x.docsCollected,
              bgCheck: x.bgCheck,
              laptop: x.laptop,
              buddy: x.buddy
            }
          }));
        },
        error: () => {
          Swal.fire('Error', 'Failed to load onboarding list', 'error');
        }
      });
  }

  applyOnboarding() {
    if (!this.onboardForm.joiningDate) {
    Swal.fire('Warning', 'Joining Date is required', 'warning');
    return;
  }

    const selected = this.onboardForm.candidate;

    const payload = {
      regionId: this.regionId,
      companyId: this.companyId,
      userId: this.userId,
      candidateId: selected.candidateId,
      joiningDate: this.onboardForm.joiningDate,
      documentsCollected: this.onboardForm.docsCollected,
      backgroundCheckStatus: this.onboardForm.bgCheck,
      laptopIssued: this.onboardForm.laptop,
      buddyAssigned: this.onboardForm.buddy
    };

    this.recruitmentService.saveCandidateOnboarding(payload).subscribe({
      next: () => {
        Swal.fire('Success', 'Onboarding saved', 'success');
        this.loadOnboardedCandidates(); // 🔥 refresh from DB

        this.onboardForm = {
          candidate: null,
          joiningDate: '',
          docsCollected: false,
          bgCheck: 'Pending',
          laptop: false,
          buddy: ''
        };
      },
      error: () => Swal.fire('Error', 'Failed to save onboarding', 'error')
    });
  }


  get topTotalPages(): number {
    return Math.ceil(this.screeningCandidates.length / this.topPageSize) || 1;
  }
  changeTopPage(page: number) {
    if (page >= 1 && page <= this.topTotalPages) {
      this.topCurrentPage = page;
    }
  }
  viewCandidates() {
    let result = [...this.candidates];
    if (this.globalFilter) {
      const f = this.globalFilter.toLowerCase();
      result = result.filter(c =>
        (c.name || '').toLowerCase().includes(f) ||
        (c.technology || '').toLowerCase().includes(f) ||
        (c.email || '').toLowerCase().includes(f)
      );
    }
    if (this.filterStage) {
      result = result.filter(c => c.stage === Number(this.filterStage));
    }
    return result;
  }
  isSelected(candidate: any): boolean {
    return this.screeningSelectedCandidates.includes(candidate);
  }
  toggleCandidate(candidate: any, event: any) {
    if (event.target.checked) {
      // allow only one selected candidate
      this.onboardForm.candidate = candidate;
    } else {
      this.onboardForm.candidate = null;
    }
  }

  pagedTopCandidates(): any[] {
    const sorted = this.getSortedTopCandidates();
    const start = (this.topCurrentPage - 1) * this.topPageSize;
    return sorted.slice(start, start + this.topPageSize);
  }
  changeTopPageSize(size: number) {
    this.topPageSize = size;
    this.topCurrentPage = 1;
  }

  getSortedTopCandidates(): any[] {
    let data = [...this.screeningCandidates];

    if (this.topSortColumn) {
      data.sort((a, b) => {
        const valA = a[this.topSortColumn!] ?? '';
        const valB = b[this.topSortColumn!] ?? '';
        if (valA < valB) return this.topSortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.topSortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }

  todayTime() {
    const d = new Date();
    return d.toISOString().slice(0, 16).replace('T', ' ');
  }
  calculateProgress(c: any) {
    if (!c) return 0;
    // basic progress mapping across 5 stages (1..5) -> percentage
    const pct = Math.round(((c.stage - 1) / (this.totalStages - 1)) * 100);
    return pct;
  }
  getProgressColor(c: any) {
    const pct = this.calculateProgress(c);
    if (pct >= 80) return 'green';
    if (pct >= 40) return 'yellow';
    return 'red';
  }
   showResume() {

  if (!this.candidate.department || !this.candidate.designation) {
    Swal.fire('Warning', 'Select Department & Designation', 'warning');
    return;
  }

  this.recruitmentService
    .getonboardingCandidatesTopTable(
      this.companyId,
      this.regionId,
      this.candidate.department,
      this.candidate.designation
    )
    .subscribe({
      next: (res: any) => {

        this.screeningCandidates = res.map((x: any) => ({
          candidateId: x.candidateId,
          seqNo: x.seqNo,
          name: x.name,
          mobile: x.mobile,
          expectedCtc: x.expected,
          stage: 6
        }));

      },
      error: () => {
        Swal.fire('Error', 'Failed to load onboarding resumes', 'error');
      }
    });
}

  sortTop(column: string) {
    if (this.topSortColumn === column) {
      this.topSortDirection = this.topSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.topSortColumn = column;
      this.topSortDirection = 'asc';
    }
    this.topCurrentPage = 1;
  }
  resetScreeningFilters() {
    this.candidate.department = '';
    this.candidate.designation = '';
    this.screeningCandidates = [];
    this.screeningSelectedCandidates = [];
    this.topCurrentPage = 1;

    Swal.fire('Reset', 'Filters cleared', 'info');
  }
}
