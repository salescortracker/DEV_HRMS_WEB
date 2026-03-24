import { Component } from '@angular/core';
import { AdminService, Company, Region } from '../../../servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

export interface InterviewLevel {

  InterviewLevelsID: number;
  CompanyID: number;
  RegionID: number;
  InterviewLevels: string;
  IsActive: boolean;
  UserId?: number;

}
@Component({
  selector: 'app-interview-level',
  standalone: false,
  templateUrl: './interview-level.component.html',
  styleUrl: './interview-level.component.css'
})
export class InterviewLevelComponent {
searchText = '';

  interviewLevelsList: InterviewLevel[] = [];

  interview!: InterviewLevel;

  companies: Company[] = [];

  regions: Region[] = [];

  companyMap: Record<number,string> = {};

  regionMap: Record<number,string> = {};

  userId!: number;

  companyId!: number;

  regionId!: number;

  isEditMode = false;

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {

    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    this.interview = {

      InterviewLevelsID: 0,
      CompanyID: this.companyId,
      RegionID: this.regionId,
      InterviewLevels: '',
      IsActive: true

    };

    this.loadCompanies();

    this.loadInterviewLevels();

  }


  loadInterviewLevels(){

    this.spinner.show();

    this.adminService.getInterviewLevels(this.userId).subscribe({

      next:(res:any)=>{

        const data = res.data || [];

        this.interviewLevelsList = data.map((x:any)=>({

          InterviewLevelsID:x.interviewLevelsID,

          InterviewLevels:x.interviewLevels,

          CompanyID:x.companyID,

          RegionID:x.regionID,

          IsActive:x.isActive

        }));

        this.spinner.hide();

      },

      error:()=>{

        this.spinner.hide();

        Swal.fire('Error','Failed to load Interview Levels','error');

      }

    });

  }


  onSubmit(){

    this.interview.CompanyID = this.companyId;

    this.interview.RegionID = this.regionId;

    this.interview.UserId = this.userId;

    const obs = this.isEditMode
      ? this.adminService.updateInterviewLevel(this.interview)
      : this.adminService.createInterviewLevel(this.interview);

    obs.subscribe({

      next:()=>{

        Swal.fire(
          this.isEditMode ? 'Updated!' : 'Added!',
          'Interview Level saved successfully',
          'success'
        );

        this.loadInterviewLevels();

        this.clearForm();

      }

    });

  }


  editInterviewLevel(s:InterviewLevel){

    this.interview = {...s};

    this.companyId = s.CompanyID;

    this.regionId = s.RegionID;

    this.loadRegions();

    this.isEditMode = true;

  }


  deleteInterviewLevel(s:InterviewLevel){

    Swal.fire({

      title:`Delete "${s.InterviewLevels}" ?`,
      icon:'warning',
      showCancelButton:true,
      confirmButtonText:'Yes delete'

    }).then(result=>{

      if(result.isConfirmed){

        this.adminService.deleteInterviewLevel(s.InterviewLevelsID).subscribe(()=>{

          Swal.fire('Deleted!','Record deleted successfully','success');

          this.loadInterviewLevels();

        });

      }

    });

  }


  filteredInterviewLevels(){

    const search = this.searchText?.toLowerCase() || '';

    return this.interviewLevelsList.filter(x =>
      x.InterviewLevels?.toLowerCase().includes(search)
    );

  }


  loadCompanies(){

    this.adminService.getCompanies(null,this.userId).subscribe({

      next:(res:Company[])=>{

        this.companies = res || [];

        this.companyMap = {};

        this.companies.forEach(c =>
          this.companyMap[c.companyId] = c.companyName
        );

        if(this.companyId){
          this.loadRegions();
        }

      }

    });

  }


  loadRegions(){

    this.adminService.getRegions(null,this.userId).subscribe({

      next:(res:Region[])=>{

        const allRegions = res || [];

        this.regionMap = {};

        allRegions.forEach(r=>{
          this.regionMap[r.regionID] = r.regionName;
        });

        this.regions = allRegions.filter(r =>
          r.companyID == this.companyId
        );

      }

    });

  }


  onCompanyChange(){

    sessionStorage.setItem('CompanyId',this.companyId.toString());

    this.regionId = 0;

    this.regions = [];

    this.loadRegions();

  }


  onRegionChange(){

    sessionStorage.setItem('RegionId',this.regionId.toString());

  }


  resetForm(){

    this.clearForm();

  }


  clearForm(){

    this.interview = {

      InterviewLevelsID:0,

      CompanyID:this.companyId,

      RegionID:this.regionId,

      InterviewLevels:'',

      IsActive:true

    };

    this.isEditMode = false;

  }
}
