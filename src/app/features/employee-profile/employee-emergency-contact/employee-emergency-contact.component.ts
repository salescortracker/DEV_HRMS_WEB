import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { EmployeeResignationService } from '../employee-services/employee-resignation.service';
import Swal from 'sweetalert2';
import { AdminService } from '../../../admin/servies/admin.service';
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
//canCreate: boolean = false;
  isEdit = false;
  editId!: number;

  userId = Number(sessionStorage.getItem('UserId'));
  companyId =Number(sessionStorage.getItem('CompanyId'));
  regionId =Number(sessionStorage.getItem('RegionId'));
  
  phoneNumberNotSameValidator(control: AbstractControl): ValidationErrors | null {

  const phone = control.get('phoneNumber')?.value;
  const alternate = control.get('alternatePhone')?.value;

  if (
    phone &&
    alternate &&
    phone.trim() !== '' &&
    alternate.trim() !== '' &&
    phone === alternate
  ) {
    return { samePhone: true };
  }

  return null;
}

  constructor(
    private fb: FormBuilder,
    private empFamilyService: EmployeeResignationService,private adminService: AdminService
  ) {}

  ngOnInit(): void {
      this.initForm();

  this.loadPermission();

  this.loadrelationship();

  this.getEmergencyContacts();
  }

  initForm() {
    this.emergencyForm = this.fb.group({
  emergencyContactId: [0],
  contactName: ['', Validators.required],
  relationshipId: [0, Validators.required],

  phoneNumber: [
    '',
    [
      Validators.required,
      Validators.pattern('^[0-9]{10}$')
    ]
  ],

  alternatePhone: [
    '',
    [
      Validators.pattern('^[0-9]{10}$')
    ]
  ],

  email: ['', Validators.email],
  address: [''],

  userId: [this.userId],
  companyId: [this.companyId],
  regionId: [this.regionId],
},
{
  validators: this.phoneNumberNotSameValidator
});
  }
relationshipMap: { [key: number]: string } = {};

loadrelationship() {

  this.empFamilyService
    .GetAllRelationShip(this.userId, this.companyId, this.regionId)
    .subscribe({
      next: (res: any[]) => {

        console.log('All Relationships 👉', res);

        // ✅ Filter Active + Company + Region
        this.relationList = (res || []).filter((r: any) =>
          r.companyId == this.companyId &&
          r.regionId == this.regionId &&
          r.isActive === true
        );

        // ✅ Build Map
        this.relationshipMap = {};
        this.relationList.forEach((r: any) => {
          this.relationshipMap[r.relationshipId] = r.relationshipName;
        });

        console.log('Filtered Relationships 👉', this.relationList);
        console.log('Relationship Map 👉', this.relationshipMap);
      },
      error: (err) => console.error(err)
    });
}

 getEmergencyContacts() {
  this.empFamilyService.getEmergencyContactsByUserId(this.userId)
    .subscribe((res: any[]) => {
      this.emergencyList = res.map(contact => ({
        ...contact,
        relationshipName: this.relationList.find(
  r => r.relationshipId === contact.relationshipId
)?.relationshipName || 'N/A'
      }));

    });
}

  // ➕ Add / ✏️ Update
  onSubmit() {
    //if (this.emergencyForm.invalid) return;
  if (this.emergencyForm.hasError('samePhone')) {

    this.emergencyForm.markAllAsTouched();

    Swal.fire(
      'Validation',
      'Phone Number and Alternate Phone should not be the same.',
      'warning'
    );

    return;
  }
    if (this.emergencyForm.value.relationshipId === 0) {

    Swal.fire(
      'Validation',
      'Please select a relationship.',
      'warning'
    );

    return;
  }
    const payload = this.emergencyForm.value;

  const duplicate = this.emergencyList.find(x =>

    x.contactName.trim().toLowerCase() === payload.contactName.trim().toLowerCase()

    &&

    x.phoneNumber.trim() === payload.phoneNumber.trim()

    &&

    (!this.isEdit || x.emergencyContactId !== payload.emergencyContactId)

  );

  if (duplicate) {
    Swal.fire(
      'Duplicate',
      'Emergency contact already exists.',
      'warning'
    );
    return;
  }
    if (this.isEdit) {
      this.empFamilyService.updateEmergencyContact(payload).subscribe({
  next: () => {
    this.resetForm();
    this.getEmergencyContacts();
    Swal.fire("Updated successfully!", '', 'success');
  },
  error: (err) => {
    Swal.fire(
      "Error",
      err?.error?.message ||
      err?.error ||
      "Something went wrong",
      "error"
    );
  }
});
    } else {
      this.empFamilyService.addEmergencyContact(payload).subscribe({
  next: () => {
    this.resetForm();
    this.getEmergencyContacts();
    Swal.fire("Created successfully!", '', 'success');
  },
error: (err) => {

  Swal.fire(
    "Error",
    err?.error?.message ||
    err?.error ||
    "Something went wrong",
    "error"
  );
}
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

  if (!this.canDelete) {
    Swal.fire("You don't have permission to delete", "", "warning");
    return;
  }

  if (confirm('Are you sure you want to delete this contact?')) {
    this.empFamilyService.deleteEmergencyContact(id).subscribe({
      next: () => {
        this.getEmergencyContacts();
        Swal.fire("Deleted successfully!", '', 'success');
      },
      error: (err) => {
        Swal.fire("Permission Denied", err.error, "error");
      }
    });
  }
}

  // resetForm() {
  //   this.emergencyForm.reset();
  //   this.emergencyForm.patchValue({ emergencyContactId: 0, userId: this.userId, companyId: this.companyId,
  //   regionId: this.regionId });
  //   this.isEdit = false;
  // }
  resetForm() {

  this.emergencyForm.reset({
    emergencyContactId: 0,
    contactName: '',
    relationshipId: 0,
    phoneNumber: '',
    alternatePhone: '',
    email: '',
    address: '',
    userId: this.userId,
    companyId: this.companyId,
    regionId: this.regionId
  });

  this.isEdit = false;
}
canCreate: boolean = true;
canEdit: boolean = false;
canDelete: boolean = false;

loadPermission() {
  if (!this.canCreate) {
  this.emergencyForm.disable();
}
  const userId = Number(sessionStorage.getItem("UserId"));
  const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

  // ✅ FIXED MENU NAME
  const emergencyMenu = menus.find(
    (m: any) => m.menuName === "Emergency Contact"
  );

  const menuId = emergencyMenu ? emergencyMenu.menuId : 0;

  if (emergencyMenu) {
    this.canCreate = emergencyMenu.canAdd;
    this.canEdit = emergencyMenu.canEdit;
    this.canDelete = emergencyMenu.canDelete;
  }

  this.adminService.getPermission(userId, menuId, 'create').subscribe({
    next: (res: boolean) => {
      this.canCreate = res;
    },
    error: () => {
      this.canCreate = false;
    }
  });
}

}
