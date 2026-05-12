import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { RecruitmentService } from '../service/recruitment.service';
import { EmployeeResignationService } from '../../employee-profile/employee-services/employee-resignation.service';
import { environment } from '../../../../environments/environment';
import * as mammoth from 'mammoth';


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
  isParsing = false;

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

  constructor(private recruitmentService: RecruitmentService, private empResignationService: EmployeeResignationService) { }
  // ================= EXTRACT RESUME TEXT =================

async extractResumeText(file: File): Promise<string> {

  const extension = file.name.split('.').pop()?.toLowerCase();

  // ===== PDF =====
  if (extension === 'pdf') {

    const pdfjsLib = await import('pdfjs-dist');

    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer
    }).promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {

      const page = await pdf.getPage(i);

      const content = await page.getTextContent();

      const strings = content.items.map((item: any) => item.str);

      fullText += strings.join(' ') + '\n';
    }

    return fullText;
  }

  // ===== DOCX =====
  if (extension === 'docx') {
    const mammoth = await import('mammoth');

    const arrayBuffer = await file.arrayBuffer();

    const result = await mammoth.extractRawText({
      arrayBuffer
    });

    return result.value;
  }

  if (extension === 'doc') {
    Swal.fire('Warning', '.doc not supported', 'warning');
    return '';
  }

  return '';
}
// ================= PARSE RESUME =================

