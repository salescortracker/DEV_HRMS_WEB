import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeResignationService } from '../../employee-services/employee-resignation.service';
import { EmployeeResignation } from '../../employee-models/EmployeeResignation';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-employee-family-details',
  standalone: false,
  templateUrl: './employee-family-details.component.html',
  styleUrl: './employee-family-details.component.css'
})
export class EmployeeFamilyDetailsComponent {
familyForm!: FormGroup;
  familyList: any[] = [];
  isEdit = false;
  editId: number | null = null;
  userId = Number(sessionStorage.getItem("UserId")); // 🔹 replace with logged-in userId
  companyId=Number(sessionStorage.getItem("CompanyId"));
  regionId=Number(sessionStorage.getItem("RegionId"));
  constructor(
    private fb: FormBuilder,
    private empFamilyService: EmployeeResignationService
  ) {}

  ngOnInit(): void {
    this.familyForm = this.fb.group({
      name: ['', Validators.required],
      relationship: ['', Validators.required],
      dateofbirth: ['', Validators.required],
      gender: ['', Validators.required],
      occupation: [''],
      phone: [''],
      address: [''],
      isDependent: [false, Validators.required],
      companyId:this.companyId,
      regionId:this.regionId,
      userId:this.userId,  
    });
this.loadrelationship();
this.loadgender();
    this.loadFamily();
  }

  loadFamily() {
    this.empFamilyService.Getempfamily(this.userId).subscribe(res => {
      debugger;
      this.familyList = res;
    });
  }

  submit() {
    debugger;
    // if (this.familyForm.invalid) return;

    const formData = new FormData();
    Object.keys(this.familyForm.value).forEach(key => {
      formData.append(key, this.familyForm.value[key]);
    });
    formData.append('userId', this.userId.toString());

    if (this.isEdit && this.editId) {
      formData.append('familyId', this.editId.toString());
      this.empFamilyService.updateempfamily(formData).subscribe(() => {
        this.resetForm();
        this.loadFamily();
         Swal.fire("Updated successfully!", '', 'success');
      });
    } else {
      this.empFamilyService.createempfamily(formData).subscribe(() => {
        this.resetForm();
        this.loadFamily();
          Swal.fire("Created successfully!", '', 'success');
      });
    }
  }

  edit(row: any) {
    this.isEdit = true;
    this.editId = row.familyId;
    this.familyForm.patchValue(row);
  }

  delete(id: number) {
    if (confirm('Are you sure?')) {
      this.empFamilyService.deleteempfamily(id).subscribe(() => {
        this.loadFamily();
          Swal.fire("Deleted successfully!", '', 'success');
      });
    }
  }

  resetForm() {
    this.familyForm.reset();
    this.isEdit = false;
    this.editId = null;
  }
  relationList: any[] = [];
   loadrelationship() {
    
    this.empFamilyService.GetAllRelationShip(this.userId,this.companyId,this.regionId).subscribe(res => {
      this.relationList = res;
    });
  }
  genderList: any[] = [];
   loadgender() {
    this.empFamilyService.Getempgender(this.userId,this.companyId,this.regionId).subscribe(res => {
      this.genderList = res;
    });
  }

}
