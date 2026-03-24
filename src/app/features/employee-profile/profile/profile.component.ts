import { Component, ElementRef, ViewChild } from '@angular/core';
import { EmployeeResignationService } from '../employee-services/employee-resignation.service';
import { employeeprofile } from '../../../admin/layout/models/employeeprofile.model';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-profile',
  standalone: false,

  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
profile!: employeeprofile;
  userId: number | null = null;
  profileImage: string | ArrayBuffer | null = null;
  isMobile = false;
companyName: string = sessionStorage.getItem('CompanyName') || '';
regionName: string = sessionStorage.getItem('RegionName') || '';
  @ViewChild('cameraInput') cameraInput!: ElementRef<HTMLInputElement>;
  @ViewChild('galleryInput') galleryInput!: ElementRef<HTMLInputElement>;
 constructor(private profileService: EmployeeResignationService) {}
 ngOnInit(): void {
    const storedUserId = sessionStorage.getItem('UserId');
this.getshiftallocationName();
    if (storedUserId) {
      this.userId = +storedUserId;
      this.loadProfile();
       // Load stored profile image from sessionStorage
      const savedImage = sessionStorage.getItem(`profileImage_${this.userId}`);
      if (savedImage) {
        this.profileImage = savedImage;
      }
    } else {
      console.error('No user logged in');
    }

        this.isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  }
  employeeCode: number = 0;
  shiftAllocationName: string = '';
ShiftstartTime: string = '';
ShiftendTime: string = '';
getshiftallocationName() {
  debugger;
    this.employeeCode=sessionStorage.getItem('EmployeeCode') as unknown as number;
    this.profileService.getShiftallocationName(this.employeeCode).subscribe(res => {
      console.log('Shift Allocation Name:', res);
      this.shiftAllocationName = res.shiftName;
      this.ShiftstartTime = res.shiftStartTime;
      this.ShiftendTime = res.shiftEndTime;

    });
  }

  loadProfile() {
    if (!this.userId) return;
    debugger;
    this.profileService.GetempProfile(this.userId).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.profile = res.data;
        }
      },
      error: (err) => {
        console.error('Error loading profile', err);
      }
    });
  }

openImageOptions() {
  Swal.fire({
    title: "Select Option",
    showCancelButton: true,
    confirmButtonText: "Open Camera",
    cancelButtonText: "Choose File"
  }).then((result) => {
    if (result.isConfirmed) {
      if (this.isMobile) {
        this.cameraInput.nativeElement.click();
      } else {
        Swal.fire('Camera not supported on desktop');
      }
    } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
      this.galleryInput.nativeElement.click();
    }
  });
}



 onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (!file || !this.userId) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.profileImage = reader.result;
        // Save image in sessionStorage
        sessionStorage.setItem(`profileImage_${this.userId}`, reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

}
