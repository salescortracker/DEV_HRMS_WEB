import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AdminService } from '../../../admin/servies/admin.service';
import { employeeprofile } from '../../../admin/layout/models/employeeprofile.model';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';
import { EmployeeResignation } from '../employee-models/EmployeeResignation';
import { EmployeeResignationService } from '../employee-services/employee-resignation.service';
@Component({
  selector: 'app-digital-business-card',
  standalone: false,
  templateUrl: './digital-business-card.component.html',
  styleUrl: './digital-business-card.component.css'
})
export class DigitalBusinessCardComponent {
  profile: employeeprofile | null = null;
  profileImage: string | ArrayBuffer | null = null;
  @ViewChild('cameraInput') cameraInput!: ElementRef;
  @ViewChild('galleryInput') galleryInput!: ElementRef;


  constructor(private adminService: EmployeeResignationService) { }

  ngOnInit(): void {
    const userId = Number(sessionStorage.getItem('UserId'));

    this.adminService.GetDigitalCard(userId).subscribe({
      next: (data) => {
        console.log("Digital Card Data:", data);
        this.profile = data;

        // If backend already has image, show it
        if (this.profile?.profilePictureBase64) {
          this.profileImage = 'data:image/png;base64,' + this.profile.profilePictureBase64;
        }
      },
      error: (err) => console.error("Error loading digital card:", err)
    });
  }

  // ------------------ DOWNLOAD PDF --------------------
  // ------------------ DOWNLOAD PDF --------------------
  downloadPDF() {

    const cardElement = document.querySelector('.business-card') as HTMLElement;

    if (!cardElement) {
      console.error("Business card not found!");
      return;
    }

    html2canvas(cardElement, {
      scale: 2,
      backgroundColor: null,
      useCORS: true
    }).then(canvas => {

      const imgData = canvas.toDataURL('image/png');

      // Card dimensions
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Center card in PDF
      const x = 10;
      const y = 20;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

      pdf.save(`${this.profile?.fullName}-DigitalBusinessCard.pdf`);
    });
  }
  // ------------------ DOWNLOAD IMAGE --------------------
  // ------------------ DOWNLOAD COMPLETE CARD AS IMAGE --------------------
  downloadImage() {
    const cardElement = document.querySelector('.business-card') as HTMLElement;

    if (!cardElement) {
      console.error('Business card not found!');
      return;
    }

    html2canvas(cardElement, {
      scale: 2,
      backgroundColor: null,
      useCORS: true
    }).then(canvas => {

      const imageData = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = imageData;
      link.download = `${this.profile?.fullName}-DigitalBusinessCard.png`;

      link.click();
    });
  }

  // ------------------ IMAGE UPLOAD --------------------
  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      // preview image
      this.profileImage = reader.result;

      // save only Base64 part for backend
      const base64String = (reader.result as string).split(',')[1];
      if (this.profile) {
        this.profile.profilePictureBase64 = base64String;
      }
    };

    reader.readAsDataURL(file);
  }
  openImageOptions() {
    Swal.fire({
      title: 'Select Option',
      showCancelButton: true,
      confirmButtonText: 'Open Camera',
      cancelButtonText: 'Choose File',
    }).then((result) => {
      if (result.isConfirmed) {
        this.cameraInput.nativeElement.click(); // Open camera
      } else {
        this.galleryInput.nativeElement.click(); // Open gallery/file picker
      }
    });
  }
}