parseResumeText(text: string) {

  // ===== EMAIL =====
  const emailMatch = text.match(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
  );

  // ===== PHONE =====
  const phoneMatch = text.match(
    /(\+91[\-\s]?)?[6-9]\d{9}/
  );

  // ===== NAME =====
  const lines = text.split('\n')
    .map(x => x.trim())
    .filter(x => x);

  const fullName = lines[0] || '';

  const nameParts = fullName.split(' ');

  // ===== SKILLS =====
  const skills = [];

  const skillKeywords = [
    'Angular',
    'React',
    'Java',
    'SQL',
    'Python',
    'HTML',
    'CSS',
    'JavaScript',
    'TypeScript',
    'Node',
    'ASP.NET',
    'C#'
  ];

  for (const skill of skillKeywords) {

    if (text.toLowerCase().includes(skill.toLowerCase())) {
      skills.push(skill);
    }
  }

  // ===== EXPERIENCE =====

  // ===== EXPERIENCE =====

const experienceList: any[] = [];

const linesArr = text
  .split('\n')
  .map(x => x.trim())
  .filter(x => x);

const dateRegex =
  /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{4}\s*[-–]\s*((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{4}|Present)/i;

for (let i = 0; i < linesArr.length; i++) {

  const currentLine = linesArr[i];

  if (dateRegex.test(currentLine)) {

    const match = currentLine.match(
      /([A-Za-z]{3,9}\s\d{4})\s*[-–]\s*([A-Za-z]{3,9}\s\d{4}|Present)/i
    );

    if (match) {

      const role =
        linesArr[i + 1] || '';

      const company =
        linesArr[i + 2] || '';

      experienceList.push({

        from: this.convertMonthYearToDate(match[1]),

        to:
          match[2].toLowerCase() === 'present'
            ? this.today
            : this.convertMonthYearToDate(match[2]),

        // ✅ ROLE
        designation: role,

        // ✅ COMPANY
        organization: company
      });
    }
  }
}

  // ===== EDUCATION =====

  const qualificationList: any[] = [];

  const eduRegex =
    /(\d{4})\s*[-–]\s*(\d{4}).*?(BTech|MTech|MBA|BSc|MSc|BCom|MCA|Degree|Intermediate|SSC).*?\n?(.*?)(?=\n|$)/gi;

  let eduMatch;

  while ((eduMatch = eduRegex.exec(text)) !== null) {

    qualificationList.push({

      from: eduMatch[1],

      to: eduMatch[2],

      qualification: eduMatch[3],

      board: eduMatch[4]
    });
  }

  let designation = '';

if (experienceList.length > 0) {

  designation =
    experienceList[0].designation || '';
}


  // ===== FINAL BIND =====

  this.candidate.firstName = nameParts[0] || '';

  this.candidate.lastName =
    nameParts.slice(1).join(' ') || '';

  this.candidate.email = emailMatch?.[0] || '';

  this.candidate.mobile =
    phoneMatch?.[0]?.replace(/\D/g, '') || '';

  this.candidate.skills = skills.join(', ');

  this.candidate.designation = designation;

  this.experienceList = experienceList;

  this.qualificationList = qualificationList;
}
convertMonthYearToDate(value: string): string {

  const months: any = {
    jan: '01',
    feb: '02',
    mar: '03',
    apr: '04',
    may: '05',
    jun: '06',
    jul: '07',
    aug: '08',
    sep: '09',
    oct: '10',
    nov: '11',
    dec: '12'
  };

  const parts = value.split(' ');

  if (parts.length < 2) return '';

  const month =
    months[parts[0].substring(0, 3).toLowerCase()] || '01';

  const year = parts[1];

  return `${year}-${month}-01`;
}

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

    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    if (!this.userId) {
      console.error("UserId missing in sessionStorage");
      return;
    }
    this.loadAllData();
    this.loadReferenceUsers();
    this.loadGenders();
    this.loadNoticePeriods();
   this.loadMaritalStatuses();


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

  // 1. Manual candidates
  this.recruitmentService.getCandidates(this.userId, this.companyId, this.regionId)
    .subscribe((res: any) => {

      const manual = res.map((c: any) => ({
        candidateId: c.candidateId,
        seqNo: c.seqNo,
        candidateName: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
        email: c.email,
        technology: c.designation,
        mobile: c.mobile,
        appliedDate: c.appliedDate,
        fileName: c.fileName,
        stageName: c.stageName,
        progressPercent: c.progress,
        experiences:
        c.experiences ||
        c.candidateExperiences ||
        c.experienceDetails ||
        [],

        qualifications:
          c.qualifications ||
          c.candidateQualifications ||
          c.qualificationDetails ||
          [],
      }));

      // 2. Applied resumes (from job applications API)
      this.recruitmentService.getJobApplications()
        .subscribe((apps: any[]) => {

          const applied = apps.map(a => ({
            candidateId: a.applicationId,
            seqNo: 'APP_' + a.applicationId,
            candidateName: a.candidateName,
            email: a.email,
            technology: a.jobTitle,
            mobile: a.phone,
            appliedDate: a.appliedDate,
            fileName: a.resumeUrl,
            stageName: 'Applied',
            progressPercent: 5
          }));

          // 🔥 MERGE BOTH
          this.candidates = [...manual, ...applied]
            .sort((a, b) =>
              new Date(b.appliedDate).getTime() -
              new Date(a.appliedDate).getTime()
            );
        });
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




  saveCandidate() {

    if (!this.candidate.firstName || !this.candidate.email) {
      Swal.fire('Required', 'Candidate Name & Email are mandatory', 'warning');
      return;
    }

    const formData = new FormData();


    // 🔹 CandidateId (ONLY for edit)
    if (this.isEditMode && this.editingCandidateId) {
      formData.append('CandidateId', this.editingCandidateId.toString());
    }

    // 🔹 Resume (optional in edit)
    if (this.resumeFile) {
      formData.append('ResumeFile', this.resumeFile);
    }
    if (!this.isEditMode) {
      formData.append('SeqNo', `SEQ_${Date.now()}`);
    }
    if (!this.isEditMode) {
      formData.append('StageId', '1');
    }

    // 🔹 Context
    formData.append('UserId', this.userId.toString());
    formData.append('CompanyId', this.companyId.toString());
    formData.append('RegionId', this.regionId.toString());

    // 🔹 Candidate fields
    formData.append('AppliedDate', this.candidate.appliedDate);
    formData.append('FirstName', this.candidate.firstName);
    formData.append('LastName', this.candidate.lastName);
    formData.append('Email', this.candidate.email);
    formData.append('Mobile', this.candidate.mobile);
    formData.append('Gender', this.candidate.gender);
    formData.append('DateOfBirth', this.candidate.dob);
    formData.append('MaritalStatus', this.candidate.maritalStatus);
    formData.append('CurrentSalary', this.candidate.currentSalary);
    formData.append('ExpectedSalary', this.candidate.expectedSalary);
    formData.append('ReferenceSource', this.candidate.reference);
    formData.append('Department', this.candidate.department);
    formData.append('Designation', this.candidate.designation);
    formData.append('Skills', this.candidate.skills);
    formData.append('NoticePeriod', this.candidate.noticePeriod);
    formData.append('AnyOffers', this.candidate.anyOffers);
    formData.append('Location', this.candidate.location);
    formData.append('Reason', this.candidate.reason);
    formData.append('StageId', '1');
    formData.append('SeqNo', `SEQ_${Date.now()}`);

    // 🔹 Experience JSON
    formData.append(
      'ExperiencesJson',
      JSON.stringify(this.experienceList.map(e => ({
        FromDate: e.from,
        ToDate: e.to,
        Designation: e.designation,
        Organization: e.organization
      })))
    );

    // 🔹 Qualification JSON
    formData.append(
      'QualificationsJson',
      JSON.stringify(this.qualificationList.map(q => ({
        FromYear: +q.from,
        ToYear: +q.to,
        Qualification: q.qualification,
        BoardUniversity: q.board
      })))
    );

    // 🔹 CALL API
    const apiCall = this.isEditMode
      ? this.recruitmentService.updateCandidate(formData)
      : this.recruitmentService.saveCandidate(formData);

    apiCall.subscribe({
      next: () => {
        Swal.fire(
          'Success',
          this.isEditMode ? 'Candidate updated successfully' : 'Candidate saved successfully',
          'success'
        );
        this.resetForm();
        this.isEditMode = false;
        this.editingCandidateId = null;
        this.resumeFile = null;
        this.existingResumeName = null;
        this.loadAllData();
      },
      error: () => Swal.fire('Error', 'Operation failed', 'error')
    });
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

  // ================= APPLICATION RESUME =================

  if (c.isApplication) {

    this.isEditMode = false;

    this.candidate = {

      appliedDate:
        c.appliedDate?.split('T')[0] || '',

      firstName:
        c.candidateName?.split(' ')[0] || '',

      lastName:
        c.candidateName?.split(' ').slice(1).join(' ') || '',

      email: c.email || '',

      mobile: c.mobile || '',

      designation:
        c.technology || '',

      gender: '',
      dob: '',
      currentSalary: '',
      expectedSalary: '',
      reference: '',
      maritalStatus: '',
      department: '',
      skills: '',
      noticePeriod: '',
      anyOffers: '',
      location: '',
      reason: ''
    };

    this.existingResumeName =
      c.fileName || '';

    // ✅ Auto parse resume again
    if (c.fileName) {

      fetch(this.getResumeUrl(c.fileName))
        .then(r => r.blob())
        .then(async blob => {

          const file = new File(
            [blob],
            c.fileName.split('/').pop() || 'resume.pdf'
          );

          const text =
            await this.extractResumeText(file);

          this.parseResumeText(text);
        });
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    return;
  }

  // ================= NORMAL CANDIDATE =================

  this.isEditMode = true;

  this.editingCandidateId = c.candidateId;

  this.recruitmentService
    .getCandidateById(c.candidateId)
    .subscribe({

      next: (res: any) => {

        this.bindCandidateForm(res);

        this.existingResumeName =
          res.fileName ||
          res.resumeUrl ||
          null;

        this.experienceList =
          (res.experiences || []).map((e: any) => ({

            from:
              e.fromDate || '',

            to:
              e.toDate || '',

            designation:
              e.designation || '',

            organization:
              e.organization || ''
          }));

        this.qualificationList =
          (res.qualifications || []).map((q: any) => ({

            from:
              q.fromYear || '',

            to:
              q.toYear || '',

            qualification:
              q.qualification || '',

            board:
              q.boardUniversity || ''
          }));

        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      },

      error: () => {

        Swal.fire(
          'Error',
          'Failed to load candidate details',
          'error'
        );
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

    // 🔥 IMPORTANT (JOB TITLE → DESIGNATION)
    designation: res.designation || res.jobTitle || '',

    designationId: this.designations.find(
      d => d.designationName === (res.designation || res.jobTitle)
    )?.designationId || '',

    skills: res.skills || '',
    location: res.location || res.currentLocation || '',

    currentSalary: res.currentSalary || '',
    expectedSalary: res.expectedSalary || '',

    reference: res.referenceSource || '',
    maritalStatus: res.maritalStatus || '',
    department: res.department || '',

    noticePeriod: res.noticePeriod || '',
    anyOffers: res.anyOffers || '',
    reason: res.reason || '',

    dob: res.dateOfBirth?.split('T')[0] || ''
  };

  // Resume file
  this.existingResumeName = res.fileName || res.resumeUrl || null;

  // Experience
  this.experienceList = (res.experiences || []).map((e: any) => ({

  from:
    e.fromDate ||
    e.FromDate ||
    (e.fromYear ? `${e.fromYear}-01-01` : ''),

  to:
    e.toDate ||
    e.ToDate ||
    (e.toYear ? `${e.toYear}-12-31` : ''),

  designation: e.designation || '',
  organization: e.organization || ''
}));

  // Qualification
  this.qualificationList = (res.qualifications || []).map((q: any) => ({
    from: q.fromYear,
    to: q.toYear,
    qualification: q.qualification,
    board: q.boardUniversity
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


  async onResumeFiles(event: any) {

  if (!event.target.files?.length) return;

  const file = event.target.files[0];

  this.resumeFile = file;

  this.isParsing = true;

  try {

    const text = await this.extractResumeText(file);

    this.parseResumeText(text);

    Swal.fire(
      'Success',
      'Resume parsed successfully',
      'success'
    );

  } catch (error) {

    console.error(error);

    Swal.fire(
      'Error',
      'Resume parsing failed',
      'error'
    );

  } finally {

    this.isParsing = false;
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
