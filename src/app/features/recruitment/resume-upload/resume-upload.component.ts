import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { RecruitmentService } from '../service/recruitment.service';
import { EmployeeResignationService } from '../../employee-profile/employee-services/employee-resignation.service';
import { environment } from '../../../../environments/environment';
import { AdminService } from '../../../admin/servies/admin.service';
import { ResumeParserService } from '../../../services/resume-parser.service';


interface ReferenceUser {
  userId: number;
  fullName: string;
}
@Component({
  selector: 'app-resume-upload',
  standalone: false,
  templateUrl: './resume-upload.component.html',
  styleUrl: './resume-upload.component.css'
})
export class ResumeUploadComponent {
  today: string = '';
  sequenceCounter = 1;
isParsing:any;
  tabs = ['Resume Upload', 'Screening', 'Interview', 'Appointment', 'Offer', 'Onboarding','Application Resumes'];
  years: number[] = [];
  experienceList: any[] = [];
  qualificationList: any[] = [];
  candidates: any[] = [];
  selectedCandidate: any = null;
  // -------- Sorting --------
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  // -------- Pagination --------
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50];


  references: any[] = [];
maritalStatuses: any[] = [];


  designations: any[] = [];
  departments: any[] = [];
  gender = ['Female', 'Male', 'Other'];
  candidate: any = {
    appliedDate: '',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    gender: '',
    dob: '',
    currentSalary: '',
    expectedSalary: '',
    reference: '',
    maritalStatus: '',
    department: '',
    designation: '',
    skills: '',
    noticePeriod: '',
    anyOffers: '',
    location: '',
    reason: '',
    designationId: '',

  };
  resumeFile: File | null = null;
  genders: any[] = [];
  expForm = {
    from: '',
    to: '',
    designation: '',
    organization: ''
  };
  eduForm = {
    from: '',
    to: '',
    qualification: '',
    board: ''
  };
  noticePeriods: any[] = [];
  userId!: number;
  companyId!: number;
  regionId!: number;
  isEditMode: boolean = false;
  editingCandidateId: number | null = null;
  editingExpIndex: number | null = null;
  editingEduIndex: number | null = null;
  existingResumeName: string | null = null;
  expToYears: number[] = [];
  eduToYears: number[] = [];
  applications: any[] = [];

  constructor(private recruitmentService: RecruitmentService, private empResignationService: EmployeeResignationService, private adminService: AdminService) { }
 


  generateYears() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 40; // last 40 years

    for (let y = currentYear; y >= startYear; y--) {
      this.years.push(y);
    }
  }
 loadMaritalStatuses() {
  this.recruitmentService
    .getMaritalStatuses(this.companyId, this.regionId)
    .subscribe({
      next: (res: any) => {
        this.maritalStatuses = res;
      },
      error: () => {
        console.error('Failed to load marital statuses');
      }
    });
}



  ngOnInit(): void {
    this.generateYears();
    const d = new Date();
    this.today = d.toISOString().split('T')[0];
    this.candidate.appliedDate = this.today;

    this.userId = Number(sessionStorage.getItem("UserId") || 0);
    this.companyId = Number(sessionStorage.getItem("CompanyId") || 0);
    this.regionId = Number(sessionStorage.getItem("RegionId") || 0);

    if (!this.userId || !this.companyId || !this.regionId) {
      console.error("Session values missing");
      return;
    }
    this.loadAllData();
    this.loadReferenceUsers();
    this.loadGenders();
    this.loadNoticePeriods();
    this.loadMaritalStatuses();
    this.loadDepartments();
    this.loadDesignations();


  }
  getExperienceDuration(exp: any): number {
  if (!exp?.from || !exp?.to) return 0;

  const from = new Date(exp.from);
  const to = new Date(exp.to);

  const diff = to.getFullYear() - from.getFullYear();

  return diff > 0 ? diff : 0;
}

// ✅ Total Experience (Years)
getTotalExperienceYears(): string {

  let totalMonths = 0;

  this.experienceList.forEach(exp => {

    if (exp.from && exp.to) {

      const from = new Date(exp.from);
      const to = new Date(exp.to);

      const months =
        (to.getFullYear() - from.getFullYear()) * 12 +
        (to.getMonth() - from.getMonth());

      totalMonths += months > 0 ? months : 0;
    }
  });

  const years = Math.floor(totalMonths / 12);

  const months = totalMonths % 12;

  return `${years} Years ${months} Months`;
}

