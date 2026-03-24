import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeResignationService } from '../employee-services/employee-resignation.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-employee-emergency-contact',
  standalone: false,
  templateUrl: './employee-emergency-contact.component.html',
  styleUrl: './employee-emergency-contact.component.css'
})
export class EmployeeEmergencyContactComponent {
   emergencyForm!: FormGroup;
  emergencyList: any[] = [];
  relationList: any[] = [];

  isEdit = false;
  editId!: number;

  userId = Number(sessionStorage.getItem('UserId'));
  companyId =Number(sessionStorage.getItem('CompanyId'));
  regionId =Number(sessionStorage.getItem('RegionId'));

  constructor(
    private fb: FormBuilder,
    private empFamilyService: EmployeeResignationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadrelationship();
    this.getEmergencyContacts();
  }

  initForm() {
    this.emergencyForm = this.fb.group({
      emergencyContactId: [0],
      contactName: ['', Validators.required],
      relationshipId: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      alternatePhone: [''],
      email: [''],
      address: [''],
      userId: [this.userId],
      companyId: [this.companyId],
      regionId: [this.regionId],
    });
  }
relationshipMap: any;

  // 📄 Load Relationships
  loadrelationship() {
    this.empFamilyService
      .GetAllRelationShip(this.userId, this.companyId, this.regionId)
      .subscribe(res => {
        this.relationList = res;
      });
  }

 getEmergencyContacts() {
  this.empFamilyService.getEmergencyContactsByUserId(this.userId)
    .subscribe((res: any[]) => {
debugger;
      this.emergencyList = res.map(contact => ({
        ...contact,
        relationshipName: this.relationList.find(
          r => r.id === contact.relationshipId
        )?.relationshipName || 'N/A'
      }));

    });
}

  // ➕ Add / ✏️ Update
  onSubmit() {
    //if (this.emergencyForm.invalid) return;

    const payload = this.emergencyForm.value;

    if (this.isEdit) {
      this.empFamilyService.updateEmergencyContact(payload)
        .subscribe(() => {
          this.resetForm();
          this.getEmergencyContacts();
          Swal.fire("Updated successfully!", '', 'success');
        });
    } else {
      this.empFamilyService.addEmergencyContact(payload)
        .subscribe(() => {
          this.resetForm();
          this.getEmergencyContacts();
          Swal.fire("Created successfully!", '', 'success');
        });
    }
  }

  // ✏️ Edit
  edit(item: any) {
    this.isEdit = true;
    this.editId = item.emergencyContactId;

    this.emergencyForm.patchValue(item);
  }

  // 🗑️ Delete
  delete(id: number) {
    if (confirm('Are you sure you want to delete this contact?')) {
      this.empFamilyService.deleteEmergencyContact(id)
        .subscribe(() => {
          this.getEmergencyContacts();
          Swal.fire("Deleted successfully!", '', 'success');
        });
    }
  }

  resetForm() {
    this.emergencyForm.reset();
    this.emergencyForm.patchValue({ userId: this.userId });
    this.isEdit = false;
  }
}
