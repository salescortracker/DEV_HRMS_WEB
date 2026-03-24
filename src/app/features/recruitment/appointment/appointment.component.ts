import { Component } from '@angular/core';
import { RecruitmentService } from '../service/recruitment.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-appointment',
  standalone: false,
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.css'
})
export class AppointmentComponent {
appointments: any[] = [];
  selectedCandidate: any = null;
  reporters: any[] = [];
   userId!: number;
  companyId!: number;
  regionId!: number;
  constructor(private service: RecruitmentService) {}
ngOnInit() {
  this.userId = Number(sessionStorage.getItem("UserId"));
  this.companyId = Number(sessionStorage.getItem("CompanyId"));
  this.regionId = Number(sessionStorage.getItem("RegionId"));

  if (!this.userId) {
    console.error("UserId missing in sessionStorage");
    return;
  }
  this.loadAppointments();
  this.loadReporters();
}
loadAppointments() {
    this.service.getAppointments(this.userId)
      .subscribe(res => {
        this.appointments = res;
      });
  }
onEdit(row: any) {

  this.service.getAppointmentCandidateDetails(row.candidateId)
  .subscribe(res => {

    this.selectedCandidate = {
      ...res,

      candidateId: row.candidateId,
      interviewId: row.interviewId,

      levelNo: row.levelNo,   // ⭐ VERY IMPORTANT

      interviewDate: row.interviewDate,
      location: row.location,

      result: row.result || "Selected",
      description: row.description || "",

      reportedBy: this.userId
    };

    console.log("SelectedCandidate:", this.selectedCandidate); // debug
  });

}


  loadReporters() {
  this.reporters = [{
    userId: this.userId,
    fullName: sessionStorage.getItem("Name")
  }];
}


save() {
  if (!this.selectedCandidate) return;

  //  if (!this.selectedCandidate.levelNo) {
  //   Swal.fire("Error","Interview level missing","error");
  //   return;
  // }

  const payload = {
    interviewId: this.selectedCandidate.interviewId,
    regionId: this.regionId,
    companyId: this.companyId,
    userId: this.userId,
    candidateId: this.selectedCandidate.candidateId,

    levelNo: Number(this.selectedCandidate.levelNo),
    interviewerId: this.userId,
    interviewerName: sessionStorage.getItem("Name"),
    interviewDate: this.selectedCandidate.interviewDate,
    location: this.selectedCandidate.location,
    meetingLink: null,

    description: this.selectedCandidate.description,
    result: this.selectedCandidate.result
  };
 console.log("Payload:", payload);
  this.service.updateCandidateInterview(payload).subscribe({
    next: () => {
      Swal.fire("Success", "Appointment updated successfully", "success");
      this.loadAppointments();     // ✅ refresh top table
      this.selectedCandidate = null;
    },
    error: () => {
      Swal.fire("Error", "Unable to save appointment", "error");
    }
  });
}

}