// ✅ Number of Organizations
getOrganizationCount(): number {
  const uniqueOrgs = new Set(
    this.experienceList.map(x => x.organization?.toLowerCase()?.trim())
  );
  return uniqueOrgs.size;
}
  loadDesignations() {
    this.recruitmentService
      .getDesignations(this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {
          this.designations = res;
        },
        error: () => {
          Swal.fire('Error', 'Failed to load designations', 'error');
        }
      });
  }
  loadNoticePeriods() {
    this.recruitmentService
      .getNoticePeriods(this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {
          this.noticePeriods = res;
        },
        error: () => {
          Swal.fire('Error', 'Failed to load notice periods', 'error');
        }
      });
  }
  allowNumbersOnly(event: KeyboardEvent) {
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }
  
  loadGenders() {
    this.empResignationService
      .Getempgender(this.userId, this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {
          this.genders = res;   // store API response
        },
        error: () => {
          Swal.fire('Error', 'Failed to load gender list', 'error');
        }
      });
  }
  capitalizeFirst(event: any, field: 'firstName' | 'lastName') {
    const value = event.target.value.replace(/[^a-zA-Z]/g, '');
    this.candidate[field] =
      value.charAt(0).toUpperCase() + value.slice(1);
  }
  loadReferenceUsers() {
    this.recruitmentService
      .getReferenceUsers(this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {
          this.references = res;
        },
        error: () => {
          Swal.fire('Error', 'Failed to load reference users', 'error');
        }
      });
  }
  onExpFromChange() {
    const fromYear = +this.expForm.from;

    if (!fromYear) {
      this.expToYears = [];
      this.expForm.to = '';
      return;
    }

    this.expToYears = this.years.filter(y => y >= fromYear);

    // reset To if invalid
    if (this.expForm.to && +this.expForm.to < fromYear) {
      this.expForm.to = '';
    }
  }
  onEduFromChange() {
    const fromYear = +this.eduForm.from;

    if (!fromYear) {
      this.eduToYears = [];
      this.eduForm.to = '';
      return;
    }

    this.eduToYears = this.years.filter(y => y >= fromYear);

    if (this.eduForm.to && +this.eduForm.to < fromYear) {
      this.eduForm.to = '';
    }
  }

  loadAllData() {

  this.recruitmentService
    .getCandidates(this.userId, this.companyId, this.regionId)
    .subscribe({
      next: (res: any) => {

        const candidates = (res || []).map((c: any) => ({
          candidateId: c.candidateId,
          seqNo: c.seqNo,
          candidateName: `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim(),
          email: c.email,
          mobile: c.mobile,
          technology: c.designation,
          appliedDate: c.appliedDate,
          fileName: c.fileName,
          stageName: c.stageName,
          progressPercent: c.progress ?? 0,

          experiences:
            c.experiences ||
            c.candidateExperiences ||
            c.experienceDetails ||
            [],

          qualifications:
            c.qualifications ||
            c.candidateQualifications ||
            c.qualificationDetails ||
            []
        }));

        // ONLY THIS LIST
        this.candidates = candidates.sort((a: any, b: any) => {
            return (
              new Date(b.appliedDate).getTime() -
              new Date(a.appliedDate).getTime()
            );
          });
      },

      error: () => {
        console.warn('Failed to load candidates');
        this.candidates = [];
      }
    });
}
  addExperience() {
    if (new Date(this.expForm.to) < new Date(this.expForm.from)) {
      Swal.fire('Invalid', '"To Date" must be after "From Date"', 'error');
      return;
    }

    if (!this.expForm.from || !this.expForm.to ||
      !this.expForm.designation || !this.expForm.organization) {
      Swal.fire('Required', 'Fill all experience fields', 'warning');
      return;
    }

    if (this.editingExpIndex !== null) {
      // ✅ UPDATE ONLY
      this.experienceList[this.editingExpIndex] = { ...this.expForm };
      this.editingExpIndex = null;
    } else {
      // ✅ ADD ONLY ONCE
      this.experienceList.push({ ...this.expForm });
    }

    // ✅ reset form
    this.expForm = {
      from: '',
      to: '',
      designation: '',
      organization: ''
    };
  }
loadDepartments() {

  this.adminService
    .getDepartmentsForDropdown(this.companyId, this.regionId)
    .subscribe({

      next: (res: any) => {
        this.departments = res;
      },

      error: () => {
        Swal.fire(
          'Error',
          'Failed to load departments',
          'error'
        );
      }
    });
}
saveCandidate() {

  if (!this.candidate.firstName || !this.candidate.email) {
    Swal.fire('Required', 'Candidate Name & Email are mandatory', 'warning');
    return;
  }

  const formData = new FormData();

  // ✅ EDIT MODE ID (IMPORTANT FIX)
  if (this.isEditMode && this.editingCandidateId) {
    formData.append('CandidateId', String(this.editingCandidateId));
  }

  // Resume
  if (this.resumeFile) {
    formData.append('ResumeFile', this.resumeFile);
  }

  // NEW ENTRY ONLY
  formData.append(
  'SeqNo',
  this.isEditMode
    ? (this.candidate.seqNo || '')
    : `AppRes_${Date.now()}`
);

// ✅ Stage only for new save
if (!this.isEditMode) {
  formData.append('StageId', '1');
}

  // Context
  formData.append('UserId', String(this.userId));
  formData.append('CompanyId', String(this.companyId));
  formData.append('RegionId', String(this.regionId));

  // ✅ SAFE STRING HELPERS
  const safe = (v: any) => v ?? '';

  formData.append('AppliedDate', safe(this.candidate.appliedDate));
  formData.append('FirstName', safe(this.candidate.firstName));
  formData.append('LastName', safe(this.candidate.lastName));
  formData.append('Email', safe(this.candidate.email));
  formData.append('Mobile', safe(this.candidate.mobile));
  formData.append('Gender', safe(this.candidate.gender));
  formData.append('DateOfBirth', safe(this.candidate.dob));
  formData.append('MaritalStatus', safe(this.candidate.maritalStatus));
  formData.append('CurrentSalary', safe(this.candidate.currentSalary));
  formData.append('ExpectedSalary', safe(this.candidate.expectedSalary));
  formData.append('ReferenceSource', safe(this.candidate.reference));
  formData.append('Department', safe(this.candidate.department));
  formData.append('Designation', safe(this.candidate.designation));
  formData.append('Skills', safe(this.candidate.skills));
  formData.append('NoticePeriod', safe(this.candidate.noticePeriod));
  formData.append('AnyOffers', safe(this.candidate.anyOffers));
  formData.append('Location', safe(this.candidate.location));
  formData.append('Reason', safe(this.candidate.reason));

  // 🔥 IMPORTANT FIX: ALWAYS VALID JSON
  const experiences = (this.experienceList || []).map(e => ({
    FromDate: e.from || '',
    ToDate: e.to || '',
    Designation: e.designation || '',
    Organization: e.organization || ''
  }));

  const qualifications = (this.qualificationList || []).map(q => ({
    FromYear: q.from || 0,
    ToYear: q.to || 0,
    Qualification: q.qualification || '',
    BoardUniversity: q.board || ''
  }));

  formData.append('ExperiencesJson', JSON.stringify(experiences));
  formData.append('QualificationsJson', JSON.stringify(qualifications));

  // API
  const apiCall = this.isEditMode
    ? this.recruitmentService.updateCandidate(formData)
    : this.recruitmentService.saveCandidate(formData);

  apiCall.subscribe({
    next: () => {
      Swal.fire(
        'Success',
        this.isEditMode ? 'Updated successfully' : 'Saved successfully',
        'success'
      );

      this.onReset();
      this.loadAllData();
    },
    error: (err) => {
      console.error('API ERROR:', err);
      Swal.fire('Error', 'Update failed (check console)', 'error');
    }
  });
}
  onDesignationChange() {

  const selectedDesignation = this.designations.find(
    (x: any) =>
      x.designationName?.toLowerCase() ===
      this.candidate.designation?.toLowerCase()
  );

  if (selectedDesignation) {

    // auto-fill department (user can still change later)
    this.candidate.department = selectedDesignation.departmentName || '';
    this.candidate.designationId = selectedDesignation.designationId || '';
  }
}

  editExperience(exp: any, index: number) {
    this.expForm = { ...exp };
    this.editingExpIndex = index;
  }
  editQualification(q: any, index: number) {
    this.eduForm = { ...q };
    this.editingEduIndex = index;
  }
  editCandidate(c: any) {

  this.recruitmentService
    .getCandidateById(c.candidateId)
    .subscribe({

      next: (res) => {

        this.isEditMode = true;
        this.editingCandidateId = res.candidateId;

        // ✅ Bind full candidate safely
        this.candidate = {
          ...this.candidate,
          ...res
        };
        this.candidate.seqNo = res.seqNo;

        // 🔥 Experience bind
        this.experienceList = (res.experiences || []).map((e: any) => ({
          from: e.fromDate ? e.fromDate.split('T')[0] : '',
          to: e.toDate ? e.toDate.split('T')[0] : '',
          designation: e.designation,
          organization: e.organization
        }));

        // 🔥 Qualification bind
        this.qualificationList = (res.qualifications || []).map((q: any) => ({
          from: q.fromYear,
          to: q.toYear,
          qualification: q.qualification,
          board: q.boardUniversity
        }));

        // Resume
        this.existingResumeName = res.fileName || null;

        // Dates fix
        if (res.appliedDate) {
          this.candidate.appliedDate = res.appliedDate.split('T')[0];
        }

        if (res.dateOfBirth) {
          this.candidate.dob = res.dateOfBirth.split('T')[0];
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      },

      error: () => {
        Swal.fire('Error', 'Failed to load candidate details', 'error');
      }
    });
}
private bindCandidateForm(res: any) {

  this.candidate = {
  appliedDate: res.appliedDate?.split('T')[0] || '',
  firstName: res.firstName || '',
  lastName: res.lastName || '',
  email: res.email || '',
  mobile: res.mobile || '',
  gender: res.gender || '',
  dob: res.dateOfBirth?.split('T')[0] || '',
  currentSalary: res.currentSalary || '',
  expectedSalary: res.expectedSalary || '',
  reference: res.referenceSource || '',
  maritalStatus: res.maritalStatus || '',
  department: res.department || '',
  designation: res.designation || '',
  skills: res.skills || '',
  noticePeriod: res.noticePeriod || '',
  anyOffers: res.anyOffers || '',
  location: res.location || '',
  reason: res.reason || ''
};

  // Resume file
  this.existingResumeName = res.fileName || res.resumeUrl || null;

  // Experience
  this.experienceList = (res.experiences || []).map((e: any) => ({

   from:
      e.fromDate ||
      e.FromDate ||
      '',

    to:
      e.toDate ||
      e.ToDate ||
      '',

    designation:
      e.designation ||
      e.Designation ||
      '',

    organization:
      e.organization ||
      e.Organization ||
      ''
  }));

  // Qualification
  this.qualificationList = (res.qualifications || []).map((q: any) => ({
    from:
      q.fromYear ||
      q.FromYear ||
      '',

    to:
      q.toYear ||
      q.ToYear ||
      '',

    qualification:
      q.qualification ||
      q.Qualification ||
      '',

    board:
      q.boardUniversity ||
      q.BoardUniversity ||
      ''
  }));
}

  loadCandidateDetails(candidateId: number) {
    this.recruitmentService.getCandidateById(candidateId).subscribe((res: any) => {
      this.experienceList = res.experiences.map((e: any) => ({
        from: e.fromYear,
        to: e.toYear,
        designation: e.designation,
        organization: e.organization
      }));

      this.qualificationList = res.qualifications.map((q: any) => ({
        from: q.fromYear,
        to: q.toYear,
        qualification: q.qualification,
        board: q.boardUniversity
      }));
    });
  }


  resetForm() {
    this.candidate = {
      appliedDate: '',
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      gender: '',
      dob: '',
      currentSalary: '',
      expectedSalary: '',
      reference: '',
      maritalStatus: '',
      department: '',
      designation: '',
      skills: '',
      noticePeriod: '',
      anyOffers: '',
      location: '',
      reason: ''
    };

    this.experienceList = [];
    this.qualificationList = [];
  }

  onReset() {
    this.resetForm();

    this.isEditMode = false;
    this.editingCandidateId = null;
    this.selectedCandidate = null;

    this.resumeFile = null;
    this.existingResumeName = null;

    this.expForm = {
      from: '',
      to: '',
      designation: '',
      organization: ''
    };

    this.eduForm = {
      from: '',
      to: '',
      qualification: '',
      board: ''
    };

    this.editingExpIndex = null;
    this.editingEduIndex = null;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  addQualification() {
    if (+this.eduForm.to < +this.eduForm.from) {
      Swal.fire('Invalid', '"To" year must be >= "From"', 'error');
      return;
    }

    if (!this.eduForm.from || !this.eduForm.to ||
      !this.eduForm.qualification || !this.eduForm.board) {
      Swal.fire('Required', 'Fill all qualification fields', 'warning');
      return;
    }

    if (this.editingEduIndex !== null) {
      // ✅ UPDATE ONLY
      this.qualificationList[this.editingEduIndex] = { ...this.eduForm };
      this.editingEduIndex = null;
    } else {
      // ✅ ADD ONLY ONCE
      this.qualificationList.push({ ...this.eduForm });
    }

    // ✅ reset form
    this.eduForm = {
      from: '',
      to: '',
      qualification: '',
      board: ''
    };
  }


 onResumeFiles(event: any) {
  if (!event.target.files?.length) return;

  const file = event.target.files[0];
  this.resumeFile = file;

  // Only store file (NO parsing)
  if (this.isEditMode) {
    this.existingResumeName = file.name;
  }
}

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  getSortedCandidates(): any[] {
    let data = [...this.candidates];

    if (this.sortColumn) {
      data.sort((a, b) => {
        const valA = a[this.sortColumn!] ?? '';
        const valB = b[this.sortColumn!] ?? '';

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }
  pagedCandidates(): any[] {
    const sorted = this.getSortedCandidates();
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return sorted.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.candidates.length / this.pageSize);
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  viewDocument(fileName: string | undefined): void {
  if (!fileName) return;

  // If already full URL → open directly
  if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
    window.open(fileName, '_blank');
    return;
  }

  // If it's relative path from backend
  const baseUrl = environment.apiUrl.replace('/api', '');

  const cleanBase = baseUrl.endsWith('/')
    ? baseUrl.slice(0, -1)
    : baseUrl;

  const cleanPath = fileName.startsWith('/')
    ? fileName.substring(1)
    : fileName;

  const url = `${cleanBase}/${cleanPath}`;

  window.open(url, '_blank');
}
getResumeUrl(fileName: string): string {

  if (
    fileName.startsWith('http://') ||
    fileName.startsWith('https://')
  ) {
    return fileName;
  }

  const baseUrl = environment.apiUrl.replace('/api', '');

  const cleanBase = baseUrl.endsWith('/')
    ? baseUrl.slice(0, -1)
    : baseUrl;

  const cleanPath = fileName.startsWith('/')
    ? fileName.substring(1)
    : fileName;

  return `${cleanBase}/${cleanPath}`;
}

  calculateProgress(c: any) {
    return c.progressPercent ?? 0;
  }

  getProgressColor(c: any) {
    const pct = c.progressPercent;
    if (pct >= 80) return 'bg-success';
    if (pct >= 40) return 'bg-warning';
    return 'bg-danger';
  }
  advanceStage(c: any) {

    Swal.fire({
      title: 'Move to Screening?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes'
    }).then(result => {

      if (result.isConfirmed) {
        this.recruitmentService.moveStage(c.candidateId, 2).subscribe({
          next: () => {
            c.stageName = 'Screening';
            c.progressPercent = 30;
            Swal.fire('Updated', 'Moved to Screening', 'success');
          },
          error: () => Swal.fire('Error', 'Stage update failed', 'error')
        });
      }
    });
  }
  removeCandidate(c: any) {

    Swal.fire({
      title: 'Delete candidate?',
      text: 'This will permanently remove the candidate',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete'
    }).then(result => {

      if (result.isConfirmed) {
        this.recruitmentService
          .deleteCandidate(c.candidateId)
          .subscribe({
            next: () => {
              Swal.fire('Deleted', 'Candidate removed successfully', 'success');
              this.loadAllData();
            },
            error: () => Swal.fire('Error', 'Delete failed', 'error')
          });
      }

    });
  }



  viewCandidates() {
    return this.candidates || [];
  }
}
